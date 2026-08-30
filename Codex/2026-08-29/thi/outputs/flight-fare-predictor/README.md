# AeroFare deployment

## 1. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Train the model

Place your `Flight_fare.csv` anywhere locally, then run:

```bash
python train_model.py --data /absolute/path/to/Flight_fare.csv
```

This generates `artifacts/model_bundle.joblib` and held-out evaluation metrics. Do not deploy until you review the MAE and R² printed by this command.

## 3. Run locally

```bash
streamlit run app.py
```

## 4. Deploy

For Streamlit Community Cloud, push this folder *including* `artifacts/model_bundle.joblib` to a GitHub repository, then select `app.py` as the entry point. Do not upload the raw customer data unless it is safe and permitted to share.

## Notes

The input options reflect the common categories in the original India flight-fare dataset. Categories absent from the training data are safely encoded as zeros, but predictions for them may be less reliable. The shown range is a usability aid, not a statistically calibrated prediction interval.
