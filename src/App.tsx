import { useEffect, useRef, useState } from "react";
import "./App.css";
import NotificationProvider from "./components/NotificationProvider";
import Taskbar from "./components/Taskbar";
import WindowProvider from "./components/WindowManager";
import { State } from "./types/State";
import { Context } from "./util/Context";
import { Program } from "./util/Program";
import { Provider } from "./windows/live/components/ContextMenu";
import ThemingProvider from "./components/ThemingProvider";
import GettingStarted from "./windows/GettingStarted";
import Live from "./windows/live/Live";
import Personalization from "./windows/Personalization";
import Minesweeper from "./windows/minesweeper/Minesweeper";
import CommandPrompt from "./windows/CommandPrompt";
import NotificationSender from "./windows/NotificationSender";
import Notepad from "./windows/Notepad";
import Explorer from "./windows/Explorer";
import TaskManager from "./windows/TaskManager";
import { Notification } from "./util/NotificationService";
import { TrayService } from "./util/TrayService";

export const programs = [
	new Program(
		{
			title: "Getting Started",
			component: GettingStarted,
			icon: "getting-started.png",
			defaultWidth: 971,
			defaultHeight: 603,
			minWidth: 718,
			minHeight: 230,
		},
		"Getting Started",
		"getting-started.png",
	),
	new Program(
		{
			title: "Binbows Live Messenger",
			component: Live,
			icon: "msn.png",
			minWidth: 270,
			minHeight: 600,
			defaultWidth: 270,
			defaultHeight: 600,
			initialPath: "/live",
		},
		"Binbows Live Messenger",
		"msn.png",
	),
	new Program(
		{
			title: "Personalization",
			component: Personalization,
			icon: "personalization.png",
			defaultWidth: 400,
			defaultHeight: 300,
			minWidth: 400,
			minHeight: 300,
		},
		"Personalization",
		"personalization.png",
	),
	new Program(
		{
			title: "Minesweeper",
			component: Minesweeper,
			icon: "minesweeper.png",
			initialPath: "/singleplayer",
			defaultWidth: 180,
			defaultHeight: 240,
			minWidth: 180,
			minHeight: 240,
		},
		"Minesweeper",
		"minesweeper.png",
	),
	new Program(
		{
			title: "Live for Binbows - Minesweeper",
			component: Minesweeper,
			icon: "minesweeper.png",
			initialPath: "/multiplayer",
			defaultWidth: 376,
			defaultHeight: 240,
			minWidth: 376,
			minHeight: 240,
		},
		"Minesweeper for Two",
		"minesweeper.png",
	),
	new Program(
		{
			title: "Command Prompt",
			component: CommandPrompt,
			icon: "command-prompt.png",
			defaultWidth: 678,
			defaultHeight: 345,
		},
		"Command Prompt",
		"command-prompt.png",
	),
	new Program(
		{
			title: "Notification Sender",
			component: NotificationSender,
			icon: "../main/tray-service.png",
			defaultWidth: 500,
			defaultHeight: 300,
		},
		"Notification Sender",
		"../main/tray-service.png",
	),
	new Program(
		{
			title: "Notepad",
			component: Notepad,
			icon: "notepad.png",
		},
		"Notepad",
		"notepad.png",
	),
	new Program(
		{
			title: "Explorer",
			component: Explorer,
			icon: "explorer.png",
			titleBarHeight: 58,
			transparent: true,
		},
		"Explorer",
		"explorer.png",
	),
	new Program(
		{
			title: "Test Application",
			component: TaskManager,
			icon: "test-app.png",
		},
		"Test Application",
		"test-app.png",
	),
];

function App() {
	const [state, setState] = useState<State>({ zIndex: 1000, windows: [] });
	const desktopRef = useRef<HTMLDivElement>(null);
	const selectRef = useRef<HTMLDivElement>(null);
	let windowOpened = false;
	useEffect(() => {
		if (!windowOpened)
			programs.find((p) => p.name === "Getting Started")?.spawn();
		windowOpened = true;
	}, []);
	function mouseMove(e: MouseEvent) {
		let [width, height] = [
			e.clientX - parseInt(selectRef.current!.style.left.replace("px", "")),
			e.clientY - parseInt(selectRef.current!.style.top.replace("px", "")),
		];
		let transform = "";
		if (width < 0) {
			transform += `scaleX(-1)`;
			width = Math.abs(width);
		}
		if (height < 0) {
			transform += `scaleY(-1)`;
			height = Math.abs(height);
		}
		selectRef.current!.style.width = `${width}px`;
		selectRef.current!.style.transform = transform;
		selectRef.current!.style.height = `${height}px`;
	}
	useEffect(() => {
		function mouseDown(e: MouseEvent) {
			if (e.button !== 0) return;
			if (!selectRef.current || !desktopRef.current) return;
			document.addEventListener("mousemove", mouseMove);
			document.addEventListener("mouseup", mouseUp);
			selectRef.current.style.left = `${e.clientX}px`;
			selectRef.current.style.top = `${e.clientY}px`;
			selectRef.current.style.visibility = "visible";
		}
		function mouseUp(e: MouseEvent) {
			if (e.button !== 0) return;
			if (!selectRef.current || !desktopRef.current) return;
			document.removeEventListener("mousemove", mouseMove);
			selectRef.current.style.transform = "none";
			selectRef.current.style.width = "0";
			selectRef.current.style.height = "0";
			selectRef.current.style.visibility = "hidden";
			document.removeEventListener("mouseup", mouseUp);
		}
		desktopRef.current?.addEventListener("mousedown", mouseDown);
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			desktopRef.current?.removeEventListener("mousedown", mouseDown);
			document.removeEventListener("mousemove", mouseMove);
			document.removeEventListener("mouseup", mouseUp);
		};
	}, []);
	return (
		<Context.Provider value={{ state, setState }}>
			<Provider />
			<ThemingProvider />
			<WindowProvider>
				<div>
					<div className="desktop" ref={desktopRef}>
						<div ref={selectRef} className="select" />
					</div>
					<Taskbar />
					<div className="fullscreen-preview-container">
						<div className="fullscreen-preview" />
						<div className="genuine">
							{
								"Michaelsoft Binbows 7\nBuild 7601.5\nThis copy of Michaelsoft Binbows is absolutely genuine, promise"
							}
						</div>
					</div>
				</div>
				<NotificationProvider />
			</WindowProvider>
		</Context.Provider>
	);
}

export default App;
