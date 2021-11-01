/* eslint-disable @typescript-eslint/no-unsafe-call */
import sandbox from "sandbox";
import ErrorMapper from "utils/ErrorMapper";
import profiler from 'screeps-profiler';
import { USE_PROFILER } from "settings";
import { HiveOS } from "HiveOS";
import { Initialize } from "initialize";


Initialize.init();
function main(): void {
    Initialize.run();
    HiveOS.init.run();
    sandbox();

    Memory.stats.cpu.usage.push(Math.ceil(Game.cpu.getUsed()));
}
if (USE_PROFILER) {
    profiler.enable();
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
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
