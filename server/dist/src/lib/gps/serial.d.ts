/// <reference types="node" />
import { EventEmitter } from 'node:events';
declare class MyEmitter extends EventEmitter {
}
declare function run(): Promise<MyEmitter | null>;
export default run;
