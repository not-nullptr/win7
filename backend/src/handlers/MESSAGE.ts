import { v4 } from "uuid";
import { Connection, ConnectionManager } from "../classes/Connection";

interface MessageData {
	message: string;
	to: string;
}

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

export default function receiveMessage(conn: Connection, data: MessageData) {
	if (!data.message || !data.to) return;
	const to = ConnectionManager.getConnection(data.to);
	if (!to) return;
	const payload = JSON.stringify({
		type: "MESSAGE",
		data: {
			to: data.to,
			from: conn.socket.id,
			message: data.message,
			id: v4(),
			conversationId: hashCode(data.to, conn.socket.id),
		},
	});
	to.socket.send(payload);
	conn.socket.send(payload);
	return;
}
