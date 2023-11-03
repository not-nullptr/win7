import { Process } from "./Process";
import { WindowProps } from "./WindowManager";

import GettingStarted from "../windows/GettingStarted";
import Live from "../windows/live/Live";
import Personalization from "../windows/Personalization";
import Minesweeper from "../windows/minesweeper/Minesweeper";
import CommandPrompt from "../windows/CommandPrompt";
import NotificationSender from "../windows/NotificationSender";
import Notepad from "../windows/Notepad";
import Explorer from "../windows/Explorer";
import TaskManager from "../windows/TaskManager";
import Chrome from "../windows/chrome/Chrome";
import VirtualMachine from "../windows/VirtualMachine";

export class Program {
	constructor(
		public mainWindow: WindowProps,
		public name: string,
		public icon: string,
	) {}
	spawn() {
		return new Process(this);
	}
}

export const programs = [
	new Program(
		{
			title: "Getting Started",
			component: GettingStarted,
			icon: "getting-started.png",
			defaultWidth: 971,
			defaultHeight: 603,
			minWidth: 718,
			minHeight: 230,
		},
		"Getting Started",
		"getting-started.png",
	),
	new Program(
		{
			title: "Binbows Live Messenger",
			component: Live,
			icon: "msn.png",
			minWidth: 270,
			minHeight: 600,
			defaultWidth: 270,
			defaultHeight: 600,
			initialPath: "/live",
		},
		"Binbows Live Messenger",
		"msn.png",
	),
	new Program(
		{
			title: "Personalization",
			component: Personalization,
			icon: "personalization.png",
			defaultWidth: 400,
			defaultHeight: 300,
			minWidth: 400,
			minHeight: 300,
		},
		"Personalization",
		"personalization.png",
	),
	new Program(
		{
			title: "Minesweeper",
			component: Minesweeper,
			icon: "minesweeper.png",
			initialPath: "/singleplayer",
			defaultWidth: 180,
			defaultHeight: 240,
			minWidth: 180,
			minHeight: 240,
		},
		"Minesweeper",
		"minesweeper.png",
	),
	new Program(
		{
			title: "Live for Binbows - Minesweeper",
			component: Minesweeper,
			icon: "minesweeper.png",
			initialPath: "/multiplayer",
			defaultWidth: 376,
			defaultHeight: 240,
			minWidth: 376,
			minHeight: 240,
		},
		"Minesweeper for Two",
		"minesweeper.png",
	),
	new Program(
		{
			title: "Command Prompt",
			component: CommandPrompt,
			icon: "command-prompt.png",
			defaultWidth: 678,
			defaultHeight: 345,
		},
		"Command Prompt",
		"command-prompt.png",
	),
	new Program(
		{
			title: "Notification Sender",
			component: NotificationSender,
			icon: "../main/tray-service.png",
			defaultWidth: 500,
			defaultHeight: 300,
		},
		"Notification Sender",
		"../main/tray-service.png",
	),
	new Program(
		{
			title: "Notepad",
			component: Notepad,
			icon: "notepad.png",
		},
		"Notepad",
		"notepad.png",
	),
	new Program(
		{
			title: "Explorer",
			component: Explorer,
			icon: "explorer.png",
			titleBarHeight: 58,
			transparent: true,
		},
		"Explorer",
		"explorer.png",
	),
	new Program(
		{
			title: "Windows 7",
			component: VirtualMachine,
			icon: "seven.png",
			defaultWidth: 1280,
			defaultHeight: 720,
			frame: false,
		},
		"Windows 7",
		"seven.png",
	),
	new Program(
		{
			title: "Google Chrome",
			component: Chrome,
			icon: "chrome.png",
			defaultWidth: 1280,
			defaultHeight: 720,
			minWidth: 400,
			minHeight: 300,
			titleBarHeight: 58,
			transparent: true,
		},
		"Google Chrome",
		"chrome.png",
	),
	new Program(
		{
			title: "Test Application",
			component: TaskManager,
			icon: "test-app.png",
		},
		"Test Application",
		"test-app.png",
	),
];
