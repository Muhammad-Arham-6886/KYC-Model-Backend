import os
import joblib
import json
import pandas as pd
import numpy as np

# Resolve path to the root of the testing model directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

MODEL_PATH = os.path.join(BASE_DIR, "rf_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
ENCODERS_PATH = os.path.join(BASE_DIR, "encoders.pkl")
IMPUTATION_PATH = os.path.join(BASE_DIR, "imputation_values.json")

# Load artifacts at startup
rf_model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
encoders = joblib.load(ENCODERS_PATH)
with open(IMPUTATION_PATH, "r") as f:
    imputation_data = json.load(f)
    imputation_values = imputation_data["imputation"]
    ordered_features = imputation_data["feature_columns"]

def predict_risk(data: dict) -> dict:
    # 0. Hard Business Rules (Immediate Overrides)
    amt = data.get('Transaction_Amount')
    bal = data.get('Account_Balance')
    if amt is not None and bal is not None and float(amt) > float(bal):
        return {
            "risk_score": 0.99,
            "risk_level": "High"
        }

    df = pd.DataFrame([data])
    
    # 1. Feature Engineering
    if 'Timestamp' in df.columns and pd.notnull(df['Timestamp'].iloc[0]):
        try:
            df['Timestamp'] = pd.to_datetime(df['Timestamp'])
            df['Transaction_Hour'] = df['Timestamp'].dt.hour
        except:
            pass # Fall back to imputation if format is invalid
            
    if 'Transaction_Amount' in df.columns and 'Account_Balance' in df.columns:
        amt = df['Transaction_Amount'].iloc[0]
        bal = df['Account_Balance'].iloc[0]
        if pd.notnull(amt) and pd.notnull(bal):
            df['Amount_to_Balance_Ratio'] = amt / (bal + 1e-5)
            
    # 2. Imputation (Fill missing values with median/mode)
    for col, modal_val in imputation_values["numeric"].items():
        if col not in df.columns or pd.isnull(df[col].iloc[0]):
            df[col] = modal_val
            
    for col, mode_val in imputation_values["categorical"].items():
        if col not in df.columns or pd.isnull(df[col].iloc[0]):
            df[col] = mode_val
            
    # 3. Encoding (Label Encoders)
    for col, le in encoders.items():
        if col in df.columns:
            val = str(df[col].iloc[0])
            # Handle unseen labels
            if val in le.classes_:
                df[col] = le.transform([val])
            else:
                mode_val = str(imputation_values["categorical"][col])
                if mode_val in le.classes_:
                    df[col] = le.transform([mode_val])
                else:
                    df[col] = 0
                    
    # 4. Ordering Features
    X = df[ordered_features]
    
    # 5. Scaling
    X_scaled = scaler.transform(X)
    
    # 6. Predict
    prob = rf_model.predict_proba(X_scaled)[0, 1]
    
    # Threshold 0.3 as defined in training `(y_prob > 0.3).astype(int)`
    level = "High" if prob > 0.3 else "Low"
    
    return {
        "risk_score": float(prob),
        "risk_level": level
    }
