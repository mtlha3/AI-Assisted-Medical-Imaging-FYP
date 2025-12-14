import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras import layers, models, Input
from PIL import Image
from io import BytesIO
import matplotlib.pyplot as plt
import base64

def build_model(num_classes=5):
    inputs = Input(shape=(224,224,3))
    x = layers.Conv2D(32,(3,3),activation="relu")(inputs)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(64,(3,3),activation="relu")(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(128,(3,3),activation="relu",name="last_conv")(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Flatten()(x)
    x = layers.Dense(256,activation="relu")(x)
    x = layers.Dropout(0.4)(x)
    outputs = layers.Dense(num_classes,activation="softmax")(x)
    model = models.Model(inputs=inputs,outputs=outputs)
    model.compile(optimizer="adam",loss="categorical_crossentropy",metrics=["accuracy"])
    return model

CLASS_NAMES = {
    "F": "Fusion Beat",
    "N": "Normal Beat",
    "Q": "Unknown/Paced Beat",
    "S": "Supraventricular Beat",
    "V": "Ventricular Ectopic Beat"
}

def array_to_base64(img_array):
    img = Image.fromarray(cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB))
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def predict_ecg_route(file_bytes, model=None):
    if model is None:
        raise ValueError("Model not loaded")

    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"error":"Invalid image file"}

    img_resized = cv2.resize(img,(224,224))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    x = np.expand_dims(img_rgb.astype("float32")/255.0, axis=0)

    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[model.get_layer("last_conv").output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(x)
        class_idx = tf.argmax(predictions[0])
        loss = predictions[:,class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0,1,2))
    heatmap = tf.reduce_sum(tf.multiply(pooled_grads, conv_outputs[0]), axis=-1)
    heatmap = np.maximum(heatmap,0)
    heatmap /= np.max(heatmap + 1e-10)
    heatmap = cv2.resize(heatmap, (224,224)) 
    heatmap = np.uint8(255*heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    superimposed = cv2.addWeighted(img_rgb,0.6,heatmap,0.4,0)

    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY).astype("float32")/255.0
    h, w = gray.shape

    thresholds = {
        "Normal Beat": 0.6,
        "Ventricular Ectopic Beat": 0.8,
        "Supraventricular Beat": 0.65,
        "Fusion Beat": 0.7,
        "Unknown/Paced Beat": 0.5
    }

    pred_code = list(CLASS_NAMES.keys())[class_idx.numpy()]
    pred_label = CLASS_NAMES[pred_code]

    threshold_val = thresholds.get(pred_label, 0.6)
    delta = 0.05
    upper_thresh = min(threshold_val + delta,1.0)
    lower_thresh = max(threshold_val - delta,0.0)

    for t in np.linspace(0,1,6):
        y = int((1-t)*h)
        cv2.line(superimposed, (0,y), (10,y), (255,255,255), 2)
        cv2.putText(superimposed, f"{t:.2f}", (12,y+4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255,255,255), 1)

    upper_y = int((1-upper_thresh)*h)
    cv2.line(superimposed, (0,upper_y), (w, upper_y), (0,0,255), 2)
    cv2.putText(superimposed, f"Threshold {upper_thresh:.2f}", (5, upper_y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0,0,255),1)

    explanations = {
        "Normal Beat": (
            "A normal heartbeat: Your heart rhythm is regular, QRS complex is normal, "
            "and P-wave is present. This means blood is being pumped effectively.\n"
            "What you feel: Usually nothing, normal heartbeat.\n"
            "Precautions: Maintain a healthy lifestyle, balanced diet, exercise, "
            "avoid excessive caffeine or alcohol, and attend regular check-ups.\n"
            "Treatment: None required for healthy individuals."
        ),
        "Ventricular Ectopic Beat": (
            "Ventricular ectopic beat: This is an early heartbeat originating from the ventricles. "
            "QRS is wide and abnormal, no P-wave detected. Blood flow may be slightly less efficient.\n"
            "What you feel: Palpitations, skipped beats, or a fluttering sensation in the chest.\n"
            "Precautions: Avoid stimulants (caffeine, alcohol, nicotine), manage stress, monitor heart rhythm.\n"
            "Treatment: Usually benign if infrequent; if frequent or symptomatic, your doctor may prescribe antiarrhythmic medication and recommend cardiologist follow-up."
        ),
        "Supraventricular Beat": (
            "Supraventricular beat: Early heartbeat originating from the atria. QRS is normal, but beat occurs prematurely.\n"
            "What you feel: Brief palpitations, sensation of skipped or rapid beats.\n"
            "Precautions: Reduce stress, avoid caffeine or energy drinks, maintain electrolyte balance.\n"
            "Treatment: Often benign; if frequent, doctor may prescribe beta-blockers or recommend monitoring."
        ),
        "Fusion Beat": (
            "Fusion beat: This occurs when a normal heartbeat and an ectopic ventricular beat combine, creating a hybrid QRS morphology.\n"
            "What you feel: May notice palpitations, irregular pulse, or skipped beats.\n"
            "Precautions: Regular heart monitoring, avoid stimulants and triggers like stress or lack of sleep.\n"
            "Treatment: Depends on underlying arrhythmia; your cardiologist may monitor or adjust medication."
        ),
        "Unknown/Paced Beat": (
            "Unknown or Paced beat: Could be a pacemaker spike or artifact in ECG. This beat may not be generated naturally.\n"
            "What you feel: Usually none if pacemaker is working properly; may notice minor irregularities if artifact.\n"
            "Precautions: Ensure pacemaker is functioning correctly, attend scheduled check-ups.\n"
            "Treatment: Adjustment of pacemaker settings if required, cardiologist follow-up."
        )
    }

    explanation = explanations.get(pred_label,"Unknown reason")

    gradcam_base64 = array_to_base64(superimposed)

    return {"predicted_class": pred_label, "explanation": explanation, "gradcam_image": gradcam_base64}

# ----------------------------
# 5️⃣ Load model & weights
# ----------------------------
checkpoint_path = "models/ECG.keras"
model = build_model(num_classes=5)
model.load_weights(checkpoint_path)
dummy_input = np.zeros((1,224,224,3),dtype=np.float32)
_ = model(dummy_input)
print("✅ ECG model loaded.")
