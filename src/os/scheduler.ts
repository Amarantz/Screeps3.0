import { profile } from "profiler/decorator";

@profile
export class Scheduler {
    static setup(processList: any[]): void {
        this.rootSetup(processList);
    }
    static rootSetup(processList: any[]) {
        // We add process for default process such as Room Keeper.
    }
}
