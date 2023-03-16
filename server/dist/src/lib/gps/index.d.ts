export declare let currentPos: {
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
};
export declare function getPoint(): Promise<{
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
} | null>;
