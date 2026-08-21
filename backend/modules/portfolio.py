import numpy as np
from typing import Tuple

class Portfolio:
    """Classe pour gérer les calculs du portefeuille"""
    
    def __init__(self, expected_returns: np.ndarray, cov_matrix: np.ndarray, risk_free_rate: float = 0.02):
        """
        Args:
            expected_returns: vecteur des retours espérés
            cov_matrix: matrice de covariance
            risk_free_rate: taux sans risque (default 2%)
        """
        self.expected_returns = expected_returns
        self.cov_matrix = cov_matrix
        self.risk_free_rate = risk_free_rate
        self.num_assets = len(expected_returns)
    
    def portfolio_return(self, weights: np.ndarray) -> float:
        """Calcule le retour du portefeuille"""
        return np.sum(weights * self.expected_returns)
    
    def portfolio_volatility(self, weights: np.ndarray) -> float:
        """Calcule la volatilité (écart-type) du portefeuille"""
        return np.sqrt(np.dot(weights, np.dot(self.cov_matrix, weights)))
    
    def sharpe_ratio(self, weights: np.ndarray) -> float:
        """Calcule le ratio de Sharpe"""
        portfolio_ret = self.portfolio_return(weights)
        portfolio_vol = self.portfolio_volatility(weights)
        
        if portfolio_vol == 0:
            return 0
        
        return (portfolio_ret - self.risk_free_rate) / portfolio_vol
    
    def portfolio_metrics(self, weights: np.ndarray) -> dict:
        """Retourne tous les métriques du portefeuille"""
        return {
            "return": self.portfolio_return(weights),
            "volatility": self.portfolio_volatility(weights),
            "sharpe_ratio": self.sharpe_ratio(weights)
        }