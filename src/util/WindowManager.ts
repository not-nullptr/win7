import { v4 } from "uuid";
import Explorer from "../windows/Explorer";
import Notepad from "../windows/Notepad";
import NotificationSender from "../windows/NotificationSender";
import TaskManager from "../windows/TaskManager";
import Live from "../windows/live/Live";
//  ------------------------------------------------------
//  notes
//
//   this file sets out to answer the following questions:
//   1.  how do you efficiently manage windows in react?
//   2.  how do you consistently update state between a
//       react and regular typescript (i.e. keeping the
//       dom hydrated with data in the WindowManager)
//   3.  how do you do all that, dynamically, for easier
//       refactoring and adding on later?
//   i have solved none of these. this isterrible code
//   and, quite frankly, i urge you to spend your time
//   reading something more interesting. for those  who
//   are staying for the ride, thanks.
//
//  -------------------------------------------------------
//  1.  efficient window management
//
//   this file contains 2 classes:
//      -  WindowManager
//      -  Window
//
//   WindowManager does all of the heavy lifting. it takes
//   all of the Windows and makes sure they're in check,
//   actually inserts them into the dom, etc.
//
//   Window, on the other hand, is a lazy fuck. that is
//   to say that it does no work other than to act as a
//   singular window (a concept which doesn't exist in
//   this window manager, they're all just elements in
//   the dom). despite this, it works as you'd expect.
//
//  ------------------------------------------------------
//  2.  state management
//
//   the problem: react has its own lifecycle and state
//   management system. how am i, a developer, supposed
//   to integrate classes into it?
//
//   the solution: event listeners.
//   in the class, call every listener whenever something
//   important happens, and component-side, listen in
//   useEffect and set state whenever it happens. simple.
//
//  ------------------------------------------------------
//  3.  dynamicism
//   this code isn't ALL that dynamic, but it does the
//   job by not hardcoding anything at all and by being
//   reusable for systems such as notifications later on.
//
//  ------------------------------------------------------
//  conclusion
//
//  i hope this all interested u a bit and provided insight
//  into my process when programming. bye<3

export const componentMap = {
	Explorer,
	Notepad,
	NotificationSender,
	Live,
	TaskManager,
};

export interface CreateCallbackPayload {
	title: string;
	component: ComponentKeys;
	icon: string;
	id: string;
	readonly width: number;
	readonly height: number;
	frame: boolean;
	titleBarHeight: number;
	transparent: boolean;
	minWidth: number;
	minHeight: number;
}

export interface CreateCallbackData {
	type: "create";
	data: CreateCallbackPayload;
}

export interface RemoveCallbackData {
	type: "remove";
	data: { id: string };
}

export interface UpdateCallbackData {
	type: "update";
	data: { id: string };
}

export type CallbackData =
	| CreateCallbackData
	| RemoveCallbackData
	| UpdateCallbackData;

export type ComponentKeys = keyof typeof componentMap;

export class WindowManager {
	private static listeners: {
		function: (windows: Window[]) => void;
		id: string;
	}[] = [];
	private static callListeners() {
		this.listeners.forEach((l) => l.function(this.windows));
	}
	private static windowProviderCallback: (e: CallbackData) => void = () => {};
	static windows: Window[] = [];
	static create(window: Window) {
		const id = v4();
		this.windowProviderCallback({
			type: "create",
			data: {
				title: window.title,
				component: window.component,
				icon: window.icon,
				id,
				width: window.width,
				height: window.height,
				frame: window.frame,
				titleBarHeight: window.titleBarHeight,
				transparent: window.transparent,
				minWidth: window.minWidth,
				minHeight: window.minHeight,
			},
		});
		this.callListeners();
		return id;
	}
	static remove(id: string) {
		this.windowProviderCallback({
			type: "remove",
			data: {
				id,
			},
		});
		this.callListeners();
	}
	static setWindowProviderCallback(callback: (e: CallbackData) => void) {
		WindowManager.windowProviderCallback = callback;
	}
	static addWindowListener(callback: (windows: Window[]) => void) {
		const listenerId = v4();
		this.listeners.push({ function: callback, id: listenerId });
		return listenerId;
	}
	static removeWindowListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	static getWindowById(id: string) {
		return this.windows.find((w) => w.id === id);
	}
}

export interface WindowProps {
	title: string;
	component: ComponentKeys;
	icon: string;
	defaultWidth?: number;
	defaultHeight?: number;
	frame?: boolean;
	titleBarHeight?: number;
	transparent?: boolean;
	minWidth?: number;
	minHeight?: number;
}

export class Window {
	private listeners: {
		function: (window: Window, isClosing: boolean) => void;
		id: string;
	}[] = [];

	private callListeners(isClosing: boolean = false) {
		this.listeners.forEach((l) => l.function(this, isClosing));
	}

	addListener(callback: (window: Window, isClosing: boolean) => void) {
		const id = v4();
		this.listeners.push({
			function: callback,
			id,
		});
		callback(this, false); // to prevent some state issues
		return id;
	}

	removeListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}

	activity: string = "";
	id: string = "";
	title: string;
	component: ComponentKeys;
	icon: string;
	readonly width: number = 800;
	readonly height: number = 600;
	frame: boolean = true;
	titleBarHeight: number;
	transparent: boolean;
	minWidth: number = 400;
	minHeight: number = 200;
	constructor(props: WindowProps) {
		this.component = props.component;
		this.title = props.title;
		this.icon = props.icon;
		if (props.defaultWidth) this.width = props.defaultWidth;
		if (props.defaultHeight) this.height = props.defaultHeight;
		if (props.frame !== undefined) this.frame = props.frame;
		this.titleBarHeight = props.titleBarHeight || 28;
		this.transparent = props.transparent || false;
		if (props.minWidth) this.minWidth = props.minWidth;
		if (props.minHeight) this.minHeight = props.minHeight;
	}
	create() {
		WindowManager.windows.push(this);
		this.id = WindowManager.create(this);
	}
	close() {
		WindowManager.windows = WindowManager.windows.filter(
			(w) => w.id !== this.id
		);
		WindowManager.remove(this.id);
		this.callListeners(true);
	}
	setTitle(title: string) {
		this.title = title;
		this.callListeners();
	}
	setIcon(icon: string) {
		this.icon = icon;
		this.callListeners();
	}
	setActivity(activity: string) {
		this.activity = `${activity}.png`;
		this.callListeners();
	}
}
