export const DESTINATIONS = {
  "Hougang Int": {
    options: [
      { bus_stop_code: "63321", service_no: "132" },
      { bus_stop_code: "63381", service_no: "74" },
      { bus_stop_code: "63381", service_no: "147" },
      { bus_stop_code: "63381", service_no: "165" },
    ],
  },
  "Ang Mo Kio Int": {
    options: [
      { bus_stop_code: "63389", service_no: "74" },
      { bus_stop_code: "63389", service_no: "165" },
      { bus_stop_code: "63329", service_no: "25" },
      { bus_stop_code: "63329", service_no: "132" },
    ],
  },
  "Kembangan Stn": {
    options: [
      { bus_stop_code: "63321", service_no: "25" },
      { bus_stop_code: "63321", service_no: "854" },
    ],
  },
  "Serangoon Stn": {
    options: [
      { bus_stop_code: "63389", service_no: "147" },
      { bus_stop_code: "63219", service_no: "103" },
      { bus_stop_code: "63219", service_no: "109" },
    ],
  },
} as const;

export type DestinationKey = keyof typeof DESTINATIONS;
