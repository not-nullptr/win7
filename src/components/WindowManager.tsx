import React, { useEffect, useState } from "react";
import styles from "../css/Window.module.css";
import { TrayItem } from "../util/TrayService";
import {
	CreateCallbackPayload,
	WindowManager,
	componentMap,
} from "../util/WindowManager";
import WindowComponent from "./Window";

function WindowProvider({ children }: { children: React.ReactNode }) {
	const [windows, setWindows] = useState<CreateCallbackPayload[]>([]);
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
						})
					);
				}
			}
		});
	}, []);
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
