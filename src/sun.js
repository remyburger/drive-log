import SunCalc from "suncalc";

// 👇 Boulder, CO coordinates. If the family ever moves, update these.
const LOCATION_LAT = 40.0150;
const LOCATION_LON = -105.2705;

// True if `date` falls before that day's sunrise or after that day's sunset,
// using real solar data for the location above (accounts for seasonal
// variation — winter sunset ~4:45pm, summer sunset ~8:30pm, etc).
export function isNightAt(date) {
  const times = SunCalc.getTimes(date, LOCATION_LAT, LOCATION_LON);
  return date < times.sunrise || date > times.sunset;
}
