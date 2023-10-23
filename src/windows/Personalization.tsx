import { Window } from "../util/WindowManager";
import styles from "../css/Personalization.module.css";
import { useState } from "react";

/*
	--saturation: 43%;
	--brightness: 65%;
    --intensity: 50%;
	--aero-color: rgba(116, 184, 252, calc(0.7 * var(--intensity))); // x = 0.7 * (y / 100)    where x is the desired opacity and y is the intensity, 0 - 100
	--aero-accent: color-mix(
		in srgb,
		#000,
		color-mix(in srgb, var(--aero-color) var(--saturation), transparent)
			var(--brightness)
	);
*/
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

function Personalization({ win }: { win?: Window }) {
	const root = document.querySelector(":root") as HTMLElement;
	const computed = getComputedStyle(root);
	const [hex, setHex] = useState(
		rgbaToHex(getComputedStyle(root).getPropertyValue("--aero-color"))
	);
	const [colorIntensity, setColorIntensity] = useState(
		parseInt(computed.getPropertyValue("--intensity").replace("%", ""))
	);
	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		switch (e.target.name) {
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
		}
	}
	return (
		<div className={styles.window}>
			<h1>Personalize your theme (wip)</h1>
			<div className={styles.picker}>
				<div>Color</div>
				<input
					type="color"
					name="rgb"
					onChange={handleChange}
					defaultValue={hex}
				/>
			</div>
			<div className={styles.picker}>
				<div>Color intensity</div>
				<input
					type="range"
					min="0"
					max="100"
					name="colorIntensity"
					defaultValue={colorIntensity.toString()}
					onChange={handleChange}
				/>
			</div>
			<div className={styles.picker}>
				<div>Saturation</div>
				<input
					type="range"
					min="0"
					max="100"
					name="saturation"
					onChange={handleChange}
					defaultValue={computed
						.getPropertyValue("--saturation")
						.replace("%", "")}
				/>
			</div>
			<div className={styles.picker}>
				<div>Brightness</div>
				<input
					type="range"
					min="0"
					max="100"
					name="brightness"
					onChange={handleChange}
					defaultValue={computed
						.getPropertyValue("--brightness")
						.replace("%", "")}
				/>
			</div>
		</div>
	);
}

export default Personalization;
