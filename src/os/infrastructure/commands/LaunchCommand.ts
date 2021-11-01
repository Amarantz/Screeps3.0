import { HiveOS } from "HiveOS";
import { BuyPixleProcess } from "process/standard/buyPixelProcess";
import { TestProcess } from "process/test/test";
import { Enviroment } from "utils/enviroment";
import { Result } from "utils/Result";

declare global {
    type LaunchCommandResult = Result<Process, string>
}

export class LaunchCommand implements ConsoleCommand {
    constructor(
        readonly options: Map<string, string>,
        readonly args: string[],
        readonly rawCommand: string,
    ) {}

    run(): CommandExecutionResult {
        let result: LaunchCommandResult | undefined;
        switch (this.args[0]) {
            case "TestProcess": {
                result = this.launchTestProcess();
                break;
            }
            case "BuyPixleProcess":
                result = this.launchBuyPixleProcess();
                break;
        }
        if (!result) {
            return `Invalid Process type name ${this.args[0]}`;
        }

        switch(result.resultType) {
            case "succeeded": {
                const detail = "";
                if(this.options.get("-l")) {
                    Memory.os.logger.filteringProcessIds.push(result.value.processId);
                }
                return `Launched ${result.value.constructor.name}, PID: ${result.value.processId}${detail}`;
            }
            case 'failed': {
                return result.reason;
            }
        }
    }

    private launchTestProcess(): LaunchCommandResult {
        const process = HiveOS.init.addProcess<TestProcess>(undefined, processId => {
            return TestProcess.create(processId);
        });
        return Result.Succeseeded(process);
    }

    private launchBuyPixleProcess(): LaunchCommandResult {
        if (Enviroment.world !== "persistent world") {
            return Result.Failed(`Enviroment ${Enviroment.world} does not support pixel`);
        }

        const process = HiveOS.init.addProcess(undefined, processId => {
            return BuyPixleProcess.create(processId);
        })
        return Result.Succeseeded(process);
    }

}
