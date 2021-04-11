import { ReadStream } from "fs";

export interface ResourceIdentifier {
    uuid: string;
    contentType: string;
}

export interface EphemeralResource extends ResourceIdentifier {
    creationTime: number;
}

export interface ResourceCreated {
    created: boolean;
    resource: EphemeralResource;
}

export interface ResourceMetadata {
    uuid: string;
    size: number;
}

export interface ResourceFetchable {
    found: boolean;
    resource?: ReadStream;
}
