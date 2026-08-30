from matplotlib import axes
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix, classification_report
import joblib
import streamlit as st

data=pd.read_csv("/Users/namanvasani/Desktop/PROJECT/FLIGHT/Flight_fare.csv")
data=data.drop_duplicates()
data = data.dropna(subset=["Route", "Total_Stops"])
data["Source"]=data["Source"].replace("New Delhi","Delhi")
data["Destination"] = data["Destination"].replace("New Delhi", "Delhi")
data["Additional_Info"]=data["Additional_Info"].replace("No info","No Info")
data=data[data["Duration"] != "5m"]                                                             
rare_airlines=data["Airline"].value_counts()
rare_airlines=rare_airlines[rare_airlines < 10].index
data["Airline"]=data["Airline"].replace(rare_airlines,"other")
def convert_duration(duration):
    hours=0
    minutes=0
    if "h" in duration:
        hours=int(duration.split("h")[0])
    if "m" in duration:
        minutes=int(duration.split("h")[-1].replace("m"," ").strip())
    return hours * 60 + minutes
data["Duration"]=data["Duration"].apply(convert_duration)
def date_fun(date):
    date1=int(date.split("/")[0])
    return date1
def month_fun(month):    
    month1=int(month.split("/")[1])
    return month1
data["Journey_Date"]=data["Date_of_Journey"].apply(date_fun)
data["Journey_Month"]=data["Date_of_Journey"].apply(month_fun)
def time_fun(time):
    time1=int(time.split(":")[0])
    if(18 <= time1 <= 23):
        return "Night" 
    elif (0 <= time1 < 6):    
        return "Night" 
    else:
        return "Day" 
data["Bucket"]=data["Dep_Time"].apply(time_fun)
def time_fun1(time):
    time1=int(time.split(":")[0])
    return time1
data["Dep_Time"]=data["Dep_Time"].apply(time_fun1)
def arrival_fun(a_time):
    a_time1=int(a_time.split(" ")[0].split(":")[0])
    return a_time1
data["Estimated_Time_of_Arrival"]=data["Arrival_Time"].apply(arrival_fun)   
data["Total_Stops"]=data["Total_Stops"].replace("non-stop","0")
def stop_fun(stops):
    stop1=int(stops.split(" ")[0])
    return stop1
data["Total_Stops"]=data["Total_Stops"].apply(stop_fun)
data = data.drop(["Route", "Date_of_Journey", "Arrival_Time"], axis=1)

clean_data = data.copy()

data = pd.get_dummies(
    data,
    columns=[
        "Airline",
        "Source",
        "Destination",
        "Additional_Info",
        "Bucket"
    ],
    drop_first=True,
    dtype=int
)

X = data.drop("Price", axis=1)
Y = np.log1p(data["Price"])
reg_columns = X.columns

X_train, X_test, Y_train, Y_test = train_test_split(
    X,
    Y,
    test_size=0.2,
    random_state=42
)
Y_test_original = np.expm1(Y_test)

model = XGBRegressor(
    n_estimators=1000, learning_rate=0.05, max_depth=7,
    subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1
)
model.fit(X_train, Y_train)
y_pred = model.predict(X_test)
y_pred = np.expm1(y_pred)
print("\n===== XGBOOST =====")
print("RMSE :", np.sqrt(mean_squared_error(Y_test_original, y_pred)))
print("MAE :", mean_absolute_error(Y_test_original, y_pred))
print("R2 :", r2_score(Y_test_original, y_pred))

model3 = CatBoostRegressor(
    iterations=1000, learning_rate=0.05, depth=7,
    random_seed=42, verbose=0
)
model3.fit(X_train, Y_train)
y_pred3 = model3.predict(X_test)
y_pred3 = np.expm1(y_pred3)
print("\n===== CATBOOST =====")
print("RMSE :", np.sqrt(mean_squared_error(Y_test_original, y_pred3)))
print("MAE :", mean_absolute_error(Y_test_original, y_pred3))
print("R2 :", r2_score(Y_test_original, y_pred3))

xgb_pred = model.predict(X_test)
cat_pred = model3.predict(X_test)
final_pred = (xgb_pred + cat_pred) / 2
final_pred = np.expm1(final_pred)
print("\n===== XGBOOST + CATBOOST =====")
print("RMSE :", np.sqrt(mean_squared_error(Y_test_original, final_pred)))
print("MAE :", mean_absolute_error(Y_test_original, final_pred))
print("R2 :", r2_score(Y_test_original, final_pred))

joblib.dump(model, "xgb_regressor.pkl")
joblib.dump(model3, "catboost_regressor.pkl")
joblib.dump(reg_columns.tolist(), "reg_columns.pkl")
print("Regression models saved successfully!")

classification_data = data.copy()

classification_data["Price_Category"] = pd.qcut(
    classification_data["Price"],
    q=4,
    labels=["Low", "Medium", "High", "Premium"]
)

X = classification_data.drop(["Price", "Price_Category"], axis=1)
Y = classification_data["Price_Category"]
clf_columns = X.columns          

le = LabelEncoder()
Y = le.fit_transform(Y)

X_train, X_test, Y_train, Y_test = train_test_split(
    X, Y, test_size=0.2, random_state=42
)

model_clf = XGBClassifier(
    n_estimators=600,
    max_depth=5,
    learning_rate=0.04,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_lambda=2,
    min_child_weight=3,
    random_state=42,
    n_jobs=-1
)

model_clf.fit(X_train, Y_train)
Y_pred_clf = model_clf.predict(X_test)

joblib.dump(model_clf, "xgb_classifier.pkl")
joblib.dump(clf_columns.tolist(), "clf_columns.pkl")
joblib.dump(le.classes_.tolist(), "label_encoder_classes.pkl")
print("\n\nClassification model saved successfully!")

print("\n\n===== XGBOOST CLASSIFICATION =====")
print("Accuracy :", accuracy_score(Y_test, Y_pred_clf))
print("F1 Score :", f1_score(Y_test, Y_pred_clf, average="weighted"))
print("\nConfusion Matrix:")
print(confusion_matrix(Y_test, Y_pred_clf))
print("\nClassification Report:")
print(classification_report(Y_test, Y_pred_clf, target_names=le.classes_))

train_pred = model_clf.predict(X_train)
print("\nTrain Accuracy:", accuracy_score(Y_train, train_pred))
print("Overfitting Gap:", accuracy_score(Y_train, train_pred) - accuracy_score(Y_test, Y_pred_clf))

feature_importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by="Importance",
    ascending=False
)

print(feature_importance.head(15))

cat_importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model3.get_feature_importance()
})

cat_importance = cat_importance.sort_values(
    by="Importance",
    ascending=False
)

print(cat_importance.head(15))

st.title("✈️ Flight Fare Prediction")

model = joblib.load("xgb_regressor.pkl")
model3 = joblib.load("catboost_regressor.pkl")
reg_columns = joblib.load("reg_columns.pkl")
st.success("Models loaded successfully!")
