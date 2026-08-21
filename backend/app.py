import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from modules.data import fetch_stock_data, calculate_returns, calculate_annual_metrics
from modules.portfolio import Portfolio
from modules.optimizer import PortfolioOptimizer

app = FastAPI(title="Portfolio Optimizer API")

# CORS pour React (CORS_ORIGINS="https://mon-app.vercel.app,http://localhost:5173")
origins = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models Pydantic
class StockRequest(BaseModel):
    tickers: List[str]
    period: str = "1y"

class OptimizationResponse(BaseModel):
    optimal_weights: dict
    expected_return: float
    volatility: float
    sharpe_ratio: float
    frontier_volatilities: List[float]
    frontier_returns: List[float]

@app.get("/")
def read_root():
    return {"message": "Portfolio Optimizer API is running! 🚀"}

@app.post("/api/optimize")
def optimize_portfolio(request: StockRequest) -> OptimizationResponse:
    """
    Optimise un portefeuille selon Markowitz
    """
    if len(request.tickers) < 2:
        raise HTTPException(status_code=400, detail="Il faut au moins 2 tickers pour optimiser un portefeuille")

    try:
        prices = fetch_stock_data(request.tickers, request.period)
    except Exception:
        raise HTTPException(status_code=502, detail="Échec de récupération des données depuis Yahoo Finance")

    missing = [t for t in request.tickers if t not in prices.columns or prices[t].dropna().empty]
    if missing:
        raise HTTPException(status_code=400, detail=f"Ticker(s) invalide(s) ou sans données: {', '.join(missing)}")

    returns = calculate_returns(prices)
    annual_returns, cov_matrix, _ = calculate_annual_metrics(returns)

    portfolio = Portfolio(annual_returns.values, cov_matrix.values)
    optimizer = PortfolioOptimizer(portfolio)

    optimal_weights = optimizer.optimize_max_sharpe()
    metrics = portfolio.portfolio_metrics(optimal_weights)

    volatilities, returns_frontier = optimizer.generate_frontier(n_points=50)

    weights_dict = {ticker: float(w) for ticker, w in zip(request.tickers, optimal_weights)}

    return OptimizationResponse(
        optimal_weights=weights_dict,
        expected_return=float(metrics["return"]) * 100,
        volatility=float(metrics["volatility"]) * 100,
        sharpe_ratio=float(metrics["sharpe_ratio"]),
        frontier_volatilities=volatilities,
        frontier_returns=returns_frontier
    )

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))