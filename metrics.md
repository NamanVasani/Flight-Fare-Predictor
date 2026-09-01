# Flight Fare Predictor — Model Performance Report

## Cross-Validation Performance (5-Fold CV)
- **XGBoost Regressor (Log RMSE)**: 0.1313
- **CatBoost Regressor (Log RMSE)**: 0.1585
- **XGBoost Classifier (Accuracy)**: 0.8322

## Held-Out Test Set Metrics (20% Split)

### Regression Models (Price Prediction)
| Model | RMSE (₹) | MAE (₹) | R² Score |
|---|---|---|---|
| **XGBoost Regressor** | ₹1378.52 | ₹742.73 | 0.9081 |
| **CatBoost Regressor** | ₹1432.18 | ₹824.90 | 0.9008 |
| **Ensemble (XGB + Cat)** | ₹1375.46 | ₹767.81 | **0.9085** |

### Classification Model (Price Tier Classification)
- **Accuracy**: 85.71%
- **Weighted F1 Score**: 0.8570
- **Classes**: `['High', 'Low', 'Medium', 'Premium']`

#### Confusion Matrix
```
[[416   3  47  49]
 [  1 552  30   0]
 [ 49  32 420  21]
 [ 44   0  23 406]]
```
