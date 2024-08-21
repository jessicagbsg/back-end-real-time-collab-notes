import http from "http";
import { app } from "./app";
import { dbConnection } from "./database/db";
import { setUpSocket } from "./socket";

const server = http.createServer(app);

setUpSocket(server);
dbConnection();
server.listen(3000, () => console.log(`Server running at http://localhost:3000`));
