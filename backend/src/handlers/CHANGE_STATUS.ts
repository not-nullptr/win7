import { Connection, ConnectionManager } from "../classes/Connection";

interface ChangeStatusData {
	status: "active" | "idle" | "dnd" | "offline";
}
// ie client sends {type: "CHANGE_STATUS", data: {status: "idle"}}
export default function changeStatus(conn: Connection, data: ChangeStatusData) {
	if (
		data.status !== "active" &&
		data.status !== "idle" &&
		data.status !== "dnd" &&
		data.status !== "offline"
	)
		return;
	ConnectionManager.modifyConnection(conn.socket.id, { status: data.status });
	ConnectionManager.broadcast({
		type: "UPDATE_USER",
		data: {
			id: conn.socket.id,
			status: data.status,
		},
	});
	return;
}
