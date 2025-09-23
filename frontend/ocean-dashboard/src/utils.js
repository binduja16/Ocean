// src/utils.js
export async function getCoordinates(city) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json`);
  const data = await res.json();
  if (data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  return null;
}
