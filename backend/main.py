from fastapi import FastAPI, HTTPException, Query, Request
import json
import requests
from datetime import datetime, timezone
from dateutil import parser
import os
from dotenv import load_dotenv
from models import BusOption, CompareRequest
from fastapi.middleware.cors import CORSMiddleware

# .\venv\Scripts\Activate.ps1
# uvicorn main:app --host 0.0.0.0 --port 8000
# ngrok http 8000 (when developing locally)

# Render deployment
# Build command: pip install -r requirements.txt
# Start command: cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 (need to go into correct folder first)

app = FastAPI(title="Bus Arrival API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get LTA API Key
load_dotenv()
LTA_API_KEY = os.getenv('LTA_API_KEY')

HEADERS = {
    "AccountKey": LTA_API_KEY,
    "Accept": "application/json"
}

BUS_STOPS_DATAFILE = "../data/bus_stops_241225.json"
BUS_ARRIVAL_API_URL = "https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival"

# --------------------
# Load bus stops once
# --------------------
with open(BUS_STOPS_DATAFILE, "r", encoding="utf-8") as f:
    BUS_STOPS = json.load(f)

VALID_BUS_STOP_CODES = {stop["BusStopCode"] for stop in BUS_STOPS}

# --------------------
# Helpers
# --------------------
# Convert from ISO timestamp to minutes from now
def eta_in_minutes(iso_time):
    if not iso_time:
        return None
    arrival_time = parser.isoparse(iso_time) # Parse ISO timestamp into datetime object
    now = datetime.now(timezone.utc)
    return max(int((arrival_time - now).total_seconds() / 60), 0) # use int to floor the result value. use max to ensure that if the bus is arriving now, it will return 0

# --------------------
# FAST APIs
# --------------------
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Compare bus arrivals at different bus stops and sort by eta, to get to a common destination
@app.post("/bus-arrival/compare")
def compare_bus_arrivals(payload: CompareRequest):
    results = []    
    for option in payload.options:
        stop_code = option.bus_stop_code
        service_no = option.service_no

        if stop_code not in VALID_BUS_STOP_CODES:
            continue  # skip invalid stop

        try:
            response = requests.get(
                BUS_ARRIVAL_API_URL,
                headers=HEADERS,
                params={
                    "BusStopCode": stop_code,
                    "ServiceNo": service_no
                },
                timeout=60
            )
            response.raise_for_status()

        except requests.exceptions.Timeout:
            continue
        except requests.exceptions.RequestException:
            continue
        
        data = response.json()
        services = data.get("Services", [])

        if not services:
            continue
        
        service = services[0]
        # Collect all 3 upcoming buses
        next_buses = []
        for key in ["NextBus", "NextBus2", "NextBus3"]:
            bus_data = service.get(key)
            if bus_data:
                eta = eta_in_minutes(bus_data.get("EstimatedArrival"))
                if eta is not None:
                    next_buses.append({
                    "eta_min": eta,
                })

        # Only append if there is at least one ETA
        if next_buses:
            results.append({
                "bus_stop_code": stop_code,
                "service_no": service_no,
                "next_buses": next_buses
            })
    
    # Sort by ETA of the first upcoming bus
    results.sort(key=lambda x: x["next_buses"][0]["eta_min"])

    return {
        "results": results
    }

# Get bus service numbers at particular bus stop code
@app.get("/bus-services")
def get_bus_services(bus_stop_code: str):
    """
    Returns a list of bus service numbers serving a bus stop
    """
    if bus_stop_code not in VALID_BUS_STOP_CODES:
        raise HTTPException(
            status_code=400,
            detail="Invalid bus stop code"
        )

    try:
        response = requests.get(
            BUS_ARRIVAL_API_URL,
            headers=HEADERS,
            params={"BusStopCode": bus_stop_code},
            timeout=60
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="LTA API timeout")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"LTA API error: {str(e)}")
    
    data = response.json()
    services = data.get("Services", [])

    # Return empty list if no services
    if not services:
        return {"bus_stop_code": bus_stop_code, "services": []}
    
    # Extract all bus service numbers
    service_numbers = [service["ServiceNo"] for service in services]

    return {
        "bus_stop_code": bus_stop_code,
        "services": service_numbers
    }