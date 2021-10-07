/* eslint-disable @typescript-eslint/ban-types */
import profiler from 'screeps-profiler';
import { USE_PROFILING } from 'settings';

export function profile(target: Function): void;
export function profile(target: object, key: string | symbol, _descriptor: TypedPropertyDescriptor<Function>): void;
export function profile(target: object | Function, key?: string | symbol,
    _descriptor?: TypedPropertyDescriptor<Function>,): void {
        if (!USE_PROFILING) {
            return;
        }
        if (key) {
            profiler.registerFN(target as Function, key as string);
            return;
        }
        const ctor = target as any;
        if (!ctor.prototype) {
            return;
        }

        const className = ctor.name;
        profiler.registerClass(target as Function, className);
    }
