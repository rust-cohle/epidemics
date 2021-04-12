import { ISpaceTimeEpidemicsRecord, ISpaceTimeRecord } from "@epidemics/engine";
import * as child_process from "child_process";
import { Observable } from "rxjs";
import { IPrecomputeConfig } from "../../common/precompute-config";
import { IComputationProgressEvent } from "../common/computation-event";

export function forkEpidemicsProcess$(config: IPrecomputeConfig): Observable<IComputationProgressEvent<ISpaceTimeEpidemicsRecord>> {
    return new Observable((observer) => {
        const computeProcess = child_process.fork("./dist/simulators/epidemics/epidemics-process.js");
        
        computeProcess.send({
            config
        });

        computeProcess.on("message", message => observer.next(message as IComputationProgressEvent<ISpaceTimeEpidemicsRecord>));
    });
}