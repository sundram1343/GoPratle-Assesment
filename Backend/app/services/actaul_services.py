import requests
import os
from dotenv import load_dotenv
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
BASE_URL = os.getenv("BASE_URL")
def fetch_actual_wind():
    try:
        api_url=f"{BASE_URL}/datasets/FUELHH/stream"
        params={
            "publishDateTimeFrom":"2026-01-01T00:00:00Z",
            "publishDateTimeTo":"2026-02-01T00:00:00Z"
        }
        response=requests.get(api_url,params=params,timeout=20)
        response.raise_for_status()
        records=response.json()
        wind_records = [
        record
        for record in records
        if record.get("fuelType") == "WIND"
        ]
        return {
            "total_records":len(wind_records),
            "records":wind_records
        }
    except Exception as e:
        return{
            "error":"Unknown error",
            "message":str(e)
        }