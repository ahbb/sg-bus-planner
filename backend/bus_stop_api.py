import requests
from datetime import datetime, timezone
from dateutil import parser
import os
from dotenv import load_dotenv
import time
import json

# Get LTA API Key
load_dotenv()
LTA_API_KEY = os.getenv('LTA_API_KEY')

HEADERS = {
    "AccountKey": LTA_API_KEY,
    "Accept": "application/json"
}

# Bus Stops API to get bus stop codes
BUS_STOPS_API_URL = "https://datamall2.mytransport.sg/ltaodataservice/BusStops"
OUTPUT_FILE = "../data/bus_stops.json"

def fetch_all_bus_stops():
    all_stops = []
    # API returns max 500 records per request, so fetch all data in chunks
    # eg. $skip=500 Skip first 500 records, return records 500 → 999
    skip = 0

    while True:
        params = {"$skip": skip}
        response = requests.get(BUS_STOPS_API_URL, headers=HEADERS, params=params)

        if response.status_code != 200:
            raise Exception(f"Bus Stops API Error: {response.status_code} - {response.text}")
        
        data = response.json().get("value", []) # value is from API response
        
        # Getting in chunks of 500, stop when we reach the end
        if not data:
            break
        all_stops.extend(data)
        skip += 500
        time.sleep(0.2) # allow some gap between making requests to the API
    
    return all_stops

def save_to_json_bus_stops(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    print("Fetching bus stops from LTA...")
    bus_stops = fetch_all_bus_stops()
    print(f"Fetched {len(bus_stops)} bus stops.")

    save_to_json_bus_stops(bus_stops, OUTPUT_FILE)
    print(f"Saved to {OUTPUT_FILE}")