import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def process_dataset():
    input_file = "transaction_simulation.csv"
    output_file = "fixed_transaction_simulation.csv"
    
    print(f"Loading {input_file}...")
    df = pd.read_csv(input_file)
    
    # 1. Global Rule - Fix Account Balance
    # Replace current balance with: balance = random(2, 5) * monthly_income
    np.random.seed(42)
    random.seed(42)
    
    # We apply this first to every row
    # random(2, 5) means a uniform random float between 2 and 5
    multipliers = np.random.uniform(2, 5, size=len(df))
    df['Account_Balance'] = np.round(df['Monthly_Income_PKR'] * multipliers, 2)
    
    rules = {
        'Student': {'ceiling': 15000, 'hard_max': 35000, 'daily': (1, 4), 'bal_ceiling': 80000},
        'Housewife': {'ceiling': 8000, 'hard_max': 20000, 'daily': (1, 3), 'bal_ceiling': 50000},
        'Engineer': {'ceiling': 80000, 'hard_max': 150000, 'daily': (1, 6), 'bal_ceiling': 600000},
        'Retired': {'ceiling': 25000, 'hard_max': 60000, 'daily': (1, 2), 'bal_ceiling': 300000},
        'Business Owner': {'ceiling': 200000, 'hard_max': 500000, 'daily': (1, 8), 'bal_ceiling': 2000000},
        'Other': {'ceiling': 40000, 'hard_max': 100000, 'daily': (1, 5), 'bal_ceiling': 400000}
    }
    
    # Map any unknown profession to 'Other'
    professions = set(rules.keys())
    df['Mapped_Profession'] = df['Profession'].apply(lambda x: x if x in professions else 'Other')
    
    pools = {}
    
    # 2. Split into Normal and Anomaly pools per profession
    for prof in professions:
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
    # We'll take the first row of each user as their profile
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
            continue # Skip if no data
            
        normal_pool = prof_pools['normal']
        anomaly_pool = prof_pools['anomaly']
        
        # 30-day window organic spread
        num_active_days = random.randint(10, 28)
        active_days = sorted(random.sample(range(30), num_active_days))
        
        # Pre-calculate txns for this user
        day_txn_counts = [random.randint(r['daily'][0], r['daily'][1]) for _ in active_days]
        total_txns = sum(day_txn_counts)
        
        # Determine how many anomalies vs normal
        num_anomaly = sum([1 for _ in range(total_txns) if random.uniform(0, 100) < random.uniform(10, 15)])
        if len(anomaly_pool) == 0:
            num_anomaly = 0
            
        num_normal = total_txns - num_anomaly
        
        # Sample in bulk
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
        
        # Now assign them to days
        idx = 0
        for day_idx, day_offset in enumerate(active_days):
            num_txns = day_txn_counts[day_idx]
            for _ in range(num_txns):
                if idx >= len(sampled_dicts):
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
                
                risk_level = "Low"
                risk_score = 0.0
                compliance_flag = None
                anomaly_source = None
                
                if amt <= r['ceiling']:
                    risk_level = "Low"
                    risk_score = random.uniform(0.10, 0.35)
                elif amt <= r['hard_max']:
                    risk_level = "Medium"
                    risk_score = random.uniform(0.40, 0.65)
                else:
                    risk_level = "High"
                    risk_score = random.uniform(0.70, 0.95)
                    
                # Compliance rules
                if pool_name == 'anomaly':
                    anomaly_source = 'rule'
                    if amt > income:
                        compliance_flag = "Transaction exceeds 30-day income"
                    elif bal > r['bal_ceiling']:
                        # The prompt said "income credit would push balance above ceiling", 
                        # we'll approximate with if balance is just above ceiling
                        compliance_flag = "Balance ceiling breach"
                    elif amt > r['hard_max']:
                        compliance_flag = "Behavioral pattern anomaly — no explicit rule matched"
                    else:
                        compliance_flag = "Behavioral pattern anomaly — no explicit rule matched"
                        
                # Overwrite pool and anomaly tracking
                txn['pool'] = pool_name
                txn['risk_score'] = round(risk_score, 4)
                txn['risk_level'] = risk_level
                txn['compliance_flag'] = compliance_flag
                txn['anomaly_source'] = anomaly_source
                
                new_rows.append(txn)

    out_df = pd.DataFrame(new_rows)
    # Drop intermediate columns
    out_df = out_df.drop(columns=['Mapped_Profession'], errors='ignore')
    
    # Sort by User_ID and Timestamp
    out_df = out_df.sort_values(by=['User_ID', 'Timestamp'])
    
    print(f"Generated {len(out_df)} total transactions.")
    out_df.to_csv(output_file, index=False)
    print(f"Saved to {output_file}.")

if __name__ == "__main__":
    process_dataset()
