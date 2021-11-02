/* eslint-disable @typescript-eslint/no-empty-interface */
import { memoryUsage } from "process";
import { decodeProcessFrom, isProcedural } from "process/process";
import { profile } from "profiler/decorator";
import ErrorMapper from "utils/ErrorMapper";
import { Result } from "utils/Result";
import { ProcessStore } from "./ProcessStore";

declare global {
    interface HiveOSMemory {
        p: ProcessMemory[];
        config: {
            shouldReadMemory?: boolean;
        },
        logger: LoggerMemory
    }
    interface LoggerMemory {
        filteringProcessIds: ProcessId[],
    }
    interface Memory {
        os: HiveOSMemory
    }
    interface ProcessMemory {
        /** running */
        readonly r: boolean;

        /** process state */
        readonly s: ProcessState
        readonly childProcessIds: ProcessId[];
        readonly executionPriority: number;
    }

    interface InternalProcessInfo {
        running: boolean,
        readonly process: Process,
        readonly childProcessIds: ProcessId[],
        readonly executionPriority: number;
    }

    interface RuntimeMemory {
        processLogs: ProcessLog[];
    }

    interface ProcessLog {
        processId: ProcessId,
        processType: string,
        message: string,
    }

    interface ProcessInfo {
        processId: ProcessId,
        type: string,
        running: boolean,
        process: Process
    }
}

@profile
export class HiveOS {
    static init = (() => {
        return new HiveOS();
    })();

    private setupDone = false;
    private readonly processStore = new ProcessStore();
    private readonly processIdsToKill: ProcessId[] = [];
    private runtimeMemory: RuntimeMemory = { processLogs: [] };
    private processIndex: number = 0;

    constructor() {
        // empty
    }

    public addProcess<T extends Process>(parentProcessId: ProcessId | undefined, maker: (processId: ProcessId) => T): T {
        const processId = this.getNewProcessId();
        const process = maker(processId);
        this.processStore.add(process, parentProcessId);
        console.log(`Launch process ${process.constructor.name}, ID: ${processId}`);
        return process;
    }

    public processOf(processId: ProcessId): Process | undefined {
        return this.processStore.get(processId)?.process ?? undefined;
    }

    public suspendProcess(processId: ProcessId): Result<string, string> {
        const processInfo = this.processStore.get(processId);
        if (!processInfo) {
            return Result.Failed(`No Process with Id ${processId}`);
        }
        if (!processInfo.running) {
            return Result.Failed(`Process with ID ${processId} already suspended`);
        }

        processInfo.running = false;
        return Result.Succeseeded(processInfo.process.constructor.name);
    }

    public resumeProcess(processId: ProcessId): Result<string, string> {
        const processInfo = this.processStore.get(processId);
        if (!processInfo) {
            return Result.Failed(`No Process with Id ${processId}`);
        }
        if (!processInfo.running) {
            return Result.Failed(`Process with ID ${processId} already running`);
        }

        processInfo.running = false;
        return Result.Succeseeded(processInfo.process.constructor.name);
    }

    public killProcess(processId: ProcessId): Result<string, string> {
        const process = this.processOf(processId)
        if (!process) {
            return Result.Failed(`[OS Error] Trying to kill unknown process ${processId}`);
        }
        if (!this.processIdsToKill.includes(processId)) {
            this.processIdsToKill.push(processId)
        }
        return Result.Succeseeded(process.constructor.name);

    }

    run(): void {
        if (!this.setupDone) {
            this.setup();
            this.setupDone = true;
        } else {
            if (Memory.os.config.shouldReadMemory) {
                ErrorMapper.wrapLoop(() => {
                    this.restoreProcesses();
                }, "HiveOS.restoreProcesses()")();
            }
        }

        ErrorMapper.wrapLoop(() => {
            this.runProceduralProcesses();
        }, "HiveOS.runProceduralProcesses()")();

        ErrorMapper.wrapLoop(() => {
            this.runProceduralProcesses();
        }, "HiveOS.runProceduralProcesses()")();

        ErrorMapper.wrapLoop(() => {
            this.killProcesses();
        }, "HiveOS.killProcesses()")();

        ErrorMapper.wrapLoop(() => {
            this.storeProcesses();
        }, "HiveOS.storeProcesses()")();
    }

    setup(): void {
        ErrorMapper.wrapLoop(() => {
            this.setupMemory();
        }, "HiveOS.setupMemory()")();

        ErrorMapper.wrapLoop(() => {
            this.restoreProcesses()
        }, "HiveOS.restoureProcesses()")();
    }

    setupMemory(): void {
        if (!Memory.os) {
            Memory.os = {
                p: [],
                config: {},
                logger: {
                    filteringProcessIds: []
                }
            }
        }
        if (!Memory.os.p) {
            Memory.os.p = [];
        }
        if (!Memory.os.config) {
            Memory.os.config = {};
        }

        if(!Memory.os.logger) {
            Memory.os.logger = {
                filteringProcessIds: []
            }
        }
    }

    processInfoOf(processId: ProcessId): ProcessInfo | undefined {
        const processInfo = this.processStore.get(processId);
        if (!processInfo) {
            return;
        }
        return {
            processId: processInfo.process.processId,
            type: processInfo.process.constructor.name,
            running: processInfo.running,
            process: processInfo.process,
        }
    }

    listAllProcesses(): ProcessInfo[] {
        return this.processStore.list().map(processInfo => {
            const info: ProcessInfo = {
                processId: processInfo.process.processId,
                type: processInfo.process.constructor.name,
                running: processInfo.running,
                process: processInfo.process,
            }
            return info;
        });
    }

    addProcessLog(log: ProcessLog): void {
        this.runtimeMemory.processLogs.push(log);
    }

    processLogs(): ProcessLog[] {
        return this.runtimeMemory.processLogs.concat([]);
    }

    clearProcessLogs(): void {
        this.runtimeMemory.processLogs.splice(0, this.runtimeMemory.processLogs.length);
    }

    private restoreProcesses(): void {
        const processInfo: InternalProcessInfo[] = Memory.os.p.flatMap(processStateMemory => {
            const process = decodeProcessFrom(processStateMemory.s);
            if (!process) {
                this.sendOSError(`Unrecognized stateful process type ${processStateMemory.s.t}, ${processStateMemory.s.i}`);
                return [];
            }
            return {
                process,
                running: processStateMemory.r === true,
                childProcessIds: processStateMemory.childProcessIds ?? [],
                executionPriority: processStateMemory.executionPriority ?? 0,
            }
        });
        this.processStore.replace(processInfo);
    }

    private storeProcesses(): void {
        const processesMemory: ProcessMemory[] = [];
        this.processStore.list().forEach(processInfo => {
            const process = processInfo.process;
            ErrorMapper.wrapLoop(() => {
                processesMemory.push({
                    r: processInfo.running,
                    s: process.encode(),
                    childProcessIds: processInfo.childProcessIds,
                    executionPriority: processInfo.executionPriority,
                });
            }, "Hivemind.storeProcesses()")();
        });
        Memory.os.p = processesMemory;
    }

    private sendOSError(message: string): void {
        console.log(`[OS Error] ${message}`);
    }

    private getNewProcessId(): ProcessId {
        const processId = Game.time * 1000 + this.processIndex;
        this.processIndex += 1;
        return processId;
    }

    private runProceduralProcesses(): void {
       const runningProcessInfo = this.processStore.list()
       .filter(processInfo => this.processStore.isRunning(processInfo.process.processId))
       .sort((a, b) => {
           return b.executionPriority - a.executionPriority;
       });

       runningProcessInfo.forEach(processInfo => {
           ErrorMapper.wrapLoop(() => {
               if (!processInfo.process.runBeforeTick) {
                   return;
               }
               processInfo.process.runBeforeTick();
           }, `Procedural process ${processInfo.process.processId} runBeforeTick()`);
       })

       runningProcessInfo.forEach(processInfo => {
           ErrorMapper.wrapLoop(() => {
                processInfo.process.runOnTick();
           }, `Procedural process ${processInfo.process.processId} runOnTick()`);
       })
    }

    private killProcesses(): void {
       if(this.processIdsToKill.length <= 0) {
           return;
       }

       const messages: string[] = [];
       const spaces = '                                                         ';
       const getIndent = (indent: number): string => spaces.slice(0, indent * 2);
       const kill = (processId: ProcessId, indent: number): void => {
           const processInfo = this.processStore.get(processId);
           if (!processInfo) {
                this.sendOSError(`Trying to kill non existent process ${processId}`);
                return;
           }

           const result = this.processStore.remove(processId);
           if (!result) {
               return;
           }

           const additionalInfo: string[] = [];
           const { parentProcessId } = result;
           if (parentProcessId) {
               const parentProcessInfo = this.processStore.get(parentProcessId);
               if(!parentProcessInfo) {

               } else {
                   const index = parentProcessInfo.childProcessIds.indexOf(processId);
                   if(index < 0) {
                        this.sendOSError(`Missing child process ${processId}, ${processInfo.process.taskIdentifier}`)
                   } else {
                       parentProcessInfo.childProcessIds.splice(index, 1);
                   }
               }
           }
       }
    }
}
