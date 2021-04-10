export function getRandomNumber(from: number, to: number): number {
    const decimals = Math.random();
    return Math.round((Math.random() * (to - from)) + from) + decimals;
}