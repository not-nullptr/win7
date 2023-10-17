import { v4 } from "uuid";
import { WebSocket } from "ws";
import { handleMessage } from "../functions/Logic";

export interface CustomWebSocket extends WebSocket {
	id: string;
}

export interface Connection {
	status: "active" | "idle" | "dnd" | "invisible";
	statusMessage?: string;
	username: string;
	socket: CustomWebSocket;
}

export class ConnectionManager {
	static connections: Connection[] = [];
	static addConnection(connection: CustomWebSocket) {
		connection.id = v4();
		connection.on("message", (message) => {
			console.log(`Received message => ${message}`);
			const json = JSON.parse(message.toString());
			const conn = this.getConnection(connection.id);
			if (json.type === "INITIALIZE") {
				type InitializeData = Partial<Connection>;

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
					if (ConnectionManager.getConnection(id)) return;
					const conn = {
						username,
						status,
						statusMessage,
						socket: connection,
					};
					ConnectionManager.connections.push(conn);
					ConnectionManager.broadcastExcept(conn.socket.id, {
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
								connections: ConnectionManager.getConnections()
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
			handleMessage(json.type, conn, json.data);
		});
		connection.on("close", () => {
			this.removeConnection(connection);
		});
	}
	static removeConnection(connection: CustomWebSocket) {
		ConnectionManager.connections = ConnectionManager.connections.filter(
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
		return ConnectionManager.connections.find((c) => c.socket.id === id);
	}
	static getConnections() {
		return ConnectionManager.connections;
	}
	static modifyConnection(id: string, data: Partial<Connection>) {
		const conn = this.getConnection(id);
		if (!conn) return;
		Object.assign(conn, data);
	}
	static broadcast(data: { type: string; data: any }) {
		ConnectionManager.connections.forEach((c) => {
			c.socket.send(JSON.stringify(data));
		});
	}
	static broadcastExcept(id: string, data: { type: string; data: any }) {
		ConnectionManager.connections
			.filter((c) => c.socket.id !== id)
			.forEach((c) => {
				c.socket.send(JSON.stringify(data));
			});
	}
}
