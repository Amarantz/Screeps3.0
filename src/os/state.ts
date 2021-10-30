declare global {
    interface state {
        /** name of process  */
        n: string
    }

    interface Stateful {
        encode(): void;
    }
}

export const isStateful = (args: any): args is Stateful => {
    return args.encode !== undefined;
}


