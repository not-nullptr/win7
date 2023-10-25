import { WebSocketServer } from "ws";
import {
	MessengerManager,
	CustomWebSocket,
} from "./classes/MessengerConnection";
import "./functions/Logic";
import http from "http";
import url from "url";
import { MinesweeperManager } from "./classes/MinesweeperConnection";

const server = http.createServer();

const messengerServer = new WebSocketServer({ noServer: true });

messengerServer.on("connection", (ws: CustomWebSocket) => {
	MessengerManager.addConnection(ws);
});

const minesweeperServer = new WebSocketServer({ noServer: true });

minesweeperServer.on("connection", (ws: CustomWebSocket) => {
	MinesweeperManager.addConnection(ws);
});

server.on("upgrade", (request, socket, head) => {
	const pathname = url.parse(request.url!).pathname;

	if (pathname === "/messenger") {
		messengerServer.handleUpgrade(request, socket, head, (ws) => {
			messengerServer.emit("connection", ws);
		});
	} else if (pathname === "/minesweeper") {
		minesweeperServer.handleUpgrade(request, socket, head, (ws) => {
			minesweeperServer.emit("connection", ws);
		});
	} else {
		socket.destroy();
	}
});

server.on("listening", () => {
	console.log("4000, yo");
});

server.listen(4000);
