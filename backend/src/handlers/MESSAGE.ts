import { v4 } from "uuid";
import { Connection, ConnectionManager } from "../classes/Connection";
import {
	ServerMessage,
	ClientMessage,
	MessageType,
} from "../../../shared/src/types";

function hashCode(...strings: string[]): string {
	const input = strings.sort().join("");
	let hash: number = 0;
	for (let i = 0; i < input.length; i++) {
		const chr: number = input.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0;
	}
	return hash.toString();
}

export default function receiveMessage(conn: Connection, data: ClientMessage) {
	switch (data.messageType) {
		case MessageType.TEXT_MESSAGE_CLIENT: {
			if (!data.message || !data.to) return;
			const to = ConnectionManager.getConnection(data.to);
			if (!to) return;
			if (data.message.startsWith("!triggerError")) {
				const payload = {
					type: "MESSAGE",
					data: {
						messageType: MessageType.ERROR,
						to: conn.socket.id,
						from: conn.socket.id,
						message:
							data.message.replace("!triggerError", "").replace(" ", "") ||
							"Sample error",
						id: v4(),
						conversationId: hashCode(conn.socket.id, to.socket.id),
					} as ServerMessage,
				};
				conn.socket.send(JSON.stringify(payload));
				return;
			}
			const payload = {
				type: "MESSAGE",
				data: {
					messageType: MessageType.TEXT_MESSAGE_SERVER,
					to: data.to,
					from: conn.socket.id,
					message: data.message,
					id: v4(),
					conversationId: hashCode(data.to, conn.socket.id),
				} as ServerMessage,
			};
			to.socket.send(JSON.stringify(payload));
			conn.socket.send(JSON.stringify(payload));
			return;
		}
		case MessageType.NUDGE_REQUEST: {
			if (!data.to) return;
			const to = ConnectionManager.getConnection(data.to);
			if (!to) return;
			const payload = {
				type: "MESSAGE",
				data: {
					messageType: MessageType.NUDGE_RESPONSE,
					to: data.to,
					from: conn.socket.id,
					id: v4(),
					conversationId: hashCode(data.to, conn.socket.id),
				} as ServerMessage,
			};
			to.socket.send(JSON.stringify(payload));
			conn.socket.send(JSON.stringify(payload));
			return;
		}
		case MessageType.IMAGE_REQUEST: {
			if (!data.to || !data.image) return;
			const to = ConnectionManager.getConnection(data.to);
			if (!to) return;
			const payload = {
				type: "MESSAGE",
				data: {
					messageType: MessageType.IMAGE_RESPONSE,
					to: data.to,
					from: conn.socket.id,
					image: data.image,
					id: v4(),
					conversationId: hashCode(data.to, conn.socket.id),
				} as ServerMessage,
			};
			to.socket.send(JSON.stringify(payload));
			conn.socket.send(JSON.stringify(payload));
			return;
		}
	}
}
