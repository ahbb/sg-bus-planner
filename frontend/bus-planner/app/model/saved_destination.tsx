export type SavedDestination = {
  id: string;                 // unique (uuid or timestamp)
  name: string;               // user input
  busStops: {
    busStopCode: string;
    description: string;
    roadName: string;
    services: string[]; // selected bus services from the bus stop
  }[];
};

export type StopServicesMap = {
    [busStopCode: string]: string[]; // eg. "63321": ["74", "165"]
  }
