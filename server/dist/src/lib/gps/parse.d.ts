export declare function parseMessage(str: string): {
    lat: number;
    lng: number;
    fix: string;
    altGeoId: number;
    alt: number;
    altGeo: number;
    geoSep: number;
    time: number;
    numberSats: number;
    hdop: number;
} | null;
