import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import json

def generate_artifacts():
    filepath = r"c:/My Files/University/Final Year Project/backend/base-testing model/Datasets/merged_kyc_fraud_dataset.csv"
    
    print("Loading dataset...")
    df = pd.read_csv(filepath)
    df_processed = df.copy()
    
    # 1. Feature Engineering
    print("Engineering features...")
    if 'Timestamp' in df_processed.columns:
        df_processed['Timestamp'] = pd.to_datetime(df_processed['Timestamp'])
        df_processed['Transaction_Hour'] = df_processed['Timestamp'].dt.hour
        
    if 'Transaction_Amount' in df_processed.columns and 'Account_Balance' in df_processed.columns:
        df_processed['Amount_to_Balance_Ratio'] = df_processed['Transaction_Amount'] / (df_processed['Account_Balance'] + 1e-5)
        
    # Drop unused columns as per original logic
    cols_to_drop = ['Transaction_ID', 'User_ID', 'Risk_Score', 'Previous_Fraudulent_Activity', 'Timestamp', 'Fraud_Label']
    df_processed = df_processed.drop([c for c in cols_to_drop if c in df_processed.columns], axis=1)

    # 2. Imputation Values
    print("Calculating imputation values...")
    imputation_values = {"numeric": {}, "categorical": {}}
    
    numeric_columns = df_processed.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_columns:
        median_val = df_processed[col].median()
        imputation_values["numeric"][col] = median_val
        df_processed[col] = df_processed[col].fillna(median_val)
        
    categorical_columns = df_processed.select_dtypes(include=['object']).columns.tolist()
    for col in categorical_columns:
        mode_val = df_processed[col].mode()[0]
        imputation_values["categorical"][col] = mode_val
        df_processed[col] = df_processed[col].fillna(mode_val)
        
    # 3. Label Encoders
    print("Fitting LabelEncoders...")
    encoders = {}
    for col in categorical_columns:
        le = LabelEncoder()
        df_processed[col] = le.fit_transform(df_processed[col].astype(str))
        encoders[col] = le
        
    # 4. StandardScaler
    print("Fitting StandardScaler...")
    scaler = StandardScaler()
    scaler.fit(df_processed)
    
    # Save Feature Columns used
    feature_columns = df_processed.columns.tolist()
    
    # 5. Exporting
    print("Exporting artifacts...")
    joblib.dump(scaler, "scaler.pkl")
    joblib.dump(encoders, "encoders.pkl")
    
    # Convert numpy types to native python for JSON serialization
    def convert_types(d):
        return {k: (float(v) if isinstance(v, (np.floating, float)) else int(v) if isinstance(v, (np.integer, int)) else str(v)) for k, v in d.items()}
        
    imputation_values["numeric"] = convert_types(imputation_values["numeric"])
    imputation_values["categorical"] = convert_types(imputation_values["categorical"])
    
    # Include feature column order
    export_metadata = {
        "imputation": imputation_values,
        "feature_columns": feature_columns
    }
    
    with open("imputation_values.json", "w") as f:
        json.dump(export_metadata, f, indent=4)
        
    print("Successfully generated scaler.pkl, encoders.pkl, and imputation_values.json!")

if __name__ == "__main__":
    generate_artifacts()
