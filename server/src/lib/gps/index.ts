import { SerialPort } from 'serialport';
import * as geolib from 'geolib';
import { parseMessage } from './parse';
import serial from './serial';

import { EventEmitter } from 'node:events';

class GPSEventEmitter extends EventEmitter {}
const events = new GPSEventEmitter();

const cbs: any[] = [];

function subscribe(cb: any) {
  cbs.push(cb);
  return () => {
    const index = cbs.indexOf(cb);
    cbs.splice(index, 1);
  };
}

export let currentPos = {
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

async function run() {
  const port = await serial();
  if (!port) {
    return;
  }
  port.on('data', str => {
    const msg = parseMessage(str);
    if (msg) {
      currentPos = {
        ...msg,
      };
      events.emit('data', currentPos);
      for (const cb of cbs) {
        cb(currentPos);
      }
    }
  });
}

async function getXPoints(
  num: number
): Promise<Exclude<ReturnType<typeof parseMessage>, null>[]> {
  const prom = new Promise<ReturnType<typeof parseMessage>[]>(resolve => {
    const arr: ReturnType<typeof parseMessage>[] = [];
    const cb = subscribe((parsed: ReturnType<typeof parseMessage>) => {
      // console.debug(parsed);
      if (!parsed || !parsed.lat || !parsed.lng) return;
      arr.push({
        ...parsed,
      });
      if (arr.length === num) {
        cb();
        resolve(arr);
      }
    });
  });
  const resp = await prom;
  const value = resp.filter(elem => !!elem) as Exclude<
    ReturnType<typeof parseMessage>,
    null
  >[];
  return value;
}

export async function getPoint() {
  const points = await getXPoints(10);
  const pointsLatLng: { lat: number; lng: number }[] = points.map(elem => ({
    lat: elem.lat,
    lng: elem.lng,
  }));
  // console.debug(points);
  const centerPoint = geolib.getCenter(pointsLatLng);
  if (!centerPoint) {
    return null;
  }
  // console.debug(centerPoint);
  return {
    ...points[Math.floor(points.length / 2)],
    lat: centerPoint.latitude,
    lng: centerPoint.longitude,
  };
}

run();

// setInterval(() => {
//   console.debug(currentPos.fix);
// }, 1000);
