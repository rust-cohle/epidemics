import * as child_process from 'child_process';
import * as path from 'path';
import { IPersonStateCount } from "@epidemics/engine";
import { PY_SCRIPTS_ROOT } from './python-scripts-root';

const GENERATE_GRAPH_PY = path.join(PY_SCRIPTS_ROOT, "main.py");
console.log(GENERATE_GRAPH_PY);

export function generateGraph(data: IPersonStateCount): Promise<string> {
    return new Promise((resolve, reject) => {
        const buffer = Buffer.from(JSON.stringify(data));
        const encodedData = buffer.toString("base64");

        const pyGenerateGraph = child_process.spawn("python3", [GENERATE_GRAPH_PY, encodedData], {
            cwd: PY_SCRIPTS_ROOT
        });

        pyGenerateGraph.stdout.on("data", (data) => {
            console.log(data.toString());
            resolve(null);
        });

        pyGenerateGraph.stderr.on("data", (data) => {
            reject(data.toString());
        });
    });
}