import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import pfp from "../../../assets/wlm/default-pfp.png";
import dropdown from "../../../assets/wlm/icons/dropdown.png";
import styles from "../../../css/Live.module.css";
import { joinClasses } from "../../../util/Module";
import { Window } from "../../../util/WindowManager";
import Fuse from "fuse.js";
import { ProcessManager } from "../../../util/Process";
import PfpBorder from "../components/PfpBorder";

type Status = "active" | "idle" | "dnd" | "invisible";

interface Connection {
	status: Status;
	username: string;
	id: string;
}

export interface State {
	connections: Connection[];
	username: string;
	status: Status;
	id: string;
}

interface INITIALIZE {
	type: "INITIALIZE";
	data: State;
}

interface CONNECT {
	type: "CONNECT";
	data: Connection;
}

interface DISCONNECT {
	type: "DISCONNECT";
	data: {
		id: string;
	};
}

interface UPDATE_USER {
	type: "UPDATE_USER";
	data: Partial<Connection> & { id: string };
}

type Message = INITIALIZE | CONNECT | DISCONNECT | UPDATE_USER;

function getStringFromActivity(activity: string) {
	switch (activity) {
		case "live/active.png":
			return "active";
		case "live/idle.png":
			return "idle";
		case "live/dnd.png":
			return "dnd";
		case "live/invisible.png":
			return "invisible";
	}
}

function Home({ win }: { win?: Window }) {
	const [liveState, setLiveStateWithoutBroadcast] = useState<State>({
		connections: [],
		status: "active",
		username: "",
		id: "",
	});
	const setLiveState: React.Dispatch<React.SetStateAction<State>> = (s) => {
		setLiveStateWithoutBroadcast(s);
		win?.broadcast("live-state", s);
	};
	const [winState, setWinState] = useState(win);
	useEffect(() => {
		const id = win?.addListener((e) => {
			setWinState(e);
		});
		return () => {
			if (id) win?.removeListener(id);
		};
	}, [win]);
	useEffect(() => {
		if (!win) return;
		const id = win.onMessage("live-state", (state) => {
			setLiveStateWithoutBroadcast(state);
			console.log(state);
		});
		return () => {
			win.removeMessageListener(id);
		};
	}, [win]);
	const [search, setSearch] = useState("");
	const onMessage = useCallback(
		(e: MessageEvent<Message>) => {
			switch (e.data.type) {
				case "INITIALIZE": {
					const data = e.data.data;
					setLiveState(data);
					break;
				}
				case "CONNECT": {
					const data = e.data.data;
					setLiveState((old) => ({
						...old,
						connections: [...old.connections, data],
					}));
					break;
				}
				case "DISCONNECT": {
					const data = e.data.data;
					setLiveState((old) => ({
						...old,
						connections: old.connections.filter((c) => c.id !== data.id),
					}));
					break;
				}
				case "UPDATE_USER": {
					const data = e.data.data;
					if (data.id !== liveState.id)
						setLiveState((old) => ({
							...old,
							connections: old.connections.map((c) => {
								if (c.id === data.id) {
									return { ...c, ...data };
								}
								return c;
							}),
						}));
					else {
						if (data.status) win?.setActivity(`live/${data.status}`);
						setLiveState((o) => ({ ...o, ...data }));
					}
					break;
				}
			}
		},
		[liveState, win]
	);
	const { sendJsonMessage } = useWebSocket("wss://win7api.nota-robot.com", {
		onMessage: (e) => {
			onMessage({ ...e, data: JSON.parse(e.data) });
		},
		shouldReconnect: () => true,
	});
	useEffect(() => {
		const interval = setInterval(() => {
			sendJsonMessage({
				type: "PING",
			});
		}, 5000);
		return () => {
			clearInterval(interval);
		};
	}, []);
	const [contextMenuOpacity, setContextMenuOpacity] = useState("0");
	useEffect(() => {
		const id = win?.addListener((e) => {
			const str = getStringFromActivity(e.activity);
			if (str && str !== liveState.status) {
				setLiveState((old) => ({ ...old, status: str }));
			}
		});
		return () => {
			if (id) win?.removeListener(id);
		};
	}, [win, liveState]);
	useEffect(() => {
		win?.setActivity("live/active");
	}, [win]);
	useEffect(() => {
		function mouseDown(e: MouseEvent) {
			const el = e.target as HTMLDivElement;
			if (el.closest(`.${styles.contextMenu}`)) return;
			if (el.closest(`.${styles.contextMenuItem}`)) return;
			setContextMenuOpacity("0");
		}
		document.addEventListener("mousedown", mouseDown);
		return () => {
			document.removeEventListener("mousedown", mouseDown);
		};
	}, []);
	function ContextMenuItems({
		items,
	}: {
		items: { icon?: string; label: string; id: string; onClick?: () => any }[];
	}) {
		return items.map((i) => (
			<div
				onMouseUp={() => {
					i.onClick?.();
					setContextMenuOpacity("0");
				}}
				key={i.id}
				className={styles.contextMenuItem}
			>
				{i.icon ? (
					<div className={styles.contextMenuIconContainer}>
						<img src={i.icon} />
					</div>
				) : null}
				<div className={styles.contextMenuText}>{i.label}</div>
			</div>
		));
	}
	return (
		<div className={styles.window}>
			<div className={styles.background}>
				<div className={styles.topInfo}>
					<PfpBorder state={winState?.activity} pfp={pfp} />
					<div className={styles.userInfo}>
						<div
							style={{
								opacity: contextMenuOpacity,
								pointerEvents: contextMenuOpacity === "0" ? "none" : "all",
								transition:
									contextMenuOpacity === "0" ? "none" : "opacity 0.1s linear",
							}}
							className={joinClasses(
								styles.contextMenu,
								styles.nameContextMenu
							)}
						>
							{/* <div className={styles.contextMenuItem}>
								<div className={styles.contextMenuText}>Available</div>
							</div>
							<div className={styles.contextMenuItem}>
								<div className={styles.contextMenuText}>Busy</div>
							</div>
							<div className={styles.contextMenuItem}>
								<div className={styles.contextMenuText}>Away</div>
							</div>
							<div className={styles.contextMenuItem}>
								<div className={styles.contextMenuText}>Appear offline</div>
							</div> */}
							<ContextMenuItems
								items={[
									{
										label: "Available",
										id: "available",
										onClick() {
											sendJsonMessage({
												type: "CHANGE_STATUS",
												data: {
													status: "active",
												},
											});
										},
										icon: "/ui/wlm/icons/active.png",
									},
									{
										label: "Busy",
										id: "busy",
										onClick() {
											sendJsonMessage({
												type: "CHANGE_STATUS",
												data: {
													status: "dnd",
												},
											});
										},
										icon: "/ui/wlm/icons/dnd.png",
									},
									{
										label: "Away",
										id: "away",
										onClick() {
											sendJsonMessage({
												type: "CHANGE_STATUS",
												data: {
													status: "idle",
												},
											});
										},
										icon: "/ui/wlm/icons/idle.png",
									},
									{
										label: "Appear offline",
										id: "invisible",
										onClick() {
											sendJsonMessage({
												type: "CHANGE_STATUS",
												data: {
													status: "invisible",
												},
											});
										},
										icon: "/ui/wlm/icons/invisible.png",
									},
									{
										label: "Change Username",
										id: "changeusername",
										onClick() {
											const res = prompt(
												"Enter your new username (don't worry, this box is only temporary while I sort out application state):"
											);
											if (!res) return;
											sendJsonMessage({
												type: "CHANGE_USERNAME",
												data: {
													username: res,
												},
											});
										},
									},
								]}
							/>
						</div>
						<div
							onClick={() =>
								setContextMenuOpacity((o) => (o === "0" ? "1" : "0"))
							}
							className={styles.usernameContainer}
							data-toggled={`${contextMenuOpacity === "1"}`}
						>
							<span className={styles.username}>{liveState.username}</span>
							<img src={dropdown} />
						</div>
						<div className={styles.message}>Share a quick message</div>
					</div>
				</div>
			</div>
			<div className={styles.divider} />
			<div className={styles.content}>
				{/* <h1>Connection details</h1>
				<div>Currently online users (according to our state?):</div>
				{liveState.connections.map((c) => (
					<div
						key={c.id}
						style={{
							backgroundColor: "#57b9e7",
							marginBottom: "10px",
							padding: 8,
						}}
					>
						<h1>{c.username}</h1>
						<div>{c.id}</div>
						<PfpBorder pfp={pfp} state={c.status} />
					</div>
				))}
				<h1>Window info (state debugging??)</h1>
				Window ID: {win?.id} */}
				<div className={styles.padded}>
					<div className={styles.searchContainer}>
						<input
							required
							onChange={(e) => setSearch(e.target.value)}
							className={styles.search}
							placeholder="Search contacts or the Web..."
						/>
					</div>
					<h1>Users Online</h1>
					<div className={styles.contacts}>
						{(() => {
							const connections = search
								? new Fuse(liveState.connections, { keys: ["username"] })
										.search(search)
										.map((c) => c.item)
										.filter((c) => c)
								: liveState.connections;

							return search.trim() === "" && connections.length === 0 ? (
								<div className={styles.searchInfo}>
									<div
										style={{
											marginTop: 4,
										}}
									>
										No users are online right now.
									</div>
								</div>
							) : connections.length !== 0 ? (
								connections.map((c) => (
									<div
										className={styles.contact}
										key={c.id}
										onDoubleClick={() => {
											const process = ProcessManager.getProcessByWindowId(
												winState?.id || ""
											);
											process?.addWindow({
												component: "Live",
												initialPath: `/message?user=${
													c.id
												}&initialState=${JSON.stringify(liveState)}`,
												title: c.username,
												icon: "../main/msn.png",
												defaultWidth: 483,
												defaultHeight: 419,
												minWidth: 483,
												minHeight: 419,
											});
										}}
									>
										<PfpBorder pfp={pfp} state={c.status} variant="small" />
										<div className={styles.contactUsername}>{c.username}</div>
									</div>
								))
							) : (
								<div className={styles.searchInfo}>
									<div
										style={{
											marginBottom: 4,
										}}
									>
										No results found for "{search}"
									</div>
									<a
										href={`https://www.google.com/search?q=${search}`}
										target="_blank"
									>
										Search the web for "{search}"
									</a>
								</div>
							);
						})()}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
