import { CellState, reveal } from "../../../../shared/src/types";
import {
	MinesweeperConnection,
	MinesweeperManager,
} from "../../classes/MinesweeperConnection";

export default function makeMove(
	conn: MinesweeperConnection,
	data: {
		x: number;
		y: number;
	}
) {
	const game = MinesweeperManager.games.find((game) =>
		game.players.some((player) => player.id === conn.id)
	);
	if (!game) return;
	const board = game.boards.find((b) => b.id === conn.id);
	if (!board) return;
	const result = reveal(board.board, data.x, data.y);
	if (!result) return;
	MinesweeperManager.games
		.find((game) => game.players.some((player) => player.id === conn.id))!
		.boards.find((b) => b.id === conn.id)!.board = result.board;
	console.log(result.board);
	const payload = JSON.stringify({
		type: "MAKE_MOVE",
		data: {
			board: result.board,
			id: conn.id,
		},
	});
	game.players.forEach((p) => p.socket.send(payload));
	switch (result.gameState) {
		case "win": {
			const payload = JSON.stringify({
				type: "GAME_OVER",
				data: {
					winner: conn.id,
				},
			});
			game.players.forEach((p) => p.socket.send(payload));
			break;
		}
		case "loss": {
			const payload = JSON.stringify({
				type: "GAME_OVER",
				data: {
					winner: game.players.find((p) => p.id !== conn.id)!.id,
				},
			});
			game.players.forEach((p) => p.socket.send(payload));
			break;
		}
	}
}
