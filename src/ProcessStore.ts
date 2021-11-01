
export class ProcessStore {
    private readonly processes = new Map<ProcessId, InternalProcessInfo>();
    private readonly parentProcessIds = new Map<ProcessId, ProcessId>();

    public get(processId: ProcessId): InternalProcessInfo | undefined {
        return this.processes.get(processId);
    }

    public add(process: Process, parentProcessId: ProcessId | undefined): void {
        let executionPriority = 0;
        if (parentProcessId) {
            const parentProcessInfo = this.processes.get(parentProcessId);
            if (!parentProcessInfo) {
            } else {
                parentProcessInfo.childProcessIds.push(process.processId);
                this.parentProcessIds.set(process.processId, parentProcessId);
                executionPriority = parentProcessInfo.executionPriority + 1;
            }
        }
        const processInfo: InternalProcessInfo = {
            process,
            running: true,
            childProcessIds: [],
            executionPriority,
        };
        this.processes.set(process.processId, processInfo);
    }

    public remove(processId: ProcessId): { parentProcessId: ProcessId | undefined; } | undefined {
        const processInfo = this.get(processId);
        if (!processInfo) {
            return;
        }
        const parentProcessId = this.parentProcessIds.get(processId);
        processInfo.childProcessIds.forEach(childProcessId => {
            this.parentProcessIds.delete(childProcessId);
        });
        this.processes.delete(processId);
        return {
            parentProcessId,
        };
    }

    public clear(): void {
        this.processes.clear();
        this.parentProcessIds.clear();
    }

    public list(): InternalProcessInfo[] {
        return Array.from(this.processes.values());
    }

    public isRunning(processId: ProcessId): boolean {
        const processInfo = this.processes.get(processId);
        if (!processInfo) {
            return false;
        }

        if (!processInfo.running) {
            return false;
        }
        const parentId = this.parentProcessIds.get(processId);
        if (!parentId) {
            return true;
        }
        return this.isRunning(parentId);
    }

    public replace(processes: InternalProcessInfo[]): void {
        this.clear();
        processes.forEach(processInfo => {
            const processId = processInfo.process.processId;
            this.processes.set(processId, processInfo);
            processInfo.childProcessIds.forEach(childProcessId => {
                if(this.parentProcessIds.has(childProcessId)) {
                    
                }
                this.parentProcessIds.set(childProcessId, processId);
            })
        })
    }
}
