"""
FinSight AI - Machine Learning Models
Build transaction categorization and spending prediction models
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error, r2_score
import joblib
import os

print("=" * 70)
print("🤖 FinSight AI - Machine Learning Model Builder")
print("=" * 70)

# Load data
print("\n📂 Loading data...")
df = pd.read_csv('data/transactions.csv')
df['date'] = pd.to_datetime(df['date'])
print(f"✅ Loaded {len(df)} transactions")

# Separate expenses (for categorization)
expenses = df[df['type'] == 'debit'].copy()
print(f"📊 {len(expenses)} expense transactions to analyze")

print("\n" + "=" * 70)
print("🏷️  MODEL 1: TRANSACTION CATEGORIZATION")
print("=" * 70)
print("Goal: Predict category based on merchant and transaction details")

# Feature Engineering for Categorization
print("\n🔧 Engineering features...")

# Extract features from description and merchant
expenses['description_length'] = expenses['description'].str.len()
expenses['merchant_length'] = expenses['merchant'].str.len()
expenses['abs_amount'] = abs(expenses['amount'])

# Encode merchant (simplified - using first word as indicator)
expenses['merchant_first_word'] = expenses['merchant'].str.split().str[0]

# Encode categorical features
le_merchant = LabelEncoder()
le_dow = LabelEncoder()

expenses['merchant_encoded'] = le_merchant.fit_transform(expenses['merchant'])
expenses['dow_encoded'] = le_dow.fit_transform(expenses['day_of_week'])

# Features for categorization
feature_cols = ['merchant_encoded', 'dow_encoded', 'abs_amount', 
                'day_of_month', 'is_weekend', 'description_length']

X = expenses[feature_cols]
y = expenses['category']

# Encode target
le_category = LabelEncoder()
y_encoded = le_category.fit_transform(y)

print(f"✅ Created {len(feature_cols)} features")
print(f"✅ Categories to predict: {len(le_category.classes_)}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

print(f"✅ Training set: {len(X_train)} samples")
print(f"✅ Test set: {len(X_test)} samples")

# Train Random Forest
print("\n🌲 Training Random Forest Classifier...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train, y_train)
print("✅ Model trained!")

# Evaluate
print("\n📊 Evaluating model...")
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n🎯 Accuracy: {accuracy*100:.2f}%")

# Detailed metrics
print("\n📋 Classification Report:")
print(classification_report(
    y_test, y_pred, 
    target_names=le_category.classes_,
    zero_division=0
))

# Feature importance
print("\n🔍 Most Important Features:")
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"  {row['feature']}: {row['importance']:.4f}")

# Save model and encoders
print("\n💾 Saving categorization model...")
os.makedirs('models', exist_ok=True)
joblib.dump(rf_model, 'models/category_model.pkl')
joblib.dump(le_category, 'models/category_encoder.pkl')
joblib.dump(le_merchant, 'models/merchant_encoder.pkl')
joblib.dump(le_dow, 'models/dow_encoder.pkl')
print("✅ Model saved to 'models/category_model.pkl'")

print("\n" + "=" * 70)
print("💰 MODEL 2: SPENDING PREDICTION")
print("=" * 70)
print("Goal: Predict monthly spending based on historical patterns")

# Prepare monthly aggregated data
print("\n🔧 Aggregating monthly data...")
df['year_month'] = df['date'].dt.to_period('M')

monthly_data = []
for period in df['year_month'].unique():
    month_df = df[df['year_month'] == period]
    
    income = month_df[month_df['type'] == 'credit']['amount'].sum()
    expenses_total = abs(month_df[month_df['type'] == 'debit']['amount'].sum())
    num_transactions = len(month_df[month_df['type'] == 'debit'])
    
    # Category breakdowns
    categories = month_df[month_df['type'] == 'debit'].groupby('category')['amount'].sum()
    
    monthly_data.append({
        'period': period,
        'month_num': period.month,
        'income': income,
        'expenses': expenses_total,
        'num_transactions': num_transactions,
        'avg_transaction': expenses_total / num_transactions if num_transactions > 0 else 0
    })

monthly_df = pd.DataFrame(monthly_data)
monthly_df = monthly_df.sort_values('period')

print(f"✅ Created {len(monthly_df)} monthly records")

# Features for prediction (using previous months to predict next month)
print("\n🔧 Creating time-series features...")

# Lag features (previous month values)
monthly_df['prev_expenses'] = monthly_df['expenses'].shift(1)
monthly_df['prev_transactions'] = monthly_df['num_transactions'].shift(1)

# Rolling averages
monthly_df['expenses_3m_avg'] = monthly_df['expenses'].rolling(window=3, min_periods=1).mean()

# Drop first row (no previous data)
monthly_df_clean = monthly_df.dropna()

if len(monthly_df_clean) < 5:
    print("⚠️  Not enough monthly data for reliable prediction")
    print(f"   Need at least 5 months, have {len(monthly_df_clean)}")
    print("   Skipping spending prediction model")
else:
    # Prepare features
    pred_features = ['month_num', 'prev_expenses', 'prev_transactions', 'expenses_3m_avg']
    X_pred = monthly_df_clean[pred_features]
    y_pred_target = monthly_df_clean['expenses']
    
    # Split (use last 2 months as test)
    if len(monthly_df_clean) >= 6:
        split_idx = len(monthly_df_clean) - 2
        X_train_pred = X_pred.iloc[:split_idx]
        X_test_pred = X_pred.iloc[split_idx:]
        y_train_pred = y_pred_target.iloc[:split_idx]
        y_test_pred = y_pred_target.iloc[split_idx:]
    else:
        # Use simple train-test split
        X_train_pred, X_test_pred, y_train_pred, y_test_pred = train_test_split(
            X_pred, y_pred_target, test_size=0.2, random_state=42
        )
    
    print(f"✅ Training samples: {len(X_train_pred)}")
    print(f"✅ Test samples: {len(X_test_pred)}")
    
    # Train Linear Regression
    print("\n📈 Training Linear Regression model...")
    lr_model = LinearRegression()
    lr_model.fit(X_train_pred, y_train_pred)
    print("✅ Model trained!")
    
    # Evaluate
    print("\n📊 Evaluating prediction model...")
    y_pred_lr = lr_model.predict(X_test_pred)
    
    rmse = np.sqrt(mean_squared_error(y_test_pred, y_pred_lr))
    r2 = r2_score(y_test_pred, y_pred_lr)
    mae = np.mean(np.abs(y_test_pred - y_pred_lr))
    mape = np.mean(np.abs((y_test_pred - y_pred_lr) / y_test_pred)) * 100
    
    print(f"\n🎯 Performance Metrics:")
    print(f"  R² Score: {r2:.4f}")
    print(f"  RMSE: AED {rmse:.2f}")
    print(f"  MAE: AED {mae:.2f}")
    print(f"  MAPE: {mape:.2f}%")
    
    # Show predictions vs actual
    print("\n📊 Predictions vs Actual:")
    comparison = pd.DataFrame({
        'Actual': y_test_pred.values,
        'Predicted': y_pred_lr,
        'Difference': y_test_pred.values - y_pred_lr
    })
    comparison['Error %'] = (comparison['Difference'] / comparison['Actual'] * 100).round(2)
    print(comparison.to_string())
    
    # Save model
    print("\n💾 Saving prediction model...")
    joblib.dump(lr_model, 'models/spending_prediction_model.pkl')
    print("✅ Model saved to 'models/spending_prediction_model.pkl'")

print("\n" + "=" * 70)
print("🎉 MODEL BUILDING COMPLETE!")
print("=" * 70)

print("\n📦 Models created:")
print("  ✅ Category Classifier (Random Forest)")
print(f"     - Accuracy: {accuracy*100:.2f}%")
if len(monthly_df_clean) >= 5:
    print("  ✅ Spending Predictor (Linear Regression)")
    print(f"     - MAPE: {mape:.2f}%")

print("\n💾 Saved files:")
print("  📁 models/category_model.pkl")
print("  📁 models/category_encoder.pkl")
print("  📁 models/merchant_encoder.pkl")
print("  📁 models/dow_encoder.pkl")
if len(monthly_df_clean) >= 5:
    print("  📁 models/spending_prediction_model.pkl")

print("\n🎯 Next Steps:")
print("  1. Build Streamlit dashboard")
print("  2. Deploy application")
print("  3. Add to GitHub portfolio")

print("\n" + "=" * 70)