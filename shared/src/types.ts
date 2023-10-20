export enum MessageType {
	TEXT_MESSAGE_CLIENT = "TEXT_MESSAGE_CLIENT",
	TEXT_MESSAGE_SERVER = "TEXT_MESSAGE_SERVER",
	ERROR = "ERROR",
	NUDGE_REQUEST = "NUDGE_REQUEST",
	NUDGE_RESPONSE = "NUDGE_RESPONSE",
	IMAGE_REQUEST = "IMAGE_REQUEST",
	IMAGE_RESPONSE = "IMAGE_RESPONSE",
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
