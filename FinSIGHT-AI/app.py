"""
FinSight AI - Interactive Personal Finance Dashboard
Streamlit Application
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import joblib
import os

# Page config
st.set_page_config(
    page_title="FinSight AI",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 1rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 5px solid #1f77b4;
    }
    .insight-box {
        background-color: #e8f4f8;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Load data
@st.cache_data
def load_data():
    df = pd.read_csv('data/transactions.csv')
    df['date'] = pd.to_datetime(df['date'])
    return df

# Load ML models
@st.cache_resource
def load_models():
    models = {}
    if os.path.exists('models/category_model.pkl'):
        models['category'] = joblib.load('models/category_model.pkl')
        models['category_encoder'] = joblib.load('models/category_encoder.pkl')
        models['merchant_encoder'] = joblib.load('models/merchant_encoder.pkl')
        models['dow_encoder'] = joblib.load('models/dow_encoder.pkl')
    if os.path.exists('models/spending_prediction_model.pkl'):
        models['spending'] = joblib.load('models/spending_prediction_model.pkl')
    return models

# Load data and models
try:
    df = load_data()
    models = load_models()
except Exception as e:
    st.error(f"Error loading data: {e}")
    st.stop()

# Header
st.markdown('<h1 class="main-header">💰 FinSight AI</h1>', unsafe_allow_html=True)
st.markdown('<p style="text-align: center; font-size: 1.2rem; color: #666;">AI-Powered Personal Finance Assistant</p>', unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.header("📊 Filters")
    
    # Date range filter
    min_date = df['date'].min().date()
    max_date = df['date'].max().date()
    
    date_range = st.date_input(
        "Select Date Range",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date
    )
    
    if len(date_range) == 2:
        start_date, end_date = date_range
        mask = (df['date'].dt.date >= start_date) & (df['date'].dt.date <= end_date)
        filtered_df = df[mask]
    else:
        filtered_df = df
    
    # Category filter
    categories = ['All'] + sorted(df[df['type'] == 'debit']['category'].unique().tolist())
    selected_category = st.selectbox("Category", categories)
    
    if selected_category != 'All':
        filtered_df = filtered_df[filtered_df['category'] == selected_category]
    
    st.markdown("---")
    st.markdown("### 🤖 About")
    st.info("Built with ML models achieving 91% accuracy in transaction categorization")

# Main content
tabs = st.tabs(["📊 Overview", "📈 Analysis", "🤖 ML Predictions", "🔮 Insights"])

# TAB 1: Overview
with tabs[0]:
    # Calculate metrics
    income = filtered_df[filtered_df['type'] == 'credit']['amount'].sum()
    expenses = abs(filtered_df[filtered_df['type'] == 'debit']['amount'].sum())
    net = income - expenses
    savings_rate = (net/income)*100 if income > 0 else 0
    
    # Display metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "💵 Total Income",
            f"AED {income:,.2f}",
            delta=None
        )
    
    with col2:
        st.metric(
            "💸 Total Expenses",
            f"AED {expenses:,.2f}",
            delta=None
        )
    
    with col3:
        st.metric(
            "💎 Net Savings",
            f"AED {net:,.2f}",
            delta=f"{savings_rate:.1f}%"
        )
    
    with col4:
        avg_daily = expenses / ((filtered_df['date'].max() - filtered_df['date'].min()).days + 1)
        st.metric(
            "📅 Avg Daily Spending",
            f"AED {avg_daily:.2f}",
            delta=None
        )
    
    st.markdown("---")
    
    # Charts
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("💰 Spending by Category")
        category_data = filtered_df[filtered_df['type'] == 'debit'].groupby('category')['amount'].sum()
        category_data = abs(category_data).sort_values(ascending=False)
        
        fig = px.pie(
            values=category_data.values,
            names=category_data.index,
            title="Category Distribution"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("📈 Monthly Spending Trend")
        monthly = filtered_df[filtered_df['type'] == 'debit'].groupby(
            filtered_df['date'].dt.to_period('M')
        )['amount'].sum()
        monthly = abs(monthly)
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=[str(x) for x in monthly.index],
            y=monthly.values,
            mode='lines+markers',
            name='Spending',
            line=dict(color='#1f77b4', width=3),
            marker=dict(size=10)
        ))
        fig.update_layout(
            title="Monthly Spending Pattern",
            xaxis_title="Month",
            yaxis_title="Amount (AED)",
            hovermode='x'
        )
        st.plotly_chart(fig, use_container_width=True)

# TAB 2: Analysis
with tabs[1]:
    st.subheader("🔍 Detailed Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 📆 Spending by Day of Week")
        dow_data = filtered_df[filtered_df['type'] == 'debit'].groupby('day_of_week')['amount'].agg(['count', 'sum'])
        dow_data['sum'] = abs(dow_data['sum'])
        dow_order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        dow_data = dow_data.reindex(dow_order, fill_value=0)
        
        fig = px.bar(
            x=dow_data.index,
            y=dow_data['sum'],
            title="Spending by Day",
            labels={'x': 'Day', 'y': 'Amount (AED)'},
            color=dow_data['sum'],
            color_continuous_scale='Blues'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("### 🏪 Top 10 Merchants")
        merchants = filtered_df[filtered_df['type'] == 'debit'].groupby('merchant')['amount'].sum()
        merchants = abs(merchants).sort_values(ascending=False).head(10)
        
        fig = px.bar(
            x=merchants.values,
            y=merchants.index,
            orientation='h',
            title="Most Frequent Merchants",
            labels={'x': 'Total Spent (AED)', 'y': 'Merchant'},
            color=merchants.values,
            color_continuous_scale='Reds'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    st.markdown("---")
    
    # Transaction table
    st.markdown("### 📋 Recent Transactions")
    recent = filtered_df[['date', 'description', 'category', 'amount']].sort_values('date', ascending=False).head(20)
    recent['amount'] = recent['amount'].round(2)
    st.dataframe(recent, use_container_width=True, height=400)

# TAB 3: ML Predictions
with tabs[2]:
    st.subheader("🤖 Machine Learning Predictions")
    
    if 'category' in models:
        st.success("✅ Category Classification Model Loaded (91% Accuracy)")
        
        st.markdown("### 🏷️ Predict Transaction Category")
        st.info("Enter transaction details to predict its category")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            merchant_input = st.selectbox(
                "Merchant",
                options=sorted(df['merchant'].unique())
            )
        
        with col2:
            amount_input = st.number_input(
                "Amount (AED)",
                min_value=0.0,
                value=100.0,
                step=10.0
            )
        
        with col3:
            dow_input = st.selectbox(
                "Day of Week",
                options=['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            )
        
        if st.button("🔮 Predict Category", type="primary"):
            try:
                # Prepare features
                merchant_encoded = models['merchant_encoder'].transform([merchant_input])[0]
                dow_encoded = models['dow_encoder'].transform([dow_input])[0]
                
                features = np.array([[
                    merchant_encoded,
                    dow_encoded,
                    amount_input,
                    15,  # day_of_month (default)
                    dow_input in ['Friday', 'Saturday'],  # is_weekend
                    len(f"{merchant_input} - Transaction")  # description_length
                ]])
                
                prediction = models['category'].predict(features)[0]
                category = models['category_encoder'].inverse_transform([prediction])[0]
                
                proba = models['category'].predict_proba(features)[0]
                confidence = proba[prediction] * 100
                
                st.success(f"### Predicted Category: **{category}**")
                st.info(f"Confidence: {confidence:.1f}%")
                
            except Exception as e:
                st.error(f"Prediction error: {e}")
    else:
        st.warning("⚠️ Models not found. Run 02_build_ml_models.py first")
    
    st.markdown("---")
    
    # Model performance
    st.markdown("### 📊 Model Performance")
    col1, col2 = st.columns(2)
    
    with col1:
        st.metric("Category Model Accuracy", "91.36%")
        st.caption("Random Forest Classifier with 6 features")
    
    with col2:
        if 'spending' in models:
            st.metric("Spending Prediction MAPE", "58.44%")
            st.caption("Linear Regression with time-series features")
        else:
            st.info("Spending model available after sufficient data")

# TAB 4: Insights
with tabs[3]:
    st.subheader("🔮 Smart Insights")
    
    expenses_df = filtered_df[filtered_df['type'] == 'debit']
    
    # Insight 1: Savings
    st.markdown('<div class="insight-box">', unsafe_allow_html=True)
    if net > 0:
        st.markdown(f"### ✅ Good News!")
        st.write(f"You're saving **{savings_rate:.1f}%** of your income (AED {net:,.2f})")
    else:
        st.markdown(f"### ⚠️ Alert!")
        st.write(f"You're spending **{abs(savings_rate):.1f}%** more than you earn")
        st.write("**Suggestion:** Review your top spending categories and identify areas to cut back")
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Insight 2: Top category
    top_cat = expenses_df.groupby('category')['amount'].sum().abs().idxmax()
    top_cat_amount = abs(expenses_df[expenses_df['category'] == top_cat]['amount'].sum())
    top_cat_pct = (top_cat_amount / expenses) * 100
    
    st.markdown('<div class="insight-box">', unsafe_allow_html=True)
    st.markdown(f"### 📊 Your Top Spending Category")
    st.write(f"**{top_cat}** accounts for **{top_cat_pct:.1f}%** of your expenses (AED {top_cat_amount:,.2f})")
    if top_cat_pct > 30:
        st.write("💡 **Tip:** This is a significant portion. Consider setting a monthly budget for this category")
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Insight 3: Weekend spending
    weekend_spend = abs(expenses_df[expenses_df['is_weekend'] == True]['amount'].sum())
    weekday_spend = abs(expenses_df[expenses_df['is_weekend'] == False]['amount'].sum())
    weekend_pct = (weekend_spend / (weekend_spend + weekday_spend)) * 100
    
    st.markdown('<div class="insight-box">', unsafe_allow_html=True)
    st.markdown(f"### 📆 Weekend Spending Pattern")
    st.write(f"You spend **{weekend_pct:.1f}%** of your money on weekends (AED {weekend_spend:,.2f})")
    if weekend_pct > 40:
        st.write("💡 **Tip:** Plan weekend activities in advance to control impulse spending")
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Insight 4: Average transaction
    avg_transaction = abs(expenses_df['amount'].mean())
    st.markdown('<div class="insight-box">', unsafe_allow_html=True)
    st.markdown(f"### 💳 Transaction Behavior")
    st.write(f"Your average transaction is **AED {avg_transaction:.2f}**")
    
    high_trans = len(expenses_df[abs(expenses_df['amount']) > avg_transaction * 2])
    st.write(f"You have **{high_trans}** transactions over 2x the average")
    st.markdown('</div>', unsafe_allow_html=True)

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666; padding: 1rem;'>
    <p>💰 FinSight AI - Built with Streamlit, Scikit-learn, and Plotly</p>
    <p>🎓 Created by Shirin Nibu | One Million Prompters Graduate</p>
</div>
""", unsafe_allow_html=True)