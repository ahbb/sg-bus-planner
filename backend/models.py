from pydantic import BaseModel
from typing import List

class BusOption(BaseModel):
    bus_stop_code: str
    service_no: str

class CompareRequest(BaseModel):
    options: List[BusOption]