import { useContext, useEffect, useState } from "react";
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

function TaskbarIcon({ window }: { window: Window }) {
	const [w, setWindowState] = useState<Window>(window);
	useEffect(() => {
		const listener = window.addListener((e) => {
			setWindowState((o) => {
				return { ...o, ...e } as any; // wtf ???
			});
		});
		return () => window.removeListener(listener);
	}, [window]);
	return (
		<div className="taskbar-icon" key={w.id}>
			<img src={`/icons/main/${w.icon}`} />
			{w.activity !== "" ? (
				<img
					className="taskbar-icon-activity"
					src={`/icons/activities/${w.activity}`}
				/>
			) : null}
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
												window.localStorage[LOCALSTORAGE_CACHE_KEY] || "{}"
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
													[]
												)
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
