/* eslint-disable @typescript-eslint/no-unsafe-call */
import sandbox from "sandbox";
import ErrorMapper from "utils/ErrorMapper";
import * as profiler from 'screeps-profiler';

declare global {
    interface GameObjectInfo<GameObject> {
        update(obj: GameObject): void
    }
}

function main(): void {
    sandbox();
}

profiler.enable();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
const loop = ErrorMapper.wrapLoop(() => {
    profiler.wrap(main);
});

export {
    loop,
    main
};
