import { v4 } from "uuid";
import {
	MinesweeperConnection,
	MinesweeperManager,
} from "../../classes/MinesweeperConnection";
import { MPBoard, generateBoard } from "../../../../shared/src/types";

export default function startGame(
	conn: MinesweeperConnection,
	data: { id: string },
) {
	const otherGame = MinesweeperManager.games.find((game) =>
		game.players.some(
			(player) => player.id === data.id || player.id === conn.socket.id,
		),
	);
	if (otherGame) return;
	const otherConn = MinesweeperManager.getConnection(data.id);
	if (!otherConn) return;
	const game = {
		id: v4(),
		players: [conn, otherConn],
		boards: [
			{
				board: generateBoard(),
				id: conn.id,
			},
			{
				board: generateBoard(),
				id: otherConn.id,
			},
		] as [MPBoard, MPBoard],
	};
	MinesweeperManager.games.push(game);
	const payload = JSON.stringify({
		type: "START_GAME",
		data: game,
	});
	conn.socket.send(payload);
	otherConn.socket.send(payload);
	return;
}
