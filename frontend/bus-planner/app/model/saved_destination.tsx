// TODO: add selected bus numbers

type SavedDestination = {
  id: string;                 // unique (uuid or timestamp)
  name: string;               // user input
  busStops: {
    busStopCode: string;
    description: string;
    roadName: string;
  }[];
};
