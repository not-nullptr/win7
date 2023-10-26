import { v4 } from "uuid";
import { WebSocket } from "ws";
import { handleMessageMinesweeper } from "../functions/Logic";
import { CustomWebSocket } from "./MessengerConnection";
import { MPBoard, MinesweeperUser } from "../../../shared/src/types";

export type MinesweeperConnection = MinesweeperUser & {
	socket: CustomWebSocket;
};

export interface Game {
	id: string;
	players: MinesweeperConnection[];
	boards: [MPBoard, MPBoard];
}

export class MinesweeperManager {
	static games: Game[] = [];
	static connections: MinesweeperConnection[] = [];
	static addConnection(connection: CustomWebSocket) {
		connection.on("message", (message) => {
			console.log(`Received message => ${message}`);
			const json = JSON.parse(message.toString());
			const conn = this.getConnection(connection.id);
			if (json.type === "INITIALIZE") {
				connection.id = v4();
				this.connections.push({
					id: connection.id,
					isInGame: false,
					socket: connection,
				});
				MinesweeperManager.broadcastExcept(connection.id, {
					type: "UPDATE_USERS",
					data: {
						users: MinesweeperManager.connections.map(
							({ socket, ...rest }) => rest,
						),
					},
				});
				connection.send(
					JSON.stringify({
						type: "INITIALIZE",
						data: {
							id: connection.id,
							users: MinesweeperManager.connections.map(
								({ socket, ...rest }) => rest,
							),
						},
					}),
				);
			}
			if (!conn) return;
			handleMessageMinesweeper(json.type, conn, json.data);
		});
		connection.on("close", () => {
			this.removeConnection(connection);
		});
	}
	static removeConnection(connection: CustomWebSocket) {
		MinesweeperManager.connections = MinesweeperManager.connections.filter(
			(c) => c.socket !== connection,
		);
		this.broadcast({
			type: "DISCONNECT",
			data: {
				id: connection.id,
			},
		});
	}
	static getConnection(id: string) {
		return MinesweeperManager.connections.find((c) => c.socket.id === id);
	}
	static getConnections() {
		return MinesweeperManager.connections;
	}
	static modifyConnection(id: string, data: Partial<MinesweeperConnection>) {
		const conn = this.getConnection(id);
		if (!conn) return;
		Object.assign(conn, data);
	}
	static broadcast(data: { type: string; data: any }) {
		MinesweeperManager.connections.forEach((c) => {
			c.socket.send(JSON.stringify(data));
		});
	}
	static broadcastExcept(id: string, data: { type: string; data: any }) {
		MinesweeperManager.connections
			.filter((c) => c.socket.id !== id)
			.forEach((c) => {
				c.socket.send(JSON.stringify(data));
			});
	}
}

export class GameManager {}
