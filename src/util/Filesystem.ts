import fs from "indexeddb-fs";
import { v4 } from "uuid";

export class MichaelsoftFS {
	private static listeners: {
		function: () => void;
		id: string;
	}[] = [];
	private static callListeners() {
		this.listeners.forEach((l) => l.function());
	}
	static addListener(callback: () => void) {
		const id = v4();
		this.listeners.push({
			function: callback,
			id,
		});
		return id;
	}
	static removeListener(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	static async copyFile(from: string, to: string) {
		this.callListeners();
		return await fs.copyFile(from, to);
	}
	static async createDirectory(path: string) {
		this.callListeners();
		return await fs.createDirectory(path);
	}
	static async details(path: string) {
		return await fs.details(path);
	}
	static async exists(path: string) {
		return await fs.exists(path);
	}
	static async fileDetails(path: string) {
		return await fs.fileDetails(path);
	}
	static async isDirectory(path: string) {
		fs.isDirectory(path);
	}
	static async isFile(path: string) {
		fs.isFile(path);
	}
	static async moveFile(from: string, to: string) {
		this.callListeners();
		return await fs.moveFile(from, to);
	}
	static async readDirectory(path: string) {
		return await fs.readDirectory(path);
	}
	static async readFile(path: string) {
		this.callListeners();
		return await fs.readFile(path);
	}
	static async removeDirectory(path: string) {
		this.callListeners();
		return await fs.removeDirectory(path);
	}
	static async removeFile(path: string) {
		this.callListeners();
		return await fs.removeFile(path);
	}
	static async renameFile(from: string, to: string) {
		this.callListeners();
		return await fs.renameFile(from, to);
	}
	static async writeFile(path: string, data: Blob) {
		this.callListeners();
		return await fs.writeFile(path, data);
	}
}
