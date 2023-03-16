import { SerialPort } from 'serialport';
import { EventEmitter } from 'node:events';

class MyEmitter extends EventEmitter {}

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
    // console.debug(buf.toString());
    const strs = buf.toString().split('\n');
    for (const str of strs) {
      events.emit('data', str);
    }
  });
  return events;
}

export default run;
