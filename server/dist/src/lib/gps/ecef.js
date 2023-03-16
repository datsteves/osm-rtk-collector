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
Object.defineProperty(exports, "__esModule", { value: true });
exports.unproject = exports.project = void 0;
const wgs84 = __importStar(require("wgs84"));
function degrees(angle) {
    return angle * (180 / Math.PI);
}
function radians(angle) {
    return angle * (Math.PI / 180);
}
var a = wgs84.RADIUS;
var f = wgs84.FLATTENING;
var b = wgs84.POLAR_RADIUS;
var asqr = a * a;
var bsqr = b * b;
var e = Math.sqrt((asqr - bsqr) / asqr);
var eprime = Math.sqrt((asqr - bsqr) / bsqr);
function project(latitude, longitude, altitude) {
    return LLAToECEF(radians(latitude), radians(longitude), altitude);
}
exports.project = project;
function unproject(x, y, z) {
    var gps = ECEFToLLA(x, y, z);
    gps[0] = degrees(gps[0]);
    gps[1] = degrees(gps[1]);
    return gps;
}
exports.unproject = unproject;
function LLAToECEF(latitude, longitude, altitude) {
    var N = getN(latitude);
    var ratio = bsqr / asqr;
    var X = (N + altitude) * Math.cos(latitude) * Math.cos(longitude);
    var Y = (N + altitude) * Math.cos(latitude) * Math.sin(longitude);
    var Z = (ratio * N + altitude) * Math.sin(latitude);
    return [X, Y, Z];
}
function ECEFToLLA(X, Y, Z) {
    var p = Math.sqrt(X * X + Y * Y);
    var theta = Math.atan((Z * a) / (p * b));
    var sintheta = Math.sin(theta);
    var costheta = Math.cos(theta);
    var num = Z + eprime * eprime * b * sintheta * sintheta * sintheta;
    var denom = p - e * e * a * costheta * costheta * costheta;
    var latitude = Math.atan(num / denom);
    var longitude = Math.atan(Y / X);
    var N = getN(latitude);
    var altitude = p / Math.cos(latitude) - N;
    if (X < 0 && Y < 0) {
        longitude = longitude - Math.PI;
    }
    if (X < 0 && Y > 0) {
        longitude = longitude + Math.PI;
    }
    return [latitude, longitude, altitude];
}
function getN(latitude) {
    var sinlatitude = Math.sin(latitude);
    var denom = Math.sqrt(1 - e * e * sinlatitude * sinlatitude);
    var N = a / denom;
    return N;
}
//# sourceMappingURL=ecef.js.map