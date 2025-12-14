from flask import Flask, request, send_file, jsonify, Response
import numpy as np
import cv2
from io import BytesIO
import os
from PIL import Image
from controllers.brainMRIController import predict_mri
from controllers.gradcam_controller import predict_and_gradcam
import base64
import json
from controllers.Lungs import predict_lungs, generate_gradcam_images
from controllers.BoneFracture import predict_bone_fracture
from controllers.ECG import predict_ecg_route, model

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict_route():
    if "file" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "File name is empty"}), 400

    result = predict_mri(file)
    return jsonify(result)

@app.route("/gradcam", methods=["POST"])
def predict():
    if "image" not in request.files:
        return {"error": "No image uploaded"}, 400

    file = request.files["image"]
    result = predict_and_gradcam(file.read())

    combined_pil = Image.fromarray(cv2.cvtColor(result["combined_image"], cv2.COLOR_BGR2RGB))
    buf = BytesIO()
    combined_pil.save(buf, format="PNG")
    buf.seek(0)

    return send_file(buf, mimetype="image/png")


import base64

def array_to_base64(img_array):
    """Convert BGR image array to base64 string."""
    img = Image.fromarray(cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB))
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

@app.route("/predict_full", methods=["POST"])
def predict_full():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "File name is empty"}), 400
    report = predict_mri(file)

    file.seek(0)

    gradcam_result = predict_and_gradcam(file.read())
    gradcam_base64 = array_to_base64(gradcam_result["combined_image"])

    return jsonify({
        "report": report,               
        "gradcam_image": gradcam_base64  
    })
# @app.route("/predict_full", methods=["POST"])
# def predict_full():
#     if "image" not in request.files:
#         return jsonify({"error": "No image uploaded"}), 400

#     file = request.files["image"]
#     if file.filename == "":
#         return jsonify({"error": "File name is empty"}), 400

#     # ---------- Get report ----------
#     report = predict_mri(file)

#     # Reset file stream for Grad-CAM
#     file.seek(0)

#     # ---------- Get Grad-CAM ----------
#     gradcam_result = predict_and_gradcam(file.read())
#     combined_image = cv2.cvtColor(gradcam_result["combined_image"], cv2.COLOR_BGR2RGB)
#     pil_img = Image.fromarray(combined_image)
#     buf = BytesIO()
#     pil_img.save(buf, format="PNG")
#     buf.seek(0)

#     # ---------- Send image as response ----------
#     response = send_file(buf, mimetype="image/png")

#     # Include full report in a custom header
#     response.headers["X-Prediction-Report"] = json.dumps(report)

#     return response

# ---------------- LUNGS ROUTE ----------------
@app.route("/predict-lungs", methods=["POST"])
def predict_lungs_route():
    if "image" not in request.files:
        return jsonify({"error": "Image file missing"}), 400

    img_bytes = request.files["image"].read()

    preds, labels, raw_img, report = predict_lungs(img_bytes, threshold=0.001)

    gradcams = {}
    if labels:
        gradcams = generate_gradcam_images(img_bytes, labels)

    return jsonify({
        "labels": labels,
        "report": report,
        "gradcam_images": gradcams
    })

# ---------------- BONE FRACTURE ROUTE ----------------
def array_to_base64(img_array):
    img = Image.fromarray(cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB))
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

@app.route("/predict-bone", methods=["POST"])
def predict_bone_route():
    if "image" not in request.files:
        return jsonify({"error": "Image file missing"}), 400

    img_bytes = request.files["image"].read()

    result = predict_bone_fracture(img_bytes)

    img_base64 = array_to_base64(result["image"])

    return jsonify({
        "label": result["label"],
        "probability": result["probability"],
        "gradcam_image": img_base64
    })


#---------------- ECG ----------------
@app.route("/predict-ecg", methods=["POST"])
def predict_ecg():
    if "image" not in request.files:
        return jsonify({"error":"No file provided"}), 400

    file = request.files["image"]
    file_bytes = file.read() 
    result = predict_ecg_route(file_bytes, model=model)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
