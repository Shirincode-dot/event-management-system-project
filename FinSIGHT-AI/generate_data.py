"""
FinSight AI - Synthetic Personal Finance Data Generator
Generates realistic transaction data for personal finance analysis
"""

import pandas as pd
import numpy as np
from faker import Faker
from datetime import datetime, timedelta
import random

fake = Faker()
np.random.seed(42)
random.seed(42)

# Transaction categories with typical merchants and price ranges
CATEGORIES = {
    'Groceries': {
        'merchants': ['Carrefour', 'Lulu Hypermarket', 'Spinneys', 'Choithrams', 'West Zone'],
        'price_range': (50, 400),
        'frequency': 12  # times per month
    },
    'Dining & Coffee': {
        'merchants': ['Starbucks', 'Costa Coffee', 'McDonald\'s', 'Pizza Hut', 'Subway', 'Tim Hortons'],
        'price_range': (15, 200),
        'frequency': 20
    },
    'Transportation': {
        'merchants': ['ENOC Petrol', 'ADNOC', 'Uber', 'Careem', 'RTA Salik', 'Parking'],
        'price_range': (10, 300),
        'frequency': 15
    },
    'Entertainment': {
        'merchants': ['VOX Cinemas', 'Netflix', 'Spotify', 'PlayStation Store', 'Dubai Mall'],
        'price_range': (30, 500),
        'frequency': 8
    },
    'Shopping': {
        'merchants': ['Zara', 'H&M', 'Noon.com', 'Amazon.ae', 'IKEA', 'Home Centre'],
        'price_range': (50, 1000),
        'frequency': 6
    },
    'Healthcare': {
        'merchants': ['Aster Clinic', 'Mediclinic', 'Life Pharmacy', 'Boots Pharmacy'],
        'price_range': (100, 800),
        'frequency': 2
    },
    'Utilities': {
        'merchants': ['DEWA', 'Etisalat', 'du', 'Internet Bill', 'Building Maintenance'],
        'price_range': (200, 600),
        'frequency': 1
    },
    'Fitness': {
        'merchants': ['Fitness First', 'Gold\'s Gym', 'Talise Fitness', 'Yoga Studio'],
        'price_range': (200, 500),
        'frequency': 1
    },
    'Subscriptions': {
        'merchants': ['Amazon Prime', 'YouTube Premium', 'Disney+', 'Apple Music'],
        'price_range': (20, 100),
        'frequency': 1
    }
}

def generate_transactions(n_months=12, base_monthly_income=15000):
    """
    Generate synthetic personal finance transactions
    
    Args:
        n_months: Number of months of data to generate
        base_monthly_income: Average monthly income in AED
    
    Returns:
        DataFrame with transaction data
    """
    transactions = []
    start_date = datetime.now() - timedelta(days=30 * n_months)
    
    # Generate salary deposits
    for month in range(n_months):
        salary_date = start_date + timedelta(days=30 * month + random.randint(25, 28))
        salary = base_monthly_income + random.randint(-1000, 2000)
        
        transactions.append({
            'date': salary_date,
            'description': 'Salary Deposit - Company XYZ',
            'merchant': 'Employer',
            'category': 'Income',
            'amount': salary,
            'type': 'credit'
        })
    
    # Generate expenses
    for month in range(n_months):
        month_start = start_date + timedelta(days=30 * month)
        
        for category, details in CATEGORIES.items():
            freq = details['frequency']
            
            # Add some randomness to frequency
            actual_freq = max(1, freq + random.randint(-2, 2))
            
            for _ in range(actual_freq):
                # Random date within the month
                days_offset = random.randint(0, 29)
                trans_date = month_start + timedelta(days=days_offset)
                
                # Random merchant and amount
                merchant = random.choice(details['merchants'])
                min_price, max_price = details['price_range']
                amount = round(random.uniform(min_price, max_price), 2)
                
                # Add some spending spikes occasionally
                if random.random() < 0.1:  # 10% chance of higher spending
                    amount *= random.uniform(1.5, 2.5)
                
                transactions.append({
                    'date': trans_date,
                    'description': f'{merchant} - {category}',
                    'merchant': merchant,
                    'category': category,
                    'amount': -round(amount, 2),
                    'type': 'debit'
                })
    
    # Create DataFrame
    df = pd.DataFrame(transactions)
    df = df.sort_values('date').reset_index(drop=True)
    
    # Add additional features
    df['day_of_week'] = df['date'].dt.day_name()
    df['day_of_month'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['is_weekend'] = df['date'].dt.dayofweek.isin([4, 5])  # Friday, Saturday in UAE
    
    # Add running balance
    df['balance'] = df['amount'].cumsum()
    
    # Add transaction ID
    df.insert(0, 'transaction_id', range(1, len(df) + 1))
    
    return df

def add_anomalies(df, n_anomalies=5):
    """Add some unusual transactions for anomaly detection"""
    anomaly_indices = random.sample(range(len(df)), n_anomalies)
    
    for idx in anomaly_indices:
        if df.loc[idx, 'type'] == 'debit':
            # Make it 3-5x more expensive
            df.loc[idx, 'amount'] *= random.uniform(3, 5)
            df.loc[idx, 'description'] += ' [UNUSUAL]'
    
    return df

def generate_user_profile():
    """Generate user profile information"""
    profile = {
        'user_id': fake.uuid4(),
        'name': fake.name(),
        'age': random.randint(25, 45),
        'monthly_income': 15000,
        'savings_goal': 5000,
        'currency': 'AED'
    }
    return profile

if __name__ == "__main__":
    print("🚀 Generating synthetic personal finance data...")
    
    # Generate transactions for 12 months
    df = generate_transactions(n_months=12, base_monthly_income=15000)
    
    # Add some anomalies
    df = add_anomalies(df, n_anomalies=8)
    
    # Save to CSV
    df.to_csv('data/transactions.csv', index=False)
    
    print(f"✅ Generated {len(df)} transactions")
    print(f"📅 Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"💰 Total income: AED {df[df['type']=='credit']['amount'].sum():,.2f}")
    print(f"💸 Total expenses: AED {abs(df[df['type']=='debit']['amount'].sum()):,.2f}")
    print(f"💵 Net savings: AED {df['amount'].sum():,.2f}")
    
    # Generate user profile
    profile = generate_user_profile()
    profile_df = pd.DataFrame([profile])
    profile_df.to_csv('data/user_profile.csv', index=False)
    
    print("\n📊 Category breakdown:")
    category_summary = df[df['type']=='debit'].groupby('category')['amount'].agg(['count', 'sum'])
    category_summary['sum'] = abs(category_summary['sum'])
    category_summary = category_summary.sort_values('sum', ascending=False)
    print(category_summary)
    
    print("\n✅ Data saved to 'data/transactions.csv' and 'data/user_profile.csv'")
    print("🎯 Ready for analysis!")