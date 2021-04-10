import { SocketService } from "./io/io.service";

const socketService = new SocketService({
    port: 3333
});
socketService.init();