/* eslint-disable @typescript-eslint/no-unsafe-call */
import "ts-polyfill/lib/es2019-array"
import ErrorMapper from "utils/ErrorMapper";
import profiler from 'screeps-profiler';

export const USE_PROFILER = true;

function main(): void {

}


if (USE_PROFILER) {
    profiler.enable();
}

const loop = ErrorMapper.wrapLoop(() => {
    if (USE_PROFILER) {
        return profiler.wrap(main);
    }
    return main();
});

export {
    loop,
    main
};
