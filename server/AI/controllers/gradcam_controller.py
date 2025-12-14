# gradcam_controller.py
import tensorflow as tf
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from io import BytesIO
from PIL import Image

# ---------- Settings ----------
MODEL_PATH = "models/best_brain_tumor_effv2b2_260.keras"
IMG_SIZE = (260, 260)

# ---------- Load model once ----------
best_model = load_model(MODEL_PATH)
print("✅ Model loaded:", best_model.name)

# ---------- Extract the base EfficientNet model ----------
base_model = best_model.get_layer("efficientnetv2-b2")
print("✅ Nested base model found:", base_model.name)

# ---------- Get last conv layer ----------
last_conv = None
for layer in reversed(base_model.layers):
    if isinstance(layer, (tf.keras.layers.Conv2D, tf.keras.layers.DepthwiseConv2D)):
        last_conv = layer
        break
if last_conv is None:
    raise ValueError("❌ No conv layer found in EfficientNet base")
print("✅ Last conv layer inside EfficientNet base:", last_conv.name)

# ---------- Build Grad-CAM model ----------
grad_model = tf.keras.models.Model(
    inputs=base_model.input,
    outputs=[last_conv.output, base_model.output]
)

# ---------- Grad-CAM++ Function ----------
def gradcam_plus_plus(grad_model, img_tensor, class_idx):
    with tf.GradientTape() as tape1:
        with tf.GradientTape() as tape2:
            with tf.GradientTape() as tape3:
                conv_output, predictions = grad_model(img_tensor)
               
                if isinstance(predictions, list):
                    predictions = predictions[0]
                class_output = predictions[:, class_idx]
            grads = tape3.gradient(class_output, conv_output)
        grads2 = tape2.gradient(grads, conv_output)
    grads3 = tape1.gradient(grads2, conv_output)

    conv_output = conv_output[0]
    grads = grads[0]
    grads2 = grads2[0]
    grads3 = grads3[0]

    numerator = grads2
    denominator = 2.0 * grads2 + grads3 * conv_output
    denominator = tf.where(denominator != 0.0, denominator, tf.ones_like(denominator))
    alpha = numerator / denominator
    alpha = tf.nn.relu(alpha)

    weights = tf.reduce_sum(alpha * tf.nn.relu(grads), axis=(0, 1))
    heatmap = tf.reduce_sum(tf.nn.relu(conv_output) * weights, axis=-1)

    heatmap = np.maximum(heatmap, 0)
    heatmap /= (np.max(heatmap) + 1e-8)
    return heatmap


# ---------- Test-Time Augmentation ----------
def get_tta_heatmap(model, grad_model, img_tensor, pred_class, angles=[0, 90, 180, 270], flip=True):
    heatmaps = []
    for angle in angles:
        img_rot = tf.image.rot90(img_tensor, k=angle // 90)
        heatmap = gradcam_plus_plus(grad_model, img_rot, pred_class)
        heatmap = np.rot90(heatmap, k=(4 - angle // 90))
        heatmaps.append(heatmap)
        if flip:
            img_flip = tf.image.flip_left_right(img_rot)
            heatmap_flip = gradcam_plus_plus(grad_model, img_flip, pred_class)
            heatmap_flip = np.fliplr(np.rot90(heatmap_flip, k=(4 - angle // 90)))
            heatmaps.append(heatmap_flip)
    heatmap_avg = np.mean(np.stack(heatmaps), axis=0)
    heatmap_avg = np.maximum(heatmap_avg, 0)
    heatmap_avg /= (np.max(heatmap_avg) + 1e-8)
    return heatmap_avg

# ---------- Overlay Function ----------
def overlay_on_image(orig_bgr_uint8, heatmap, alpha=0.5):
    hmap = cv2.resize(heatmap, (orig_bgr_uint8.shape[1], orig_bgr_uint8.shape[0]))
    hmap = np.uint8(255 * hmap)
    hmap_color = cv2.applyColorMap(hmap, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(orig_bgr_uint8, 1 - alpha, hmap_color, alpha, 0)
    return hmap_color, overlay

# ---------- Main function to call from Flask ----------
# def predict_and_gradcam(file_stream):
#     pil = Image.open(BytesIO(file_stream)).convert("RGB")
#     pil_resized = pil.resize(IMG_SIZE)
    
#     x = image.img_to_array(pil_resized)
#     x = np.expand_dims(x, 0)
#     x = x / 255.0
#     x = tf.keras.applications.efficientnet_v2.preprocess_input(x)

#     orig_bgr = np.array(pil.resize(IMG_SIZE))[:, :, ::-1] 

#     pred = best_model.predict(x)
#     pred_class = int(np.argmax(pred[0]))

#     img_tensor = tf.convert_to_tensor(x, dtype=tf.float32)
#     heatmap = get_tta_heatmap(best_model, grad_model, img_tensor, pred_class)
#     hmap_color, overlay = overlay_on_image(orig_bgr, heatmap)

#     return {
#         "pred_class": pred_class,
#         "pred_prob": float(pred[0, pred_class]),
#         "heatmap": hmap_color,
#         "overlay": overlay
#     }

# ---------- Main function to call from Flask ----------
def predict_and_gradcam(file_stream):
    pil = Image.open(BytesIO(file_stream)).convert("RGB")
    pil_resized = pil.resize(IMG_SIZE)
    
    x = image.img_to_array(pil_resized)
    x = np.expand_dims(x, 0)
    x = x / 255.0
    x = tf.keras.applications.efficientnet_v2.preprocess_input(x)

    # Original image in BGR for OpenCV
    orig_bgr = np.array(pil.resize(IMG_SIZE))[:, :, ::-1] 

    # Predict
    pred = best_model.predict(x)
    pred_class = int(np.argmax(pred[0]))

    # Grad-CAM++
    img_tensor = tf.convert_to_tensor(x, dtype=tf.float32)
    heatmap = get_tta_heatmap(best_model, grad_model, img_tensor, pred_class)
    hmap_color, overlay = overlay_on_image(orig_bgr, heatmap)

    # ---------- Combine Images Horizontally ----------
    combined = np.concatenate([
        orig_bgr,       # Original MRI
        hmap_color,     # Grad-CAM++ Heatmap
        overlay         # Overlay
    ], axis=1)  # axis=1 means horizontal concatenation

    return {
        "pred_class": pred_class,
        "pred_prob": float(pred[0, pred_class]),
        "combined_image": combined
    }
