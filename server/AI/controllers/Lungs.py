
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image as keras_image
import matplotlib.pyplot as plt
import cv2
import io
import base64
from PIL import Image

# -----------------------------
# CONFIG
# -----------------------------
MODEL_PATH = "models/best_model.keras"
IMG_H, IMG_W = 224, 224
LABELS = ['Cardiomegaly','Emphysema','Effusion','Hernia','Infiltration',
          'Mass','Nodule','Atelectasis','Pneumothorax','Pleural_Thickening',
          'Pneumonia','Fibrosis','Edema','Consolidation']

# -----------------------------
# Doctor Recommendations
# -----------------------------
DISEASE_GUIDE = {
    "Cardiomegaly": {
        "Precautions": [
            "Monitor blood pressure regularly.",
            "Limit salt intake.",
            "Avoid strenuous exercise without doctor's approval.",
            "Follow a heart-healthy diet."
        ],
        "Treatment": [
            "Stage 1: Diagnosis through imaging & ECG.",
            "Stage 2: Medication to manage underlying causes like hypertension.",
            "Stage 3: Lifestyle changes (diet, exercise, smoking cessation).",
            "Stage 4: Surgery or implant devices in severe cases."
        ]
    },
    "Emphysema": {
        "Precautions": [
            "Avoid smoking and secondhand smoke.",
            "Prevent respiratory infections.",
            "Regularly monitor lung function."
        ],
        "Treatment": [
            "Stage 1: Diagnosis with pulmonary function tests and imaging.",
            "Stage 2: Bronchodilators and inhaled steroids.",
            "Stage 3: Pulmonary rehabilitation and oxygen therapy.",
            "Stage 4: Surgery (lung volume reduction) or transplantation in severe cases."
        ]
    },
    "Effusion": {
        "Precautions": [
            "Avoid exposure to respiratory irritants.",
            "Report any shortness of breath immediately.",
            "Follow prescribed medications."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via X-ray/CT scan and fluid analysis.",
            "Stage 2: Treat underlying cause (infection, heart failure, etc.).",
            "Stage 3: Drainage procedures (thoracentesis) if necessary.",
            "Stage 4: Prevent recurrence through medication or surgery."
        ]
    },
    "Hernia": {
        "Precautions": [
            "Avoid heavy lifting and straining.",
            "Maintain healthy weight.",
            "Follow diet recommendations."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via imaging.",
            "Stage 2: Lifestyle modifications.",
            "Stage 3: Medication for discomfort or reflux.",
            "Stage 4: Surgical repair if symptomatic or severe."
        ]
    },
    "Infiltration": {
        "Precautions": [
            "Follow respiratory hygiene.",
            "Get vaccinated against flu and pneumonia.",
            "Avoid exposure to pollutants."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via X-ray and lab tests.",
            "Stage 2: Treat underlying infection with antibiotics.",
            "Stage 3: Supportive care (oxygen therapy, fluids).",
            "Stage 4: Monitor recovery and prevent complications."
        ]
    },
    "Mass": {
        "Precautions": [
            "Avoid smoking.",
            "Regular check-ups and imaging.",
            "Report symptoms like cough, weight loss, or chest pain early."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via imaging and biopsy.",
            "Stage 2: Surgical removal if operable.",
            "Stage 3: Chemotherapy or radiotherapy if malignant.",
            "Stage 4: Follow-up imaging and monitoring."
        ]
    },
    "Nodule": {
        "Precautions": [
            "Avoid smoking.",
            "Regular imaging follow-ups.",
            "Report new respiratory symptoms promptly."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via CT scan and sometimes biopsy.",
            "Stage 2: Monitoring over time for growth.",
            "Stage 3: Surgical removal if risk of malignancy.",
            "Stage 4: Regular follow-up imaging."
        ]
    },
    "Atelectasis": {
        "Precautions": [
            "Deep breathing exercises.",
            "Avoid prolonged immobility.",
            "Follow prescribed respiratory therapies."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via imaging.",
            "Stage 2: Treat underlying cause (mucus blockage, lung collapse).",
            "Stage 3: Physiotherapy and medications.",
            "Stage 4: Surgery in severe cases if obstruction persists."
        ]
    },
    "Pneumothorax": {
        "Precautions": [
            "Avoid smoking.",
            "Avoid high-pressure environments (scuba diving, flying in unpressurized planes).",
            "Seek immediate care if shortness of breath occurs."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via X-ray or CT scan.",
            "Stage 2: Observation for small cases.",
            "Stage 3: Needle aspiration or chest tube insertion for larger cases.",
            "Stage 4: Surgery if recurrent."
        ]
    },
    "Pleural_Thickening": {
        "Precautions": [
            "Avoid asbestos exposure.",
            "Avoid smoking.",
            "Regular check-ups if previously exposed."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via imaging.",
            "Stage 2: Treat underlying cause if present.",
            "Stage 3: Surgery in severe restrictive cases.",
            "Stage 4: Regular monitoring."
        ]
    },
    "Pneumonia": {
        "Precautions": [
            "Vaccination against pneumococcus and flu.",
            "Maintain hygiene and avoid infected individuals.",
            "Seek medical care at first sign of infection."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via X-ray and lab tests.",
            "Stage 2: Antibiotics for bacterial pneumonia.",
            "Stage 3: Supportive care (fluids, oxygen, rest).",
            "Stage 4: Monitor recovery and prevent complications."
        ]
    },
    "Fibrosis": {
        "Precautions": [
            "Avoid smoking and lung irritants.",
            "Regular monitoring of lung function.",
            "Vaccinations against respiratory infections."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via imaging and lung function tests.",
            "Stage 2: Medication to slow progression.",
            "Stage 3: Oxygen therapy and pulmonary rehabilitation.",
            "Stage 4: Lung transplantation in severe cases."
        ]
    },
    "Edema": {
        "Precautions": [
            "Monitor weight and fluid intake.",
            "Limit salt in diet.",
            "Follow cardiac care advice if heart-related."
        ],
        "Treatment": [
            "Stage 1: Diagnosis and identify cause (heart, kidney, lung).",
            "Stage 2: Diuretics and underlying condition management.",
            "Stage 3: Lifestyle modifications.",
            "Stage 4: Hospitalization if severe."
        ]
    },
    "Consolidation": {
        "Precautions": [
            "Avoid respiratory infections.",
            "Follow vaccination schedule.",
            "Maintain good hygiene."
        ],
        "Treatment": [
            "Stage 1: Diagnosis via X-ray and lab tests.",
            "Stage 2: Treat underlying infection (antibiotics).",
            "Stage 3: Supportive care (oxygen, fluids).",
            "Stage 4: Monitor until full recovery."
        ]
    },
}

# -----------------------------
# CUSTOM LOSS
# -----------------------------
def get_weighted_loss(pos_weights, neg_weights):
    def weighted_loss(y_true, y_pred):
        epsilon = 1e-7
        y_pred = tf.clip_by_value(y_pred, epsilon, 1 - epsilon)
        loss = (
            pos_weights * y_true * -tf.math.log(y_pred) +
            neg_weights * (1 - y_true) * -tf.math.log(1 - y_pred)
        )
        return tf.reduce_mean(loss)
    return weighted_loss

pos_weights = np.ones(len(LABELS))
neg_weights = np.ones(len(LABELS))
custom_objects = {"weighted_loss": get_weighted_loss(pos_weights, neg_weights)}

# -----------------------------
# LOAD MODEL (only once)
# -----------------------------
print("Loading lungs model...")
model = tf.keras.models.load_model(MODEL_PATH, custom_objects=custom_objects)
print("Model loaded successfully!")

# -----------------------------
# IMAGE PREPROCESSING
# -----------------------------
def load_image_bytes(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")  # <-- convert to RGB
    img = img.resize((IMG_H, IMG_W))
    x = keras_image.img_to_array(img)
    x = (x - np.mean(x)) / (np.std(x) + 1e-12)
    x = np.expand_dims(x, axis=0).astype(np.float32)
    return x, np.array(img).astype(np.uint8)


# -----------------------------
# PREDICT FUNCTION
# -----------------------------
def predict_lungs(img_bytes, threshold=0.01):
    x, raw_img = load_image_bytes(img_bytes)
    preds = model.predict(x)[0]

    pred_labels = [LABELS[i] for i, p in enumerate(preds) if p >= threshold]

    # BUILD REPORT TEXT
    if pred_labels:
        report = "===== LUNG XRAY ANALYSIS REPORT =====\n\n"
        for label in pred_labels:
            guide = DISEASE_GUIDE.get(label, None)
            report += f"\n=== {label} ===\n"
            if guide:
                report += "\nPrecautions:\n"
                for p in guide["Precautions"]:
                    report += f" - {p}\n"

                report += "\nTreatment (stage-wise):\n"
                for s in guide["Treatment"]:
                    report += f" - {s}\n"
    else:
        report = "No disease detected. The chest X-ray appears NORMAL."

    return preds.tolist(), pred_labels, raw_img, report

# -----------------------------
# GRAD-CAM
# -----------------------------
def grad_cam(model, image_array, class_index, layer_name='conv5_block16_concat'):
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(image_array)
        
        if isinstance(predictions, list):
            predictions = predictions[0]

        loss = predictions[:, class_index]
    grads = tape.gradient(loss, conv_outputs)
    weights = tf.reduce_mean(grads, axis=(1,2))
    cam = tf.reduce_sum(weights[:, None, None, :] * conv_outputs, axis=-1)
    cam = cam.numpy()[0]
    cam = np.maximum(cam, 0)
    cam = cv2.resize(cam, (IMG_W, IMG_H))
    if cam.max() > 0:
        cam /= (cam.max() + 1e-12)
    return cam

def generate_gradcam_images(img_bytes, labels_to_show):
    x, raw_arr = load_image_bytes(img_bytes)
    images = {}

    for lab in labels_to_show:
        idx = LABELS.index(lab)
        cam = grad_cam(model, x, idx)

        heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(raw_arr, 0.6, heatmap, 0.4, 0)

        # Encode base64
        _, buffer = cv2.imencode(".png", overlay)
        b64 = base64.b64encode(buffer).decode("utf-8")
        images[lab] = b64

    return images
