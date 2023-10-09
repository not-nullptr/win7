import styles from "../css/Notepad.module.css";
import { Window } from "../util/WindowManager";

function Notepad({ win }: { win: Window }) {
	return (
		<div className="window-content-container">
			<div className={styles.toolbar} />
			<textarea
				className={styles.notepad}
				onChange={(e) => {
					if (e.target.value.startsWith("set title to ")) {
						win.setTitle(e.target.value.slice(13));
					} else {
						win.setTitle("Notepad");
					}
				}}
			/>
		</div>
	);
}

export default Notepad;
