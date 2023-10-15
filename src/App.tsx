import { useEffect, useRef, useState } from "react";
import "./App.css";
import NotificationProvider from "./components/NotificationProvider";
import Taskbar from "./components/Taskbar";
import WindowProvider from "./components/WindowManager";
import { State } from "./types/State";
import { Context } from "./util/Context";
import { Program } from "./util/Program";

export const programs: Program[] = [
	new Program(
		{
			title: "Notification Sender",
			component: "NotificationSender",
			icon: "../main/tray-service.png",
			defaultWidth: 500,
			defaultHeight: 300,
		},
		"Notification Sender",
		"../main/tray-service.png"
	),
	new Program(
		{
			title: "Notepad",
			component: "Notepad",
			icon: "notepad.png",
		},
		"Notepad",
		"notepad.png"
	),
	new Program(
		{
			title: "Explorer",
			component: "Explorer",
			icon: "explorer.png",
			titleBarHeight: 58,
			transparent: true,
		},
		"Explorer",
		"explorer.png"
	),
	new Program(
		{
			title: "Windows Live Messenger",
			component: "Live",
			icon: "../main/msn.png",
			minWidth: 270,
			minHeight: 600,
			defaultWidth: 270,
			defaultHeight: 600,
		},
		"Windows Live Messenger",
		"../main/msn.png"
	),
	new Program(
		{
			title: "Task Manager",
			component: "TaskManager",
			icon: "task-manager.png",
		},
		"Task Manager",
		"task-manager.png"
	),
];

function App() {
	const [state, setState] = useState<State>({ zIndex: 1000, windows: [] });
	const desktopRef = useRef<HTMLDivElement>(null);
	const selectRef = useRef<HTMLDivElement>(null);
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
			if (!selectRef.current || !desktopRef.current) return;
			document.addEventListener("mousemove", mouseMove);
			document.addEventListener("mouseup", mouseUp);
			selectRef.current.style.left = `${e.clientX}px`;
			selectRef.current.style.top = `${e.clientY}px`;
			selectRef.current.style.visibility = "visible";
		}
		function mouseUp() {
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
			<WindowProvider>
				<div>
					<div className="desktop" ref={desktopRef}>
						<div ref={selectRef} className="select" />
					</div>
					<Taskbar />
					<div className="fullscreen-preview-container">
						<div className="fullscreen-preview" />
					</div>
				</div>
				<NotificationProvider />
			</WindowProvider>
		</Context.Provider>
	);
}

export default App;