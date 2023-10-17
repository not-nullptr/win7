import { useEffect, useRef, useState } from "react";
import styles from "../../../css/NotificationProviderLive.module.css";
import { v4 } from "uuid";

export interface LiveNotification {
	text: string;
	id: string;
}

export class LiveNotificationHandler {
	static listeners: {
		cb: (notification: LiveNotification) => any;
		id: string;
	}[] = [];
	static addListener(cb: (notification: LiveNotification) => any) {
		const id = v4();
		LiveNotificationHandler.listeners.push({ cb, id });
		return id;
	}
	static removeListener(id: string) {
		LiveNotificationHandler.listeners =
			LiveNotificationHandler.listeners.filter((l) => l.id !== id);
	}
	static notify(notification: Omit<LiveNotification, "id">) {
		LiveNotificationHandler.listeners.forEach((l) =>
			l.cb({ ...notification, id: v4() })
		);
	}
}

function Notification({ notification }: { notification: LiveNotification }) {
	const notificationRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		(async () => {
			const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
			if (!notificationRef.current || !notification) return;
			notificationRef.current.classList.add(styles.show);
			await sleep(5000);
			notificationRef.current.classList.remove(styles.show);
			notificationRef.current.classList.add(styles.hide);
			await sleep(750);
			notificationRef.current.classList.remove(styles.hide);
		})();
	}, []);
	return (
		<div
			key={notification.id}
			ref={notificationRef}
			className={styles.notification}
		>
			<div className={styles.pseudoTitlebar}>
				<img
					className={styles.notificationIcon}
					src="/icons/window/msn.png"
					alt="MSN"
				/>
				<div className={styles.notificationTitle}>Windows Live Messenger</div>
				<div className={styles.notificationClose} />
			</div>
			<div className={styles.notificationContentContainer}>
				<div className={styles.notificationContent}>{notification.text}</div>
			</div>
		</div>
	);
}

function NotificationProvider() {
	const [notifications, setNotifications] = useState<LiveNotification[]>([]);
	useEffect(() => {
		const id = LiveNotificationHandler.addListener((notification) => {
			setNotifications((notifications) => [...notifications, notification]);
			setTimeout(() => {
				setNotifications((notifications) =>
					notifications.filter((n) => n.id !== notification.id)
				);
			}, 15000);
		});
		return () => LiveNotificationHandler.removeListener(id);
	}, []);
	return (
		<div className={styles.container}>
			{notifications.map((notification) => (
				<Notification notification={notification} />
			))}
		</div>
	);
}

export default NotificationProvider;
