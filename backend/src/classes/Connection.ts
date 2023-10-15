import { v4 } from "uuid";
import { WebSocket } from "ws";
import { handleMessage } from "../functions/Logic";

export interface CustomWebSocket extends WebSocket {
	id: string;
}

export interface Connection {
	status: "active" | "idle" | "dnd" | "invisible";
	username: string;
	socket: CustomWebSocket;
}

export class ConnectionManager {
	private static connections: Connection[] = [];
	static addConnection(connection: CustomWebSocket) {
		connection.id = v4();
		ConnectionManager.connections.push({
			status: "active",
			username: connection.id,
			socket: connection,
		});
		this.broadcastExcept(connection.id, {
			type: "CONNECT",
			data: {
				id: connection.id,
				status: "active",
				username: connection.id,
			},
		});
		connection.send(
			JSON.stringify({
				type: "INITIALIZE",
				data: {
					id: connection.id,
					status: "active",
					username: connection.id,
					connections: this.getConnections()
						.filter((c) => c.socket.id !== connection.id)
						.map((c) => ({
							id: c.socket.id,
							status: c.status,
							username: c.username,
						})),
				},
			})
		);
		connection.on("message", (message) => {
			console.log(`Received message => ${message}`);
			const json = JSON.parse(message.toString());
			const conn = this.getConnection(connection.id);
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
