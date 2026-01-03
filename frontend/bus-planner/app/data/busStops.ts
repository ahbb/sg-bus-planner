import busStops from "./bus_stops_241225.json";

export type BusStop = {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
};

// key = BusStopCode (string)
// value = BusStop object
export const BUS_STOP_MAP: Record<string, BusStop> = busStops.reduce(
  (acc, stop: BusStop) => { // accumulator. acc = object that is being built, stop = current bus stop in the array
    acc[stop.BusStopCode] = stop; // use bus stop code as key, and store entire bus stop object as value
    return acc;
  },
  {} as Record<string, BusStop>
);