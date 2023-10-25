import {
	MessengerConnection,
	MessengerManager,
} from "../../classes/MessengerConnection";

interface ChangeStatusData {
	status?: "active" | "idle" | "dnd" | "invisible";
	statusMessage?: string;
}
// ie client sends {type: "CHANGE_STATUS", data: {status: "idle"}}
export default function changeStatus(
	conn: MessengerConnection,
	data: ChangeStatusData
) {
	if (data.status) {
		if (
			data.status !== "active" &&
			data.status !== "idle" &&
			data.status !== "dnd" &&
			data.status !== "invisible"
		)
			return;
		MessengerManager.modifyConnection(conn.socket.id, {
			status: data.status,
		});
		MessengerManager.broadcast({
			type: "UPDATE_USER",
			data: {
				id: conn.socket.id,
				status: data.status,
			},
		});
	}
	if (typeof data.statusMessage === "string") {
		if (data.statusMessage.length > 128) return;
		MessengerManager.modifyConnection(conn.socket.id, {
			statusMessage: data.statusMessage,
		});
		MessengerManager.broadcast({
			type: "UPDATE_USER",
			data: {
				id: conn.socket.id,
				statusMessage: data.statusMessage,
			},
		});
	}
	return;
}
