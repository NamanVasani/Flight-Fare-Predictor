import requests

BASE = "http://localhost:5001"

tests = [
    ("Valid prediction", "/api/predict", {"source":"Delhi","destination":"Cochin","airline":"IndiGo","depHour":10,"durationMins":120,"stops":1,"day":15,"month":6}, 200),
    ("Missing fields", "/api/predict", {"source":"Delhi"}, 400),
    ("Invalid dep_hour", "/api/predict", {"source":"Delhi","destination":"Cochin","airline":"IndiGo","depHour":25,"durationMins":120,"stops":0,"day":15,"month":6}, 400),
    ("Invalid duration", "/api/predict", {"source":"Delhi","destination":"Cochin","airline":"IndiGo","depHour":10,"durationMins":0,"stops":0,"day":15,"month":6}, 400),
    ("Invalid stops", "/api/predict", {"source":"Delhi","destination":"Cochin","airline":"IndiGo","depHour":10,"durationMins":120,"stops":10,"day":15,"month":6}, 400),
    ("Invalid day", "/api/predict", {"source":"Delhi","destination":"Cochin","airline":"IndiGo","depHour":10,"durationMins":120,"stops":0,"day":32,"month":6}, 400),
    ("Invalid month", "/api/predict", {"source":"Delhi","destination":"Cochin","airline":"IndiGo","depHour":10,"durationMins":120,"stops":0,"day":15,"month":0}, 400),
    ("Fake city", "/api/predict", {"source":"FakeCity","destination":"Cochin","airline":"IndiGo","depHour":10,"durationMins":120,"stops":0,"day":15,"month":6}, 400),
    ("Valid search", "/api/search", {"source":"Delhi","destination":"Cochin","day":15,"month":9}, 200),
    ("Search fake city", "/api/search", {"source":"Pune","destination":"Goa","day":15,"month":9}, 400),
]

all_pass = True
for name, path, payload, expected in tests:
    try:
        r = requests.post(f"{BASE}{path}", json=payload, timeout=30)
        status = "✅" if r.status_code == expected else "❌"
        if r.status_code != expected:
            all_pass = False
        print(f"{status} {name:25s} | expected={expected} | got={r.status_code}")
    except Exception as e:
        all_pass = False
        print(f"❌ {name:25s} | expected={expected} | Exception: {e}")

print("\n" + ("🎉 ALL TESTS PASSED" if all_pass else "⚠️ SOME TESTS FAILED"))
