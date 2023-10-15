import { WebSocketServer } from "ws";
import { ConnectionManager, CustomWebSocket } from "./classes/Connection";
import "./functions/Logic";

const wss = new WebSocketServer({ port: 4000 });

wss.on("connection", (ws: CustomWebSocket) => {
	ConnectionManager.addConnection(ws);
});

wss.on("listening", () => {
	console.log("Listening on port 4000");
});
