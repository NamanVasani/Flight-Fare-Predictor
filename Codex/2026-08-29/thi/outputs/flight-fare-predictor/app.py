from __future__ import annotations

from datetime import date
from pathlib import Path

import joblib
import pandas as pd
import streamlit as st

from modeling import predict_fare


st.set_page_config(page_title="AeroFare | Flight Intelligence", page_icon="✦", layout="wide")
MODEL_PATH = Path("artifacts/model_bundle.joblib")


@st.cache_resource
def load_model():
    return joblib.load(MODEL_PATH)


st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap');
:root { --ink:#eaf2ff; --muted:#91a4bd; --line:rgba(164,201,255,.18); --cyan:#5af2dd; --panel:rgba(7,20,39,.74); }
.stApp { background: radial-gradient(circle at 78% 4%, #17375c 0, transparent 33%), radial-gradient(circle at 15% 83%, #17284e 0, transparent 38%), #06111f; color:var(--ink); font-family:'Space Grotesk',sans-serif; }
[data-testid='stHeader'] { background:transparent; } #MainMenu, footer { visibility:hidden; }
.block-container { padding-top: 1rem; padding-bottom: 1rem; }
.hero { position:relative; overflow:hidden; min-height:160px; padding:18px 4% 14px; border-bottom:1px solid var(--line); margin-bottom:12px; }
.hero:after { content:''; position:absolute; width:260px; height:260px; right:7%; top:-70px; border:1px solid rgba(90,242,221,.42); border-radius:50%; box-shadow:0 0 0 20px rgba(90,242,221,.03), 0 0 0 40px rgba(90,242,221,.025), inset 0 0 50px rgba(90,242,221,.07); animation:float 10s ease-in-out infinite; }
@keyframes float { 50% { transform:translateY(10px) rotate(6deg); } }
.eyebrow { color:var(--cyan); font:500 10px 'DM Mono',monospace; letter-spacing:.16em; text-transform:uppercase; }
.hero h1 { position:relative; z-index:1; max-width:790px; margin:6px 0 6px; font-size:clamp(28px,4.5vw,52px); line-height:.95; letter-spacing:-.04em; }
.hero p { position:relative; z-index:1; max-width:470px; color:var(--muted); font-size:13px; line-height:1.4; margin:0; }
.panel { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:14px 18px; backdrop-filter:blur(18px); }
.stButton>button { width:100%; padding:.5rem 1rem; border:0; border-radius:8px; color:#032127; background:var(--cyan); font-weight:700; letter-spacing:.03em; }
.result { margin-top:12px; border-left:3px solid var(--cyan); padding:12px 16px; background:rgba(90,242,221,.07); border-radius:0 10px 10px 0; }
.fare { color:var(--cyan); font-size:clamp(32px,4.5vw,52px); font-weight:700; letter-spacing:-.05em; line-height:1; }
@media (prefers-reduced-motion:reduce) { *,*:before,*:after { animation-duration:.01ms!important; transition-duration:.01ms!important; } }
</style>
<section class="hero"><div class="eyebrow">AeroFare / Predictive route intelligence</div><h1>Know your fare before you fly.</h1><p>Choose a route and flight details to estimate the expected ticket price from your trained fare model.</p></section>
""", unsafe_allow_html=True)

if not MODEL_PATH.exists():
    st.error("Model not found. Train it first with `python train_model.py --data path/to/Flight_fare.csv`.")
    st.stop()

bundle = load_model()
left, right = st.columns([1.3, 0.7], gap="large")
with left:
    st.markdown('<div class="panel">', unsafe_allow_html=True)
    st.subheader("Plan your route")
    with st.form("fare_form"):
        c1, c2 = st.columns(2)
        airline = c1.selectbox("Airline", ["IndiGo", "Air India", "Jet Airways", "SpiceJet", "Vistara", "GoAir", "Multiple carriers"])
        stops = c2.selectbox("Stops", ["non-stop", "1 stop", "2 stops", "3 stops", "4 stops"])
        source = c1.selectbox("Departure", ["Delhi", "Kolkata", "Mumbai", "Chennai", "Bangalore"])
        destination = c2.selectbox("Arrival", ["Cochin", "Delhi", "New Delhi", "Hyderabad", "Kolkata", "Bangalore"])
        journey_date = st.date_input("Journey date", value=date.today(), min_value=date.today())
        c3, c4, c5 = st.columns(3)
        dep = c3.time_input("Departure", value=pd.Timestamp("09:00").time())
        arr = c4.time_input("Arrival", value=pd.Timestamp("11:30").time())
        duration = c5.text_input("Duration", value="2h 30m", help="Example: 2h 30m")
        additional_info = st.selectbox("Flight detail", ["No Info", "In-flight meal not included", "No check-in baggage included", "1 Short layover", "1 Long layover"])
        submitted = st.form_submit_button("Calculate estimated fare  →")
    st.markdown('</div>', unsafe_allow_html=True)

with right:
    m = bundle["metrics"]
    st.markdown('<div class="panel"><div class="eyebrow">Model health</div>', unsafe_allow_html=True)
    st.metric("Held-out MAE", f"₹{m['mae']:,.0f}")
    st.metric("Held-out R²", f"{m['r2']:.2f}")
    st.caption(f"Evaluated on {m['test_rows']:,} unseen records. An estimate is not a live airline quote.")
    st.markdown('</div>', unsafe_allow_html=True)

if submitted:
    trip = {
        "Airline": airline, "Source": source, "Destination": destination, "Total_Stops": stops,
        "Additional_Info": additional_info, "Date_of_Journey": journey_date.strftime("%d/%m/%Y"),
        "Dep_Time": dep.strftime("%H:%M"), "Arrival_Time": arr.strftime("%H:%M"), "Duration": duration,
    }
    try:
        fare = predict_fare(trip, bundle)
        low, high = fare * 0.88, fare * 1.12
        st.markdown(f'<div class="result"><div class="eyebrow">Estimated one-way fare</div><div class="fare">₹{fare:,.0f}</div><p>Typical range: ₹{low:,.0f} – ₹{high:,.0f}. Prices can change with demand, availability, and booking time.</p></div>', unsafe_allow_html=True)
    except (ValueError, IndexError) as error:
        st.error(f"Please check your flight details: {error}")
