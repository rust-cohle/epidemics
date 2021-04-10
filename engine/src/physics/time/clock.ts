export class Clock {
    private _timestamp: number;

    constructor(private _origin: number, private unit: number = 1000, startTimestamp?: number) {
        if(typeof startTimestamp !== "number") {
            this._timestamp = _origin;
        }
    }

    clone(): Clock {
        return new Clock(this._origin, this.unit, this._timestamp);
    }
    
    cloneFresh(): Clock {
        return new Clock(this._timestamp, this.unit);
    }

    resume(resumeTimestamp: number) {
        this._origin = this._origin + (resumeTimestamp - this._timestamp);
        this._timestamp = resumeTimestamp;
    }

    restart(timestamp: number): Clock {
        this._origin = timestamp;
        this._timestamp = timestamp;

        return this;
    }

    synchronize(clock: Clock): Clock {
        this._origin = clock.origin;
        this._timestamp = clock.timestamp;

        return this;
    }

    update(timestamp: number): void {
        this._timestamp = timestamp;
    }

    get time(): number {
        return (this._timestamp - this._origin) / this.unit;
    }

    get origin(): number {
        return this._origin;
    }

    get timestamp(): number {
        return this._timestamp;
    }
}