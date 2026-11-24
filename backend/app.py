import random
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from modules.data import (
    fetch_stock_data, calculate_returns, calculate_annual_metrics,
    validate_ticker, get_snapshot,
)
from modules.portfolio import Portfolio
from modules.optimizer import PortfolioOptimizer

app = FastAPI(title="Portfolio Optimizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pool de tickers suggérés (on en tire 8 au hasard à chaque actualisation)
POPULAR_POOL = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM",
    "JNJ", "XOM", "PG", "KO", "NESN.SW", "NOVN.SW", "ROG.SW", "UBSG.SW",
    "NESN.SW", "ABBN.SW", "ZURN.SW", "MC.PA", "SAP.DE", "ASML.AS", "SHEL.L",
]


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


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/validate/{ticker}")
def validate(ticker: str):
    t = ticker.strip().upper()
    return {"ticker": t, "valid": validate_ticker(t)}


@app.get("/api/suggestions")
def suggestions():
    """Renvoie 8 tickers tirés au hasard, avec prix et variation. Appelé à chaque clic sur Actualiser."""
    sample = random.sample(list(dict.fromkeys(POPULAR_POOL)), 8)
    return {"stocks": get_snapshot(sample)}


@app.post("/api/optimize", response_model=OptimizationResponse)
def optimize_portfolio(request: StockRequest):
    tickers = [t.strip().upper() for t in request.tickers]

    # 1. Rejette les tickers invalides AVANT de calculer
    invalid = [t for t in tickers if not validate_ticker(t)]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Ticker(s) introuvable(s) : {', '.join(invalid)}",
        )

    try:
        prices = fetch_stock_data(tickers, request.period)
        returns = calculate_returns(prices)
        annual_returns, cov_matrix, _ = calculate_annual_metrics(returns)

        portfolio = Portfolio(annual_returns.values, cov_matrix.values)
        optimizer = PortfolioOptimizer(portfolio)

        optimal_weights = optimizer.optimize_max_sharpe()
        metrics = portfolio.portfolio_metrics(optimal_weights)
        volatilities, returns_frontier = optimizer.generate_frontier(n_points=50)

        weights_dict = {t: float(w) for t, w in zip(tickers, optimal_weights)}

        return OptimizationResponse(
            optimal_weights=weights_dict,
            expected_return=float(metrics["return"]) * 100,
            volatility=float(metrics["volatility"]) * 100,
            sharpe_ratio=float(metrics["sharpe_ratio"]),
            frontier_volatilities=volatilities,
            frontier_returns=returns_frontier,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de calcul : {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)