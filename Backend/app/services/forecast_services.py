import requests
import os
from fastapi import HTTPException
from dotenv import load_dotenv
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
BASE_URL = os.getenv("BASE_URL")
def fetch_forecast_wind():
    try:
        api_url = f"{BASE_URL}/datasets/WINDFOR/stream"
        params = {
            "publishDateTimeFrom": "2025-12-31T00:00:00Z",
            "publishDateTimeTo": "2026-02-01T00:00:00Z",
        }
        response = requests.get(
            api_url,
            params=params,
            timeout=30,
        )
        response.raise_for_status()
        records = response.json()
        if not isinstance(records, list):
            raise HTTPException(
                status_code=502,
                detail="Unexpected forecast response format",
            )
        wind_records = [
            record
            for record in records
            if record.get("startTime")
            and "2026-01-01T00:00:00Z"
            <= record["startTime"]
            < "2026-02-01T00:00:00Z"
            and record.get("generation") is not None
            and record.get("publishTime")
        ]
        wind_records.sort(
            key=lambda record: (
                record["startTime"],
                record["publishTime"],
            )
        )
        unique_delivery_times = sorted({
            record["startTime"]
            for record in wind_records
        })
        print("Forecast records:", len(wind_records))
        print(
            "Unique delivery timestamps:",
            len(unique_delivery_times),
        )
        print(
            "Sample timestamps:",
            [
                (
                    record["startTime"],
                    record["publishTime"],
                    record["generation"],
                )
                for record in wind_records[:10]
            ],
        )
        return {
            "total_records": len(wind_records),
            "unique_delivery_timestamps": len(unique_delivery_times),
            "records": wind_records,
        }
    except requests.RequestException as err:
        raise HTTPException(
            status_code=502,
            detail=f"Elexon forecast request failed: {err}",
        )