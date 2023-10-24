import { v4 } from "uuid";

export interface Theme {
	background: string;
	colorIntensity: number;
	saturation: number;
	brightness: number;
	color: string;
	userPicture: string;
}

export class ThemingService {
	private static theme: Theme = {
		background: "/bg.jpg",
		colorIntensity: 50,
		saturation: 43,
		brightness: 65,
		color: "#74b8fc",
		userPicture: "/user.bmp",
	};
	private static listeners: {
		function: (theme: Theme) => void;
		id: string;
	}[] = [];
	private static callListeners() {
		this.listeners.forEach((l) => l.function(this.theme));
	}
	static addListener(callback: (theme: Theme) => void) {
		const id = v4();
		ThemingService.listeners.push({
			function: callback,
			id,
		});
		return id;
	}
	static removeListener(id: string) {
		ThemingService.listeners = ThemingService.listeners.filter(
			(l) => l.id !== id
		);
	}
	static modifyTheme(theme: Partial<Theme>) {
		ThemingService.theme = { ...ThemingService.theme, ...theme };
		ThemingService.callListeners();
	}
	static getTheme() {
		return ThemingService.theme;
	}
}
