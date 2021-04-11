import * as path from "path";
import { ClientsService } from "./clients/clients.service";
import { ApiService } from "./io/api.service";
import { SocketService } from "./io/io.service";
import { rootPath } from "./root";
import { EphemeralStorageService } from "./storage";

const ephemeralStorage = new EphemeralStorageService({
    constants: {
        CHECK_CLEAN_RESOURCES: 20000, // 10s
        MAX_RESOURCE_LIFESPAN: 120000, // 2 minutes
    },
    location: path.resolve(rootPath, "../resources/storage")
});
const clients = new ClientsService({
    constants: {
        CHECK_UNBAN_USERS_INTERVAL: 1000 * 60, // one minute
        BAN_DURATION: 1000 * 60 * 60 // one hour
    }
});
const socketService = new SocketService({
    port: 3333,
    dependencies: [ephemeralStorage, clients]
});
socketService.init();
const apiService = new ApiService({
    port: 3334,
    dependencies: [ephemeralStorage, clients]
});
apiService.init();