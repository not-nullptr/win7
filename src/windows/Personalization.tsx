import styles from "../css/Personalization.module.css";
import { ThemingService } from "../util/ThemingService";

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

function Personalization() {
	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		ThemingService.modifyTheme({
			[e.target.name]: e.target.value,
		});
	}
	function onImageClick(name: string) {
		const input = document.createElement("input");
		input.type = "file";
		input.name = name;
		input.accept = "image/*";
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			handleChange({
				target: {
					name: name,
					value: URL.createObjectURL(file),
				},
			} as any); // scuffed, i know
		};
		input.click();
	}
	const initialTheme = ThemingService.getTheme();
	return (
		<div className={styles.window}>
			<h1>Personalize your theme (wip)</h1>
			<div className={styles.picker}>
				<div>Color</div>
				<input
					type="color"
					name="color"
					defaultValue={initialTheme.color}
					onChange={handleChange}
				/>
			</div>
			<div className={styles.picker}>
				<div>Color intensity</div>
				<input
					defaultValue={initialTheme.colorIntensity}
					type="range"
					min="0"
					max="100"
					name="colorIntensity"
					onChange={handleChange}
				/>
			</div>
			<div className={styles.picker}>
				<div>Saturation</div>
				<input
					defaultValue={initialTheme.saturation}
					type="range"
					min="0"
					max="100"
					name="saturation"
					onChange={handleChange}
				/>
			</div>
			<div className={styles.picker}>
				<div>Brightness</div>
				<input
					defaultValue={initialTheme.brightness}
					type="range"
					min="0"
					max="100"
					name="brightness"
					onChange={handleChange}
				/>
			</div>
			<div className={styles.picker}>
				<div>Background</div>
				<button
					onClick={() => {
						onImageClick("background");
					}}
				>
					Select file
				</button>
			</div>
			<div className={styles.picker}>
				<div>User Picture</div>
				<button
					onClick={() => {
						onImageClick("userPicture");
					}}
				>
					Select file
				</button>
			</div>
		</div>
	);
}

export default Personalization;
