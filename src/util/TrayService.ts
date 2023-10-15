import { v4 } from "uuid";

export class TrayItem {
	id: string;
	icon: string;
	label: string;
	windowId?: string;
	constructor(icon: string, label: string, windowId?: string) {
		this.id = v4();
		this.icon = icon;
		this.label = label;
		this.windowId = windowId;
	}
	create() {
		TrayService.addItem(this);
	}
	destroy() {
		TrayService.removeItem(this.id);
	}
}

export class TrayService {
	private static items: TrayItem[] = [];
	private static listeners: {
		function: (tray: TrayItem[]) => void;
		id: string;
	}[] = [];
	private static callListeners() {
		this.listeners.forEach((l) => l.function(this.items));
	}
	static addListener(callback: (tray: TrayItem[]) => void) {
		const id = v4();
		TrayService.listeners.push({
			function: callback,
			id,
		});
		return id;
	}
	static removeListener(id: string) {
		TrayService.listeners = TrayService.listeners.filter((l) => l.id !== id);
	}
	static addItem(item: TrayItem) {
		TrayService.items.push(item);
		TrayService.callListeners();
	}
	static removeItem(id: string) {
		TrayService.items = TrayService.items.filter((i) => i.id !== id);
		TrayService.callListeners();
	}
	static getItems() {
		return TrayService.items;
	}
	static getItemById(id: string) {
		return TrayService.items.find((t) => t.id === id);
	}
}
