import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import pfp from "../../assets/wlm/default-pfp.png";
import dropdown from "../../assets/wlm/icons/dropdown.png";
import styles from "../../css/Live.module.css";
import { joinClasses } from "../../util/Module";
import { Window } from "../../util/WindowManager";

type Status = "active" | "idle" | "dnd" | "offline";

interface Connection {
	status: Status;
	username: string;
	id: string;
}

interface State {
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

function PfpBorder({
	pfp,
	win,
	state = "active",
}: {
	pfp: string;
	win?: Window;
	state?: string;
}) {
	const [src, setSrc] = useState("/ui/wlm/statuses/active-static.png");
	const [prevActivity, setPrevActivity] = useState("active");
	const [borderDummy1, setBorderDummy1] = useState(
		"/ui/wlm/statuses/active-animated-from.png"
	);
	const [borderDummy2, setBorderDummy2] = useState(
		"/ui/wlm/statuses/active-animated-to.png"
	);

	const [borderRef, borderDummy1Ref, borderDummy2Ref] = [
		useRef<HTMLImageElement>(null),
		useRef<HTMLImageElement>(null),
		useRef<HTMLImageElement>(null),
	];

	useEffect(() => {
		const [border, borderDummy1, borderDummy2] = [
			borderRef.current!,
			borderDummy1Ref.current!,
			borderDummy2Ref.current!,
		] as HTMLImageElement[];
		const id = win?.addListener((w) => {
			let state = "active";
			switch (w.activity) {
				case "live/active.png":
					state = "active";
					break;
				case "live/idle.png":
					state = "idle";
					break;
				case "live/dnd.png":
					state = "dnd";
					break;
				case "live/invisible.png":
					break;
			}

			if (state !== prevActivity) {
				setPrevActivity(state);
				(async () => {
					const sleep = (ms: number) =>
						new Promise((resolve) => setTimeout(resolve, ms));
					border.style.opacity = "0";
					borderDummy1.style.opacity = "1";
					borderDummy2.style.opacity = "0";
					setBorderDummy1(`/ui/wlm/statuses/${prevActivity}-animated-from.png`);
					await sleep(550);
					borderDummy1.animate(
						[
							{
								opacity: "1",
							},
							{
								opacity: "0",
							},
						],
						{
							easing: "linear",
							duration: 250,
						}
					);
					setTimeout(() => (borderDummy1.style.opacity = "0"), 250);
					borderDummy2.style.opacity = "1";
					setBorderDummy2(`/ui/wlm/statuses/${state}-animated-to.png`);
					await sleep(730);
					borderDummy1.style.opacity = "0";
					borderDummy2.style.opacity = "0";
					border.style.opacity = "1";
					setSrc(`/ui/wlm/statuses/${state}-static.png`);
				})();
			}
		});
		return () => {
			if (id) win?.removeListener(id);
		};
	}, [borderDummy1Ref, borderDummy2Ref, borderRef, prevActivity, win]);
	useEffect(() => {
		const [border, borderDummy1, borderDummy2] = [
			borderRef.current!,
			borderDummy1Ref.current!,
			borderDummy2Ref.current!,
		] as HTMLImageElement[];
		if (state !== prevActivity) {
			setPrevActivity(state);
			(async () => {
				const sleep = (ms: number) =>
					new Promise((resolve) => setTimeout(resolve, ms));
				border.style.opacity = "0";
				borderDummy1.style.opacity = "1";
				borderDummy2.style.opacity = "0";
				setBorderDummy1(`/ui/wlm/statuses/${prevActivity}-animated-from.png`);
				await sleep(550);
				borderDummy1.animate(
					[
						{
							opacity: "1",
						},
						{
							opacity: "0",
						},
					],
					{
						easing: "linear",
						duration: 250,
					}
				);
				setTimeout(() => (borderDummy1.style.opacity = "0"), 250);
				borderDummy2.style.opacity = "1";
				setBorderDummy2(`/ui/wlm/statuses/${state}-animated-to.png`);
				await sleep(730);
				borderDummy1.style.opacity = "0";
				borderDummy2.style.opacity = "0";
				border.style.opacity = "1";
				setSrc(`/ui/wlm/statuses/${state}-static.png`);
			})();
		}
	}, [state]);
	useEffect(() => {
		// preload images
		const cache = document.createElement("CACHE");
		cache.style.position = "absolute";
		cache.style.zIndex = "-1000";
		cache.style.opacity = "0";
		document.body.appendChild(cache);
		function preloadImage(url: string) {
			const img = new Image();
			img.src = url;
			img.style.position = "absolute";
			cache.appendChild(img);
		}
		["active", "dnd", "idle"].forEach((state) => {
			preloadImage(`/ui/wlm/statuses/${state}-static.png`);
			preloadImage(`/ui/wlm/statuses/${state}-animated-from.png`);
			preloadImage(`/ui/wlm/statuses/${state}-animated-to.png`);
		});
		return () => {
			document.body.removeChild(cache);
		};
	}, []);
	return (
		<div className={styles.pfpBorder}>
			<img ref={borderRef} src={src} id="border" className={styles.border} />
			<img
				ref={borderDummy2Ref}
				src={borderDummy2}
				id="borderDummy2"
				className={styles.borderDummy2}
			/>
			<img
				ref={borderDummy1Ref}
				src={borderDummy1}
				id="borderDummy1"
				className={styles.borderDummy1}
			/>
			<img src={pfp} className={styles.pfp} />
		</div>
	);
}

function getStringFromActivity(activity: string) {
	switch (activity) {
		case "live/active.png":
			return "active";
		case "live/idle.png":
			return "idle";
		case "live/dnd.png":
			return "dnd";
		case "live/invisible.png":
			return "offline";
	}
}

function Live({ win }: { win?: Window }) {
	const [liveState, setLiveState] = useState<State>({
		connections: [],
		status: "active",
		username: "",
		id: "",
	});
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
	useEffect(() => {
		console.log(win);
	}, [win]);
	const { sendJsonMessage } = useWebSocket("wss://win7api.nota-robot.com", {
		onMessage: (e) => {
			onMessage({ ...e, data: JSON.parse(e.data) });
		},
	});
	useEffect(() => {}, [liveState]);
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
						<img src={i.icon} className={styles.contextMenuIcon} />
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
					<PfpBorder win={win} pfp={pfp} />
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
										id: "offline",
										onClick() {
											sendJsonMessage({
												type: "CHANGE_STATUS",
												data: {
													status: "offline",
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
				<div className={styles.searchContainer}></div>
			</div>
		</div>
	);
}

export default Live;
