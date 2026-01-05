# SG Bus Planner
App to allow users to compare bus arrivals at different bus stops to decide which one to take. Useful in cases where the user has multiple choices between different buses at different bus stops to get to a common destination.

## Example
The current functionality of the API (Still in progress)
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
cd frontend/bus-planner
npm run dev
```
This command runs the API server and starts the mobile app due to a script written in package.json.

## Acknowledgments
Land Transport Datamall  
[LTA APIs](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html)
