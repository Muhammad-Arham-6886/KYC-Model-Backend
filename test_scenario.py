import sys
import os

sys.path.insert(0, r"c:\My Files\University\Final Year Project\backend\base-testing model\backend")
from app.ml.predictors import predict_risk

print("Scenario 2:")
result = predict_risk({
    "Transaction_Amount": 50000,
    "Account_Balance": 15000,
    "Transaction_Type": "POS",
    "Device_Type": "Mobile",
    "Bank_Name": "MCB",
    "Is_Weekend": 0
})
print(result)

print("Scenario 3:")
result = predict_risk({
    "Transaction_Amount": 900000,
    "Account_Balance": 90000000,
    "Transaction_Type": "POS",
    "Device_Type": "Mobile",
    "Bank_Name": "MCB",
    "Is_Weekend": 0
})
print(result)
