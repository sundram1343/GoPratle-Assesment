import math
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from pathlib import Path
from app.services.actaul_services import fetch_actual_wind
from app.services.forecast_services import fetch_forecast_wind
from dotenv import load_dotenv
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
BASE_URL = os.getenv("BASE_URL")
def parse_time(value):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (ValueError, TypeError):
        return None
def fetch_compare_wind():
    try:
        actual_response = fetch_actual_wind()
        forecast_response = fetch_forecast_wind()
        if "error" in actual_response:
            raise HTTPException(
                status_code=502,
                detail=actual_response.get("message", "Actual data request failed"),
            )
        actual_records = actual_response.get("records", [])
        forecast_records = forecast_response.get("records", [])
        actual_values_by_hour = defaultdict(list)
        for record in actual_records:
            timestamp = parse_time(record.get("startTime"))
            value = record.get("generation")
            if timestamp is None or value is None:
                continue
            if timestamp.year != 2026 or timestamp.month != 1:
                continue
            try:
                value = float(value)
            except (ValueError, TypeError):
                continue
            hour = timestamp.replace(
                minute=0,
                second=0,
                microsecond=0,
            )
            actual_values_by_hour[hour].append(value)
        actual_by_hour = {
            hour: sum(values) / len(values)
            for hour, values in actual_values_by_hour.items()
            if values
        }
        selected_forecasts = {}
        for record in forecast_records:
            delivery_time = parse_time(record.get("startTime"))
            publish_time = parse_time(record.get("publishTime"))
            value = record.get("generation")
            if delivery_time is None or publish_time is None or value is None:
                continue
            if delivery_time.year != 2026 or delivery_time.month != 1:
                continue
            cutoff = (
                delivery_time.replace(
                    hour=0,
                    minute=0,
                    second=0,
                    microsecond=0,
                )
                - timedelta(days=1)
                + timedelta(hours=12)
            )
            if publish_time > cutoff: 
                continue
            try:
                value = float(value)
            except (ValueError, TypeError):
                continue
            existing = selected_forecasts.get(delivery_time)
            if existing is None or publish_time > existing["publish_time"]:
                selected_forecasts[delivery_time] = {
                    "publish_time": publish_time,
                    "forecast_mw": value,
                }
        comparison = []
        for delivery_time in sorted(selected_forecasts):
            if delivery_time not in actual_by_hour:
                continue
            selected = selected_forecasts[delivery_time]
            actual_mw = actual_by_hour[delivery_time]
            forecast_mw = selected["forecast_mw"]
            error_mw = forecast_mw - actual_mw
            comparison.append({
                "start_time": delivery_time.isoformat(),
                "forecast_publish_time": (
                    selected["publish_time"].isoformat()
                ),
                "forecast_mw": round(forecast_mw, 3),
                "actual_mw": round(actual_mw, 3),
                "error_mw": round(error_mw, 3),
                "absolute_error_mw": round(abs(error_mw), 3),
            })
        if comparison:
            errors = [row["error_mw"] for row in comparison]
            mae = sum(abs(error) for error in errors) / len(errors)
            rmse = math.sqrt(
                sum(error ** 2 for error in errors) / len(errors)
            )
            bias = sum(errors) / len(errors)
            metrics = {
                "mae_mw": round(mae, 3),
                "rmse_mw": round(rmse, 3),
                "bias_mw": round(bias, 3),
            }
        else:
            metrics = {
                "mae_mw": None,
                "rmse_mw": None,
                "bias_mw": None,
            }
        actual_hours = set(actual_by_hour)
        forecast_hours = set(selected_forecasts)
        return {
            "period": "January 2026",
            "decision_cutoff": "12:00 UTC on the previous day (assumption)",
            "actual_records_received": len(actual_records),
            "forecast_records_received": len(forecast_records),
            "unique_actual_timestamps": len(actual_values_by_hour),
            "hourly_actual_periods": len(actual_hours),
            "eligible_forecast_timestamps": len(forecast_hours),
            "matched_records": len(comparison),
            "missing_forecast": len(actual_hours - forecast_hours),
            "missing_actual": len(forecast_hours - actual_hours),
            "metrics": metrics,
            "comparison": comparison,
        }
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Wind comparison failed: {err}",
        )