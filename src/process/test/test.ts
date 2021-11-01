import { profile } from "profiler/decorator";

declare global {
    interface TestProcessState extends ProcessState {
        testMemory: string | undefined;
    }
}

@profile
export class TestProcess implements Process, Procedural {
    private constructor(
        readonly launchTime: number,
        readonly processId: ProcessId,
        readonly testMemory: string | undefined,
    ) {

    }
    runOnTick(): void {
        // do nothing for now
    }

    encode(): TestProcessState {
        return {
            t: "TestProcess",
            l: this.launchTime,
            i: this.processId,
            testMemory: this.testMemory,
        }
    }

    static decode(state: TestProcessState): TestProcess {
        return new TestProcess(state.l, state.i, state.testMemory);
    }

    static create(processId: ProcessId) {
        return new TestProcess(Game.time, processId, undefined);
    }

    processDescription(): string {
        return `Test Process as ${Game.time}`;
    }

}
