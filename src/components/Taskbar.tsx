import { useContext, useEffect, useRef, useState } from "react";
import { programs } from "../App";
import startActive from "../assets/taskbar/start-active.png";
import startHover from "../assets/taskbar/start-hover.png";
import startNormal from "../assets/taskbar/start-normal.png";
import startStyles from "../css/Start.module.css";
import { Context } from "../util/Context";
import { hasParentWithClass } from "../util/Generic";
import { Notification } from "../util/NotificationService";
import { TrayService } from "../util/TrayService";
import { Window, WindowManager } from "../util/WindowManager";
import Start from "./Start";
import TrayProvider from "./TrayProvider";
import Vibrant from "node-vibrant";
import windowStyles from "../css/Window.module.css";

function TaskbarIcon({ window }: { window: Window }) {
	const { state, setState } = useContext(Context);
	const hoverRef = useRef<HTMLDivElement>(null);
	const [w, setWindowState] = useState<Window>(window);
	useEffect(() => {
		const listener = window.addListener((e) => {
			setWindowState((o) => {
				return { ...o, ...e } as any; // wtf ???
			});
		});
		return () => window.removeListener(listener);
	}, [window]);
	useEffect(() => {
		(async () => {
			if (hoverRef.current) {
				const img = new Image();
				img.src = `/icons/main/${w.icon}`;
				const vibrant = Vibrant.from(img);
				const color = await vibrant.getPalette();
				hoverRef.current.style.setProperty(
					"--color",
					color.LightVibrant?.hex || "#000",
				);
			}
		})();
	}, [hoverRef, w.icon]);
	useEffect(() => {
		function mouseMove(e: MouseEvent) {
			if (!hoverRef.current) return;
			const rect = hoverRef.current.getBoundingClientRect();
			if (rect) {
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				hoverRef.current.style.setProperty("--x", x + "px");
				hoverRef.current.style.setProperty("--y", y + "px");
			}
		}
		function mouseEnter() {
			document.addEventListener("mousemove", mouseMove);
			hoverRef.current?.addEventListener("mouseleave", mouseLeave);
			if (hoverRef.current) {
				hoverRef.current.style.setProperty(
					"--secondary",
					"rgb(255, 255, 255, 0.239)",
				);
				hoverRef.current.style.opacity = "1";
			}
		}
		function mouseLeave() {
			document.removeEventListener("mousemove", mouseMove);
			if (hoverRef.current) {
				hoverRef.current.style.opacity = "0";
			}
		}
		function mouseDown(e: MouseEvent) {
			if (e.button !== 0) return;
			if (hoverRef.current) {
				document.removeEventListener("mousemove", mouseMove);
				hoverRef.current.style.setProperty(
					"--secondary",
					"rgb(255, 255, 255, 0.5)",
				);
				hoverRef.current.classList.add("pressed");
			}
		}
		function mouseUp(e: MouseEvent) {
			if (e.button !== 0) return;

			if (hoverRef.current) {
				document.addEventListener("mousemove", mouseMove);
				hoverRef.current.style.setProperty(
					"--secondary",
					"rgb(255, 255, 255, 0.239)",
				);
				hoverRef.current.classList.remove("pressed");
			}
		}
		hoverRef.current?.addEventListener("mouseenter", mouseEnter);
		hoverRef.current?.addEventListener("mousedown", mouseDown);
		hoverRef.current?.addEventListener("mouseup", mouseUp);
		return () => {
			hoverRef.current?.removeEventListener("mouseenter", mouseEnter);
			document.removeEventListener("mousemove", mouseMove);
			hoverRef.current?.removeEventListener("mouseleave", mouseLeave);
			hoverRef.current?.removeEventListener("mousedown", mouseDown);
			// eslint-disable-next-line react-hooks/exhaustive-deps
			hoverRef.current?.removeEventListener("mouseup", mouseUp);
		};
	}, [hoverRef]);
	return (
		<div
			className="taskbar-icon"
			id={`icon-${w.id}`}
			onClick={() => {
				let maxZIndex = 0;

				for (const w of Array.from(
					document.querySelectorAll(`.${windowStyles.windowFrame}`),
				) as HTMLDivElement[]) {
					if (w.style.zIndex !== "") {
						maxZIndex = Math.max(maxZIndex, parseInt(w.style.zIndex));
					}
				}
				const windowFrame = document.getElementById(w.id) as HTMLDivElement;
				if (windowFrame.classList.contains(windowStyles.minimized)) {
					windowFrame.style.transform = "scale(0.5)";
					windowFrame.style.zIndex = `${maxZIndex + 1}`;
					for (const w of Array.from(
						document.querySelectorAll(`.${windowStyles.windowFrame}`),
					) as HTMLDivElement[]) {
						w.classList.add(windowStyles.unfocused);
					}

					windowFrame.classList.remove(windowStyles.unfocused);
					windowFrame.animate(
						[
							{
								opacity: "0",
								transform: "scale(0.5)",
							},
							{
								opacity: "1",
								transform: "scale(1)",
							},
						],
						{
							duration: 250,
							easing: "ease-in-out",
						},
					).onfinish = () => {
						windowFrame.style.transform = "scale(1)";
						windowFrame.style.transformOrigin = "center center";
					};
					windowFrame.classList.remove(windowStyles.minimized);
				} else {
					if (!windowFrame.classList.contains(windowStyles.unfocused)) {
						const taskbarItem = document.getElementById(
							`icon-${window?.id}`,
						) as HTMLDivElement;
						if (!taskbarItem || !windowFrame) return;
						const box = taskbarItem.getBoundingClientRect();
						const windowBox = windowFrame.getBoundingClientRect();
						windowFrame.style.transformOrigin = `${
							box.left - windowBox.left + box.width / 2
						}px ${box.top - windowBox.top + box.height / 2}px`;

						windowFrame.animate(
							[
								{
									transform: `scale(1)`,
									opacity: 1,
								},
								{
									transform: `scale(0.5)`,
									opacity: 0,
								},
							],
							{
								duration: 200,
								easing: "ease-out",
							},
						).onfinish = () => {
							windowFrame.classList.remove(windowStyles.fullscreen);
							windowFrame.classList.add(windowStyles.minimized);
						};
						return;
					}
					// focus window
					windowFrame.classList.remove(windowStyles.unfocused);
					windowFrame.style.zIndex = `${maxZIndex + 1}`;
					setState({ ...state, zIndex: maxZIndex + 1 });
				}
			}}
			key={w.id}
		>
			<img src={`${import.meta.env.BASE_URL}icons/main/${w.icon}`} />
			{w.activity !== "" ? (
				<img
					className="taskbar-icon-activity"
					src={`${import.meta.env.BASE_URL}icons/activities/${w.activity}`}
				/>
			) : null}
			<div ref={hoverRef} className="taskbar-icon-hover" />
		</div>
	);
}

function Taskbar() {
	const { state } = useContext(Context);
	const [windows, setWindows] = useState<Window[]>([]);
	const [startOpen, setStartOpen] = useState(false);
	useEffect(() => {
		const id = WindowManager.addWindowListener((w) => setWindows(w));
		return () => WindowManager.removeWindowListener(id);
	}, []);
	useEffect(() => {
		function closeStart(e: MouseEvent) {
			if (
				!hasParentWithClass(e.target as HTMLElement, startStyles.startMenuFrame)
			)
				setStartOpen(false);
		}
		document.addEventListener("mousedown", closeStart);
		return () => document.removeEventListener("mousedown", closeStart);
	}, [state.windows]);
	return (
		<div>
			{startOpen ? (
				<Start
					onClose={() => setStartOpen(false)}
					sideButtons={[
						{
							label: "Clear IndexedDB",
							async onClick() {
								function clearIndexedDB() {
									if (
										window.indexedDB &&
										typeof window.indexedDB.databases === "undefined"
									) {
										const LOCALSTORAGE_CACHE_KEY = "indexedDBDatabases";

										// Store a key value map of databases
										const getFromStorage = () =>
											JSON.parse(
												window.localStorage[LOCALSTORAGE_CACHE_KEY] || "{}",
											);

										// Write the database to local storage
										const writeToStorage = (value: any) =>
											(window.localStorage[LOCALSTORAGE_CACHE_KEY] =
												JSON.stringify(value));

										IDBFactory.prototype.databases = () =>
											Promise.resolve(
												Object.entries(getFromStorage()).reduce(
													(acc: any[], [name, version]) => {
														acc.push({ name, version });
														return acc;
													},
													[],
												),
											);

										// Intercept the existing open handler to write our DBs names
										// and versions to localStorage
										const open = IDBFactory.prototype.open;

										IDBFactory.prototype.open = function (...args) {
											const dbName = args[0];
											const version = args[1] || 1;
											const existing = getFromStorage();
											writeToStorage({ ...existing, [dbName]: version });
											return open.apply(this, args);
										};

										// Intercept the existing deleteDatabase handler remove our
										// dbNames from localStorage
										const deleteDatabase = IDBFactory.prototype.deleteDatabase;

										IDBFactory.prototype.deleteDatabase = function (...args) {
											const dbName = args[0];
											const existing = getFromStorage();
											delete existing[dbName];
											writeToStorage(existing);
											return deleteDatabase.apply(this, args);
										};
									}
								}
								clearIndexedDB();
							},
						},
						{
							label: "Create notification",
							onClick() {
								const noti = new Notification({
									icon: "notepad.png",
									title: "Test notification",
									message: "This is a test notification",
									trayId: TrayService.getItems()[2].id,
								});
								noti.show();
							},
						},
						{
							label: "Pictures",
						},
						{
							label: "Music",
						},
						{
							label: "divider",
						},
						{
							label: "Games",
						},
						{
							label: "Computer",
						},
						{
							label: "divider",
						},
						{
							label: "Control Panel",
						},
						{
							label: "Devices and Printers",
						},
						{
							label: "Default Programs",
						},
						{
							label: "Help and Support",
						},
					]}
					programs={programs}
				/>
			) : null}
			<div className="taskbar bg"></div>
			<div className="taskbar fg">
				<div className="left">
					<div
						className="start start-button"
						onClick={() => setStartOpen(!startOpen)}
					>
						<img
							className={`start-active ${startOpen ? "pressed" : ""}`}
							src={startActive}
						/>
						<img className="start start-normal" src={startNormal} />
						<img className="start start-hover" src={startHover} />
					</div>
					<div className="taskbar-icons">
						{windows.map((w) => (
							<TaskbarIcon key={w.id} window={w} />
						))}
					</div>
				</div>
				<div className="right">
					<TrayProvider />
				</div>
			</div>
		</div>
	);
}

export default Taskbar;
