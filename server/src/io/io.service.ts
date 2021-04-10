import { ISpaceTimeRecord } from "@epidemics/engine";
import * as http from "http";
import { Server } from "http";
import { interval } from "rxjs";
import { Server as IoServer, Socket } from "socket.io";
import { generateGraph } from "../python-connectors";
import { ComputationEvent, IComputationProgressEvent } from "../simulators/common/computation-event";
import { forkEpidemicsProcess$ } from "../simulators/epidemics/epidemics-precompute";

const constants = {
    MAX_CONCCURRENT_COMPUTATIONS: 4,
    MAX_PER_CLIENT_COMPUTATIONS: 1,
    MAX_FAILED_ATTEMPTS: 5,
    CLEAR_ATTEMPTS_INTERVAL: 1000 * 60, // one minute
    CHECK_UNBAN_USERS_INTERVAL: 1000 * 60, // one minute
    BAN_DURATION: 1000*60*60 // one hour
}

export interface ISocketConfig {
    port: number
}

export interface FailedAttempts {
    count: number;
    firstAttemptTime: number
}

export interface PerClientComputations {
    onGoing: number;
    failedAttempts: FailedAttempts;
}

export interface Computations {
    total: number;
    perClient: { [client: string]: PerClientComputations};
}

export class SocketService {
    private httpServer: Server;

    private socketServer: IoServer;

    private sockets: Socket[] = [];

    private bannedClients: {ip: string, start: number}[] = [];

    private computations: Computations = {
        total: 0,
        perClient: {}
    }

    constructor(private config: ISocketConfig) {
        // Refresh the clients computation attempts periodically
        interval(constants.CLEAR_ATTEMPTS_INTERVAL).subscribe(() => {
            for (const clientId in this.computations.perClient) {
                if (!this.computations.perClient.hasOwnProperty(clientId)) {
                    continue;
                }

                const clientData = this.computations.perClient[clientId];
                if (!clientData.failedAttempts) {
                    continue;
                }

                clientData.failedAttempts = {
                    count: 0,
                    firstAttemptTime: null
                }
            }
        });

        interval(constants.CHECK_UNBAN_USERS_INTERVAL).subscribe(() => {
            this.bannedClients = this.bannedClients
                .filter(bannedClient => {
                    if ((bannedClient.start + constants.BAN_DURATION) <= Date.now()) {
                        console.log(`[Socket] [Ban] Unbanning client with IP ${bannedClient.ip}`);
                        return false;
                    }

                    // Client stays banned
                    return true;
                });
        });
    }

    init(): void {
        this.httpServer = http.createServer();
        this.socketServer = new IoServer(this.httpServer, {
            cors: {
                origin: true,
                credentials: true,
                allowedHeaders: ['Content-Type', 'Authorization'],
                methods: ["GET", "POST"]
            },
            cookie: true
        });

        this.socketServer.on("connection", this.onClientConnection.bind(this));
        

        const port = this.config.port;
        this.httpServer.listen(port, () => console.log(`[Socket] Server listening at ${port}`));
    }

    onClientConnection(socket: Socket): void {
        const clientIp = socket.handshake.address;
        if (this.bannedClients.some(bannedClient => bannedClient.ip === socket.handshake.address)) {
            console.warn(`[Server] [Connection] Client ${clientIp} attempted to connect but is banned.`);
            socket.emit("connectionEvent", {
                connected: false,
                reason: "You are banned for a while."
            });
            socket.disconnect();
            return;
        }

        console.log(`[Server] [Connection] Client ${clientIp} connected with socket ID ${socket.id}.`);

        socket.on("disconnect", this.onSocketDisconnect.bind(this, socket));
        socket.on("computationRequest", this.onSocketRequestComputation.bind(this, socket));

        this.sockets.push(socket);
    }

    onSocketDisconnect(socket: Socket, reason: string): void {
        console.log(`[Socket] [Disconnection] Client ${socket.id} disconnected: ${reason ? `${reason}.` : "unknown reason."}`);
        this.sockets = this.sockets.filter(sckt => sckt.id !== socket.id);
    }

    async onSocketRequestComputation(socket: Socket, data): Promise<void> {
        const clientIp = socket.handshake.address;
        console.log(`[Socket] [Computation] Client ${clientIp} requested a computation.`);

        if (!this.computations.perClient[clientIp]) {
            this.computations.perClient[clientIp] = {
                onGoing: 0,
                failedAttempts: {
                    count: 0,
                    firstAttemptTime: null
                },
            };
        }

        const perClientComputations = this.computations.perClient[clientIp];
        const failedAttempts = perClientComputations.failedAttempts;
        if (failedAttempts.count >= constants.MAX_FAILED_ATTEMPTS) {
            console.log(`[Socket] [Computation] Client ${clientIp} requested too many computations.`);
            socket.emit("computationRequestEvent", {
                computing: false,
                reason: "You've made too many computation requests. You'll be banned for a while."
            });
            this.banClient(clientIp);
            return;
        }


        if (this.computations.total >= constants.MAX_CONCCURRENT_COMPUTATIONS) {
            console.warn(`[Socket] [Computation] Refused: too many overall computations.`);
            socket.emit("computationProgressEvent", {
                type: ComputationEvent.NotStarted
            });
            if (failedAttempts.count === 0) {
                failedAttempts.firstAttemptTime = Date.now();
            }
            failedAttempts.count += 1;
            socket.emit("computationRequestEvent", {
                computing: false,
                reason: `Too many people are computing at the moment. Please wait (failed attempts: ${failedAttempts.count}/${constants.MAX_FAILED_ATTEMPTS}).`
            });
            return;
        }
        
        if (perClientComputations.onGoing >= constants.MAX_PER_CLIENT_COMPUTATIONS) {
            console.warn(`[Socket] [Computation] Refused: too many computations for ${socket.id}.`);
            perClientComputations.failedAttempts.count += 1;
            socket.emit("computationProgressEvent", {
                type: ComputationEvent.NotStarted
            });
            socket.emit("computationRequestEvent", {
                computing: false,
                reason: `You reached the per-client computation limit (${perClientComputations.onGoing}/${constants.MAX_PER_CLIENT_COMPUTATIONS}). Please wait (failed attempts: ${failedAttempts.count}/${constants.MAX_FAILED_ATTEMPTS}).`
            });
            return;
        }

        this.computations.total += 1;
        socket.emit("computationRequestEvent", {
            computing: true,
            reason: "This may take a while."
        });

        console.log(`[Socket] [Computation] Starting with options: ${JSON.stringify(data)}.`);
        perClientComputations.onGoing += 1;

        forkEpidemicsProcess$(data).subscribe(async (computationEvent: IComputationProgressEvent<ISpaceTimeRecord>) => {
            socket.emit("computationProgressEvent", JSON.stringify(computationEvent));

            if(computationEvent.type === ComputationEvent.Progressing) {
                try {
                    // const graphPath = await generateGraph(computationEvent.progress.epidemics.counts.current);
                    // console.log(graphPath);
                } catch(err) {
                    console.error("[Socket] [Computation] Failed to create a graph: ", err);
                }
            }

            if(computationEvent.type === ComputationEvent.Complete) {
                perClientComputations.onGoing -= 1;
                this.computations.total -= 1;
            }
        });
    }

    private banClient(clientIp: string) {
        console.log(`[Socket] [Ban] Banning client with IP ${clientIp} for ${constants.BAN_DURATION/1000}s.`);

        // Store this IP to prevent it from reconnecting
        this.bannedClients.push({
            ip: clientIp,
            start: Date.now()
        });
        
        // Find all sockets that have this client IP and disconnect them
        const targets = this.sockets.filter(socket => socket.handshake.address === clientIp);
        targets.forEach(socket => {
            socket.disconnect();
        });
    
    }
}
