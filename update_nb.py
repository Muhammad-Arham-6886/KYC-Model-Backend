import json
import os

fp = r"c:\My Files\University\Final Year Project\backend\base-testing model\random_forest_model.ipynb"
with open(fp, "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        new_source = []
        for line in cell.get('source', []):
            if "merged_kyc_fraud_dataset" in line:
                line = line.replace("merged_kyc_fraud_dataset", "final_kyc_fraud_dataset")
            new_source.append(line)
        cell['source'] = new_source

with open(fp, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1)
