import { BACKEND_URL } from "../config/url";

export async function compareBusArrivals(options: any) {
  const response = await fetch(`${BACKEND_URL}/bus-arrival/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ options }),
  });

  if (!response.ok) {
    throw new Error("API error");
  }

  return response.json();
}
