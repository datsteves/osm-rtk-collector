/*
 * (C) 2015 Seth Lakowske

 * A projector that converts GPS->ECEF and ECEF->GPS
 *
 * Formulas from this paper:
 * Datum Transformations of GPS Positions
 * Application Note
 * 5th July 1999
 */

import * as wgs84 from 'wgs84';

/*
 * Converts an angle in radians to degrees.
 */
function degrees(angle: number) {
  return angle * (180 / Math.PI);
}

/*
 * Converts an angle in degrees to radians.
 */
function radians(angle: number) {
  return angle * (Math.PI / 180);
}

/*
 * Some constants we'll want to have on hand
 */
var a = wgs84.RADIUS;
var f = wgs84.FLATTENING;
var b = wgs84.POLAR_RADIUS;
var asqr = a * a;
var bsqr = b * b;

var e = Math.sqrt((asqr - bsqr) / asqr);
var eprime = Math.sqrt((asqr - bsqr) / bsqr);

/*
 * Convert GPS coordinates (degrees) to Cartesian coordinates (meters)
 */
export function project(latitude: number, longitude: number, altitude: number) {
  return LLAToECEF(radians(latitude), radians(longitude), altitude);
}

/*
 * Convert Cartesian coordinates (meters) to GPS coordinates (degrees)
 */
export function unproject(x: number, y: number, z: number) {
  var gps = ECEFToLLA(x, y, z);

  gps[0] = degrees(gps[0]);
  gps[1] = degrees(gps[1]);

  return gps;
}

function LLAToECEF(latitude: number, longitude: number, altitude: number) {
  //Auxiliary values first
  var N = getN(latitude);
  var ratio = bsqr / asqr;

  //Now calculate the Cartesian coordinates
  var X = (N + altitude) * Math.cos(latitude) * Math.cos(longitude);
  var Y = (N + altitude) * Math.cos(latitude) * Math.sin(longitude);

  //Sine of latitude looks right here
  var Z = (ratio * N + altitude) * Math.sin(latitude);

  return [X, Y, Z];
}

function ECEFToLLA(X: number, Y: number, Z: number) {
  //Auxiliary values first
  var p = Math.sqrt(X * X + Y * Y);
  var theta = Math.atan((Z * a) / (p * b));

  var sintheta = Math.sin(theta);
  var costheta = Math.cos(theta);

  var num = Z + eprime * eprime * b * sintheta * sintheta * sintheta;
  var denom = p - e * e * a * costheta * costheta * costheta;

  //Now calculate LLA
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

function getN(latitude: number) {
  var sinlatitude = Math.sin(latitude);
  var denom = Math.sqrt(1 - e * e * sinlatitude * sinlatitude);
  var N = a / denom;
  return N;
}
