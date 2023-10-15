import { useEffect, useState } from "react";
import styles from "../css/Time.module.css";

export default function Time() {
	const [time, setTime] = useState(new Date());
	useEffect(() => {
		const id = setInterval(() => {
			setTime(new Date());
		}, 1000);
		return () => {
			clearInterval(id);
		};
	}, []);
	return (
		<div className={styles.timeContainer}>
			<div className={styles.time}>{`${time
				.getHours()
				.toString()
				.padStart(2, "0")}:${time
				.getMinutes()
				.toString()
				.padStart(2, "0")}`}</div>
			<div className={styles.date}>{`${time
				.getDate()
				.toString()
				.padStart(2, "0")}/${(time.getMonth() + 1)
				.toString()
				.padStart(2, "0")}/${time.getFullYear()}`}</div>
		</div>
	);
}
