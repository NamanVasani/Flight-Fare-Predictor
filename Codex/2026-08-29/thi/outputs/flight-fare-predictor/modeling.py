"""Training and inference helpers for the flight-fare predictor."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from catboost import CatBoostRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor


RAW_COLUMNS = {
    "Airline", "Source", "Destination", "Total_Stops", "Additional_Info",
    "Date_of_Journey", "Dep_Time", "Arrival_Time", "Duration",
}
TARGET = "Price"


def _duration_minutes(value: str) -> int:
    """Convert strings such as '2h 50m' into minutes."""
    value = str(value).strip().lower()
    hours = 0
    minutes = 0
    if "h" in value:
        hours = int(value.split("h", 1)[0].strip())
    if "m" in value:
        tail = value.split("h", 1)[-1] if "h" in value else value
        minutes = int(tail.replace("m", "").strip())
    return (hours * 60) + minutes


def _hour(value: str) -> int:
    return int(str(value).strip().split(" ", 1)[0].split(":", 1)[0])


def _stops(value: Any) -> int:
    text = str(value).strip().lower()
    return 0 if text == "non-stop" else int(text.split(" ", 1)[0])


def _prepare_base(frame: pd.DataFrame, rare_airlines: set[str]) -> pd.DataFrame:
    """Apply deterministic feature engineering shared by training and inference."""
    data = frame.copy()
    missing = RAW_COLUMNS.difference(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")

    data["Source"] = data["Source"].replace("New Delhi", "Delhi")
    data["Destination"] = data["Destination"].replace("New Delhi", "Delhi")
    data["Additional_Info"] = data["Additional_Info"].fillna("No Info").replace("No info", "No Info")
    data["Airline"] = data["Airline"].where(~data["Airline"].isin(rare_airlines), "Other")
    data["Duration"] = data["Duration"].map(_duration_minutes)

    journey = pd.to_datetime(data["Date_of_Journey"], format="%d/%m/%Y", errors="raise")
    data["Journey_Date"] = journey.dt.day
    data["Journey_Month"] = journey.dt.month
    data["Dep_Time"] = data["Dep_Time"].map(_hour)
    data["Estimated_Time_of_Arrival"] = data["Arrival_Time"].map(_hour)
    data["Bucket"] = np.where(data["Dep_Time"].between(6, 17), "Day", "Night")
    data["Total_Stops"] = data["Total_Stops"].map(_stops)
    return data.drop(columns=["Route", "Date_of_Journey", "Arrival_Time"], errors="ignore")


def transform(frame: pd.DataFrame, bundle: dict[str, Any]) -> pd.DataFrame:
    data = _prepare_base(frame, set(bundle["rare_airlines"]))
    data = pd.get_dummies(
        data,
        columns=["Airline", "Source", "Destination", "Additional_Info", "Bucket"],
        dtype=int,
    )
    return data.reindex(columns=bundle["feature_columns"], fill_value=0)


def train_bundle(raw_data: pd.DataFrame) -> tuple[dict[str, Any], dict[str, float]]:
    """Train the ensemble and return deployable artifacts plus held-out metrics."""
    if TARGET not in raw_data.columns:
        raise ValueError("The training CSV must include a Price column.")

    raw_data = raw_data.drop_duplicates().dropna(subset=["Route", "Total_Stops", TARGET]).copy()
    rare_airlines = set(raw_data["Airline"].value_counts().loc[lambda counts: counts < 10].index)
    prepared = _prepare_base(raw_data, rare_airlines)
    target = np.log1p(prepared.pop(TARGET).astype(float))
    encoded = pd.get_dummies(
        prepared,
        columns=["Airline", "Source", "Destination", "Additional_Info", "Bucket"],
        dtype=int,
    )
    x_train, x_test, y_train, y_test = train_test_split(
        encoded, target, test_size=0.20, random_state=42
    )
    xgb = XGBRegressor(
        n_estimators=650, learning_rate=0.04, max_depth=6,
        subsample=0.85, colsample_bytree=0.85, random_state=42, n_jobs=-1,
    )
    catboost = CatBoostRegressor(
        iterations=650, learning_rate=0.04, depth=6, random_seed=42, verbose=False,
    )
    xgb.fit(x_train, y_train)
    catboost.fit(x_train, y_train)
    prediction = np.expm1((xgb.predict(x_test) + catboost.predict(x_test)) / 2)
    actual = np.expm1(y_test)
    metrics = {
        "mae": float(mean_absolute_error(actual, prediction)),
        "rmse": float(mean_squared_error(actual, prediction) ** 0.5),
        "r2": float(r2_score(actual, prediction)),
        "test_rows": int(len(x_test)),
    }
    bundle = {
        "xgb": xgb,
        "catboost": catboost,
        "feature_columns": encoded.columns.tolist(),
        "rare_airlines": sorted(rare_airlines),
        "metrics": metrics,
    }
    return bundle, metrics


def predict_fare(raw_trip: dict[str, Any], bundle: dict[str, Any]) -> float:
    features = transform(pd.DataFrame([raw_trip]), bundle)
    log_prediction = (bundle["xgb"].predict(features)[0] + bundle["catboost"].predict(features)[0]) / 2
    return float(max(0, np.expm1(log_prediction)))
