"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoint = exports.currentPos = void 0;
const geolib = __importStar(require("geolib"));
const parse_1 = require("./parse");
const serial_1 = __importDefault(require("./serial"));
const node_events_1 = require("node:events");
class GPSEventEmitter extends node_events_1.EventEmitter {
}
const events = new GPSEventEmitter();
const cbs = [];
function subscribe(cb) {
    cbs.push(cb);
    return () => {
        const index = cbs.indexOf(cb);
        cbs.splice(index, 1);
    };
}
exports.currentPos = {
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
    const port = await (0, serial_1.default)();
    if (!port) {
        return;
    }
    port.on('data', str => {
        const msg = (0, parse_1.parseMessage)(str);
        if (msg) {
            exports.currentPos = {
                ...msg,
            };
            events.emit('data', exports.currentPos);
            for (const cb of cbs) {
                cb(exports.currentPos);
            }
        }
    });
}
async function getXPoints(num) {
    const prom = new Promise(resolve => {
        const arr = [];
        const cb = subscribe((parsed) => {
            if (!parsed || !parsed.lat || !parsed.lng)
                return;
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
    const value = resp.filter(elem => !!elem);
    return value;
}
async function getPoint() {
    const points = await getXPoints(10);
    const pointsLatLng = points.map(elem => ({
        lat: elem.lat,
        lng: elem.lng,
    }));
    const centerPoint = geolib.getCenter(pointsLatLng);
    if (!centerPoint) {
        return null;
    }
    return {
        ...points[Math.floor(points.length / 2)],
        lat: centerPoint.latitude,
        lng: centerPoint.longitude,
    };
}
exports.getPoint = getPoint;
run();
//# sourceMappingURL=index.js.map