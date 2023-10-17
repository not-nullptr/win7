import { Connection, ConnectionManager } from "../classes/Connection";

interface ChangeStatusData {
	username: string;
}
// ie client sends {type: "CHANGE_STATUS", data: {status: "idle"}}
export default function changeUsername(
	conn: Connection,
	data: ChangeStatusData
) {
	// for each key in the interface, if it doesn't exist in the data, return
	if (!data.username) return;
	if (data.username.length > 32) return;
	ConnectionManager.modifyConnection(conn.socket.id, {
		username: data.username,
	});
	ConnectionManager.broadcast({
		type: "UPDATE_USER",
		data: {
			id: conn.socket.id,
			username: data.username,
		},
	});
	return;
}
