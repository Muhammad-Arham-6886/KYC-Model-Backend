import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def process_dataset():
    input_file = "transaction_simulation.csv"
    output_file = "fixed_transaction_simulation.csv"
    
    print(f"Loading {input_file}...")
    df = pd.read_csv(input_file)
    
    np.random.seed(42)
    random.seed(42)
    
    rules = {
        'Student': {
            'ceiling': 15000, 
            'hard_max': 35000, 
            'daily': (1, 4), 
            'velocity_trigger': 5, 
            'bal_ceiling': 80000, 
            'bal_mult': (2, 3), 
            'flags': [
                "Multiple transfers to same recipient within 1 hour", 
                "Transaction exceeds monthly income", 
                "Unusual transaction velocity", 
                "Dormant account activity", 
                "Balance ceiling breach"
            ]
        },
        'Housewife': {
            'ceiling': 8000, 
            'hard_max': 20000, 
            'daily': (1, 3), 
            'velocity_trigger': 4, 
            'bal_ceiling': 50000, 
            'bal_mult': (2, 3), 
            'flags': [
                "Unusual transaction velocity", 
                "Transaction exceeds monthly income", 
                "Balance ceiling breach", 
                "Repeated small transfers to unknown recipient"
            ]
        },
        'Retired': {
            'ceiling': 25000, 
            'hard_max': 60000, 
            'daily': (1, 2), 
            'velocity_trigger': 3, 
            'bal_ceiling': 300000, 
            'bal_mult': (3, 4), 
            'flags': [
                "Transaction exceeds monthly income", 
                "Unusual transaction velocity", 
                "Dormant account activity", 
                "Large withdrawal post pension credit"
            ]
        },
        'Business Owner': {
            'ceiling': 200000, 
            'hard_max': 500000, 
            'daily': (1, 8), 
            'velocity_trigger': 9, 
            'bal_ceiling': 2000000, 
            'bal_mult': (3, 5), 
            'flags': [
                "Bulk transfer to new recipient", 
                "Transaction exceeds monthly income", 
                "Unusual transaction velocity", 
                "Multiple high-value transfers within 24 hours"
            ]
        },
        'Software Engineer': {
            'ceiling': 80000, 
            'hard_max': 150000, 
            'daily': (1, 6), 
            'velocity_trigger': 7, 
            'bal_ceiling': 600000, 
            'bal_mult': (3, 4), 
            'flags': [
                "Transaction exceeds monthly income", 
                "Unusual transaction velocity", 
                "Multiple high-value transfers within 24 hours", 
                "Dormant account activity", 
                "Balance ceiling breach"
            ]
        },
        'Other': {
            'ceiling': 40000, 
            'hard_max': 100000, 
            'daily': (1, 5), 
            'velocity_trigger': 6, 
            'bal_ceiling': 400000, 
            'bal_mult': (2, 4), 
            'flags': [
                "Transaction exceeds monthly income", 
                "Unusual transaction velocity", 
                "Dormant account activity", 
                "Balance ceiling breach"
            ]
        }
    }
    
    # Map unknown professions and 'Engineer' -> 'Software Engineer'
    def map_prof(x):
        if x in rules: return x
        if x == 'Engineer': return 'Software Engineer'
        return 'Other'
        
    df['Mapped_Profession'] = df['Profession'].apply(map_prof)
    
    # 1 & 2. Apply profession-specific balance multipliers
    for prof in rules.keys():
        mask = df['Mapped_Profession'] == prof
        min_mult, max_mult = rules[prof]['bal_mult']
        multipliers = np.random.uniform(min_mult, max_mult, size=mask.sum())
        df.loc[mask, 'Account_Balance'] = np.round(df.loc[mask, 'Monthly_Income_PKR'] * multipliers, 2)
    
    pools = {}
    
    # Split into Normal and Anomaly pools per profession
    for prof in rules.keys():
        prof_df = df[df['Mapped_Profession'] == prof]
        if len(prof_df) == 0:
            continue
            
        r = rules[prof]
        
        # Normal pool: transaction amount <= normal ceiling
        # Anomaly pool: transaction amount > normal ceiling OR balance > balance ceiling
        anomaly_mask = (prof_df['Transaction_Amount'] > r['ceiling']) | (prof_df['Account_Balance'] > r['bal_ceiling'])
        normal_pool = prof_df[~anomaly_mask]
        anomaly_pool = prof_df[anomaly_mask]
        
        # Cap anomaly pool to maximum 20% of that profession's total rows
        max_anomalies = int(len(prof_df) * 0.20)
        if len(anomaly_pool) > max_anomalies:
            anomaly_pool = anomaly_pool.sample(n=max_anomalies, random_state=42)
            
        pools[prof] = {
            'normal': normal_pool,
            'anomaly': anomaly_pool
        }
        print(f"{prof} -> Normal: {len(normal_pool)}, Anomaly: {len(anomaly_pool)}")
        
    # Get unique users and their static properties
    user_profiles = df.groupby('User_ID').first().reset_index()
    
    new_rows = []
    
    print("Generating new transactions per user...")
    base_date = datetime(2024, 1, 1) # Start from a fixed 30-day window
    
    for _, user in user_profiles.iterrows():
        user_id = user['User_ID']
        prof = user['Mapped_Profession']
        r = rules[prof]
        income = user['Monthly_Income_PKR']
        
        prof_pools = pools.get(prof)
        if not prof_pools or len(prof_pools['normal']) == 0:
            continue
            
        normal_pool = prof_pools['normal']
        anomaly_pool = prof_pools['anomaly']
        
        # 30-day window organic spread
        num_active_days = random.randint(10, 28)
        active_days = sorted(random.sample(range(30), num_active_days))
        
        day_txn_counts = [random.randint(r['daily'][0], r['daily'][1]) for _ in active_days]
        
        # Occasionally trigger velocity anomalies if anomaly pool is available
        if len(anomaly_pool) > 0:
            for i in range(len(day_txn_counts)):
                if random.random() < 0.1:
                    day_txn_counts[i] = r['velocity_trigger']
                    
        total_txns = sum(day_txn_counts)
        
        # Sampling 85% normal, 15% anomaly overall
        num_anomaly = sum([1 for _ in range(total_txns) if random.uniform(0, 100) < 15])
        if len(anomaly_pool) == 0:
            num_anomaly = 0
            
        num_normal = total_txns - num_anomaly
        
        if num_normal > 0:
            sampled_normal = normal_pool.sample(n=num_normal, replace=True)
            sampled_normal['pool'] = 'normal'
        else:
            sampled_normal = pd.DataFrame()
            
        if num_anomaly > 0:
            sampled_anomaly = anomaly_pool.sample(n=num_anomaly, replace=True)
            sampled_anomaly['pool'] = 'anomaly'
        else:
            sampled_anomaly = pd.DataFrame()
            
        sampled_rows = pd.concat([sampled_normal, sampled_anomaly]).sample(frac=1).reset_index(drop=True)
        sampled_dicts = sampled_rows.to_dict('records')
        
        idx = 0
        for day_idx, day_offset in enumerate(active_days):
            num_txns = day_txn_counts[day_idx]
            
            for txn_in_day in range(num_txns):
                if idx >= len(sampled_dicts):
                    # Fill with normal if we run out due to velocity triggers
                    if len(normal_pool) > 0:
                        extra = normal_pool.sample(n=1).iloc[0].to_dict()
                        extra['pool'] = 'normal'
                        sampled_dicts.append(extra)
                    else:
                        break
                        
                txn = sampled_dicts[idx].copy()
                pool_name = txn['pool']
                idx += 1
                
                # Restore User demographics
                txn['User_ID'] = user_id
                txn['Age'] = user['Age']
                txn['Gender'] = user['Gender']
                txn['City'] = user['City']
                txn['Profession'] = user['Profession']
                txn['Monthly_Income_PKR'] = income
                txn['Account_Type'] = user['Account_Type']
                txn['Account_Age_Years'] = user['Account_Age_Years']
                txn['Account_Balance'] = user['Account_Balance']
                
                hour = random.randint(8, 22)
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                txn_date = base_date + timedelta(days=day_offset, hours=hour, minutes=minute, seconds=second)
                txn['Timestamp'] = txn_date.strftime("%Y-%m-%d %H:%M:%S")
                txn['Is_Weekend'] = 1 if txn_date.weekday() >= 5 else 0
                
                amt = txn['Transaction_Amount']
                bal = txn['Account_Balance']
                
                # Risk level & score based strictly on transaction amount relative to limits
                if amt <= r['ceiling']:
                    risk_level = "Low"
                    risk_score = random.uniform(0.10, 0.35)
                elif amt <= r['hard_max']:
                    risk_level = "Medium"
                    risk_score = random.uniform(0.40, 0.65)
                else:
                    risk_level = "High"
                    risk_score = random.uniform(0.70, 0.95)
                    
                compliance_flag = None
                has_behavioral_flag = False
                
                # 1. Velocity check
                if num_txns >= r['velocity_trigger']:
                    if "Unusual transaction velocity" in r['flags']:
                        compliance_flag = "Unusual transaction velocity"
                        has_behavioral_flag = True
                
                # 2. Other rule-based flags (from anomaly pool)
                if pool_name == 'anomaly' and not has_behavioral_flag:
                    possible_flags = []
                    if amt > income and "Transaction exceeds monthly income" in r['flags']:
                        possible_flags.append("Transaction exceeds monthly income")
                    if bal > r['bal_ceiling'] and "Balance ceiling breach" in r['flags']:
                        possible_flags.append("Balance ceiling breach")
                        
                    remaining = [f for f in r['flags'] if f not in possible_flags and f != "Unusual transaction velocity"]
                    
                    if possible_flags:
                        compliance_flag = random.choice(possible_flags)
                    elif remaining:
                        compliance_flag = random.choice(remaining)
                    else:
                        compliance_flag = random.choice(r['flags'])
                        
                    has_behavioral_flag = True
                
                # 3. If a behavioral flag fires on an otherwise Low amount transaction -> Medium risk max
                if has_behavioral_flag and risk_level == "Low":
                    risk_level = "Medium"
                    risk_score = random.uniform(0.40, 0.60)
                
                # 4. Final safety checks for correct labels
                if risk_score < 0.40:
                    risk_level = "Low"
                elif risk_score <= 0.65:
                    risk_level = "Medium"
                else:
                    risk_level = "High"
                        
                txn['pool'] = pool_name
                txn['risk_score'] = round(risk_score, 4)
                txn['risk_level'] = risk_level
                txn['compliance_flag'] = compliance_flag
                
                new_rows.append(txn)

    out_df = pd.DataFrame(new_rows)
    out_df = out_df.drop(columns=['Mapped_Profession', 'pool', 'anomaly_source'], errors='ignore')
    out_df = out_df.sort_values(by=['User_ID', 'Timestamp'])
    
    print(f"Generated {len(out_df)} total transactions.")
    out_df.to_csv(output_file, index=False)
    print(f"Saved to {output_file}.")

if __name__ == "__main__":
    process_dataset()
