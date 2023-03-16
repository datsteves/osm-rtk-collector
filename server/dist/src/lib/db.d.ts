import { Model } from 'sequelize';
interface Point {
    lat: number;
    lng: number;
    alt: number;
    fix?: string;
    imagePath?: string;
    category?: string;
    type?: string;
    name?: string;
    note?: string;
    time: number;
    hdop?: number;
    vdop?: number;
    pdop?: number;
}
export declare function createPoint(point: Point): Promise<Model<any, any>>;
export declare function getAllPoints(): Promise<Model<any, any>[]>;
export declare function getSinglePoint(id: number): Promise<Model<any, any> | null>;
export {};
