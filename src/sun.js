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

function overlapMs(aStart, aEnd, bStart, bEnd) {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  return Math.max(0, end - start);
}

// Computes exactly how many minutes of a session (start → end) fall after
// sunset or before sunrise, handling sessions that straddle sunset/sunrise
// or even cross midnight, by checking each calendar day the session touches.
export function nightMinutesForSession(startInput, endInput) {
  const start = new Date(startInput);
  const end = new Date(endInput);
  if (!(end > start)) return 0;

  let totalNightMs = 0;
  let dayCursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  while (dayCursor.getTime() <= end.getTime()) {
    const dayStart = dayCursor.getTime();
    const dayEnd = dayStart + 24 * 3600 * 1000;
    const segStart = Math.max(start.getTime(), dayStart);
    const segEnd = Math.min(end.getTime(), dayEnd);

    if (segEnd > segStart) {
      const times = SunCalc.getTimes(dayCursor, LOCATION_LAT, LOCATION_LON);
      const sunrise = times.sunrise.getTime();
      const sunset = times.sunset.getTime();

      totalNightMs += overlapMs(segStart, segEnd, dayStart, sunrise);
      totalNightMs += overlapMs(segStart, segEnd, sunset, dayEnd);
    }

    dayCursor = new Date(dayStart + 24 * 3600 * 1000);
  }

  return totalNightMs / 60000;
}

export function getTodaySunTimes() {
  return SunCalc.getTimes(new Date(), LOCATION_LAT, LOCATION_LON);
}

