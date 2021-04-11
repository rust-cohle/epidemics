import { interval } from "rxjs";

export interface ClientsConfig {
    constants: {[key: string]: any}
}

export interface Client {
    ip: string;
    start: number
}

export class ClientsService {3
    private _bannedClients: Client[] = [];

    constructor(private config: ClientsConfig) {
        interval(config.constants.CHECK_UNBAN_USERS_INTERVAL).subscribe(() => {
            this._bannedClients = this.bannedClients
                .filter(bannedClient => {
                    if ((bannedClient.start + this.config.constants.BAN_DURATION) <= Date.now()) {
                        console.log(`[Socket] [Ban] Unbanning client with IP ${bannedClient.ip}`);
                        return false;
                    }

                    // Client stays banned
                    return true;
                });
        });
    }

    get bannedClients(): Client[] {
        return this._bannedClients.map(client => ({...client}));
    }

    isBanned(clientIp: string): boolean {
        return this._bannedClients.some(bannedClient => bannedClient.ip === clientIp);
    }

    banClient(clientIp: string) {
        console.log(`[Socket] [Ban] Banning client with IP ${clientIp} for ${this.config.constants.BAN_DURATION / 1000}s.`);

        // Store this IP to prevent it from reconnecting
        this._bannedClients.push({
            ip: clientIp,
            start: Date.now()
        });
    }
}