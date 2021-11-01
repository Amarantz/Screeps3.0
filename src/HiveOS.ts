/* eslint-disable @typescript-eslint/no-empty-interface */
import { memoryUsage } from "process";
import { profile } from "profiler/decorator";

declare global {
    interface HiveOSMemory {
        p: ProcessMemory[];
        config: {
            shouldReadMemory?: boolean;
        }
    }
    interface Memory {
        os: HiveOSMemory
    }
    interface ProcessMemory {
        /** running */
        r: boolean;

        /** process state */
        s: ProcessState
    }
    interface InternalProcessInfo {
        running: boolean,
        process: Process,
    }
}

@profile
export class HiveOS  {
    static init = (() => {
        return new HiveOS();
    })();
    private setupDone = false;
    private processes = new Map<ProcessId, InternalProcessInfo>();
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
            Memory.os = {
                p: [],
                config: {},
            }
        }
        if(!Memory.os.p) {
            Memory.os.p = [];
        }
        if(!Memory.os.config) {
            Memory.os.config = {};
        }
    }

    // addProcessLog(log: ProcessLog): void {
    //     // this.runtimeMemory.processLogs.push(log);
    // }
}
