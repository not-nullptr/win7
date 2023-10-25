import { useEffect, useState } from "react";
import { Theme, ThemingService } from "../util/ThemingService";
import styles from "../css/ThemingProvider.module.css";
import { openDB } from "idb";

function hexToRgb(hex: string): string {
	hex = hex.replace("#", "");
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((char) => char + char)
			.join("");
	}

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `rgb(${r}, ${g}, ${b})`;
}

function rgbaToHex(rgba: string): string {
	const [r, g, b, a] = rgba.match(/\d+/g)!.map(Number);
	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1, 7)}`;
}

function ThemingProvider() {
	const [theme, _] = useState<Theme>(ThemingService.getTheme());
	useEffect(() => {
		const id = ThemingService.addListener((theme) => {
			_(theme);
		});
		return () => {
			ThemingService.removeListener(id);
		};
	}, []);
	useEffect(() => {
		/*
        			case "rgb": {
				setHex(e.target.value);
				root.style.setProperty(
					"--aero-color",
					`${hexToRgb(e.target.value).replace(
						")",
						""
					)}, calc(0.7 * ${colorIntensity}%))`
				);
				break;
			}
			case "colorIntensity": {
				setColorIntensity(parseInt(e.target.value));
				root.style.setProperty(
					"--aero-color",
					`${hexToRgb(hex).replace(")", "")}, calc(0.7 * ${e.target.value}%))`
				);
				break;
			}
			case "saturation": {
				root.style.setProperty("--saturation", `${e.target.value}%`);
				break;
			}
			case "brightness": {
				root.style.setProperty("--brightness", `${e.target.value}%`);
				break;
			}
			case "background": {
				console.log("aaaa");
			}
        */
		const root = document.querySelector(":root") as HTMLElement;
		root.style.setProperty("--brightness", `${theme.brightness}%`);
		root.style.setProperty("--saturation", `${theme.saturation}%`);
		root.style.setProperty(
			"--aero-color",
			`${hexToRgb(theme.color).replace(")", "")}, calc(0.7 * ${
				theme.colorIntensity
			}%))`
		);
		root.style.setProperty("--profile-picture", `url(${theme.userPicture})`);
	}, [theme]);
	useEffect(() => {}, []);
	return (
		<div>
			<div
				className={styles.desktop}
				style={{
					background: `url(${theme.background}) center center / cover no-repeat fixed`,
				}}
			></div>
		</div>
	);
}

export default ThemingProvider;
