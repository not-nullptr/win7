import { v4 } from "uuid";
import {
	MessengerConnection,
	MessengerManager,
} from "../../classes/MessengerConnection";
import {
	ServerMessage,
	ClientMessage,
	MessageType,
	ClientData,
	DataType,
	ServerData,
} from "../../../../shared/src/types";

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

export default function receiveData(
	conn: MessengerConnection,
	data: ClientData,
) {
	switch (data.dataType) {
		case DataType.TYPING_BEGIN_REQUEST: {
			if (!data.to) return;
			const to = MessengerManager.getConnection(data.to);
			if (!to) return;
			const payload = {
				type: "DATA",
				data: {
					dataType: DataType.TYPING_BEGIN_RESPONSE,
					conversationId: hashCode(data.to, conn.socket.id),
					to: data.to,
					from: conn.socket.id,
				} as ServerData,
			};
			to.socket.send(JSON.stringify(payload));
		}
	}
}
