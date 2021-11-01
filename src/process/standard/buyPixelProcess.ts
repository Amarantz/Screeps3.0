import { profile } from "profiler/decorator";

declare global {
    interface BuyPixleProcessState extends ProcessState {

    }
}

@profile
export class BuyPixleProcess implements Process, Procedural {
    constructor(
        readonly launchTime: number,
        readonly processId: ProcessId,
    ) { }

    encode(): BuyPixleProcessState {
        return {
            t: "BuyPixleProcess",
            l: this.launchTime,
            i: this.processId,
        }
    }

    static decode(state: BuyPixleProcessState): BuyPixleProcess {
        return new BuyPixleProcess(state.l, state.i)
    }

    static create(processId: ProcessId) {
        return new BuyPixleProcess(Game.time, processId);
    }

    runOnTick(): void {
        if (Game.cpu.bucket < 10000) {
            return;
        }
        const result = Game.cpu.generatePixel();
        if (result === OK) {

        }
    }
}
