# Portfolio Optimizer

Modern Portfolio Theory (Markowitz) implementation with a FastAPI backend and a
React frontend: given a set of tickers, it fetches historical prices, computes
the max-Sharpe portfolio and the efficient frontier, and plots them.

## Stack
- Backend: FastAPI, scipy.optimize (SLSQP), yfinance
- Frontend: React + Vite, Recharts
- Data: Yahoo Finance

## Getting started

```bash
# Backend — http://localhost:8000
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend — http://localhost:5173
cd frontend
npm install
npm run dev
```

The frontend calls the API at `http://localhost:8000` by default; override with
a `VITE_API_URL` env var (e.g. in `frontend/.env.local`) when deploying.

## How it works

1. `POST /api/optimize` with a list of tickers and a lookback period
2. Backend downloads adjusted close prices, computes daily log returns,
   annualizes expected returns and the covariance matrix
3. `scipy.optimize.minimize` (SLSQP) finds the max-Sharpe weights and traces
   the efficient frontier by minimizing volatility across a range of target
   returns
4. The frontend plots the frontier, highlights the optimal portfolio, and
   shows the resulting allocation
