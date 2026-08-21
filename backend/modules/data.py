import yfinance as yf
import pandas as pd
import numpy as np
from typing import List, Tuple

def fetch_stock_data(tickers: List[str], period: str = "1y") -> pd.DataFrame:
    """
    Télécharge les données des actions depuis Yahoo Finance
    
    Args:
        tickers: liste de symbols (ex: ['AAPL', 'MSFT'])
        period: période (ex: '1y', '5y')
    
    Returns:
        DataFrame avec les prix d'ajustement de clôture
    """
    data = yf.download(tickers, period=period, progress=False, auto_adjust=True)
    return data['Close']

def calculate_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """
    Calcule les retours logarithmiques
    """
    return np.log(prices / prices.shift(1)).dropna()

def calculate_annual_metrics(returns: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Calcule les métriques annualisées
    
    Returns:
        (expected_returns, covariance_matrix, correlation_matrix)
    """
    # Retours annualisés
    annual_returns = returns.mean() * 252
    
    # Matrice de covariance annualisée
    cov_matrix = returns.cov() * 252
    
    # Matrice de corrélation
    corr_matrix = returns.corr()
    
    return annual_returns, cov_matrix, corr_matrix