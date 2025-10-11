\# 💰 FinSight AI - AI-Powered Personal Finance Assistant



!\[Python](https://img.shields.io/badge/Python-3.7+-blue.svg)

!\[Streamlit](https://img.shields.io/badge/Streamlit-1.26-red.svg)

!\[ML](https://img.shields.io/badge/ML-Scikit--learn-orange.svg)

!\[Status](https://img.shields.io/badge/Status-Complete-success.svg)



> An intelligent personal finance dashboard that uses machine learning to categorize transactions, predict spending patterns, and provide actionable financial insights.



\*\*Built by:\*\* Shirin Nibu |

---



\## 🎯 Project Overview



FinSight AI is a comprehensive personal finance management system that combines traditional data analytics with modern machine learning techniques to help users understand and optimize their spending habits. The application features an interactive dashboard built with Streamlit, powered by ML models achieving 91% accuracy in transaction categorization.



\### 🌟 Key Features



\- \*\*📊 Interactive Dashboard\*\*: Real-time visualization of income, expenses, and savings

\- \*\*🤖 Smart Categorization\*\*: ML model automatically classifies transactions with 91.36% accuracy

\- \*\*📈 Spending Predictions\*\*: Time-series forecasting for future expense planning

\- \*\*🔍 Behavioral Insights\*\*: AI-powered analysis of spending patterns and personalized recommendations

\- \*\*📱 Responsive Design\*\*: Clean, modern interface with interactive charts

\- \*\*🎨 Visual Analytics\*\*: Beautiful visualizations using Plotly and Matplotlib



---



\## 🛠️ Technology Stack



\### \*\*Core Technologies\*\*

\- \*\*Python 3.7+\*\*: Primary programming language

\- \*\*Streamlit\*\*: Interactive web dashboard framework

\- \*\*Scikit-learn\*\*: Machine learning models

\- \*\*Pandas \& NumPy\*\*: Data manipulation and analysis



\### \*\*Visualization\*\*

\- \*\*Plotly\*\*: Interactive charts and graphs

\- \*\*Matplotlib \& Seaborn\*\*: Statistical visualizations



\### \*\*Machine Learning\*\*

\- \*\*Random Forest Classifier\*\*: Transaction categorization (91.36% accuracy)

\- \*\*Linear Regression\*\*: Spending prediction and forecasting

\- \*\*Feature Engineering\*\*: Custom features for improved model performance



---



\## 📊 Model Performance



\### Transaction Categorization Model

\- \*\*Algorithm\*\*: Random Forest Classifier

\- \*\*Accuracy\*\*: 91.36%

\- \*\*Features Used\*\*: 6 engineered features

\- \*\*Categories\*\*: 9 spending categories

\- \*\*Training Data\*\*: 648 samples



| Category | Precision | Recall | F1-Score |

|----------|-----------|--------|----------|

| Dining \& Coffee | 0.92 | 0.96 | 0.94 |

| Groceries | 0.96 | 0.96 | 0.96 |

| Transportation | 0.97 | 0.95 | 0.96 |

| Shopping | 0.81 | 0.93 | 0.87 |

| Entertainment | 0.82 | 1.00 | 0.90 |



\### Spending Prediction Model

\- \*\*Algorithm\*\*: Linear Regression

\- \*\*MAPE\*\*: 58.44% (improving with more data)

\- \*\*Features\*\*: Time-series lag features and rolling averages



---



\## 🚀 Quick Start



\### Prerequisites

```bash

Python 3.7 or higher

pip (Python package manager)

```



\### Installation



1\. \*\*Clone the repository\*\*

```bash

git clone https://github.com/Shirincode-dot/FinSight-AI.git

cd FinSight-AI

```



2\. \*\*Install dependencies\*\*

```bash

pip install -r requirements.txt

```



3\. \*\*Generate sample data\*\*

```bash

python generate\_data.py

```



4\. \*\*Build ML models\*\*

```bash

python 02\_build\_ml\_models.py

```



5\. \*\*Run the dashboard\*\*

```bash

streamlit run app.py

```



The dashboard will automatically open in your browser at `http://localhost:8501`



---



\## 📁 Project Structure



```

FinSight-AI/

├── data/

│   ├── transactions.csv          # Transaction data

│   └── user\_profile.csv          # User profile information

├── models/

│   ├── category\_model.pkl        # Trained categorization model

│   ├── category\_encoder.pkl      # Label encoders

│   ├── merchant\_encoder.pkl

│   ├── dow\_encoder.pkl

│   └── spending\_prediction\_model.pkl

├── demo/

│   └── screenshots/              # Dashboard screenshots

├── notebooks/                    # Jupyter notebooks (optional)

├── src/                         # Source code modules

├── generate\_data.py             # Synthetic data generator

├── 01\_data\_exploration.py       # Data analysis script

├── 02\_build\_ml\_models.py        # ML model training

├── app.py                       # Streamlit dashboard

├── requirements.txt             # Python dependencies

└── README.md

```



---



\## 📈 Features in Detail



\### 1. Financial Overview

\- \*\*Real-time Metrics\*\*: Income, expenses, net savings, savings rate

\- \*\*Category Breakdown\*\*: Visual representation of spending distribution

\- \*\*Monthly Trends\*\*: Track spending patterns over time

\- \*\*Daily Averages\*\*: Understand your daily spending behavior



\### 2. Detailed Analysis

\- \*\*Day-of-Week Patterns\*\*: Identify when you spend the most

\- \*\*Merchant Analysis\*\*: Top 10 merchants by spending

\- \*\*Transaction History\*\*: Searchable and filterable transaction table

\- \*\*Category Comparisons\*\*: Compare spending across different categories



\### 3. ML-Powered Predictions

\- \*\*Category Prediction\*\*: Automatically categorize new transactions

\- \*\*Confidence Scores\*\*: See model certainty for each prediction

\- \*\*Interactive Input\*\*: Test the model with custom transaction details

\- \*\*Model Metrics\*\*: Transparency in model performance



\### 4. Smart Insights

\- \*\*Savings Analysis\*\*: Personalized feedback on savings rate

\- \*\*Spending Alerts\*\*: Warnings for categories with high spending

\- \*\*Behavioral Patterns\*\*: Weekend vs. weekday spending analysis

\- \*\*Actionable Recommendations\*\*: Data-driven suggestions for improvement



---



\## 🎓 Learning Outcomes



This project demonstrates proficiency in:



\- ✅ \*\*Data Science\*\*: ETL processes, feature engineering, statistical analysis

\- ✅ \*\*Machine Learning\*\*: Model training, evaluation, hyperparameter tuning

\- ✅ \*\*Software Development\*\*: Clean code, modular design, version control

\- ✅ \*\*Data Visualization\*\*: Interactive dashboards, storytelling with data

\- ✅ \*\*Business Intelligence\*\*: KPI development, actionable insights

\- ✅ \*\*AI Integration\*\*: Prompt engineering skills from One Million Prompters training



---



\## 🔮 Future Enhancements



\- \[ ] \*\*AI-Powered Chat\*\*: Natural language queries about finances using LLM integration

\- \[ ] \*\*Budget Recommendations\*\*: ML-driven budget optimization

\- \[ ] \*\*Anomaly Detection\*\*: Automatic fraud detection and unusual spending alerts

\- \[ ] \*\*Multi-Currency Support\*\*: Handle international transactions

\- \[ ] \*\*Export Features\*\*: PDF reports and data export functionality

\- \[ ] \*\*Mobile Optimization\*\*: Responsive design for mobile devices

\- \[ ] \*\*Bank Integration\*\*: Connect to real bank accounts via APIs

\- \[ ] \*\*Goal Tracking\*\*: Set and monitor financial goals



---



\## 📊 Sample Insights Generated



The application provides insights such as:



\- \*"You're saving 15.2% of your income (AED 2,850)"\*

\- \*"Shopping accounts for 21.6% of your expenses - consider setting a monthly budget"\*

\- \*"You spend 45% of your money on weekends - plan activities in advance"\*

\- \*"Your average transaction is AED 245 - you have 18 transactions over 2x this amount"\*



---



\## 🎯 Use Cases



\### For Individuals

\- Track personal spending habits

\- Identify areas for cost reduction

\- Set and achieve savings goals

\- Understand financial behavior



\### For Financial Advisors

\- Client portfolio analysis

\- Spending pattern identification

\- Data-driven recommendations

\- Budget planning tools



\### For Researchers

\- Consumer behavior analysis

\- Spending pattern research

\- ML model benchmarking

\- Financial literacy studies



---



\## 🤝 Contributing



Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.



---



\## 📧 Contact



\*\*Shirin Nibu\*\*

\- Email: shirinnibu@gmail.com

\- Phone: 052 832 4705

\- Location: Ajman, UAE

\- GitHub: \[@Shirincode-dot](https://github.com/Shirincode-dot)

---



\## 🏆 Certifications



\- \*\*One Million Prompters\*\* - AI \& Prompt Engineering (Dubai Future Foundation, 2025)

\- \*\*Tata Data Visualisation\*\* - Empowering Business with Effective Insights

\- \*\*Certified Data Analyst\*\* - Space Exploration (Byju's)



---



\## 📜 License



This project is open source and available under the \[MIT License](LICENSE).



---



\## 🙏 Acknowledgments



\- \*\*Dubai Future Foundation\*\* for the One Million Prompters initiative

\- \*\*Heriot-Watt University Dubai\*\* for academic foundation

\- \*\*Streamlit\*\* for the amazing dashboard framework

\- \*\*Scikit-learn\*\* community for ML tools



---



\## 📸 Screenshots



\### Dashboard Overview

!\[Overview](demo/screenshots/dashboard\_overview.png)



\### ML Predictions

!\[Predictions](demo/screenshots/ml\_predictions.png)



\### Smart Insights

!\[Insights](demo/screenshots/insights.png)



---



<div align="center">



\*\*Built with ❤️ in Dubai, UAE\*\*



\*Combining Traditional Data Science with Cutting-Edge AI\*



\[!\[GitHub](https://img.shields.io/badge/GitHub-Follow-black?logo=github)](https://github.com/Shirincode-dot)

</div>

