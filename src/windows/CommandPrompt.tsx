import { Window } from "../util/WindowManager";
import styles from "../css/CommandPrompt.module.css";

function CommandPrompt({ win }: { win: Window }) {
	return (
		<div className={styles.window}>
			<div>Michaelsoft Binbows [Version 6.1.7601.17514]</div>
			<div>This soft</div>
		</div>
	);
}

export default CommandPrompt;
