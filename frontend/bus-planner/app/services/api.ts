export async function compareBusArrivals(options: any) {
  const response = await fetch("http://192.168.1.247:8000/bus-arrival/compare", {
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
