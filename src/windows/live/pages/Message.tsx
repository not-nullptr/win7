import { useSearchParams } from "react-router-dom";
import { Window } from "../../../util/WindowManager";
import { State } from "./Home";
import { useEffect, useState } from "react";
import styles from "../../../css/Message.module.css";
function Message({ win }: { win?: Window }) {
	const [params] = useSearchParams();
	const [liveState, setLiveStateWithoutBroadcast] = useState<State>(
		JSON.parse(params.get("initialState") || "{}")
	);
	const user = liveState.connections.find((c) => c.id === params.get("user"));
	const setLiveState = (state: State) => {
		setLiveStateWithoutBroadcast(state);
		win?.broadcast("live-state", state);
	};
	useEffect(() => {
		if (!win) return;
		const id = win.onMessage("live-state", (state) => {
			setLiveStateWithoutBroadcast(state);
		});
		return () => {
			win.removeMessageListener(id);
		};
	}, [win]);
	if (!user) return <></>;
	return (
		<div className={styles.window}>
			<div className={styles.content}>
				<div className={styles.toolbarContainer}>
					<div className={styles.toolbar} />
				</div>
				<div>a</div>
			</div>
			<div className={styles.backgroundContainer}>
				<div className={styles.backgroundImage} />
				<div className={styles.background} />
			</div>
		</div>
	);
}

export default Message;
