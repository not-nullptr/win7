import { useSearchParams } from "react-router-dom";
import { Window } from "../../../util/WindowManager";
import { useEffect, useRef, useState } from "react";
import styles from "../../../css/Message.module.css";
import PfpBorder from "../components/PfpBorder";
import pfp from "../../../assets/wlm/default-pfp.png";
import error from "../../../assets/wlm/icons/code/error.png";
import {
	ClientData,
	ClientMessage,
	DataType,
	Message,
	MessageType,
	ServerMessage,
	State,
} from "../../../../shared/src/types";
import ImageButton from "../components/ImageButton";
import { hasParentWithClass } from "../../../util/Generic";
import { Canvas } from "../../TaskManager";
import parser, { Tag } from "bbcode-to-react";
import { Menu } from "../components/ContextMenu";
import typing from "../../../assets/wlm/icons/typing.png";

function bbCodeSelection(textarea: HTMLTextAreaElement, tag: string) {
	const selection = textarea.value.substring(
		textarea.selectionStart,
		textarea.selectionEnd,
	);
	if (selection.length === 0) return;
	const selectionWithTags = `[${tag}]${selection}[/${tag}]`;
	textarea.value =
		textarea.value.substring(0, textarea.selectionStart) +
		selectionWithTags +
		textarea.value.substring(textarea.selectionEnd);
	textarea.focus();
}

class EmoticonTag extends Tag {
	toReact() {
		// using this.getContent(true) to get it's inner raw text.
		const attributes = {
			emoticon: this.getContent(true),
		};
		return <img src={attributes.emoticon} />;
	}
}

parser.registerTag("emoticon", EmoticonTag as any);

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

function MessageComponent({ win }: { win?: Window }) {
	const [otherTyping, setOtherTyping] = useState(false);
	const toolbarRef = useRef<HTMLDivElement>(null);
	const [drawing, setDrawing] = useState(false);
	const emoticonRef = useRef<HTMLDivElement>(null);
	const [emoji, setEmoji] = useState<boolean>(false);
	const messageBoxRef = useRef<HTMLTextAreaElement>(null);
	const [params] = useSearchParams();
	const [liveState, setLiveStateWithoutBroadcast] = useState<State>(
		JSON.parse(params.get("initialState") || "{}"),
	);
	const playedRef = useRef(false);
	const [images, setImages] = useState<string[]>([]);
	useEffect(() => {
		(async () => {
			const images = await Promise.all(
				Object.values(
					import.meta.glob("../../../assets/wlm/emoticons/*.png"),
				).map((p) =>
					p()
						.then((m: any) => m.default)
						.catch(() => ""),
				),
			);
			console.log(images);
			setImages(images);
		})();
	}, []);
	useEffect(() => {
		if (params.get("initialMessages") && !playedRef.current) {
			playedRef.current = true;
			const audio = new Audio(
				`${import.meta.env.BASE_URL}/ui/wlm/sounds/type.mp3`,
			);
			audio.play();
		}
	}, [params]);
	const messagesContainer = useRef<HTMLDivElement>(null);
	const user = liveState.connections.find((c) => c.id === params.get("user"));
	const conversationHash = hashCode(user?.id || "", liveState.id);
	// const setLiveState = (state: State) => {
	// 	setLiveStateWithoutBroadcast(state);
	// 	win?.broadcast("live-state", state);
	// };
	const [messages, setMessages] = useState<ServerMessage[]>(
		(() => {
			try {
				return JSON.parse(params.get("initialMessages") || "[]");
			} catch {
				return [];
			}
		})(),
	);
	let typingTimeout: NodeJS.Timeout | undefined;
	function handleSocketMessage(e: Message) {
		switch (e.type) {
			case "MESSAGE":
				{
					const data = e.data;
					if (data.conversationId !== conversationHash) return;
					setOtherTyping(false);
					switch (data.messageType) {
						case MessageType.NUDGE_RESPONSE: {
							const audio = new Audio(
								`${import.meta.env.BASE_URL}ui/wlm/sounds/nudge.mp3`,
							);
							audio.play();
							const frame = document.getElementById(
								win?.id || "",
							) as HTMLDivElement;
							if (!frame) break;
							const min = -5;
							const max = 5;
							const interval = setInterval(() => {
								const x = Math.random() * (max - min) + min;
								const y = Math.random() * (max - min) + min;
								frame.style.transform = `translate(${x}px, ${y}px)`;
							}, 25);
							setTimeout(() => {
								clearInterval(interval);
								frame.style.transform = "";
							}, 2500);
							break;
						}
						default: {
							if (data.from !== liveState.id) {
								const audio = new Audio(
									`${import.meta.env.BASE_URL}ui/wlm/sounds/type.mp3`,
								);
								audio.play();
							}
						}
					}
					setMessages((messages) => [...messages, { ...data }]);
				}

				break;
			case "DATA": {
				switch (e.data.dataType) {
					case DataType.TYPING_BEGIN_RESPONSE: {
						const data = e.data;
						if (data.conversationId !== conversationHash) return;
						if (typingTimeout) clearTimeout(typingTimeout);
						setOtherTyping(true);
						typingTimeout = setTimeout(() => {
							setOtherTyping(false);
						}, 1500);
						break;
					}
				}
				break;
			}
			case "GAME": {
				// const data = e.data;
				// if (data.conversationId !== conversationHash) return;
				// switch (e.data.gameType) {
				// 	case GameType.START_GAME_RESPONSE: {
				// 		setGameState({
				// 			playing: true,
				// 			state: data.gameState,
				// 		});
				// 		break;
				// 	}
				// }
				// break;
			}
		}
	}
	useEffect(() => {
		if (!win) return;
		const ids = [
			win.onMessage("live-state", (state) => {
				setLiveStateWithoutBroadcast(state);
			}),
			win.onMessage("receive-websocket", (e) => {
				handleSocketMessage(e);
			}),
		];
		return () => {
			ids.forEach((id) => win.removeMessageListener(id));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [win]);
	// function groupMessages(messages: Message[]): GroupedMessage[] {
	// 	const messages: GroupedMessage[] = [];
	// 	for (const message of messages) {
	// 		const lastMessage = messages[messages.length - 1];
	// 		if (lastMessage && lastMessage.from === message.from) {
	// 			lastMessage.messages.push({
	// 				message: message.message,
	// 				id: message.id,
	// 			});
	// 		} else {
	// 			messages.push({
	// 				from: message.from,
	// 				id: message.id,
	// 				messages: [
	// 					{
	// 						message: message.message,
	// 						id: message.id,
	// 					},
	// 				],
	// 			});
	// 		}
	// 	}
	// 	return messages;
	// }
	useEffect(() => {
		if (!messagesContainer.current) return;
		messagesContainer.current.scrollTop =
			messagesContainer.current.scrollHeight;
	}, [messages]);
	useEffect(() => {
		if (!user) win?.close();
	}, [user, win]);
	useEffect(() => {
		function mouseDown(e: MouseEvent) {
			if (
				hasParentWithClass(e.target as HTMLElement, "emoji-button") ||
				(e.target as HTMLElement).classList.contains("emoji-button")
			)
				return;
			if (!hasParentWithClass(e.target as HTMLElement, styles.emoticons))
				setEmoji(false);
		}
		document.addEventListener("mousedown", mouseDown);
		return () => {
			document.removeEventListener("mousedown", mouseDown);
		};
	}, []);
	useEffect(() => {
		if (!messagesContainer.current) return;
		messagesContainer.current.scrollTop =
			messagesContainer.current.scrollHeight;
	}, [drawing]);
	if (!user) return <></>;

	return (
		<div className={styles.window}>
			<div className={styles.content}>
				<div className={styles.toolbarContainer}>
					<div className={styles.toolbar} />
				</div>
				<div className={styles.contentContainer}>
					<div className={styles.pfpContainer}>
						<div className={styles.recepientPfp}>
							{user ? (
								<PfpBorder pfp={pfp} variant="large" state={user.status} />
							) : (
								<PfpBorder pfp={pfp} variant="large" state="invisible" />
							)}
						</div>
						<div className={styles.ownPfp}>
							<PfpBorder pfp={pfp} variant="large" state={liveState.status} />
						</div>
					</div>
					<div className={styles.messagingContainer}>
						<div className={styles.username}>{user.username}</div>
						<div
							style={{
								marginTop: 12,
							}}
							className={styles.divider}
						/>
						<div
							style={{
								height: drawing
									? "calc(100% - 31px - 84px - 64px)"
									: "calc(100% - 31px - 84px)",
							}}
							className={styles.messagesContainer}
							ref={messagesContainer}
						>
							{messages.map((m, i) => (
								<div key={m.id} className={styles.messageGroup}>
									{(() => {
										const potentialUsername = (() => {
											const msg = (
												<div className={styles.messageUsername}>
													{liveState.connections.find((c) => c.id === m.from)
														?.username || liveState.username}{" "}
													said:
												</div>
											);
											if (i === 0) return msg;
											if (messages.at(i - 1)!.from !== m.from) return msg;
											if (messages.at(i - 1)!.messageType !== m.messageType)
												return msg;
											return <></>;
										})();
										switch (m.messageType) {
											case MessageType.TEXT_MESSAGE_SERVER:
												return (
													<div>
														{potentialUsername}
														<div className={styles.messageContainer}>
															<span className={styles.message}>
																{parser.toReact(
																	m.message
																		.split(/(:.*?:)/g)
																		.map((part) => {
																			if (
																				part.startsWith(":") &&
																				part.endsWith(":")
																			) {
																				const imgSrc = images.find((img) =>
																					img.endsWith(
																						`/${part.replaceAll(":", "")}.png`,
																					),
																				);
																				if (imgSrc) {
																					return `[emoticon]${imgSrc}[/emoticon]`;
																				}
																			}
																			return part;
																		})
																		.join(""),
																)}
															</span>
														</div>
													</div>
												);
											case MessageType.ERROR: {
												return (
													<div className={styles.error}>
														<img src={error} />
														<div className={styles.errorText}>{m.message}</div>
													</div>
												);
											}
											case MessageType.NUDGE_RESPONSE: {
												return (
													<div className={styles.nudge}>
														{messages.at(i - 1)?.messageType !==
															MessageType.NUDGE_RESPONSE && (
															<div className={styles.nudgeDivider} />
														)}
														<div>
															{m.from === liveState.id
																? "You have just sent a nudge."
																: `${user.username} just sent you a nudge.`}
														</div>
														<div className={styles.nudgeDivider} />
													</div>
												);
											}
											case MessageType.IMAGE_RESPONSE: {
												return (
													<div className={styles.imageContainer}>
														{potentialUsername}
														<img src={m.image} />
													</div>
												);
											}
										}
									})()}
								</div>
							))}
						</div>
						<div className={styles.inputWidgets}>
							<div
								className={styles.divider}
								style={{
									transform: "rotate(180deg)",
									marginTop: 4,
									marginBottom: 2,
								}}
							/>
							{drawing ? (
								<div className={styles.canvasContainer}>
									<Canvas
										className={styles.canvas}
										height={92}
										width={
											toolbarRef.current
												? toolbarRef.current.getBoundingClientRect().width - 2
												: 0
										}
									/>
									<button
										onClick={(e) => {
											const canvas =
												e.currentTarget.parentElement?.querySelector(
													"canvas",
												) as HTMLCanvasElement;
											if (!canvas) return;
											const data = canvas.toDataURL();
											win?.broadcast("send-websocket", "MESSAGE", {
												messageType: MessageType.IMAGE_REQUEST,
												to: user.id,
												image: data,
											} as ClientMessage);
											setDrawing(false);
										}}
									>
										Send
									</button>
								</div>
							) : (
								<Menu
									items={[
										{
											type: "group",
											items: [
												{
													type: "item",
													label: "Bold selection",
													onClick() {
														if (!messageBoxRef.current) return;
														bbCodeSelection(messageBoxRef.current, "b");
													},
												},
												{
													type: "item",
													label: "Italicize selection",
													onClick() {
														if (!messageBoxRef.current) return;
														bbCodeSelection(messageBoxRef.current, "i");
													},
												},
											],
											label: "Selection",
										},
									]}
								>
									<textarea
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												// setMessages([
												// 	...messages,
												// 	{
												// 		from: liveState,
												// 		message: e.currentTarget.value,
												// 		id: v4(),
												// 	},
												// ]);
												win?.broadcast("send-websocket", "MESSAGE", {
													message: e.currentTarget.value,
													to: user.id,
													messageType: MessageType.TEXT_MESSAGE_CLIENT,
												} as ClientMessage);
												e.currentTarget.value = "";
											}
										}}
										spellCheck={false}
										className={styles.messageBox}
										ref={messageBoxRef}
										onChange={() => {
											win?.broadcast("send-websocket", "DATA", {
												dataType: DataType.TYPING_BEGIN_REQUEST,
												to: user.id,
											} as ClientData);
										}}
									></textarea>
								</Menu>
							)}
							<div ref={toolbarRef} className={styles.inputToolbar}>
								<ImageButton
									className="emoji-button"
									onClick={() => {
										setEmoji((emoji) => !emoji);
									}}
									image={images.find((i) => i.includes("smile.png")) || ""}
								/>
								<ImageButton
									onClick={() => {
										win?.broadcast("send-websocket", "MESSAGE", {
											messageType: MessageType.NUDGE_REQUEST,
											to: user.id,
										} as ClientMessage);
									}}
									image={`${
										import.meta.env.BASE_URL
									}ui/wlm/icons/messenger/nudge.png`}
								/>
								<ImageButton
									className="emoji-button"
									onClick={() => {
										setDrawing((drawing) => !drawing);
									}}
									image={images.find((i) => i.includes("wlm.png")) || ""}
								/>
							</div>
						</div>
						{otherTyping && (
							<div className={styles.typing}>
								<img src={typing} />
								<div>
									<span style={{ fontWeight: "bold" }}>{user.username}</span> is
									typing...
								</div>
							</div>
						)}
						<div
							ref={emoticonRef}
							className={styles.emoticons}
							style={{
								pointerEvents: emoji ? "all" : "none",
								opacity: emoji ? 1 : 0,
							}}
						>
							{images.map((i) => (
								<ImageButton
									key={i}
									onClick={() => {
										if (!messageBoxRef.current) return;
										const emoticon = `:${i
											.split("/")
											.at(-1)
											?.replace(".png", "")}:`;
										if (
											messageBoxRef.current.value.endsWith(" ") ||
											messageBoxRef.current.value.length === 0
										) {
											messageBoxRef.current.value += `${emoticon} `;
										} else {
											messageBoxRef.current.value += ` ${emoticon} `;
										}
										messageBoxRef.current.focus();
										setEmoji(false);
									}}
									image={i}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className={styles.backgroundContainer}>
				<div className={styles.backgroundImage} />
				<div className={styles.background} />
			</div>
			{/* <div className={styles.gameManager}>
				<div className={styles.toolbarGameManager} />
				<button
					onClick={() => {
						win?.broadcast("send-websocket", "GAME", {
							gameType: GameType.START_GAME_REQUEST,
							to: user.id,
						});
					}}
				>
					Start game
				</button>
				{gameState.playing && (
					<div>
						{gameState.state.board.map((row: (0 | 1 | 2)[]) => (
							<div>
								{row.map((r) => (
									<span
										style={{
											backgroundColor: "red",
											whiteSpace: "pre",
											width: 12,
											height: 12,
										}}
										onClick={() => {
											
										}}
									>
										{r === 0 ? "    " : r === 1 ? "X" : "O"}
									</span>
								))}
							</div>
						))}
					</div>
				)}
			</div> */}
		</div>
	);
}

export default MessageComponent;
