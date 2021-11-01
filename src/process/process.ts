import { HiveOS } from "HiveOS";
import ErrorMapper from "utils/ErrorMapper";
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
    interface Process extends Stateful, Procedural {
        readonly launchTime: number;
        readonly processId: ProcessId;
        readonly taskIdentifier: string;

        encode(): ProcessState;
        processSortDescription?(): string;
        processDescription?(): string;
    }

    interface Procedural {
        runOnTick(): void;
    }

    type ProcessTypeIdentifier = keyof ProcessTypes;
}

export function isProcedural(arg: any): arg is Procedural {
    return arg.runOnTick !== undefined;
}

export function processLog(sender: Process, message: string): void {
    HiveOS.init.addProcessLog({
        processId: sender.processId,
        processType: sender.constructor.name,
        message: message
    });
}

class ProcessTypes {
    "TestProcess" = (state: ProcessState) => TestProcess.decode(state as unknown as TestProcessState);
    "BuyPixleProcess" = (state: ProcessState) => BuyPixleProcess.decode(state as unknown as BuyPixleProcessState)
}


export function decodeProcessFrom(state: ProcessState): Process | undefined {
    let decoded: Process | undefined;
    ErrorMapper.wrapLoop(() => {
        const maker = (new ProcessTypes())[state.t];
        if(!maker) {
            return;
        }
        decoded = maker(state);
    }, `decodedProcessFrom(), process type: ${state.t}`);
    return decoded;
}
