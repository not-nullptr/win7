import { MessengerConnection } from "../../classes/MessengerConnection";

export default function ping(conn: MessengerConnection) {
	conn.socket.send(
		JSON.stringify({
			type: "PONG",
		}),
	);
	return;
}
