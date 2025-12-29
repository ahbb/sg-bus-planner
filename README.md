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
```

## Starting API Server
Note: LTA API Key is required to run some APIs
```sh
cd backend
uvicorn main:app --reload
```

## Acknowledgments
Land Transport Datamall
[LTA APIs](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html)
