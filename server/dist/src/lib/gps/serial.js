"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
const node_events_1 = require("node:events");
const ntrip_client_1 = require("ntrip-client");
const parse_1 = require("./parse");
const ecef_1 = require("./ecef");
const config_json_1 = __importDefault(require("../../../config.json"));
class MyEmitter extends node_events_1.EventEmitter {
}
const options = {
    host: config_json_1.default.ntrip.host,
    port: config_json_1.default.ntrip.port,
    mountpoint: config_json_1.default.ntrip.mountpoint,
    username: config_json_1.default.ntrip.username,
    password: config_json_1.default.ntrip.password,
    interval: 2000,
};
const client = new ntrip_client_1.NtripClient(options);
async function run() {
    const events = new MyEmitter();
    const resp = await serialport_1.SerialPort.list();
    const selected = resp.find(elem => (elem.manufacturer || '').indexOf('u-blox') !== -1);
    if (!selected) {
        return null;
    }
    const port = new serialport_1.SerialPort({
        path: selected.path,
        baudRate: 115200,
    });
    port.on('data', buf => {
        const strs = buf.toString().split('\n');
        for (const str of strs) {
            const msg = (0, parse_1.parseMessage)(str);
            if (msg) {
                const pos = (0, ecef_1.project)(msg.lat, msg.lng, msg.altGeo);
                client.setXYZ(pos);
            }
            events.emit('data', str);
        }
    });
    client.on('data', (data) => {
        port.write(data);
    });
    client.on('close', () => {
        console.log('client close');
    });
    client.on('error', (err) => {
        console.log(err);
    });
    setTimeout(() => {
        client.run();
    }, 1000);
    return events;
}
exports.default = run;
//# sourceMappingURL=serial.js.map