import { useSearchParams } from "react-router-dom";
import { Window } from "../../../util/WindowManager";
import { Connection, State } from "./Home";
import { useEffect, useRef, useState } from "react";
import styles from "../../../css/Message.module.css";
import PfpBorder from "../components/PfpBorder";
import pfp from "../../../assets/wlm/default-pfp.png";
import { v4 } from "uuid";

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

function Message({ win }: { win?: Window }) {
	const [params] = useSearchParams();
	const [liveState, setLiveStateWithoutBroadcast] = useState<State>(
		JSON.parse(params.get("initialState") || "{}")
	);
	const playedRef = useRef(false);

	useEffect(() => {
		if (params.get("initialMessages") && !playedRef.current) {
			playedRef.current = true;
			const audio = new Audio("/ui/wlm/sounds/type.mp3");
			audio.play();
		}
	}, []);
	const messagesContainer = useRef<HTMLDivElement>(null);
	const user = liveState.connections.find((c) => c.id === params.get("user"));
	const conversationHash = hashCode(user?.id || "", liveState.id);
	const setLiveState = (state: State) => {
		setLiveStateWithoutBroadcast(state);
		win?.broadcast("live-state", state);
	};
	interface Message {
		from: string;
		message: string;
		id: string;
	}
	interface GroupedMessage {
		from: string;
		id: string;
		messages: Omit<Message, "from">[];
	}
	const [messages, setMessages] = useState<Message[]>(
		JSON.parse(params.get("initialMessages") || "[]")
	);
	function handleSocketMessage(type: string, data: any) {
		switch (type) {
			case "MESSAGE": {
				if (data.conversationId !== conversationHash) return;
				if (data.from !== liveState.id) {
					const audio = new Audio("/ui/wlm/sounds/type.mp3");
					audio.play();
				}
				setMessages((messages) => [
					...messages,
					{
						from: data.from,
						message: data.message,
						id: data.id,
					},
				]);
			}
		}
	}
	useEffect(() => {
		if (!win) return;
		const ids = [
			win.onMessage("live-state", (state) => {
				setLiveStateWithoutBroadcast(state);
			}),
			win.onMessage("receive-websocket", (type, data) => {
				handleSocketMessage(type, data);
			}),
		];
		return () => {
			ids.forEach((id) => win.removeMessageListener(id));
		};
	}, [win]);
	function groupMessages(messages: Message[]): GroupedMessage[] {
		const groupedMessages: GroupedMessage[] = [];
		for (const message of messages) {
			const lastMessage = groupedMessages[groupedMessages.length - 1];
			if (lastMessage && lastMessage.from === message.from) {
				lastMessage.messages.push({
					message: message.message,
					id: message.id,
				});
			} else {
				groupedMessages.push({
					from: message.from,
					id: message.id,
					messages: [
						{
							message: message.message,
							id: message.id,
						},
					],
				});
			}
		}
		return groupedMessages;
	}
	const groupedMessages = groupMessages(messages);
	useEffect(() => {
		if (!messagesContainer.current) return;
		messagesContainer.current.scrollTop =
			messagesContainer.current.scrollHeight;
	}, [messages]);
	useEffect(() => {
		if (!user) win?.close();
	}, [user]);
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
						<div className={styles.messagesContainer} ref={messagesContainer}>
							{groupedMessages.map((m) => (
								<div key={m.id} className={styles.messageGroup}>
									<div className={styles.messageUsername}>
										{liveState.connections.find((c) => c.id === m.from)
											?.username || liveState.username}{" "}
										said:
									</div>
									{m.messages.map((message) => (
										<div key={message.id} className={styles.messageContainer}>
											<span className={styles.message}>{message.message}</span>
										</div>
									))}
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
										});
										e.currentTarget.value = "";
									}
								}}
								spellCheck={false}
								className={styles.messageBox}
							></textarea>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.backgroundContainer}>
				<div className={styles.backgroundImage} />
				<div className={styles.background} />
			</div>
		</div>
	);
}

export default Message;
