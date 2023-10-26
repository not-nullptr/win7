import { MinesweeperConnection } from "../../classes/MinesweeperConnection";

export default function ping(conn: MinesweeperConnection, data: any) {
	conn.socket.send(
		JSON.stringify({
			type: "PONG",
		}),
	);
	return;
}
