import { useEffect, useState } from "react";
import folderSmall from "../assets/explorer/folder-small.png";
import DirectorySearch from "../components/DirectorySearch";
import styles from "../css/Explorer.module.css";
import { CreateCallbackPayload, Window } from "../util/WindowManager";

// function File({ name }: { name: string }) {
// 	return (
// 		<ul>
// 			<li className={styles.sidebarItem}>
// 				<div className={styles.sidebarUlItem}>
// 					<img src={folderSmall} />
// 					<span>{name.replace("/", "")}</span>
// 				</div>
// 			</li>
// 		</ul>
// 	);
// }

function Explorer({ win }: { win: Window }) {
	const [winState, setWinState] = useState<CreateCallbackPayload>(win!);
	useEffect(() => {
		// win?.setOnChange((e) =>
		// 	setWinState((old) => {
		// 		return { ...old, ...e };
		// 	})
		// );
		const listener = win?.addListener((e) => {
			setWinState((old) => {
				return { ...old, ...e };
			});
		});
		return () => win?.removeListener(listener);
	}, [win]);
	return (
		<div className={styles.window}>
			<div
				className={styles.windowContent}
				style={{
					marginTop: winState.titleBarHeight,
					height: `calc(100% - ${winState.titleBarHeight}px)`,
				}}
			>
				<div
					style={{
						height: winState.titleBarHeight,
						marginTop: -winState.titleBarHeight,
					}}
					className={styles.titleBarExtension}
				>
					<div className={styles.titleBarElements}>
						<div className={styles.titleBarNavigation}>
							<div className={styles.titleBarNavigationButton} />
							<div className={styles.titleBarNavigationButton} />
						</div>
						<DirectorySearch path="/Documents/Not porn/0000.mp4" />
						<input
							placeholder={`Search Not porn...`}
							className={styles.search}
							type="text"
						/>
					</div>
				</div>
				<div className={styles.toolbarLarge} />
				<div
					style={{
						display: "flex",
						width: "100%",
						height: "calc(100% - 32px)",
					}}
				>
					<ul className={styles.sidebar}>
						<li className={styles.sidebarItem}>
							<div className={styles.sidebarUlItem}>
								<img src={folderSmall} />
								<span>[root]</span>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

export default Explorer;
