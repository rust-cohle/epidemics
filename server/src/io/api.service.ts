import express from "express";
import { EphemeralStorageService } from "../storage";
import { ClientsService } from "src/clients/clients.service";

export interface ApiConfig {
    port: number;
    dependencies: [EphemeralStorageService, ClientsService]
}

export class ApiService {
    private api: express.Application;

    private ephemeralStorage: EphemeralStorageService;

    private clientsManager: ClientsService;

    constructor(private config: ApiConfig) {
        this.api = express();
        const [ephemeralStorage, clientsManager] = config.dependencies;
        this.ephemeralStorage = ephemeralStorage;
        this.clientsManager = clientsManager;
    }

    init(): void {
        this.api.use(this.headersMiddleware.bind(this));
        this.api.use(this.bannedMiddleware.bind(this));
        this.api.get("/api/resource/:uuid", this.onGetResource.bind(this));
        this.api.listen(this.config.port, () => console.log(`[API] Listening at port ${this.config.port}`));
    }

    private async onGetResource(req: express.Request, res: express.Response) {
        if (!req.params.uuid) {
            res.status(422).json({ message: "Missing mandatory resource 'uuid' parameter.", type: "error" });
            return;
        }

        try {
            const fetchable = await this.ephemeralStorage.getResource({
                uuid: req.params.uuid,
                contentType: "application/json"
            });

            if(!fetchable.found || !fetchable.readStream) {
                throw new Error("Resource not found.");
            }

            res.status(200);
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Content-Length", fetchable.length);
            fetchable.readStream.pipe(res);
            return;
        } catch(err) {
            console.error(`[API] [GET resource ${req.params.uuid}] ${err}`);
            res.status(404).json({ message: `Could not fetch resource ${req.params.uuid}.`, type: "error" });
        }
    }

    private headersMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length");

        next();
    }

    /**
     * Abort any request from a banned client.
     *
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    private bannedMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
        const ip = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress;
        if (this.clientsManager.isBanned(ip)) {
            console.log(`[API] ${req.method} ${req.path} aborted: ${ip} is banned.`);
            res.status(401).json({type: "error", message: "Client is banned."});
            return;
        }

        next();
    }
}