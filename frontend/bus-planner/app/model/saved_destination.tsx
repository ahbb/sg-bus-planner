// TODO: add selected bus numbers
export type SavedDestination = {
  id: string;                 // unique (uuid or timestamp)
  name: string;               // user input
  busStops: {
    busStopCode: string;
    description: string;
    roadName: string;
  }[];
};

export type StopServicesMap = {
    [busStopCode: string]: string[]; // eg. "63321": ["74", "165"]
  }
