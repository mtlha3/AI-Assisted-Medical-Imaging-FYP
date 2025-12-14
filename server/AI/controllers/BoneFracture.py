import tensorflow as tf
import numpy as np
import cv2
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input
import io

MODEL_PATH = "models/BoneFracture.keras"
loaded_model = tf.keras.models.load_model(MODEL_PATH)
print("Bone fracture model loaded!")


def make_gradcam_heatmap(img_array, model, last_conv_layer_name="top_conv"):
    last_conv_layer = model.get_layer(last_conv_layer_name)

    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[last_conv_layer.output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)

        predictions = tf.convert_to_tensor(predictions)

        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]

    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)
    heatmap = np.maximum(heatmap, 0)
    heatmap /= (np.max(heatmap) + 1e-8)

    return heatmap



def extract_fracture_region(heatmap, orig_img):
    heatmap_norm = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)

    thresh_value = np.percentile(heatmap_norm, 92)
    mask = (heatmap_norm >= thresh_value).astype(np.uint8) * 255

    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if len(contours) == 0:
        return None

    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)

    boxed = orig_img.copy()
    cv2.rectangle(boxed, (x, y), (x+w, y+h), (255, 0, 0), 3)

    return boxed


def predict_bone_fracture(image_bytes):

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    orig_w, orig_h = img.size

    img_resized = img.resize((224, 224))
    arr = np.array(img_resized)
    processed = preprocess_input(arr.astype(np.float32))
    processed = np.expand_dims(processed, axis=0)

    prob = loaded_model.predict(processed)[0][0]
    label = "Fracture" if prob > 0.5 else "Non-fracture"

    orig_img = np.array(img)

    if label == "Non-fracture":
        cv2.putText(orig_img, "NO FRACTURE DETECTED", (10,40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0,255,0), 3)

        return {
            "label": label,
            "probability": float(prob),
            "image": orig_img
        }

    heatmap = make_gradcam_heatmap(processed, loaded_model)
    heatmap_resized = cv2.resize(heatmap, (orig_w, orig_h))

    boxed = extract_fracture_region(heatmap_resized, orig_img)

    if boxed is None:
        boxed = orig_img.copy()
        cv2.putText(boxed, "Possible fracture (no hotspot detected)", (10,40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255,255,0), 3)

    return {
        "label": label,
        "probability": float(prob),
        "image": boxed
    }
