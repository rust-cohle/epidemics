import * as fs from "fs";
import { StorageConfig, StorageService } from "../common";
import { EphemeralResource, ResourceCreated, ResourceFetchable, ResourceIdentifier, ResourceMetadata } from "../common/resource";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { interval } from "rxjs";

export interface EphemeralStorageConfig extends StorageConfig {
    constants: {[key: string]: any}
}

export class EphemeralStorageService extends StorageService {
    constructor(protected config: EphemeralStorageConfig) {
        super(config);

        this.periodicResourcesCleanup();
    }

    async getResource(resId: ResourceIdentifier): Promise<ResourceFetchable> {
        try {
            const stats = await fs.promises.stat(this.getResourcePath(resId.uuid));
            const readStream = fs.createReadStream(this.getResourcePath(resId.uuid));
            return {
                found: true,
                length: stats.size,
                readStream: readStream
            };
        } catch(err) {
            console.error(`[Ephemeral] Resource ${resId.uuid} could not be read: ${err}`);
            return {
                found: false
            }
        }
    }
    
    async getResourceMetadata(uuid: string): Promise<ResourceMetadata> {
        return null;
    }

    async createResource(data: string | Readable, contentType = "application/json"): Promise<ResourceCreated> {
        return new Promise((resolve, reject) => {
            const uuid = uuidv4();
            const resource: EphemeralResource = {
                uuid,
                creationTime: Date.now(),
                contentType
            };

            const fileStream = fs.createWriteStream(this.getResourcePath(resource.uuid));
            if (typeof data === "string") {
                fileStream.write(data);
                fileStream.end();
            } else if (data instanceof Readable) {
                data.pipe(fileStream);
            }

            fileStream.on("finish", () => {
                resolve({
                    created: true,
                    resource
                });
            });

            fileStream.on("error", err => {
                console.error(`[Ephemeral] Failed to write resource ${uuid}.`, err);
                resolve({
                    created: false,
                    resource: null
                });
            });
        });
    }

    periodicResourcesCleanup() {
        interval(this.config.constants.CHECK_CLEAN_RESOURCES).subscribe(() => {
            fs.readdir(this.config.location, (err, files) => {
                if (err) {
                    console.error(`[Ephemeral] Failed to read storage location ${this.config.location}.`, err);
                    return;
                }

                files.forEach(file => {
                    const uuidPath = this.getResourcePath(file);
                    fs.stat(uuidPath, (err, stats) => {
                        if (err) {
                            console.error(`[Ephemeral] Failed to read resource stats ${file}.`, err);
                            return;
                        }

                        // Not ready to delete yet
                        if (stats.birthtimeMs + this.config.constants.MAX_RESOURCE_LIFESPAN > Date.now()) {
                            return;
                        }

                        fs.unlink(uuidPath, (err) => {
                            if (err) {
                                console.error(`[Ephemeral] Failed to delete resource ${file}.`, err);
                                return;
                            }

                            console.log(`[Ephemeral] Cleaned-up resource ${file}.`);
                        });
                    });
                });
            });
        });
    }
}