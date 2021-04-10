import { InjectionToken } from "@angular/core";

export interface SocketConfig {
    url: string,
    options: any
}

export const SOCKET_CONFIG = new InjectionToken<SocketConfig>("SocketConfigToken");