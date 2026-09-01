import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, f1_score, confusion_matrix, classification_report
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBRegressor, XGBClassifier
from catboost import CatBoostRegressor

# 1. Path & Dataset Loading Fix (Items #1 & #2)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "Flight_Fare.csv")

print(f"Loading dataset from: {DATA_PATH}")
data = pd.read_csv(DATA_PATH)
data = data.drop_duplicates()
data = data.dropna(subset=["Route", "Total_Stops"])

# Clean categorical values
data["Source"] = data["Source"].replace("New Delhi", "Delhi")
data["Destination"] = data["Destination"].replace("New Delhi", "Delhi")
data["Additional_Info"] = data["Additional_Info"].replace("No info", "No Info")
data = data[data["Duration"] != "5m"]

rare_airlines = data["Airline"].value_counts()
rare_airlines = rare_airlines[rare_airlines < 10].index
data["Airline"] = data["Airline"].replace(rare_airlines, "other")

def convert_duration(duration):
    hours = 0
    minutes = 0
    if "h" in duration:
        hours = int(duration.split("h")[0])
    if "m" in duration:
        minutes = int(duration.split("h")[-1].replace("m", " ").strip())
    return hours * 60 + minutes

data["Duration"] = data["Duration"].apply(convert_duration)

data["Journey_Date"] = data["Date_of_Journey"].apply(lambda d: int(d.split("/")[0]))
data["Journey_Month"] = data["Date_of_Journey"].apply(lambda d: int(d.split("/")[1]))

def time_fun(time_str):
    hour = int(time_str.split(":")[0])
    if (18 <= hour <= 23) or (0 <= hour < 6):
        return "Night"
    return "Day"

data["Bucket"] = data["Dep_Time"].apply(time_fun)
data["Dep_Time"] = data["Dep_Time"].apply(lambda t: int(t.split(":")[0]))

# Item #8 Fix: Standardized ETA calculation matching inference formula
data["Estimated_Time_of_Arrival"] = ((data["Dep_Time"] * 60 + data["Duration"]) // 60) % 24

data["Total_Stops"] = data["Total_Stops"].replace("non-stop", "0")
data["Total_Stops"] = data["Total_Stops"].apply(lambda s: int(s.split(" ")[0]))

data = data.drop(["Route", "Date_of_Journey", "Arrival_Time"], axis=1)

# Item #3 Fix: train_test_split BEFORE dummy encoding (pd.get_dummies) to prevent data leakage
train_df, test_df = train_test_split(data, test_size=0.2, random_state=42)

cat_cols = ["Airline", "Source", "Destination", "Additional_Info", "Bucket"]

train_encoded = pd.get_dummies(train_df, columns=cat_cols, drop_first=True, dtype=int)
X_train_reg = train_encoded.drop("Price", axis=1)
y_train_price = train_encoded["Price"]
y_train_log = np.log1p(y_train_price)

reg_columns = X_train_reg.columns.tolist()

# Encode test set aligned strictly with train columns (no data leakage)
test_encoded = pd.get_dummies(test_df, columns=cat_cols, drop_first=True, dtype=int)
X_test_reg = test_encoded.drop("Price", axis=1).reindex(columns=reg_columns, fill_value=0)
y_test_price = test_encoded["Price"]
y_test_log = np.log1p(y_test_price)

print(f"\nDataset Split: Train={len(X_train_reg)} samples, Test={len(X_test_reg)} samples")
print(f"Number of Features: {len(reg_columns)}")

# Item #5 Fix: 5-Fold Cross Validation on Training Data
kf = KFold(n_splits=5, shuffle=True, random_state=42)

# Further split X_train_reg for validation during early stopping
X_tr, X_val, y_tr_log, y_val_log = train_test_split(X_train_reg, y_train_log, test_size=0.15, random_state=42)

# --- XGBOOST REGRESSOR ---
xgb_model = XGBRegressor(
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=7,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1,
    early_stopping_rounds=50
)

print("\nRunning 5-Fold Cross-Validation for XGBoost Regressor...")
cv_xgb_scores = cross_val_score(
    XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=7, subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1),
    X_train_reg, y_train_log, cv=kf, scoring='neg_root_mean_squared_error'
)
print(f"XGBoost 5-Fold CV Log RMSE: {-cv_xgb_scores.mean():.4f} (+/- {cv_xgb_scores.std():.4f})")

xgb_model.fit(
    X_tr, y_tr_log,
    eval_set=[(X_val, y_val_log)],
    verbose=False
)
y_pred_xgb_log = xgb_model.predict(X_test_reg)
y_pred_xgb = np.expm1(y_pred_xgb_log)

xgb_rmse = np.sqrt(mean_squared_error(y_test_price, y_pred_xgb))
xgb_mae = mean_absolute_error(y_test_price, y_pred_xgb)
xgb_r2 = r2_score(y_test_price, y_pred_xgb)

print("\n===== XGBOOST REGRESSOR TEST METRICS =====")
print(f"RMSE : ₹{xgb_rmse:.2f}")
print(f"MAE  : ₹{xgb_mae:.2f}")
print(f"R2   : {xgb_r2:.4f}")

# --- CATBOOST REGRESSOR ---
cat_model = CatBoostRegressor(
    iterations=1000,
    learning_rate=0.05,
    depth=7,
    random_seed=42,
    verbose=0,
    early_stopping_rounds=50
)

print("\nRunning 5-Fold Cross-Validation for CatBoost Regressor...")
cv_cat_scores = cross_val_score(
    CatBoostRegressor(iterations=300, learning_rate=0.05, depth=7, random_seed=42, verbose=0),
    X_train_reg, y_train_log, cv=kf, scoring='neg_root_mean_squared_error'
)
print(f"CatBoost 5-Fold CV Log RMSE: {-cv_cat_scores.mean():.4f} (+/- {cv_cat_scores.std():.4f})")

cat_model.fit(
    X_tr, y_tr_log,
    eval_set=(X_val, y_val_log),
    verbose=False
)
y_pred_cat_log = cat_model.predict(X_test_reg)
y_pred_cat = np.expm1(y_pred_cat_log)

cat_rmse = np.sqrt(mean_squared_error(y_test_price, y_pred_cat))
cat_mae = mean_absolute_error(y_test_price, y_pred_cat)
cat_r2 = r2_score(y_test_price, y_pred_cat)

print("\n===== CATBOOST REGRESSOR TEST METRICS =====")
print(f"RMSE : ₹{cat_rmse:.2f}")
print(f"MAE  : ₹{cat_mae:.2f}")
print(f"R2   : {cat_r2:.4f}")

# --- ENSEMBLE ---
y_pred_ens_log = (y_pred_xgb_log + y_pred_cat_log) / 2
y_pred_ens = np.expm1(y_pred_ens_log)

ens_rmse = np.sqrt(mean_squared_error(y_test_price, y_pred_ens))
ens_mae = mean_absolute_error(y_test_price, y_pred_ens)
ens_r2 = r2_score(y_test_price, y_pred_ens)

print("\n===== ENSEMBLE (XGB + CATBOOST) TEST METRICS =====")
print(f"RMSE : ₹{ens_rmse:.2f}")
print(f"MAE  : ₹{ens_mae:.2f}")
print(f"R2   : {ens_r2:.4f}")

# Save regression models & feature columns
joblib.dump(xgb_model, os.path.join(BASE_DIR, "xgb_regressor.pkl"))
joblib.dump(cat_model, os.path.join(BASE_DIR, "catboost_regressor.pkl"))
joblib.dump(reg_columns, os.path.join(BASE_DIR, "reg_columns.pkl"))
print("\nRegression models and reg_columns.pkl saved successfully!")

# Item #4 Fix: Quantile Binning for Classification computed on Y_train ONLY to prevent target data leakage
_, bin_edges = pd.qcut(y_train_price, q=4, retbins=True, labels=["Low", "Medium", "High", "Premium"])
bin_edges[0] = -np.inf
bin_edges[-1] = np.inf

y_train_cat = pd.cut(y_train_price, bins=bin_edges, labels=["Low", "Medium", "High", "Premium"])
y_test_cat = pd.cut(y_test_price, bins=bin_edges, labels=["Low", "Medium", "High", "Premium"])

le = LabelEncoder()
y_train_clf = le.fit_transform(y_train_cat)
y_test_clf = le.transform(y_test_cat)

X_tr_clf, X_val_clf, y_tr_c, y_val_c = train_test_split(X_train_reg, y_train_clf, test_size=0.15, random_state=42)

# --- XGBOOST CLASSIFIER ---
clf_model = XGBClassifier(
    n_estimators=600,
    max_depth=5,
    learning_rate=0.04,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_lambda=2,
    min_child_weight=3,
    random_state=42,
    n_jobs=-1,
    early_stopping_rounds=50
)

print("\nRunning 5-Fold Cross-Validation for XGBoost Classifier...")
cv_clf_scores = cross_val_score(
    XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.04, subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1),
    X_train_reg, y_train_clf, cv=kf, scoring='accuracy'
)
print(f"XGBoost Classifier 5-Fold CV Accuracy: {cv_clf_scores.mean():.4f} (+/- {cv_clf_scores.std():.4f})")

clf_model.fit(
    X_tr_clf, y_tr_c,
    eval_set=[(X_val_clf, y_val_c)],
    verbose=False
)

y_pred_clf = clf_model.predict(X_test_reg)

clf_acc = accuracy_score(y_test_clf, y_pred_clf)
clf_f1 = f1_score(y_test_clf, y_pred_clf, average="weighted")
cm = confusion_matrix(y_test_clf, y_pred_clf).tolist()

print("\n===== XGBOOST CLASSIFIER TEST METRICS =====")
print(f"Accuracy : {clf_acc:.4f}")
print(f"F1 Score : {clf_f1:.4f}")

# Save classification model & metadata
clf_columns = reg_columns  # Shared feature columns
joblib.dump(clf_model, os.path.join(BASE_DIR, "xgb_classifier.pkl"))
joblib.dump(clf_columns, os.path.join(BASE_DIR, "clf_columns.pkl"))
joblib.dump(le.classes_.tolist(), os.path.join(BASE_DIR, "label_encoder_classes.pkl"))
print("Classification model and clf_columns.pkl saved successfully!")

# Item #6 Fix: Save metrics to metrics.json and metrics.md
metrics_data = {
    "cv_results": {
        "xgb_reg_5fold_cv_log_rmse": round(float(-cv_xgb_scores.mean()), 4),
        "catboost_reg_5fold_cv_log_rmse": round(float(-cv_cat_scores.mean()), 4),
        "xgb_clf_5fold_cv_accuracy": round(float(cv_clf_scores.mean()), 4)
    },
    "test_metrics": {
        "xgb_regressor": {
            "rmse": round(float(xgb_rmse), 2),
            "mae": round(float(xgb_mae), 2),
            "r2": round(float(xgb_r2), 4)
        },
        "catboost_regressor": {
            "rmse": round(float(cat_rmse), 2),
            "mae": round(float(cat_mae), 2),
            "r2": round(float(cat_r2), 4)
        },
        "ensemble": {
            "rmse": round(float(ens_rmse), 2),
            "mae": round(float(ens_mae), 2),
            "r2": round(float(ens_r2), 4)
        },
        "xgb_classifier": {
            "accuracy": round(float(clf_acc), 4),
            "f1_score": round(float(clf_f1), 4),
            "confusion_matrix": cm,
            "classes": le.classes_.tolist()
        }
    }
}

metrics_json_path = os.path.join(BASE_DIR, "metrics.json")
with open(metrics_json_path, "w") as f:
    json.dump(metrics_data, f, indent=2)

metrics_md_content = f"""# Flight Fare Predictor — Model Performance Report

## Cross-Validation Performance (5-Fold CV)
- **XGBoost Regressor (Log RMSE)**: {metrics_data['cv_results']['xgb_reg_5fold_cv_log_rmse']}
- **CatBoost Regressor (Log RMSE)**: {metrics_data['cv_results']['catboost_reg_5fold_cv_log_rmse']}
- **XGBoost Classifier (Accuracy)**: {metrics_data['cv_results']['xgb_clf_5fold_cv_accuracy']}

## Held-Out Test Set Metrics (20% Split)

### Regression Models (Price Prediction)
| Model | RMSE (₹) | MAE (₹) | R² Score |
|---|---|---|---|
| **XGBoost Regressor** | ₹{xgb_rmse:.2f} | ₹{xgb_mae:.2f} | {xgb_r2:.4f} |
| **CatBoost Regressor** | ₹{cat_rmse:.2f} | ₹{cat_mae:.2f} | {cat_r2:.4f} |
| **Ensemble (XGB + Cat)** | ₹{ens_rmse:.2f} | ₹{ens_mae:.2f} | **{ens_r2:.4f}** |

### Classification Model (Price Tier Classification)
- **Accuracy**: {clf_acc * 100:.2f}%
- **Weighted F1 Score**: {clf_f1:.4f}
- **Classes**: `{le.classes_.tolist()}`

#### Confusion Matrix
```
{confusion_matrix(y_test_clf, y_pred_clf)}
```
"""

metrics_md_path = os.path.join(BASE_DIR, "metrics.md")
with open(metrics_md_path, "w") as f:
    f.write(metrics_md_content)

print(f"\nMetrics report saved to {metrics_json_path} and {metrics_md_path}")
