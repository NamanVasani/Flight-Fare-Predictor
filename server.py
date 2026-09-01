import http.server
import socketserver
import json
import joblib
import numpy as np
import pandas as pd
import os

PORT = int(os.environ.get("PORT", 5001))

# Load ML models and meta files
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
xgb_reg = joblib.load(os.path.join(MODEL_DIR, 'xgb_regressor.pkl'))
cat_reg = joblib.load(os.path.join(MODEL_DIR, 'catboost_regressor.pkl'))
xgb_clf = joblib.load(os.path.join(MODEL_DIR, 'xgb_classifier.pkl'))
reg_cols = joblib.load(os.path.join(MODEL_DIR, 'reg_columns.pkl'))
clf_cols = joblib.load(os.path.join(MODEL_DIR, 'clf_columns.pkl'))
classes = joblib.load(os.path.join(MODEL_DIR, 'label_encoder_classes.pkl'))

INFO_MAP = {
    'no info': 'No Info',
    'no_info': 'No Info',
    'in-flight meal not included': 'In-flight meal not included',
    'in_flight_meal_not_included': 'In-flight meal not included',
    'no check-in baggage included': 'No check-in baggage included',
    'no_check_in_baggage_included': 'No check-in baggage included',
    '1 long layover': '1 Long layover',
    '1_long_layover': '1 Long layover',
    'change airports': 'Change airports',
    'change_airports': 'Change airports',
    '1 short layover': '1 Short layover',
    '1_short_layover': '1 Short layover',
    'red-eye flight': 'Red-eye flight',
    'red_eye_flight': 'Red-eye flight',
    '2 long layover': '2 Long layover',
    '2_long_layover': '2 Long layover',
    'business class': 'Business class',
    'business_class': 'Business class',
}

def get_param(data, keys, default):
    for k in keys:
        if k in data and data[k] is not None:
            return data[k]
    return default

def prepare_input(source_name, dest_name, airline_name, dep_hour, duration_mins, total_stops, journey_day, journey_month, additional_info="No Info"):
    if source_name == "New Delhi": source_name = "Delhi"
    if dest_name == "New Delhi": dest_name = "Delhi"

    df = pd.DataFrame(0, index=[0], columns=reg_cols)

    df['Dep_Time'] = int(dep_hour)
    df['Duration'] = int(duration_mins)
    df['Total_Stops'] = int(total_stops)
    df['Journey_Date'] = int(journey_day)
    df['Journey_Month'] = int(journey_month)
    df['Estimated_Time_of_Arrival'] = ((int(dep_hour) * 60 + int(duration_mins)) // 60) % 24

    if (18 <= dep_hour <= 23) or (0 <= dep_hour < 6):
        df['Bucket_Night'] = 1
    else:
        df['Bucket_Night'] = 0

    KNOWN_AIRLINES = {
        "Air Asia", "Air India", "GoAir", "IndiGo", "Jet Airways",
        "Multiple carriers", "Multiple carriers Premium economy",
        "SpiceJet", "Vistara"
    }

    airline_col = f"Airline_{airline_name}"
    if airline_col in df.columns:
        df[airline_col] = 1
    elif airline_name not in KNOWN_AIRLINES:
        if "Airline_other" in df.columns:
            df["Airline_other"] = 1

    source_col = f"Source_{source_name}"
    if source_col in df.columns:
        df[source_col] = 1

    dest_col = f"Destination_{dest_name}"
    if dest_col in df.columns:
        df[dest_col] = 1

    norm_info = INFO_MAP.get(str(additional_info).strip().lower(), str(additional_info).strip())
    info_col = f"Additional_Info_{norm_info}"
    if info_col in df.columns:
        df[info_col] = 1
    elif "Additional_Info_No Info" in df.columns:
        df["Additional_Info_No Info"] = 1

    return df

class PredictHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/status' or self.path == '/api/health' or self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            resp = {
                "status": "online",
                "models": {
                    "xgb_regressor": True,
                    "catboost_regressor": True,
                    "xgb_classifier": True,
                    "classes": classes,
                    "features_count": len(reg_cols)
                }
            }
            self.wfile.write(json.dumps(resp).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            data = {}

        if self.path == '/api/predict':
            # Complete key alias support for Issue #11 & #9
            source = get_param(data, ['source', 'Source', 'source_city', 'sourceCity'], 'Delhi')
            dest = get_param(data, ['destination', 'Destination', 'dest', 'dest_city', 'destCity'], 'Cochin')
            airline = get_param(data, ['airline', 'Airline', 'airline_name', 'airlineName'], 'IndiGo')
            dep_hour = int(get_param(data, ['dep_hour', 'depHour', 'dep_time', 'depTime'], 6))
            duration = int(get_param(data, ['duration_mins', 'durationMins', 'duration', 'duration_minutes', 'durationMinutes'], 110))
            stops = int(get_param(data, ['stops', 'total_stops', 'totalStops', 'stop_num', 'stopNum'], 0))
            day = int(get_param(data, ['day', 'journey_day', 'journey_date', 'journeyDay', 'journeyDate'], 15))
            month = int(get_param(data, ['month', 'journey_month', 'journeyMonth'], 9))
            additional_info = get_param(data, ['additional_info', 'additionalInfo', 'Additional_Info', 'additional_Info'], 'No Info')

            df = prepare_input(source, dest, airline, dep_hour, duration, stops, day, month, additional_info)

            pred_xgb_log = float(xgb_reg.predict(df)[0])
            pred_cat_log = float(cat_reg.predict(df)[0])
            xgb_price = float(np.expm1(pred_xgb_log))
            cat_price = float(np.expm1(pred_cat_log))
            ensemble_price = float(np.expm1((pred_xgb_log + pred_cat_log) / 2))

            clf_idx = int(xgb_clf.predict(df)[0])
            predicted_tier = classes[clf_idx]
            probs = xgb_clf.predict_proba(df)[0].tolist()
            prob_dict = {cls_name: round(float(prob), 4) for cls_name, prob in zip(classes, probs)}

            response = {
                "success": True,
                "xgb_reg_price": round(xgb_price, 2),
                "catboost_reg_price": round(cat_price, 2),
                "ensemble_price": round(ensemble_price, 2),
                "predicted_tier": predicted_tier,
                "tier_probabilities": prob_dict,
                "features_used": {
                    "source": source,
                    "destination": dest,
                    "airline": airline,
                    "dep_hour": dep_hour,
                    "duration_mins": duration,
                    "stops": stops,
                    "day": day,
                    "month": month,
                    "additional_info": str(additional_info)
                }
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        elif self.path == '/api/search':
            source = get_param(data, ['source', 'Source', 'source_city'], 'Ahmedabad')
            dest = get_param(data, ['destination', 'Destination', 'dest_city'], 'Delhi')
            day = int(get_param(data, ['day', 'journey_day'], 15))
            month = int(get_param(data, ['month', 'journey_month'], 9))

            airlines_info = [
                {"code": "6E", "name": "IndiGo", "logo_bg": "#0B2545", "text_color": "#059669", "tier_hint": "Low", "dep": "06:20 AM", "dep_h": 6, "dur": 110, "arr": "08:10 AM", "stops": "Non-stop", "stop_num": 0, "info": "No Info"},
                {"code": "SG", "name": "SpiceJet", "logo_bg": "#D90429", "text_color": "#059669", "tier_hint": "Low", "dep": "09:15 PM", "dep_h": 21, "dur": 115, "arr": "11:10 PM", "stops": "Non-stop", "stop_num": 0, "info": "No Info"},
                {"code": "UK", "name": "Vistara", "logo_bg": "#4A154B", "text_color": "#2563EB", "tier_hint": "Medium", "dep": "07:30 AM", "dep_h": 7, "dur": 310, "arr": "12:40 PM", "stops": "1 Stop", "stop_num": 1, "info": "No Info"},
                {"code": "AI", "name": "Air India", "logo_bg": "#E63946", "text_color": "#2563EB", "tier_hint": "Medium", "dep": "11:00 AM", "dep_h": 11, "dur": 330, "arr": "04:30 PM", "stops": "1 Stop", "stop_num": 1, "info": "No Info"},
                {"code": "OP", "name": "Akasa Air", "logo_bg": "#FF6B35", "text_color": "#2563EB", "tier_hint": "Medium", "dep": "03:20 PM", "dep_h": 15, "dur": 290, "arr": "08:10 PM", "stops": "1 Stop", "stop_num": 1, "info": "No Info"},
                {"code": "G8", "name": "Go First", "logo_bg": "#0077B6", "text_color": "#2563EB", "tier_hint": "Medium", "dep": "08:45 PM", "dep_h": 20, "dur": 340, "arr": "02:25 AM", "stops": "1 Stop", "stop_num": 1, "info": "No Info"},
                {"code": "AI", "name": "Air India", "logo_bg": "#E63946", "text_color": "#7C3AED", "tier_hint": "High", "dep": "06:55 AM", "dep_h": 6, "dur": 680, "arr": "06:15 PM", "stops": "2 Stops", "stop_num": 2, "info": "Business class"},
                {"code": "UK", "name": "Vistara", "logo_bg": "#4A154B", "text_color": "#7C3AED", "tier_hint": "High", "dep": "10:40 AM", "dep_h": 10, "dur": 650, "arr": "09:30 PM", "stops": "2 Stops", "stop_num": 2, "info": "1 Long layover"}
            ]

            results = []
            for item in airlines_info:
                df = prepare_input(source, dest, item["name"], item["dep_h"], item["dur"], item["stop_num"], day, month, item.get("info", "No Info"))
                pred_xgb = float(xgb_reg.predict(df)[0])
                pred_cat = float(cat_reg.predict(df)[0])
                ensemble_price = float(np.expm1((pred_xgb + pred_cat) / 2))
                
                calculated_fare = ensemble_price

                clf_idx = int(xgb_clf.predict(df)[0])
                predicted_tier = classes[clf_idx]

                results.append({
                    "id": f"{item['code']}-{item['dep_h']}",
                    "logo": item["code"],
                    "airline": item["name"],
                    "depTime": item["dep"],
                    "arrTime": item["arr"],
                    "duration": f"{item['dur'] // 60}h {item['dur'] % 60:02d}m",
                    "stops": item["stops"],
                    "class": "Economy",
                    "price": f"₹ {int(calculated_fare):,}",
                    "numericPrice": int(calculated_fare),
                    "tier": item["tier_hint"],
                    "predictedTier": predicted_tier
                })

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "flights": results}).encode('utf-8'))
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

if __name__ == '__main__':
    print(f"Starting ML Server on port {PORT}...")
    class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        daemon_threads = True
        allow_reuse_address = True

    httpd = ThreadedTCPServer(("", PORT), PredictHandler)
    httpd.serve_forever()
