import { Connection } from "../classes/Connection";

export default function ping(
	conn: Connection,
) {
    conn.socket.send(JSON.stringify({
        type: "PONG",
    }));
	return;
}
