import {
	MessengerConnection,
	MessengerManager,
} from "../../classes/MessengerConnection";
import { ClientGame, GameType, ServerGame } from "../../../../shared/src/types";

type TTTSpace = 0 | 1 | 2;

class TicTacToe {
	type: "TIC_TAC_TOE" = "TIC_TAC_TOE";
	state: {
		// a 2d array, 3 x 3 of TTTSpace
		board: TTTSpace[][];
	} = {
		board: [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		],
	};
	constructor() {}
	makeMove(type: 1 | 2, x: number, y: number) {
		if (this.state.board[x][y] === 0) {
			this.state.board[x][y] = type;
			return true;
		}
		return false;
	}
	isOver(): 0 | 1 | 2 {
		// check rows
		for (let i = 0; i < 3; i++) {
			if (
				this.state.board[i][0] === this.state.board[i][1] &&
				this.state.board[i][1] === this.state.board[i][2]
			) {
				return this.state.board[i][0];
			}
		}
		// check columns
		for (let i = 0; i < 3; i++) {
			if (
				this.state.board[0][i] === this.state.board[1][i] &&
				this.state.board[1][i] === this.state.board[2][i]
			) {
				return this.state.board[0][i];
			}
		}
		// check diagonals
		if (
			this.state.board[0][0] === this.state.board[1][1] &&
			this.state.board[1][1] === this.state.board[2][2]
		) {
			return this.state.board[0][0];
		}
		if (
			this.state.board[2][0] === this.state.board[1][1] &&
			this.state.board[1][1] === this.state.board[0][2]
		) {
			return this.state.board[2][0];
		}
		return 0;
	}
}

type Game = TicTacToe;

const games: {
	[conversationId: string]: Game;
} = {};

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

export default function GameHandler(
	conn: MessengerConnection,
	data: ClientGame
) {
	console.log("minesweeper woo");
}
