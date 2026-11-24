import yfinance as yf
import pandas as pd
import numpy as np
from typing import List, Tuple


def fetch_stock_data(tickers: List[str], period: str = "1y") -> pd.DataFrame:
    data = yf.download(tickers, period=period, progress=False, auto_adjust=True)
    return data["Close"]


def calculate_returns(prices: pd.DataFrame) -> pd.DataFrame:
    return np.log(prices / prices.shift(1)).dropna()


def calculate_annual_metrics(returns: pd.DataFrame) -> Tuple[pd.Series, pd.DataFrame, pd.DataFrame]:
    annual_returns = returns.mean() * 252
    cov_matrix = returns.cov() * 252
    corr_matrix = returns.corr()
    return annual_returns, cov_matrix, corr_matrix


def validate_ticker(ticker: str) -> bool:
    """Un ticker est valide si Yahoo Finance renvoie au moins une cotation récente."""
    try:
        hist = yf.Ticker(ticker).history(period="5d")
        return not hist.empty
    except Exception:
        return False


def get_snapshot(tickers: List[str]) -> List[dict]:
    """Prix et variation du dernier jour pour une liste de tickers."""
    results = []
    for t in tickers:
        try:
            hist = yf.Ticker(t).history(period="5d")
            if hist.empty:
                continue
            last = float(hist["Close"].iloc[-1])
            prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else last
            results.append({
                "ticker": t,
                "price": round(last, 2),
                "change_pct": round((last / prev - 1) * 100, 2),
            })
        except Exception:
            continue
    return results