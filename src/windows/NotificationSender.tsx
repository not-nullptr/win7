import { useEffect, useState } from "react";
import Select from "../components/SelectMenu";
import styles from "../css/NotificationSender.module.css";
import { Notification } from "../util/NotificationService";
import { TrayItem, TrayService } from "../util/TrayService";
import { Window } from "../util/WindowManager";

function NotificationSender({ win }: { win: Window }) {
	const [tray, setTray] = useState<TrayItem[]>(TrayService.getItems());
	useEffect(() => {
		const id = TrayService.addListener((tray) => {
			setTray([...tray]);
		});
		const item = new TrayItem(
			"uac.png",
			"Notification Sender Process",
			win?.id
		);
		item.create();
		const notification = new Notification({
			title: "Welcome to the Notification Sender!",
			message: "If you're seeing this, everything is working properly.",
			trayId: item?.id,
			windowId: win?.id,
		});
		notification.show();
		return () => {
			notification.hide();
			item.destroy();
			TrayService.removeListener(id);
		};
	}, [win?.id]);
	return (
		<div className={styles.container}>
			<div id="notification-form" className={styles.form}>
				{/* <input type="text" placeholder="Title" id="title" />
				<input type="text" placeholder="Message" id="message" />
				<input type="text" placeholder="Icon" id="icon" />
				<Select items={tray.map((t) => ({ label: t.label, value: t.id }))} /> */}
				<div className={styles.formGroup}>
					<label htmlFor="title">Title</label>
					<input type="text" placeholder="Title" id="title" />
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="message">Message</label>
					<input type="text" placeholder="Message" id="message" />
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="icon">Icon</label>
					<input type="text" placeholder="Icon" id="icon" />
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="trayId">Tray ID</label>
					<Select
						id="trayId"
						width={160}
						items={tray.map((t) => ({ label: t.label, value: t?.id }))}
					/>
				</div>
			</div>
			<button
				className={styles.send}
				onClick={() => {
					// get the values from the form
					const title = (document.getElementById("title") as HTMLInputElement)
						.value;
					const message = (
						document.getElementById("message") as HTMLInputElement
					).value;
					const trayId = (document.getElementById("trayId") as HTMLInputElement)
						.value;
					const icon =
						(document.getElementById("icon") as HTMLInputElement).value ||
						TrayService.getItems().find((t) => t?.id === trayId)?.icon ||
						"notepad.png";
					const notification = new Notification({
						title,
						message,
						icon,
						trayId,
					});
					notification.show();
				}}
			>
				Send
			</button>
		</div>
	);
}

export default NotificationSender;
