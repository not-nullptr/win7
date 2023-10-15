import { Process } from "./Process";
import { WindowProps } from "./WindowManager";

export class Program {
	constructor(
		public mainWindow: WindowProps,
		public name: string,
		public icon: string
	) {}
	spawn() {
		return new Process(this);
	}
}
