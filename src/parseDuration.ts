export function parseDuration(durationStr: string) {

    let regex = /^(\d+)(ms|s|m|h)$/;
    let match = durationStr.match(regex);
    return match;
}
export function convertToMilliseconds(num: number, unit: string): number {
    switch (unit) {
        case 'ms':
            return num;
        case 's':
            return num * 1000;
        case 'm':
            return num * 60 * 1000;
        case 'h':
            return num * 60 * 60 * 1000;
        default:
            return num;
    }
}
