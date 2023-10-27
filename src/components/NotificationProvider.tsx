import { useEffect, useRef, useState } from "react";
import triangle from "../assets/taskbar/notification-triangle.png";
import styles from "../css/NotificationProvider.module.css";
import { Notification, NotificationService } from "../util/NotificationService";
import { TrayItem, TrayService } from "../util/TrayService";
import { WindowManager } from "../util/WindowManager";

const absolutePosition = (element: HTMLElement | null) =>
	element &&
	element.getBoundingClientRect() && {
		top: element.getBoundingClientRect().top + window.scrollY,
		left: element.getBoundingClientRect().left + window.scrollX,
	};

export default function NotificationProvider() {
	const [, setNotiTrayId] = useState("");
	const [notiPos, setNotiPos] = useState(0);
	const [tray, setTray] = useState<TrayItem[]>(TrayService.getItems());
	const notificationRef = useRef<Notification | undefined>(
		NotificationService.getNotification(),
	);
	const [notification, setNotification] = useState<Notification | undefined>(
		notificationRef.current,
	);
	const timeoutRefs = useRef<number[]>([]);
	const notificationElRef = useRef<HTMLDivElement>(null);

	function clearAllTimeouts(resetAnimation = true) {
		timeoutRefs.current.forEach(clearTimeout);
		timeoutRefs.current = [];
		notificationElRef.current?.classList.remove(styles.fade);
		if (notificationElRef.current && resetAnimation) {
			notificationElRef.current.style.animation = "none";
			notificationElRef.current.offsetHeight;
			notificationElRef.current.style.animation = "";
		}
	}

	function hideNotification(notification: Notification) {
		notificationElRef.current!.style.animation = "";
		if (notificationRef.current?.id === notification?.id) {
			notificationRef.current?.hide();
			setNotification(undefined);
			notificationRef.current = undefined;
		}
	}
	useEffect(() => {
		const id = TrayService.addListener((tray) => {
			setTray([...tray]);
		});
		return () => {
			TrayService.removeListener(id);
		};
	}, []);
	useEffect(() => {
		const id = NotificationService.addNotificationListener((n) => {
			setNotification(n);
			notificationRef.current = n;
			if (n) {
				clearAllTimeouts();
				timeoutRefs.current.push(
					setTimeout(() => {
						hideNotification(n);
					}, 10000) as any,
					setTimeout(() => {
						if (notificationElRef.current) {
							notificationElRef.current.style.animation = "";
							notificationElRef.current.classList.add(styles.fade);
						}
					}, 7700) as any,
				);
			}
			WindowManager.addWindowListener((w) => {
				if (notificationRef.current) {
					// check if the tray has a window handle
					const tray = TrayService.getItems().find(
						(t) => t.id === notificationRef.current?.trayId,
					);
					if (!tray || !tray?.windowId) return;
					if (!w.map((h) => h.id).includes(tray?.windowId || "nonexistant")) {
						clearAllTimeouts();
						notificationRef.current.hide();
					}
				}
			});
		});

		return () => {
			NotificationService.removeNotificationListener(id);
			clearAllTimeouts();
		};
	}, []);

	const handleNotificationHover = () => {
		if (notificationRef.current) {
			notificationElRef.current!.style.animation = "none";

			clearAllTimeouts(false);
			timeoutRefs.current.push(
				setTimeout(() => {
					hideNotification(notification!);
				}, 10000) as any,
				setTimeout(() => {
					if (notificationElRef.current) {
						notificationElRef.current.style.animation = "none";
						notificationElRef.current.classList.add(styles.fade);
					}
				}, 7700) as any,
			);
		}
	};
	useEffect(() => {
		const item = new TrayItem("noti-service.png", "Notification Service");
		item.create();
		setNotiTrayId(item.id);
		const noti = new Notification({
			title: "Success",
			message: "The notification service is running properly.",
			trayId: item.id,
		});
		noti.show();
		return () => {
			item.destroy();
		};
	}, []);
	useEffect(() => {
		const abs = absolutePosition(
			document.getElementById(notification?.trayId || ""),
		);
		if (!abs) return;
		setNotiPos(window.innerWidth - abs.left);
	}, [notification, tray]);
	return (
		notification && (
			<div
				style={{
					right: notiPos - 22,
				}}
				className={styles.notificationPosition}
			>
				<div
					className={styles.notificationContainer}
					onMouseEnter={handleNotificationHover}
					onMouseMove={handleNotificationHover}
					ref={notificationElRef}
				>
					<img className={styles.triangle} src={triangle} />
					<div className={styles.notificationContent}>
						<img
							className={styles.notificationIcon}
							src={`${import.meta.env.BASE_URL}icons/main/${notification.icon}`}
						/>
						<div className={styles.notificationText}>
							<h2 className={styles.header}>{notification.title}</h2>
							<div>{notification.message}</div>
						</div>
					</div>
				</div>
			</div>
		)
	);
}
