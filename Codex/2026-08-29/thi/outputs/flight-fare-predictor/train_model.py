"""Train and save the flight fare model for the Streamlit app."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd

from modeling import train_bundle


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Path to Flight_fare.csv")
    parser.add_argument("--output", default="artifacts/model_bundle.joblib")
    args = parser.parse_args()

    bundle, metrics = train_bundle(pd.read_csv(args.data))
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, output)
    output.with_suffix(".metrics.json").write_text(json.dumps(metrics, indent=2))
    print(f"Saved model to {output}")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
