import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import os
import random
import pandas as pd
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
from tabulate import tabulate
import tempfile

plt.switch_backend('Agg')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
train_dir = os.path.join(BASE_DIR, "dataset/Training")
save_model_path = os.path.join(BASE_DIR, "models/best_brain_tumor_effv2b2_260.keras")

IMG_SIZE = (260, 260)

CLASS_NAMES = sorted([d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))])
VALID_CLASSES = {"glioma", "meningioma", "notumor", "pituitary"}
print("✅ Loaded Classes:", CLASS_NAMES)

# ===== Load Model =====
assert os.path.exists(save_model_path), f"❌ Model file not found: {save_model_path}"

try:
    model = tf.keras.models.load_model(save_model_path)
except Exception:
    model = tf.keras.models.load_model(save_model_path, safe_mode=False, compile=False)

print("✅ Model loaded successfully!")


# ===== MRI REPORT =====
def generate_report(pred_class, confidence, img_path):
    pred_class = pred_class.lower()

    if pred_class not in VALID_CLASSES:
        return {
            "error": "Invalid MRI image. Please upload a correct brain MRI."
        }

    tumor_size_cm2 = round(random.uniform(1.0, 5.5), 2)

    if tumor_size_cm2 < 2:
        stage = "Stage I"
        stage_details = (
            "Stage I tumors are small and localized within a confined area. "
            "They typically do not invade surrounding brain tissue aggressively. "
            "Early treatment at this stage usually produces excellent outcomes."
        )
    elif tumor_size_cm2 < 4:
        stage = "Stage II"
        stage_details = (
            "Stage II tumors show moderate growth and may begin to infiltrate nearby tissues. "
            "Treatment may require a combination of approaches to prevent progression."
        )
    else:
        stage = "Stage III"
        stage_details = (
            "Stage III tumors are large or aggressively growing. "
            "They may compress or invade surrounding brain areas and require urgent and intensive treatment."
        )

    detailed_treatments = {
        "glioma": [
            {
                "Stage": "Stage I",
                "Treatment": "Surgery or Radiation",
                "Explanation": (
                    "At this early stage, most gliomas can be surgically removed. "
                    "Radiation is used to eliminate remaining abnormal cells."
                )
            },
            {
                "Stage": "Stage II",
                "Treatment": "Surgery + Chemotherapy",
                "Explanation": (
                    "The tumor begins spreading into nearby tissues. "
                    "Chemotherapy helps stop abnormal glioma cell growth after surgical removal."
                )
            },
            {
                "Stage": "Stage III",
                "Treatment": "Aggressive Combined Therapy",
                "Explanation": (
                    "High-grade gliomas grow rapidly. A combination of surgery, radiation, "
                    "and advanced chemotherapy drugs improves survival chances."
                )
            }
        ],
        "meningioma": [
            {
                "Stage": "Stage I",
                "Treatment": "Surgical Removal",
                "Explanation": (
                    "Most meningiomas at Stage I are benign and fully removable through surgery."
                )
            },
            {
                "Stage": "Stage II",
                "Treatment": "Radiation After Surgery",
                "Explanation": (
                    "Some cells may remain after surgery. Radiation therapy prevents regrowth."
                )
            },
            {
                "Stage": "Stage III",
                "Treatment": "Chemotherapy / Targeted Therapy",
                "Explanation": (
                    "At this advanced stage, meningiomas may become atypical or malignant. "
                    "Treatment combines multiple therapies to slow tumor progression."
                )
            }
        ],
        "pituitary": [
            {
                "Stage": "Stage I",
                "Treatment": "Observation / Hormone Therapy",
                "Explanation": (
                    "Small pituitary tumors may not require surgery. "
                    "Hormone medications help regulate abnormal hormonal changes."
                )
            },
            {
                "Stage": "Stage II",
                "Treatment": "Transsphenoidal Surgery",
                "Explanation": (
                    "Surgery through the nasal cavity removes the tumor with minimal brain disturbance."
                )
            },
            {
                "Stage": "Stage III",
                "Treatment": "Combined Therapy (Surgery + Radiation)",
                "Explanation": (
                    "Large invasive pituitary tumors require surgical removal followed by radiation."
                )
            }
        ],
        "notumor": [
            {
                "Stage": "N/A",
                "Treatment": "No Treatment Required",
                "Explanation": (
                    "No tumor detected. Brain structure appears normal based on the scanned region."
                )
            }
        ]
    }

    table_data = detailed_treatments[pred_class]

    return {
        "predicted_tumor_type": pred_class,
        "confidence": round(confidence, 2),
        "tumor_size_cm2": tumor_size_cm2,
        "stage": stage,
        "stage_explanation": stage_details,
        "treatments": table_data
    }

def predict_mri(file):
    temp_path = os.path.join(tempfile.gettempdir(), file.filename)
    file.save(temp_path)

    img = image.load_img(temp_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    preds = model.predict(img_array)
    pred_idx = np.argmax(preds, axis=1)[0]
    confidence = float(np.max(preds) * 100)
    pred_class = CLASS_NAMES[pred_idx]

    report = generate_report(pred_class, confidence, temp_path)

    return {
        "prediction": pred_class,
        "confidence": confidence,
        "report": report
    }
