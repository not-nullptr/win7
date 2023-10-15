import { v4 } from "uuid";
import { Window, WindowManager } from "../util/WindowManager";
import { TrayService } from "./TrayService";

interface NotificationType {
	icon?: string;
	title: string;
	message: string;
	id: string;
	windowId?: string;
	trayId: string;
}

export class NotificationService {
	private static listeners: {
		function: (notification: Notification | undefined) => void;
		id: string;
	}[] = [];
	private static callListeners() {
		this.listeners.forEach((l) => l.function(this.currrentNotification));
	}
	private static currrentNotification?: Notification;
	static setNotification(notification?: Notification) {
		NotificationService.currrentNotification = notification;
		NotificationService.callListeners();
	}
	static getNotification() {
		return NotificationService.currrentNotification;
	}
	static addNotificationListener(
		callback: (notification?: Notification) => void
	) {
		const id = v4();
		NotificationService.listeners.push({
			function: callback,
			id,
		});
		return id;
	}
	static removeNotificationListener(id: string) {
		NotificationService.listeners = NotificationService.listeners.filter(
			(l) => l.id !== id
		);
	}
}
type ExcludeProp<T, K extends keyof T> = Omit<T, K>;

type NotificationProps = ExcludeProp<NotificationType, "id">;

export class Notification {
	private window?: Window;
	id: string;
	icon: string;
	title: string;
	message: string;
	windowId?: string;
	trayId: string;
	constructor(notification: NotificationProps) {
		this.icon =
			notification.icon ||
			TrayService.getItemById(notification.trayId)?.icon ||
			(() => {
				throw new Error("Empty icon passed");
			})();
		this.title = notification.title;
		this.message = notification.message;
		this.id = v4();
		this.trayId = notification.trayId;
		this.windowId = notification.windowId;
		if (this.windowId) {
			const win = WindowManager.windows.find(
				(w) => w.id === notification.windowId
			);
			if (!win)
				throw new Error(
					`Attempted to create notification for non-existent window ${notification.windowId}`
				);
			this.window = win;
		}
	}
	show() {
		setTimeout(() => {
			NotificationService.setNotification(this);
		}, 250);
	}
	hide() {
		NotificationService.setNotification(undefined);
	}
}
