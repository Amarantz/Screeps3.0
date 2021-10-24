/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { anyColoredText, leveled_colored_text } from 'utils/Logger';
declare global {
    interface Memory {
        stats: {
            cpu: {
                usage: number[]
            }
        }
        roomInfo: {
            [key: string]: Record<string, unknown>
        }
    }
}

export class Initialize {
    static init(): void {
        if (!Memory.creeps) {
            Memory.creeps = {}
        }

        if (!Memory.stats) {
            Memory.stats = {
                cpu: {
                    usage: []
                }
            }
        }

        if (!Memory.roomInfo) {
            Memory.roomInfo = {}
        }

        if (Memory.stats.cpu.usage.length > 20) {
            Memory.stats.cpu.usage = []
        }
    }

    static run(): void {
        const ticks = 20;

        if (Memory.stats.cpu.usage.length > ticks) {
            Memory.stats.cpu.usage.shift();
        }

        const limit = Game.cpu.limit;
        const usage = Memory.stats.cpu.usage.map(u => {
            if (u > (1.5 * limit)) {
                return leveled_colored_text(`${u}`, 'critical');
            }
            if (u > limit) {
                return leveled_colored_text(`${u}`, 'error');
            }
            if (u > limit * .75) {
                return leveled_colored_text(`${u}`, 'warn');
            }
            return leveled_colored_text(`${u}`, 'info');
        });

        const avg = (() => {
            const a = _.sum(Memory.stats.cpu.usage) / Memory.stats.cpu.usage.length;
            if (a > (1.5 * limit)) {
                return leveled_colored_text(`${a}`, 'critical');
            }
            if (a > limit) {
                return leveled_colored_text(`${a}`, 'error');
            }
            if (a > limit * .75) {
                return leveled_colored_text(`${a}`, 'warn');
            }
            return leveled_colored_text(`${a.toFixed(3)}`, 'info');
        })();

        const bucket = (() => {
            const cb = Game.cpu.bucket;
            const bucketLimit = 10000;
            if (cb < bucketLimit * .10) {
                return leveled_colored_text(`${cb}`, 'critical');
            }
            if (cb < bucketLimit * .25) {
                return leveled_colored_text(`${cb}`, 'error');
            }
            if (cb < bucketLimit * .50) {
                return leveled_colored_text(`${cb}`, 'warn');
            }

            if (cb < bucketLimit * .75) {
                return leveled_colored_text(`${cb}`, 'almost');
            }

            return leveled_colored_text(`${cb}`, 'high');
        })();
        if (Game.time % ticks === 0) {
            console.log(`Cpu usage: ${usage} Avg: ${avg} Bucket: ${bucket} at Tick: ${anyColoredText(Game.time.toString(), '#9524')}`);
        }
    }
}
