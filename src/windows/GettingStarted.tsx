import styles from "../css/GettingStarted.module.css";
import headerImage from "../assets/getting-started/seven-pc.png";
import { useEffect, useState } from "react";
import { Program } from "../util/Program";
import { Window } from "../util/WindowManager";

function GettingStarted({ win }: { win: Window }) {
	const [programs, setPrograms] = useState<Program[]>([]);
	useEffect(() => {
		import("../App").then((a) => {
			setPrograms(a.programs);
		});
	}, []);
	useEffect(() => {
		win?.setLink(
			"Join the r/unixporn Discord server",
			"https://discord.gg/unixporn",
		);
	}, [win]);
	return (
		<div className={styles.window}>
			<div className={styles.header}>
				<span className={styles.binbowsText}>binbows</span>
				<img src={headerImage} />
				<div>
					<h1>Welcome to Binbows 7</h1>
					<ul>
						<li>This is a recreation of Windows 7 written in React.</li>
						<li>
							Originally aiming to be a UI study for the Aero era of operating
							system design, it has since become a more feature complete{" "}
							<a
								href="https://en.wikipedia.org/wiki/Webtop"
								target="_blank"
								rel="noreferrer"
							>
								webtop (web desktop)
							</a>
							.
						</li>
						<li>
							Some applications are functional. Play a game of Minesweeper, or
							open Binbows Live Messenger and chat to your friends like it's
							2009!
						</li>
					</ul>
				</div>
			</div>
			<div className={styles.programs}>
				{programs.map((p, i) => (
					<div
						key={i}
						className={styles.program}
						onMouseDown={(e) => {
							const target = e.target as HTMLDivElement;
							target
								.closest(`.${styles.programs}`)
								?.querySelectorAll(`.${styles.program}`)
								.forEach((p) => {
									p.classList.remove(styles.active);
								});
							target
								.closest(`.${styles.program}`)
								?.classList.add(styles.active);
						}}
						onDoubleClick={() => {
							p.spawn();
						}}
					>
						<img src={`${import.meta.env.BASE_URL}icons/main/${p.icon}`} />
						<div>{p.name}</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default GettingStarted;
