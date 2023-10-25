import { v4 } from "uuid";
import { WebSocket } from "ws";
import { handleMessageMessenger } from "../functions/Logic";
import { CustomWebSocket } from "./MessengerConnection";

export interface MinesweeperConnection {
	status: "active" | "idle" | "dnd" | "invisible";
	statusMessage?: string;
	username: string;
	socket: CustomWebSocket;
}

export class MinesweeperManager {
	static connections: MinesweeperConnection[] = [];
	static addConnection(connection: CustomWebSocket) {
		connection.id = v4();
		connection.on("message", (message) => {
			console.log(`Received message => ${message}`);
			const json = JSON.parse(message.toString());
			const conn = this.getConnection(connection.id);
			type InitializeData = Partial<MinesweeperConnection>;
			if (json.type === "INITIALIZE") {
				function initialize(id: string, data: InitializeData) {
					const username = data.username || id;
					const status = data.status || "active";
					const statusMessage = data.statusMessage || "";
					if (username.length > 64) return;
					if (statusMessage.length > 128) return;
					if (
						status !== "active" &&
						status !== "idle" &&
						status !== "dnd" &&
						status !== "invisible"
					)
						return;
					if (MinesweeperManager.getConnection(id)) return;
					const conn = {
						username,
						status,
						statusMessage,
						socket: connection,
					};
					MinesweeperManager.connections.push(conn);
					MinesweeperManager.broadcastExcept(conn.socket.id, {
						type: "CONNECT",
						data: {
							id,
							username,
							status,
							statusMessage,
						},
					});
					conn.socket.send(
						JSON.stringify({
							type: "INITIALIZE",
							data: {
								id,
								status,
								statusMessage,
								username,
								connections: MinesweeperManager.getConnections()
									.filter((c) => c.socket.id !== conn.socket.id)
									.map((c) => ({
										id: c.socket.id,
										...c,
										socket: undefined,
									})),
							},
						})
					);
				}
				initialize(connection.id, json.data);
			}
			if (!conn) return;
			handleMessageMessenger(json.type, conn, json.data);
		});
		connection.on("close", () => {
			this.removeConnection(connection);
		});
	}
	static removeConnection(connection: CustomWebSocket) {
		MinesweeperManager.connections = MinesweeperManager.connections.filter(
			(c) => c.socket !== connection
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
