import requests
import os
from pathlib import Path
from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.actaul_services import fetch_actual_wind
from app.services.forecast_services import fetch_forecast_wind
from app.services.compare_services import fetch_compare_wind
from dotenv import load_dotenv
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
app=FastAPI(title="Testing API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("origins").split(","),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {
    "message":"Running successfully"
    }
@app.get("/actual-wind")
def actual_wind():
    try:
        return fetch_actual_wind()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@app.get("/forecast-wind")
def forecast_wind():
    try:
        return fetch_forecast_wind()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@app.get("/compare-wind")
def compare_winds():
    try:
        return fetch_compare_wind()
    except requests.RequestException as err:
        raise HTTPException(
            status_code=502,
            detail=f"Elexon API request failed: {err}",
        )