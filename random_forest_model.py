import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score, classification_report, roc_curve
from sklearn.model_selection import cross_val_score
import joblib
from imblearn.over_sampling import SMOTE
import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
np.random.seed(42)

def load_and_inspect_data(filepath):
    """
    1. Dataset Handling
    - Load and validate dataset
    - Perform structural inspection (shape, datatypes, null values)
    - Verify label distribution
    """
    print("-" * 50)
    print("1. DATASET HANDLING & INSPECTION")
    print("-" * 50)
    
    # Load dataset
    try:
        df = pd.read_csv(filepath)
        print(f"Dataset loaded successfully. Shape: {df.shape}")
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None
        
    # Structural inspection
    print("\nData Types:")
    print(df.dtypes)
    
    print("\nNull Values:")
    print(df.isnull().sum())
    
    # Label distribution
    if 'Fraud_Label' in df.columns:
        print("\nLabel Distribution (Fraud_Label):")
        print(df['Fraud_Label'].value_counts(normalize=True))
    else:
        print("\nWarning: 'Fraud_Label' not found in columns.")
        
    return df

def perform_eda(df):
    """
    2. Exploratory Data Analysis (EDA)
    - Class distribution analysis
    - Correlation analysis
    - Risk pattern discovery
    """
    print("\n" + "-" * 50)
    print("2. EXPLORATORY DATA ANALYSIS (EDA)")
    print("-" * 50)
    
    # Class distribution (already printed, but good to note)
    fraud_pct = df['Fraud_Label'].mean() * 100
    print(f"Percentage of fraudulent transactions: {fraud_pct:.2f}%")
    
    # Identify numeric columns for correlation
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    # Correlation with target
    if 'Fraud_Label' in numeric_cols:
        corr_matrix = df[numeric_cols].corr()
        target_corr = corr_matrix['Fraud_Label'].sort_values(ascending=False)
        print("\nTop features correlated with Fraud_Label:")
        print(target_corr.head(5))
        print("\nBottom features correlated with Fraud_Label (negative correlation):")
        print(target_corr.tail(5))
        
    # Statistical summary
    print("\nStatistical Summary of Numeric Features:")
    print(df.describe().T[['mean', 'std', 'min', '50%', 'max']])
    
    # Behavioral patterns (example: Avg Transaction Amount)
    print("\nBehavioral Patterns:")
    if 'Avg_Transaction_Amount_7d' in df.columns:
        print("Average 'Avg_Transaction_Amount_7d' by Fraud_Label:")
        print(df.groupby('Fraud_Label')['Avg_Transaction_Amount_7d'].mean())
        
    if 'Risk_Score' in df.columns:
        print("\nAverage 'Risk_Score' by Fraud_Label:")
        print(df.groupby('Fraud_Label')['Risk_Score'].mean())

def preprocess_and_engineer_features(df):
    """
    3 & 4. Data Preprocessing and Feature Engineering
    - Handle missing values, outliers, encoding, scaling
    - Feature engineering aligned with frontend
    """
    print("\n" + "-" * 50)
    print("3 & 4. DATA PREPROCESSING & FEATURE ENGINEERING")
    print("-" * 50)
    
    df_processed = df.copy()
    
    # --- Feature Engineering ---
    # Convert Timestamp to datetime to extract features
    if 'Timestamp' in df_processed.columns:
        df_processed['Timestamp'] = pd.to_datetime(df_processed['Timestamp'])
        # Extract hour of day: late night transactions might be riskier
        df_processed['Transaction_Hour'] = df_processed['Timestamp'].dt.hour
        # Drop original Timestamp as models need numeric inputs
        df_processed = df_processed.drop('Timestamp', axis=1)
        print("Engineered feature: 'Transaction_Hour' from 'Timestamp'.")
        
    # Create an Amount to Balance ratio (High ratio might indicate account takeover or risky behavior)
    if 'Transaction_Amount' in df_processed.columns and 'Account_Balance' in df_processed.columns:
        # Avoid division by zero
        df_processed['Amount_to_Balance_Ratio'] = df_processed['Transaction_Amount'] / (df_processed['Account_Balance'] + 1e-5)
        print("Engineered feature: 'Amount_to_Balance_Ratio'.")
        
    # --- Preprocessing ---
    # Handling missing values
    # For numeric columns, fill with median (robust to outliers)
    numeric_columns = df_processed.select_dtypes(include=[np.number]).columns
    for col in numeric_columns:
        if df_processed[col].isnull().any():
            df_processed[col] = df_processed[col].fillna(df_processed[col].median())
            print(f"Filled missing numeric values in '{col}' with median.")
            
    # For categorical columns, fill with mode
    categorical_columns = df_processed.select_dtypes(include=['object']).columns
    for col in categorical_columns:
        if df_processed[col].isnull().any():
            df_processed[col] = df_processed[col].fillna(df_processed[col].mode()[0])
            print(f"Filled missing categorical values in '{col}' with mode.")

    # Drop identifiers that shouldn't be used for predicting (Data leakage / irrelevant)
    # ALSO dropping Risk_Score and Previous_Fraudulent_Activity to prevent Target/Data Leakage
    cols_to_drop = ['Transaction_ID', 'User_ID', 'Risk_Score', 'Previous_Fraudulent_Activity']
    df_processed = df_processed.drop([c for c in cols_to_drop if c in df_processed.columns], axis=1)
    
    # Encoding categorical features
    # Using Label Encoding for simplicity in tree-based models, though One-Hot is better for non-tree models
    label_encoders = {}
    categorical_columns = df_processed.select_dtypes(include=['object']).columns
    for col in categorical_columns:
        le = LabelEncoder()
        df_processed[col] = le.fit_transform(df_processed[col])
        label_encoders[col] = le
    print(f"Encoded categorical features: {list(categorical_columns)}")
    
    # Separate features (X) and target (y)
    X = df_processed.drop('Fraud_Label', axis=1)
    y = df_processed['Fraud_Label']
    
    # Feature scaling (Standardization)
    # Note: Random Forest doesn't strictly require scaling, but it's good practice, 
    # especially if frontend needs normalized inputs later or if trying other models.
    scaler = StandardScaler()
    # Keep column names after scaling
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)
    print("Applied Standard Scaling to features.")
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
    print(f"Train-test split completed. Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    
    return X_train, X_test, y_train, y_test, X.columns

def handle_imbalance(X_train, y_train):
    """
    5. Class Imbalance Handling
    - Quantify imbalance and apply SMOTE
    """
    print("\n" + "-" * 50)
    print("5. CLASS IMBALANCE HANDLING")
    print("-" * 50)
    
    # Quantify imbalance ratio
    class_counts = y_train.value_counts()
    imbalance_ratio = class_counts[0] / class_counts[1]
    print(f"Original Training Class Distribution:\n{class_counts}")
    print(f"Imbalance Ratio (Majority:Minority) = {imbalance_ratio:.2f}:1")
    
    print("\nApplying SMOTE (Synthetic Minority Over-sampling Technique)...")
    print("Justification: SMOTE creates synthetic examples of the minority class rather than just duplicating them,")
    print("which helps the Random Forest model generalize better to unseen fraud cases without overfitting to specific duplicates.")
    
    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
    
    print(f"Resampled Training Class Distribution:\n{y_train_resampled.value_counts()}")
    return X_train_resampled, y_train_resampled

def train_and_evaluate_rf(X_train, y_train, X_test, y_test):
    """
    6 & 7. Model Training & Evaluation
    - Initialize, configure, train Random Forest
    - Display Accuracy, Precision, Recall, F1, Confusion Matrix
    """
    print("\n" + "-" * 50)
    print("6 & 7. MODEL TRAINING & EVALUATION (Random Forest)")
    print("-" * 50)
    
    # Initialization and Hyperparameter Configuration (Tuned for Recall & FYP Best Practices)
    rf_model = RandomForestClassifier(
        n_estimators=200, 
        max_depth=20, 
        class_weight='balanced',
        random_state=42, 
        n_jobs=-1 # Use all processors
    )
    
    print("Training Tuned Random Forest Classifier...")
    # Training phase
    rf_model.fit(X_train, y_train)
    
    # Prediction phase with Custom Threshold for better Recall
    print("Making predictions using optimized 0.3 threshold...")
    # Getting probabilities instead of strict class predictions
    y_prob = rf_model.predict_proba(X_test)[:, 1]
    
    # Custom threshold (Catch more fraud)
    y_pred = (y_prob > 0.3).astype(int)
    
    # Evaluation metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    # AUC Score
    if len(np.unique(y_test)) > 1:
        auc_score = roc_auc_score(y_test, y_prob)
    else:
        auc_score = "N/A (Only one class in test set)"
    
    print("\n--- Evaluation Metrics (Threshold = 0.3) ---")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f} (When model predicts fraud, how often is it right?)")
    print(f"Recall:    {recall:.4f} (Out of all actual frauds, how many did we find?)")
    print(f"F1-Score:  {f1:.4f} (Harmonic mean of Precision and Recall)")
    print(f"AUC Score: {auc_score}")
    print("\nConfusion Matrix:")
    print(cm)
    print("Format:")
    print("[[True Negative (Legit predicted Legit), False Positive (Legit predicted Fraud)]")
    print(" [False Negative (Fraud predicted Legit), True Positive (Fraud predicted Fraud)]]")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # --- ROC Curve Visualization ---
    if len(np.unique(y_test)) > 1:
        fpr, tpr, thresholds = roc_curve(y_test, y_prob)
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {auc_score:.2f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver Operating Characteristic (ROC) Curve')
        plt.legend(loc="lower right")
        
        # Save ROC internally instead of popping up, to keep scripts quiet unless specifically analyzed
        plt.savefig('roc_curve_output.png')
        print("ROC Curve saved locally as 'roc_curve_output.png'")
        # plt.show() # Disabled for headless running, uncomment in notebooks

    return rf_model

def execute_cross_validation(rf_model, X_scaled, y):
    """
    Perform Cross-Validation to ensure the model isn't overfitting
    """
    print("\n" + "-" * 50)
    print("8. CROSS-VALIDATION CHECK")
    print("-" * 50)
    
    print("Executing 5-Fold Cross Validation. This may take a moment...")
    # Use 5 folds
    scores = cross_val_score(rf_model, X_scaled, y, cv=5, scoring='accuracy', n_jobs=-1)
    print(f"Cross-Validation Accuracy Scores: {scores}")
    print(f"Mean CV Accuracy: {scores.mean():.4f}")
    print(f"Standard Deviation: {scores.std():.4f}")
    if scores.mean() > 0.99:
        print("Warning: CV Mean is still extremely high. Check for other sneaky leaky features.")
    else:
        print("Model CV accuracy appears more realistic.")


def main():
    filepath = r"c:/My Files/University/Final Year Project/backend/base-testing model/Datasets/merged_kyc_fraud_dataset.csv"
    
    # 1. Dataset Handling
    df = load_and_inspect_data(filepath)
    if df is None:
        return
        
    # 2. EDA
    perform_eda(df)
    
    # 3 & 4. Preprocessing & Feature Engineering
    X_train, X_test, y_train, y_test, feature_names = preprocess_and_engineer_features(df)
    
    # We will need the full scaled X and y for Cross-Validation later
    # Re-apply processing simply to obtain standard X scaled and Y (since we split before returning)
    df_temp = df.copy()
    cols_to_drop = ['Transaction_ID', 'User_ID', 'Risk_Score', 'Previous_Fraudulent_Activity', 'Timestamp']
    df_temp = df_temp.drop([c for c in cols_to_drop if c in df_temp.columns], axis=1)
    for col in df_temp.select_dtypes(include=['object']).columns:
        if col != 'Fraud_Label':
            df_temp[col] = LabelEncoder().fit_transform(df_temp[col].astype(str))
    # Quick fix for CV inputs
    X_full = df_temp.drop('Fraud_Label', axis=1, errors='ignore')
    
    # 5. Handle Imbalance
    X_train_resampled, y_train_resampled = handle_imbalance(X_train, y_train)
    
    # 6 & 7. Train and Evaluate
    rf_model = train_and_evaluate_rf(X_train_resampled, y_train_resampled, X_test, y_test)
    
    # 8. Cross Validation
    scaler = StandardScaler()
    X_full_scaled = scaler.fit_transform(X_full.fillna(X_full.median()))
    y_full = df['Fraud_Label']
    execute_cross_validation(rf_model, X_full_scaled, y_full)
    
    # 9. Save Model
    print("\n" + "-" * 50)
    print("9. SAVING MODEL")
    print("-" * 50)
    model_filename = "rf_model.pkl"
    joblib.dump(rf_model, model_filename)
    print(f"Model saved successfully to '{model_filename}'")
    
    print("\nPipeline execution completed successfully.")

if __name__ == "__main__":
    main()
