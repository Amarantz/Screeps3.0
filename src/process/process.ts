import { HiveOS } from "HiveOS";
import { BuyPixleProcess } from "./standard/buyPixelProcess";
import { TestProcess } from "./test/test";

declare global {
    type ProcessId = number;
    interface ProcessState extends state {
        /**  */
        t: ProcessTypeIdentifier
        /** launch time */
        l: number
        /** process Id */
        i: number
    }
    interface Process extends Stateful {
        launchTime: number;
        processId: ProcessId;

        encode(): ProcessState;
        processSortDescription?(): string;
        processDescription?(): string;
    }

    interface Procedural {
        runOnTick(): void;
    }

    type ProcessTypeIdentifier = keyof ProcessTypes
}

export function isProcedural(arg: any): arg is Procedural {
    return arg.runOnTick !== undefined;
}

export function processLog(sender: Process, message: string): void {
    // HiveOS.init.addProcessLog({
    //     processId: sender.processId,
    //     processType: sender.constructor.name,
    //     message: message
    // });
}

class ProcessTypes {
    "TestProcess" = (state: ProcessState) => TestProcess.decode(state as unknown as TestProcessState);
    "BuyPixleProcess" = (state: ProcessState) => BuyPixleProcess.decode(state as unknown as BuyPixleProcessState)
}

