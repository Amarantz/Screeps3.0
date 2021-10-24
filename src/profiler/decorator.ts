/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import profiler from 'screeps-profiler';
import { USE_PROFILER } from 'settings';

export function profile(target: Function): void;
export function profile(target: object, key: string | symbol, _descriptor: TypedPropertyDescriptor<Function>): void;
export function profile(target: object | Function, key?: string | symbol, _descriptor?: TypedPropertyDescriptor<Function>,): void {
    if (!USE_PROFILER) {
        return;
    }

    if (key) {
        profiler.registerFN(target as Function, key as string)
        return;
    }

    if(!(target as any).prototype) {
        return;
    }

    profiler.registerClass(target as Function, (target as any).name);
}
