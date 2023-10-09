import { useEffect, useState } from "react";
import styles from "../css/TrayProvider.module.css";
import { TrayItem, TrayService } from "../util/TrayService";
import Time from "./Time";

export default function TrayProvider() {
	const [trayItems, setTrayItems] = useState<TrayItem[]>(
		TrayService.getItems()
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
				<div className={styles.aeroPeek} />
			</div>
		</div>
	);
}
