export const leveled_colored_text = (text: string, level: string): string => {
    return coloredText(text, level);
}

export function coloredText(text: string, color: string): string {
    const colorValue = textColor(color);
    return anyColoredText(text, colorValue);
}

export function anyColoredText(text: string, color: string) : string {
    return `<span style='color:${color}'>${text}</span>`;
}

export function roomLink(roomName:string): string {
    return `<a href="!#/room/${Game.shard.name}/${roomName}">[${roomName}]</a>`;
}
export function textColor(color: string): string  {
    return textColors[color] ?? 'white';
}

const textColors: {[index:string]: string} = {
    info: 'white',
    warn: '#F9E79F',
    error: '#F78C6C',
    critical: '#E74C3C',

    high: '#64C3F9',
    almost: '#47CAB0'
}
