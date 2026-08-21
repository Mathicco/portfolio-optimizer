import numpy as np
from scipy.optimize import minimize
from .portfolio import Portfolio
from typing import Tuple, List

class PortfolioOptimizer:
    """Optimise les portefeuilles selon la théorie de Markowitz"""
    
    def __init__(self, portfolio: Portfolio):
        self.portfolio = portfolio
        self.n_assets = portfolio.num_assets
    
    def optimize_max_sharpe(self) -> np.ndarray:
        """
        Trouve le portefeuille avec le Sharpe ratio maximal
        (le meilleur portefeuille)
        """
        # Contraintes: poids entre 0 et 1, somme = 1
        constraints = {
            'type': 'eq',
            'fun': lambda w: np.sum(w) - 1
        }
        
        bounds = tuple((0, 1) for _ in range(self.n_assets))
        
        # Guess initial: poids égaux
        x0 = np.array([1 / self.n_assets] * self.n_assets)
        
        # Minimise le négatif de Sharpe (pour maximiser)
        result = minimize(
            lambda w: -self.portfolio.sharpe_ratio(w),
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )
        
        return result.x
    
    def optimize_min_volatility(self) -> np.ndarray:
        """
        Trouve le portefeuille avec la volatilité minimale
        """
        constraints = {
            'type': 'eq',
            'fun': lambda w: np.sum(w) - 1
        }
        
        bounds = tuple((0, 1) for _ in range(self.n_assets))
        x0 = np.array([1 / self.n_assets] * self.n_assets)
        
        result = minimize(
            self.portfolio.portfolio_volatility,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )
        
        return result.x
    
    def generate_frontier(self, n_points: int = 100) -> Tuple[List[float], List[float]]:
        """
        Génère la frontière efficiente (courbe Markowitz)
        
        Returns:
            (volatilities, returns) - les points de la frontière
        """
        volatilities = []
        returns = []
        
        # On crée des portefeuilles avec différents retours cibles
        min_ret = self.portfolio.expected_returns.min()
        max_ret = self.portfolio.expected_returns.max()
        target_returns = np.linspace(min_ret, max_ret, n_points)
        
        for target_ret in target_returns:
            # Minimise la volatilité pour ce retour cible
            constraints = [
                {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},
                {'type': 'eq', 'fun': lambda w: self.portfolio.portfolio_return(w) - target_ret}
            ]
            
            bounds = tuple((0, 1) for _ in range(self.n_assets))
            x0 = np.array([1 / self.n_assets] * self.n_assets)
            
            try:
                result = minimize(
                    self.portfolio.portfolio_volatility,
                    x0,
                    method='SLSQP',
                    bounds=bounds,
                    constraints=constraints,
                    options={'maxiter': 500}
                )
                
                if result.success:
                    vol = self.portfolio.portfolio_volatility(result.x)
                    ret = self.portfolio.portfolio_return(result.x)
                    volatilities.append(vol * 100)  # en pourcentage
                    returns.append(ret * 100)       # en pourcentage
            except:
                pass
        
        return volatilities, returns