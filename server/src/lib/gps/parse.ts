import * as geolib from 'geolib';

const fixModes = [
  'No solution',
  'Single',
  'DGPS',
  'GPS PPS',
  'RTK Fixed',
  'RTK Float',
];

function parseTime(time: string) {
  const hours = parseInt(time.substring(0, 2), 10);
  const minutes = parseInt(time.substring(2, 4), 10);
  const seconds = parseInt(time.substring(4, 6), 10);
  const milliseconds = parseInt(time.substring(7, 10), 10);
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds * 10;
}

function toDecimal(value: number) {
  const degrees = Math.floor(value / 100);
  const minutes = value - degrees * 100;
  return degrees + minutes / 60;
}

export function parseMessage(str: string) {
  const currentPos = {
    lat: 0,
    lng: 0,
    fix: '',
    altGeoId: 0,
    alt: 0,
    altGeo: 0,
    geoSep: 0,
    time: 0,
    numberSats: 0,
    hdop: 0,
  };
  const parts = str.split(',');
  if (str.includes('$GNGGA')) {
    // console.debug(str);
    currentPos.lat = toDecimal(parseFloat(parts[2]));
    currentPos.lng = toDecimal(parseFloat(parts[4]));
    currentPos.numberSats = parseInt(parts[7], 10);
    currentPos.hdop = parseFloat(parts[8]);
    currentPos.altGeo = parseFloat(parts[9]);
    currentPos.geoSep = parseFloat(parts[11]);

    if (parts[1] !== undefined) {
      currentPos.time = parseTime(parts[1]);
    }
    if (parts[6] !== undefined) {
      const fixMode = parseInt(parts[6], 10);
      currentPos.fix = fixModes[fixMode] || 'unkown';
    }
    return currentPos;
  }
  return null;
}
