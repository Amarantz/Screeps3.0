/* eslint-disable @typescript-eslint/no-empty-interface */
import { memoryUsage } from "process";
import { decodeProcessFrom, isProcedural } from "process/process";
import { profile } from "profiler/decorator";
import ErrorMapper from "utils/ErrorMapper";
import { Result } from "utils/Result";

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
    private readonly processes = new Map<ProcessId, InternalProcessInfo>();
    private readonly processIdsToKill: ProcessId[] = [];
    private runtimeMemory: RuntimeMemory = { processLogs: [] };
    private processIndex: number = 0;

    constructor() {
        // empty
    }

    public AddProcess<T extends Process>(maker: (processId: ProcessId) => T): T {
        const processId = this.getNewProcessId();
        const process = maker(processId);
        const processInfo: InternalProcessInfo = {
            process,
            running: true,
        }
        this.processes.set(processId, processInfo);
        console.log(`Launch process ${process.constructor.name}, ID: ${processId}`);
        return process;
    }

    public processOf(processId: ProcessId): Process | undefined {
        return this.processes.get(processId)?.process ?? undefined;
    }

    public suspendProcess(processId: ProcessId): Result<string, string> {
        const processInfo = this.processes.get(processId);
        if (!processInfo) {
            return Result.Failed(`No Process with Id ${processId}`);
        }
        if (!processInfo.running) {
            return Result.Failed(`Process with ID ${processId} already suspended`);
        }

        processInfo.running = false;
        return Result.Successed(processInfo.process.constructor.name);
    }

    public resumeProcess(processId: ProcessId): Result<string, string> {
        const processInfo = this.processes.get(processId);
        if (!processInfo) {
            return Result.Failed(`No Process with Id ${processId}`);
        }
        if (!processInfo.running) {
            return Result.Failed(`Process with ID ${processId} already running`);
        }

        processInfo.running = false;
        return Result.Successed(processInfo.process.constructor.name);
    }

    public killProcess(processId: ProcessId): Result<string, string> {
        const process = this.processOf(processId)
        if (!process) {
            return Result.Failed(`[OS Error] Trying to kill unknown process ${processId}`);
        }
        if (!this.processIdsToKill.includes(processId)) {
            this.processIdsToKill.push(processId)
        }
        return Result.Successed(process.constructor.name);

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
            }
        }
        if (!Memory.os.p) {
            Memory.os.p = [];
        }
        if (!Memory.os.config) {
            Memory.os.config = {};
        }
    }

    processInfoOf(processId: ProcessId): ProcessInfo | undefined {
        const processInfo = this.processes.get(processId);
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
        return Array.from(this.processes.values()).map(processInfo => {
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
        this.processes.clear();
        Memory.os.p.forEach(processStateMemory => {
            const process = decodeProcessFrom(processStateMemory.s);
            if (!process) {
                this.sendOSError(`Unreconized stateful process type ${processStateMemory.s}`)
                return;
            }
            const processInfo: InternalProcessInfo = {
                process,
                running: processStateMemory.r === true
            }
            this.processes.set(process.processId, processInfo)
        });
    }

    private storeProcesses(): void {
        const processesMemory: ProcessMemory[] = [];
        Array.from(this.processes.values()).forEach(processInfo => {
            const process = processInfo.process;
            ErrorMapper.wrapLoop(() => {
                processesMemory.push({
                    r: processInfo.running,
                    s: process.encode(),
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
        Array.from(this.processes.values()).forEach(processInfo => {
            if (!processInfo.running) { return }

            const process = processInfo.process;
            if (isProcedural(process)) {
                ErrorMapper.wrapLoop(() => {
                    process.runOnTick()
                }, `Procedural process ${process.processId} run()`)();
            }
        })
    }

    private killProcesses(): void {
        this.processIdsToKill.forEach(processId => {
            const processInfo = this.processes.get(processId);
            if (!processInfo) {
                this.sendOSError(`[Program bug] trying to kill non existent process ${processId}`);
                return;
            }
            console.log(`Kill process ${processInfo.process.constructor.name}, ID ${processInfo.process.processId}`);
            this.processes.delete(processId);
        })
        this.processIdsToKill.splice(0, this.processIdsToKill.length);
    }
}
