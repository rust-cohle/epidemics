import { EpidemicsWorldConfig, generateEpidemicsWorld, IEpidemicsSnapshot, ISpaceTimeRecord, ISpaceTimeEpidemicsRecord, ISpaceTimeSnapshot } from "@epidemics/engine";
import { Observable } from "rxjs";
import { IPrecomputeConfig } from "../../common/precompute-config";
import { ComputationEvent, IComputationProgressEvent } from "../common/computation-event";

process.on("message", message => {
    epidemicsComputation$(message.config)
        .subscribe((computationEvent: IComputationProgressEvent<ISpaceTimeRecord>) => {
            process.send(computationEvent, () => {
                if ([ComputationEvent.Complete].includes(computationEvent.type)) {
                    process.exit();
                }
            });
        });
});

export function epidemicsComputation$(config: IPrecomputeConfig & EpidemicsWorldConfig): Observable<IComputationProgressEvent<ISpaceTimeRecord>> {
    return new Observable((observer) => {
        const world = generateEpidemicsWorld({
            width: config.width || 1000,
            height: config.height || 1000,
            numberOfPersons: config.numberOfPersons || 100
        });

        observer.next({
            type: ComputationEvent.Start
        });

        const unitInMs = config.unitInMs || 1000;
        const durationInMillis = config.duration * unitInMs;
        const duration = config.duration;
        const fps = config.fps;
        const fpms = fps / 1000;
        const numberOfFrames = fpms * durationInMillis;
        const interval = durationInMillis / numberOfFrames;

        const snapshots: ISpaceTimeSnapshot[] = [];
        let time = 0;
        world.start(time);

        const computationStart = Date.now();
        let computationTime = computationStart;

        const EMIT_PROGRESS_EVERY_FRAMES = 50;
        const epidemicsSnapshots: IEpidemicsSnapshot[] = [];
        for (let i = 0; i < numberOfFrames; i++) {
            // Epidemics snapshot must be computed everytime (getter) since it's calculated based from previous value
            world.updateEpidemicsSnapshot();
            const epidemicsSnapshot = world.epidemicsSnapshot;

            // Everytime we need a global snapshot (config), send it to UI
            if (i > 0 && i % EMIT_PROGRESS_EVERY_FRAMES === 0) {
                epidemicsSnapshots.push(epidemicsSnapshot);
                computationTime = Date.now();

                const ellapsed = computationTime - computationStart;
                observer.next({
                    type: ComputationEvent.Progressing,
                    progress: {
                        frames: {
                            computed: i,
                            remaining: numberOfFrames - i,
                            total: numberOfFrames
                        },
                        progression: {
                            percent: Math.round((i / numberOfFrames) * 100),
                            etaInMs: (numberOfFrames * ellapsed) / i
                        },
                        epidemics: epidemicsSnapshots
                    }
                });
            }
            time += interval;
            world.tick(time);
            snapshots.push(world.snapshot);
        }

        const record: ISpaceTimeEpidemicsRecord = {
            metadata: {
                fps,
                fpms,
                duration,
                unitInMs
            },
            snapshots,
            epidemics: epidemicsSnapshots
        };

        observer.next({
            type: ComputationEvent.Complete,
            payload: record
        });
        observer.complete();
    });
}