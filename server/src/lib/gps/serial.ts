import { SerialPort } from 'serialport';
import { EventEmitter } from 'node:events';
// @ts-expect-error no types
import { NtripClient } from 'ntrip-client';
import { parseMessage } from './parse';
import { project } from './ecef';
import config from '../../../config.json';

class MyEmitter extends EventEmitter {}

const options = {
  host: config.ntrip.host,
  port: config.ntrip.port,
  mountpoint: config.ntrip.mountpoint,
  username: config.ntrip.username,
  password: config.ntrip.password,
  interval: 2000,
};

const client = new NtripClient(options);

async function run() {
  const events = new MyEmitter();
  const resp = await SerialPort.list();
  const selected = resp.find(
    elem => (elem.manufacturer || '').indexOf('u-blox') !== -1
  );
  if (!selected) {
    return null;
  }
  const port = new SerialPort({
    path: selected.path,
    baudRate: 115200,
  });
  port.on('data', buf => {
    const strs = buf.toString().split('\n');
    for (const str of strs) {
      const msg = parseMessage(str);
      if (msg) {
        const pos = project(msg.lat, msg.lng, msg.altGeo);
        client.setXYZ(pos);
      }
      events.emit('data', str);
    }
  });

  client.on('data', (data: any) => {
    port.write(data);
  });

  client.on('close', () => {
    console.log('client close');
  });

  client.on('error', (err: any) => {
    console.log(err);
  });

  setTimeout(() => {
    client.run();
  }, 1000);

  return events;
}

export default run;
