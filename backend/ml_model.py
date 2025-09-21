# ml_model.py
import os
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "model.joblib")
clf = joblib.load(MODEL_PATH)

def predict_fishing(temp, wind, sst, catch_kg=0, dna_presence=0):
    X = [[sst, catch_kg, dna_presence]]  # Must match training
    pred = clf.predict(X)[0]
    if pred == 1:
        return "Good fishing conditions 🎣"
    else:
        return "Not ideal conditions ❌"
