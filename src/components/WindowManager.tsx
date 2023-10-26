import React, { useContext, useEffect, useState } from "react";
import styles from "../css/Window.module.css";
import { TrayItem } from "../util/TrayService";
import {
	CreateCallbackPayload,
	WindowManager,
	componentMap,
} from "../util/WindowManager";
import WindowComponent from "./Window";
import { Context } from "../util/Context";

function WindowProvider({ children }: { children: React.ReactNode }) {
	const [windows, setWindows] = useState<CreateCallbackPayload[]>([]);
	const { state, setState } = useContext(Context);
	// TODO: migrate this to new listener system
	useEffect(() => {
		WindowManager.setWindowProviderCallback((e) => {
			switch (e.type) {
				case "create": {
					setWindows((w) => [...w, { ...e.data }]);
					break;
				}
				case "remove": {
					const winEl = document.getElementById(e.data.id);
					if (!winEl)
						throw new Error("Attempted to delete non-existent window.");
					winEl!.classList.add(styles.windowClosing);
					setTimeout(() => {
						setWindows((w) => w.filter((w) => w.id !== e.data.id));
					}, 300);
					break;
				}
				case "update": {
					setWindows((w) =>
						w.map((w) => {
							if (w.id === e.data.id) {
								return { ...w, ...e.data };
							}
							return w;
						}),
					);
				}
			}
		});
	}, []);
	useEffect(() => {
		// get element with highest z index
		const windows = Array.from(
			document.getElementsByClassName(styles.windowFrame),
		) as HTMLDivElement[];
		let highest = 0;
		windows.forEach((w) => {
			const zindex = Number(w.style.zIndex);
			if (zindex > highest) {
				highest = zindex;
			}
		});
		const window = windows.find((w) => w.style.zIndex === `${highest}`);
		if (!window) return;
		windows.forEach((w) => w.classList.add(styles.unfocused));
		window.classList.remove(styles.unfocused);
	}, [state.zIndex, windows]);
	useEffect(() => {
		const item = new TrayItem("window-manager.png", "Window Manager Service");
		item.create();
		return () => item.destroy();
	}, []);
	return (
		<div>
			{windows.map((w) => (
				<WindowComponent
					key={w.id}
					map={componentMap as any}
					win={(() => {
						const win = WindowManager.getWindowById(w.id);
						return win;
					})()}
				/>
			))}
			{children}
		</div>
	);
}

export default WindowProvider;
