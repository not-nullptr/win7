export enum MessageType {
	TEXT_MESSAGE_CLIENT = "TEXT_MESSAGE_CLIENT",
	TEXT_MESSAGE_SERVER = "TEXT_MESSAGE_SERVER",
	ERROR = "ERROR",
	NUDGE_REQUEST = "NUDGE_REQUEST",
	NUDGE_RESPONSE = "NUDGE_RESPONSE",
	IMAGE_REQUEST = "IMAGE_REQUEST",
	IMAGE_RESPONSE = "IMAGE_RESPONSE",
	TYPING_END = "TYPING_END",
}

interface TextMessageClient {
	messageType: MessageType.TEXT_MESSAGE_CLIENT;
	message: string;
	to: string;
}

interface TextMessageServer {
	messageType: MessageType.TEXT_MESSAGE_SERVER;
	message: string;
	to: string;
	from: string;
	id: string;
	conversationId: string;
}

interface Error {
	messageType: MessageType.ERROR;
	message: string;
	to: string;
	from: string;
	id: string;
	conversationId: string;
}

interface NudgeResponse {
	messageType: MessageType.NUDGE_RESPONSE;
	to: string;
	from: string;
	id: string;
	conversationId: string;
}

interface NudgeRequest {
	messageType: MessageType.NUDGE_REQUEST;
	to: string;
}

interface ImageRequest {
	messageType: MessageType.IMAGE_REQUEST;
	to: string;
	image: string;
}

interface ImageResponse {
	messageType: MessageType.IMAGE_RESPONSE;
	to: string;
	image: string;
	from: string;
	id: string;
	conversationId: string;
}
export type ClientMessage = TextMessageClient | NudgeRequest | ImageRequest; // client -> server

export type ServerMessage =
	| TextMessageServer
	| Error
	| NudgeResponse
	| ImageResponse; // server -> client

export enum DataType {
	TYPING_BEGIN_REQUEST = "TYPING_BEGIN_REQUEST",
	TYPING_BEGIN_RESPONSE = "TYPING_BEGIN_RESPONSE",
}

interface TypingBeginRequest {
	dataType: DataType.TYPING_BEGIN_REQUEST;
	to: string;
}

interface TypingBeginResponse {
	dataType: DataType.TYPING_BEGIN_RESPONSE;
	to: string;
	from: string;
	conversationId: string;
}

export type ClientData = TypingBeginRequest;
export type ServerData = TypingBeginResponse;

export enum GameType {
	START_GAME_REQUEST = "START_GAME_REQUEST",
	START_GAME_RESPONSE = "START_GAME_RESPONSE",
}

type Game = "TIC_TAC_TOE";

interface StartGameRequest {
	gameType: GameType.START_GAME_REQUEST;
	to: string;
	game: Game;
}

interface StartGameResponse {
	gameType: GameType.START_GAME_RESPONSE;
	to: string;
	from: string;
	conversationId: string;
	game: Game;
	gameState: any;
}

export type ClientGame = StartGameRequest;
export type ServerGame = StartGameResponse;

type Status = "active" | "idle" | "dnd" | "invisible";

export interface Connection {
	status: Status;
	username: string;
	id: string;
	statusMessage?: string;
}

export type State = {
	connections: Connection[];
} & Connection;

export interface INITIALIZE {
	type: "INITIALIZE";
	data: State;
}

export interface CONNECT {
	type: "CONNECT";
	data: Connection;
}

export interface DISCONNECT {
	type: "DISCONNECT";
	data: {
		id: string;
	};
}

export interface UPDATE_USER {
	type: "UPDATE_USER";
	data: Partial<Connection> & { id: string };
}

interface MESSAGE {
	type: "MESSAGE";
	data: ServerMessage;
}

export interface DATA {
	type: "DATA";
	data: ServerData;
}

export interface GAME {
	type: "GAME";
	data: ServerGame;
}

export type Message =
	| INITIALIZE
	| CONNECT
	| DISCONNECT
	| UPDATE_USER
	| MESSAGE
	| DATA
	| GAME;

export interface MinesweeperUser {
	id: string;
	isInGame: boolean;
}

export interface MinesweeperInstance {
	id: string;
	hash: string;
	players: [MinesweeperUser, MinesweeperUser];
}

export enum CellState {
	Unrevealed,
	Revealed,
}

export interface BoardCell {
	state: CellState;
	isBomb: boolean;
}

export type Board = BoardCell[][];

export type MPBoard = {
	board: Board;
	id: string;
};

export const BOARD_SIZE = 9; // 9 x 9
export const BOMB_COUNT = 10;

// im going to fucking kill myself
export function evaluateSurrounding(board: Board, x: number, y: number) {
	let count = 0;
	for (let i = x - 1; i <= x + 1; i++) {
		if (i < 0 || i >= BOARD_SIZE) continue;
		for (let j = y - 1; j <= y + 1; j++) {
			if (j < 0 || j >= BOARD_SIZE) continue;
			if (board[i][j].isBomb) count++;
		}
	}
	return count;
}

export function generateBoard() {
	const board: {
		state: CellState;
		isBomb: boolean;
	}[][] = [];
	for (let i = 0; i < BOARD_SIZE; i++) {
		board.push([]);
		for (let j = 0; j < BOARD_SIZE; j++) {
			board[i].push({
				state: CellState.Unrevealed,
				isBomb: false,
			});
		}
	}
	for (let i = 0; i < BOMB_COUNT; i++) {
		const x = Math.floor(Math.random() * BOARD_SIZE);
		const y = Math.floor(Math.random() * BOARD_SIZE);
		board[x][y].isBomb = true;
	}
	return board;
}

export function reveal(
	board: Board,
	x: number,
	y: number,
):
	| {
			gameState: "ongoing" | "win" | "loss";
			board: Board;
	  }
	| undefined {
	const cell = board[x][y];
	if (cell.state !== CellState.Unrevealed) return;
	if (cell.isBomb) {
		// reveal all bombs and end the game
		board.forEach((row) =>
			row.forEach((cell) => {
				if (cell.isBomb) cell.state = CellState.Revealed;
			}),
		);
		return {
			gameState: "loss",
			board,
		};
	}
	const evaluation = evaluateSurrounding(board, x, y);
	cell.state = CellState.Revealed;
	if (evaluation === 0) {
		// reveal all adjacent cells that are not bombs
		for (let i = x - 1; i <= x + 1; i++) {
			if (i < 0 || i >= BOARD_SIZE) continue;
			for (let j = y - 1; j <= y + 1; j++) {
				if (j < 0 || j >= BOARD_SIZE) continue;
				reveal(board, i, j);
			}
		}
	}
	const won = !board
		.flat()
		.some((c) => c.state !== CellState.Unrevealed && !c.isBomb);
	if (won)
		return {
			gameState: "win",
			board: board,
		};
	return {
		gameState: "ongoing",
		board,
	};
}
