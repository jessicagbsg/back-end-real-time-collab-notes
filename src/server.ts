import http from "http";
import app from "./app";
import { dbConnection } from "./database/db";

const server = http.createServer(app);

dbConnection();
server.listen(3000, () => console.log(`Server running at http://localhost:3000`));
