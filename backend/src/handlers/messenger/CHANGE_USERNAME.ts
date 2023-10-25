import {
	MessengerConnection,
	MessengerManager,
} from "../../classes/MessengerConnection";

interface ChangeStatusData {
	username: string;
}
// ie client sends {type: "CHANGE_STATUS", data: {status: "idle"}}
export default function changeUsername(
	conn: MessengerConnection,
	data: ChangeStatusData
) {
	// for each key in the interface, if it doesn't exist in the data, return
	if (!data.username) return;
	if (data.username.length > 32) return;
	MessengerManager.modifyConnection(conn.socket.id, {
		username: data.username,
	});
	MessengerManager.broadcast({
		type: "UPDATE_USER",
		data: {
			id: conn.socket.id,
			username: data.username,
		},
	});
	return;
}
