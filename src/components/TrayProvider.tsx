import { useEffect, useState } from "react";
import styles from "../css/TrayProvider.module.css";
import { TrayItem, TrayService } from "../util/TrayService";
import Time from "./Time";
import { WindowManager } from "../util/WindowManager";
import windowStyles from "../css/Window.module.css";

export default function TrayProvider() {
	const [trayItems, setTrayItems] = useState<TrayItem[]>(
		TrayService.getItems(),
	);
	useEffect(() => {
		const id = TrayService.addListener((tray) => {
			setTrayItems([...tray]);
		});
		const item = new TrayItem("tray-service.png", "Tray Service");

		item.create();
		return () => {
			item.destroy();
			TrayService.removeListener(id);
		};
	}, []);
	return (
		<div key={trayItems.map((t) => t.id).join()} className={styles.tray}>
			<div className={styles.trayItems}>
				{trayItems.map((i) => (
					<img
						key={i.id}
						id={i.id}
						title={i.label}
						className={styles.icon}
						src={`/icons/main/${i.icon}`}
					/>
				))}
				<Time />
				<div
					className={styles.aeroPeek}
					onClick={() => {
						WindowManager.windows.forEach((w) => {
							const windowFrame = document.getElementById(
								w.id,
							) as HTMLDivElement | null;
							if (!windowFrame) return;
							const taskbarItem = document.getElementById(
								`icon-${w.id}`,
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
						});
					}}
				/>
			</div>
		</div>
	);
}
