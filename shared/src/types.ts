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
