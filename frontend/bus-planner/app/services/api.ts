import { BACKEND_URL, BACKEND_URL_LIVE } from "../config/url";

// input bus stop code and service numbers, output arrival times sorted by earliest first 
export async function compareBusArrivals(options: any) {
  const response = await fetch(`${BACKEND_URL_LIVE}/bus-arrival/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ options }),
  });

  if (!response.ok) {
    throw new Error("Compare API error");
  }

  return response.json();
}
