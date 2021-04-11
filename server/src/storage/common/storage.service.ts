import { ResourceCreated, ResourceFetchable as ResourceFetchable, ResourceIdentifier, ResourceMetadata } from "./resource";

import * as path from "path";
import * as fs from "fs";
import { Readable } from "stream";

export interface StorageConfig {
    location: string;
}

export abstract class StorageService {
    private _storageLocation: string;

    constructor(protected config: StorageConfig) {
        this._storageLocation = this.config.location;
        if (!fs.existsSync(this._storageLocation) || !fs.lstatSync(this._storageLocation).isDirectory()) {
            throw new Error(`[Storage] ${this._storageLocation} is not a valid directory.`);
        }
    }

    abstract getResource(resId: ResourceIdentifier): Promise<ResourceFetchable>;

    abstract getResourceMetadata(uuid: string): Promise<ResourceMetadata>;

    abstract createResource(data: string | Readable): Promise<ResourceCreated>;

    get storageLocation(): string {
        return this._storageLocation;
    }

    protected getResourcePath(uuid: string): string {
        return path.join(this._storageLocation, uuid);
    }
}