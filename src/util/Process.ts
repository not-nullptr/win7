import { v4 } from "uuid";
import { Notification } from "./NotificationService";
import { Program } from "./Program";
import { TrayService } from "./TrayService";
import { Window, WindowProps } from "./WindowManager";

export class Process {
	pid: string;
	name: string;
	program: Program;
	private windows: Window[] = [];
	constructor(program: Program) {
		this.pid = v4();
		this.name = program.name;
		this.program = program;
		this.addWindow(program.mainWindow);
		ProcessManager.addProcess(this);
	}
	destroy() {
		this.windows.forEach((w) => w.close());
		ProcessManager.removeProcess(this.pid);
		ProcessManager.callListeners();
	}
	getWindows() {
		return this.windows;
	}
	addWindow(window: WindowProps) {
		const newWindow = new Window(window);
		newWindow.create();
		this.windows.push(newWindow);
		console.log(newWindow);
		newWindow.addListener((w, isClosing) => {
			if (isClosing) {
				this.windows = this.windows.filter((win) => w.id !== win.id);
			}
			if (this.windows.length === 0) {
				this.destroy();
			}
		});
		ProcessManager.callListeners();
	}
	removeWindow(id: string) {
		const win = this.windows.find((w) => w.id === id);
		if (!win) return;
		win.close();
		this.windows = this.windows.filter((w) => w.id !== id);
		ProcessManager.callListeners();
	}
}

export class ProcessManager {
	private static processes: Process[] = [];
	private static listeners: {
		function: (processes: Process[]) => void;
		id: string;
	}[] = [];
	static callListeners() {
		this.listeners.forEach((l) => l.function(this.processes));
	}
	static addListener(callback: (processes: Process[]) => void) {
		const id = v4();
		ProcessManager.listeners.push({
			function: callback,
			id,
		});
		return id;
	}
	static removeListener(id: string) {
		ProcessManager.listeners = ProcessManager.listeners.filter(
			(l) => l.id !== id
		);
	}
	static addProcess(process: Process) {
		ProcessManager.processes.push(process);
		ProcessManager.callListeners();
		new Notification({
			title: process.name,
			message: "Process started",
			icon: process.program.icon,
			trayId: TrayService.getItems()[0].id,
		}).show();
	}
	static removeProcess(id: string) {
		ProcessManager.processes = ProcessManager.processes.filter(
			(p) => p.pid !== id
		);
		ProcessManager.callListeners();
	}
	static getProcesses() {
		return ProcessManager.processes;
	}
	static getProcessById(id: string) {
		return ProcessManager.processes.find((p) => p.pid === id);
	}
}
