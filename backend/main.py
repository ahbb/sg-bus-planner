from fastapi import FastAPI, HTTPException, Query
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
    if len(payload.options) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least two bus stop / service pairs are required"
        )

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
                timeout=5
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
        
        service = services[0] # Get only the first one (NextBus)
        eta = eta_in_minutes(service["NextBus"]["EstimatedArrival"])
        if eta is None:
            continue

        results.append({
            "bus_stop_code": stop_code,
            "service_no": service_no,
            "eta_min": eta
        })
    
    # Sort by ETA
    results.sort(key=lambda x: x["eta_min"])
    return {
        "results": results
    }


# Get bus arrivals based on bus stop code and bus no.
# TODO: make service no. non-mandatory
@app.get("/bus-arrival")
def get_bus_arrival(bus_stop_code: str, service_no):
    params = {
        "BusStopCode": bus_stop_code,
        "ServiceNo": service_no
    }
    if bus_stop_code not in VALID_BUS_STOP_CODES:
        raise HTTPException(
            status_code=404,
            detail="Invalid bus stop code."
        )

    try:
        response = requests.get(BUS_ARRIVAL_API_URL, headers=HEADERS, params=params, timeout=5)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="LTA Bus Arrival API timeout."
        )
    except requests.exceptions.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Error occured."
        )
    data = response.json()
    services_raw = data.get("Services", [])
    
    services = []
    for service in services_raw:
        try:
            services.append({
                "service_no": service["ServiceNo"],
                "next_bus_min": eta_in_minutes(
                    service["NextBus"]["EstimatedArrival"]
                ),
                "next_bus2_min": eta_in_minutes(
                    service["NextBus2"]["EstimatedArrival"]
                ),
                "next_bus3_min": eta_in_minutes(
                    service["NextBus3"]["EstimatedArrival"]
                ),
            })
        except KeyError:
            # In case there are LTA API changes
            continue

    if not services:
        raise HTTPException(
            status_code=404,
            detail="Invalid service number."
        )

    return {
        "bus_stop_code": bus_stop_code,
        "service_no": service_no,
        "services": services
    }

# Get bus stop information based on keyword
@app.get("/bus-stops/search")
def search_bus_stops(keyword: str, limit=20):
    keyword = keyword.lower()
    matches = [
        stop for stop in BUS_STOPS
        if keyword in stop["Description"].lower()
    ]
    return matches[:limit]

