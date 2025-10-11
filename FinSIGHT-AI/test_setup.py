"""Quick test - Simplified version"""
import pandas as pd
import os

print("🧪 Testing FinSight AI Setup...\n")

# Test 1: Check if data exists
print("1️⃣ Testing data files...")
if os.path.exists('data/transactions.csv'):
    df = pd.read_csv('data/transactions.csv')
    print(f"   ✅ Found {len(df)} transactions")
else:
    print("   ❌ transactions.csv not found")

# Test 2: Check packages
print("\n2️⃣ Testing required packages...")
required = ['pandas', 'numpy', 'sklearn', 'matplotlib', 'seaborn', 'plotly']
for package in required:
    try:
        __import__(package)
        print(f"   ✅ {package} installed")
    except ImportError:
        print(f"   ❌ {package} NOT installed")

print("\n" + "="*50)
print("🎉 Setup test complete!")
print("="*50)