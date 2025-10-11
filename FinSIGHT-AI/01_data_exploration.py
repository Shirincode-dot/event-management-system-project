"""
FinSight AI - Data Exploration
Explore and visualize transaction data
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (14, 8)

print("=" * 70)
print("📊 FinSight AI - Data Exploration")
print("=" * 70)

# Load data
print("\n📂 Loading transaction data...")
df = pd.read_csv('data/transactions.csv')
df['date'] = pd.to_datetime(df['date'])

print(f"✅ Loaded {len(df)} transactions")
print(f"📅 Date range: {df['date'].min().date()} to {df['date'].max().date()}")

# Basic overview
print("\n" + "=" * 70)
print("📋 DATASET OVERVIEW")
print("=" * 70)
print(f"Total transactions: {len(df)}")
print(f"Columns: {', '.join(df.columns)}")
print(f"\nFirst 5 transactions:")
print(df[['date', 'description', 'category', 'amount']].head())

# Financial Summary
print("\n" + "=" * 70)
print("💰 FINANCIAL SUMMARY")
print("=" * 70)

income = df[df['type'] == 'credit']['amount'].sum()
expenses = abs(df[df['type'] == 'debit']['amount'].sum())
net = income - expenses
savings_rate = (net/income)*100 if income > 0 else 0

print(f"💵 Total Income:     AED {income:,.2f}")
print(f"💸 Total Expenses:   AED {expenses:,.2f}")
print(f"💎 Net Savings:      AED {net:,.2f}")
print(f"📊 Savings Rate:     {savings_rate:.1f}%")

if net < 0:
    print(f"⚠️  Warning: Spending exceeds income by AED {abs(net):,.2f}")

# Category Analysis
print("\n" + "=" * 70)
print("🏷️  SPENDING BY CATEGORY")
print("=" * 70)

category_spending = df[df['type'] == 'debit'].groupby('category').agg({
    'amount': ['count', 'sum', 'mean']
}).round(2)
category_spending.columns = ['Count', 'Total', 'Average']
category_spending['Total'] = abs(category_spending['Total'])
category_spending['Average'] = abs(category_spending['Average'])
category_spending = category_spending.sort_values('Total', ascending=False)
category_spending['% of Expenses'] = (category_spending['Total'] / expenses * 100).round(1)

print(category_spending)

# Monthly Trends
print("\n" + "=" * 70)
print("📅 MONTHLY TRENDS")
print("=" * 70)

df['year_month'] = df['date'].dt.to_period('M')
monthly_spending = df[df['type'] == 'debit'].groupby('year_month')['amount'].sum()
monthly_spending = abs(monthly_spending)

print("Monthly spending:")
for month, amount in monthly_spending.items():
    print(f"  {month}: AED {amount:,.2f}")

avg_monthly = monthly_spending.mean()
print(f"\n📊 Average monthly spending: AED {avg_monthly:,.2f}")

# Top Merchants
print("\n" + "=" * 70)
print("🏪 TOP 10 MERCHANTS")
print("=" * 70)

top_merchants = df[df['type'] == 'debit'].groupby('merchant').agg({
    'amount': ['count', 'sum']
}).round(2)
top_merchants.columns = ['Visits', 'Total Spent']
top_merchants['Total Spent'] = abs(top_merchants['Total Spent'])
top_merchants = top_merchants.sort_values('Total Spent', ascending=False).head(10)

print(top_merchants)

# Day of Week Analysis
print("\n" + "=" * 70)
print("📆 SPENDING PATTERNS")
print("=" * 70)

dow_spending = df[df['type'] == 'debit'].groupby('day_of_week').agg({
    'amount': ['count', 'sum']
}).round(2)
dow_spending.columns = ['Transactions', 'Total Spent']
dow_spending['Total Spent'] = abs(dow_spending['Total Spent'])

print("\nSpending by day of week:")
print(dow_spending)

weekend_spend = abs(df[(df['type'] == 'debit') & (df['is_weekend'] == True)]['amount'].sum())
weekday_spend = abs(df[(df['type'] == 'debit') & (df['is_weekend'] == False)]['amount'].sum())

print(f"\n🏖️  Weekend (Fri-Sat): AED {weekend_spend:,.2f} ({weekend_spend/(weekend_spend+weekday_spend)*100:.1f}%)")
print(f"🏢 Weekday (Sun-Thu): AED {weekday_spend:,.2f} ({weekday_spend/(weekend_spend+weekday_spend)*100:.1f}%)")

# Anomaly Detection
print("\n" + "=" * 70)
print("⚠️  UNUSUAL TRANSACTIONS")
print("=" * 70)

threshold = df[df['type'] == 'debit']['amount'].quantile(0.05)  # Bottom 5% (most negative = highest spending)
unusual = df[(df['type'] == 'debit') & (df['amount'] < threshold)]

print(f"Found {len(unusual)} unusually high transactions (>95th percentile)")
if len(unusual) > 0:
    print("\nTop 5 highest spending transactions:")
    top_unusual = unusual.nsmallest(5, 'amount')[['date', 'description', 'category', 'amount']]
    top_unusual['amount'] = abs(top_unusual['amount'])
    print(top_unusual.to_string(index=False))

# Create Visualizations
print("\n" + "=" * 70)
print("📊 Creating visualizations...")
print("=" * 70)

fig = plt.figure(figsize=(16, 12))
gs = fig.add_gridspec(3, 2, hspace=0.3, wspace=0.3)

# 1. Category Pie Chart
ax1 = fig.add_subplot(gs[0, 0])
top_categories = category_spending['Total'].head(8)
colors = plt.cm.Set3(range(len(top_categories)))
ax1.pie(top_categories, labels=top_categories.index, autopct='%1.1f%%', 
        startangle=90, colors=colors)
ax1.set_title('💰 Spending by Category (Top 8)', fontsize=14, fontweight='bold', pad=20)

# 2. Monthly Trend
ax2 = fig.add_subplot(gs[0, 1])
months = [str(m) for m in monthly_spending.index]
ax2.plot(months, monthly_spending.values, marker='o', linewidth=2.5, 
         markersize=8, color='#2E86AB')
ax2.fill_between(range(len(months)), monthly_spending.values, alpha=0.3, color='#2E86AB')
ax2.set_title('📈 Monthly Spending Trend', fontsize=14, fontweight='bold', pad=20)
ax2.set_xlabel('Month', fontsize=11)
ax2.set_ylabel('Amount (AED)', fontsize=11)
ax2.tick_params(axis='x', rotation=45)
ax2.grid(True, alpha=0.3)
ax2.axhline(y=avg_monthly, color='red', linestyle='--', label=f'Avg: {avg_monthly:.0f}', linewidth=2)
ax2.legend()

# 3. Category Bar Chart
ax3 = fig.add_subplot(gs[1, :])
categories = category_spending['Total'].head(8).sort_values()
bars = ax3.barh(categories.index, categories.values, color='steelblue', edgecolor='navy')
ax3.set_title('🏷️  Top 8 Categories by Total Spending', fontsize=14, fontweight='bold', pad=20)
ax3.set_xlabel('Total Spent (AED)', fontsize=11)
ax3.grid(True, alpha=0.3, axis='x')
# Add value labels
for i, bar in enumerate(bars):
    width = bar.get_width()
    ax3.text(width, bar.get_y() + bar.get_height()/2, 
             f'AED {width:,.0f}', ha='left', va='center', fontsize=9)

# 4. Day of Week
ax4 = fig.add_subplot(gs[2, 0])
dow_order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
dow_data = dow_spending.reindex(dow_order, fill_value=0)['Total Spent']
colors_dow = ['#FF6B6B' if day in ['Friday', 'Saturday'] else '#4ECDC4' for day in dow_order]
bars = ax4.bar(range(len(dow_order)), dow_data, color=colors_dow, edgecolor='black')
ax4.set_xticks(range(len(dow_order)))
ax4.set_xticklabels(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
ax4.set_title('📆 Spending by Day of Week', fontsize=14, fontweight='bold', pad=20)
ax4.set_ylabel('Amount (AED)', fontsize=11)
ax4.grid(True, alpha=0.3, axis='y')

# 5. Income vs Expenses
ax5 = fig.add_subplot(gs[2, 1])
summary_data = [income, expenses, abs(net)]
summary_labels = ['Income', 'Expenses', 'Net Savings' if net > 0 else 'Deficit']
colors_summary = ['#2ECC71', '#E74C3C', '#3498DB' if net > 0 else '#E67E22']
bars = ax5.bar(summary_labels, summary_data, color=colors_summary, edgecolor='black', width=0.6)
ax5.set_title('💵 Financial Overview', fontsize=14, fontweight='bold', pad=20)
ax5.set_ylabel('Amount (AED)', fontsize=11)
ax5.grid(True, alpha=0.3, axis='y')
# Add value labels
for bar in bars:
    height = bar.get_height()
    ax5.text(bar.get_x() + bar.get_width()/2., height,
             f'AED {height:,.0f}', ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.suptitle('FinSight AI - Personal Finance Dashboard', 
             fontsize=18, fontweight='bold', y=0.98)

# Save figure
plt.savefig('demo/screenshots/data_exploration.png', dpi=300, bbox_inches='tight')
print("✅ Saved visualization to 'demo/screenshots/data_exploration.png'")

plt.show()

# Key Insights Summary
print("\n" + "=" * 70)
print("🔍 KEY INSIGHTS")
print("=" * 70)

print(f"\n1. 💰 Financial Health:")
if net > 0:
    print(f"   ✅ You're saving {savings_rate:.1f}% of your income ({net:,.2f} AED)")
else:
    print(f"   ⚠️  You're spending {abs(savings_rate):.1f}% more than you earn")

print(f"\n2. 🏷️  Spending Pattern:")
top_cat = category_spending.index[0]
top_cat_pct = category_spending.iloc[0]['% of Expenses']
print(f"   • Top category: {top_cat} ({top_cat_pct:.1f}% of expenses)")

print(f"\n3. 📆 Behavioral Pattern:")
weekend_pct = weekend_spend/(weekend_spend+weekday_spend)*100
if weekend_pct > 40:
    print(f"   ⚠️  You spend {weekend_pct:.1f}% of your money on weekends")
else:
    print(f"   ✅ Balanced spending: {weekend_pct:.1f}% on weekends")

print(f"\n4. 🏪 Most Frequent:")
top_merchant = top_merchants.index[0]
merchant_visits = top_merchants.iloc[0]['Visits']
print(f"   • You visit {top_merchant} most often ({int(merchant_visits)} times)")

print("\n" + "=" * 70)
print("✅ Data exploration complete!")
print("🎯 Ready for machine learning model building!")
print("=" * 70)