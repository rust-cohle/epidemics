export function matrixLike<T>(coefficients: T[][]): string {
    const n = coefficients.length;
    return coefficients.reduce((acc, line, i) => {
        acc += line.reduce((acc2, val, j) => {
            if (j === 0) return acc2 + val;
            return `${acc2} & ${val}`
        }, "");
        if (i < n - 1) { // if not last line
            acc += "\\\\";
        }
        return acc;
    }, "")
}