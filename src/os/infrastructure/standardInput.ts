import ErrorWrapper from 'utils/ErrorMapper';
import { Result, ResultFailed } from 'utils/Result';
import { LaunchCommand } from './commands/LaunchCommand';

declare global {
    type ConsoleCommandType = typeof consoleCommandTypes[number];
    type CommandExecutionResult = string;
    interface ConsoleCommandDefinition {
        command: ConsoleCommandType
        description: string,
        options: string[],
        args: string | undefined;
    }
    interface ConsoleCommand {
        options: Map<string, string>
        args: string[]
        rawCommand: string;
        run(): CommandExecutionResult;
    }
}

export const standardInput = (rawCommand: string): string => {
    let result: string | undefined;
    ErrorWrapper.wrapLoop(() => {
        const parseResult = parseCommand(rawCommand);
        switch (parseResult.resultType) {
            case "succeeded":
                result = parseResult.value.run();
                return;
            case "failed":
                result = `Type Game.io("help") to see available commands. \n ${parseResult.reason}`;
                return;
        }
    })();
    if (!result) {
        return "Program bug"
    }
    return result;
}
function parseCommand(rawCommand: string): Result<ConsoleCommand, string> {
    const invalidCommandDescription = (description: string): ResultFailed<string> => {
        return Result.Failed(`Prasing command failed ${description} (raw command: '${rawCommand}')`);
    }

    const components = rawCommand.split(" ");
    if (components.length <= 0) {
        return invalidCommandDescription("Empty Command");
    }

    const command = components[0];
    if (!command || !isConsoleCommand(command)) {
        return invalidCommandDescription(`Unknown command ${command}`);
    }

    components.splice(0, 1);
    const options = new Map<string, string>();
    const args: string[] = [];

    components.forEach(component => {
        if (component.startsWith("-")) {
            const [optionKey, optionValue] = component.split("=");
            if (optionKey) {
                options.set(optionKey, optionValue ?? "");
            }
            return;
        }
        if (component.length > 0) {
            args.push(component);
        }
    });

    if (options.has("-v")) {
        const optionsDescription = Array.from(options.keys()).reduce((result, key) => {
            return `${result},(${key}=${options.get(key)})`
        }, "");
        const argsDescription = args.join(",");
        console.log(`- command: ${command} \n- options: ${optionsDescription} \n- arguments: ${argsDescription}`)
    }

    switch (command) {
        case "launch": {
            return Result.Succeseeded(new LaunchCommand(options, args, rawCommand));
        }
        default:
            return invalidCommandDescription(`Unknown command ${command}`)
    }
}

const consoleCommandTypes = [
    "help",
    "kill",
    "suspend",
    "resume",
    "launch",
    "exec",
    "process",
    "message",
    "memory",
    "log",
] as const;

export const isConsoleCommand = (obj: string): obj is ConsoleCommandType => {
    return consoleCommandTypes.includes(obj as any);
}

export const commandDefinitions: ConsoleCommandDefinition[] = [
    {
        command: "help",
        description: "List available commands.",
        options: [],
        args: undefined,
    },
    {
        command: "kill",
        description: "Terminate specified process",
        options: [],
        args: "Process ID",
    },
    {
        command: "suspend",
        description: "Suspend specified process",
        options: [],
        args: "Process ID",
    },
    {
        command: "resume",
        description: "Resume specified process",
        options: [],
        args: "Process ID",
    },
    {
        command: "launch",
        description: "Launch specified process",
        options: [
            "-l: Add launched process ID to logger filter"
        ],
        args: "Process type name, process launch arguments key1=value1 key2=value2 ...",
    },
    {
        command: "exec",
        description: "Execute specified script",
        options: [],
        args: "Script name, script arguments key1=value1 key2=value2 ...",
    },
    {
        command: "process",
        description: "Show running process info",
        options: [
            "-l: List all running processes"
        ],
        args: "Process ID",
    },
    {
        command: "message",
        description: "Send message to specified process",
        options: [],
        args: "Process ID, message to send"
    },
    {
        command: "memory",
        description: "Edit memory contents",
        options: [],
        args: "Operation type name, arguments key1=value1 key2=value2 ..."
    },
    {
        command: "log",
        description: "Edit log filter",
        options: [],
        args: "Command (add|remove|clear), Process ID"
    },
]
