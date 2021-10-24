/* eslint-disable @typescript-eslint/no-empty-interface */
import { profile } from "profiler/decorator";

declare global {
    interface HiveOSMemory {
    }
    interface Memory {
        os: HiveOSMemory
    }
}

@profile
export class HiveOS  {
    static init = (() => {
        return new HiveOS();
    })();
    private setupDone = false;

    constructor() {
        // empty
    }

    run(): void {
        if(!this.setupDone) {
            this.setup();
            this.setupDone = true;
        }
    }

    setup(): void {
        this.setupMemory();
    }

    setupMemory(): void {
        if(!Memory.os) {
            Memory.os = {}
        }
    }
}
