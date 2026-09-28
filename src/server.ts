import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app";
import { initializeSocket } from "./services/socket.service";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer);

initializeSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
