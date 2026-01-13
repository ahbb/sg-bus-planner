# SG Bus Planner
App to allow users to compare bus arrivals at different bus stops to decide which one to take. Useful in cases where the user has multiple choices between different buses at different bus stops to get to a common destination.

## Mobile App
Some screenshots of the mobile app:  
<img src="/screenshots/bus-planner1.jpg" alt="busplanner1" width=250/>
<img src="/screenshots/bus-planner2.jpg" alt="busplanner2" width=250/>
<img src="/screenshots/bus-planner3.jpg" alt="busplanner3" width=250/>

## Backend
Compare API
![Screenshot_261225](/screenshot.png?raw=true)

## Getting Started

### Prerequisites
Install required packages
```sh
pip install -r requirements.txt
cd frontend/bus-planner
npm i
```

## Starting API Server and Mobile App
Note: LTA API Key is required to run some APIs
```sh
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
cd frontend/bus-planner
npx expo start --tunnel
```

## Acknowledgments
Land Transport Datamall  
[LTA APIs](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html)
