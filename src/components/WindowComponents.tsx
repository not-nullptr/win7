import React from "react";
import { CreateCallbackPayload, Window } from "../util/WindowManager";
import { WindowManager } from "../util/WindowManager";
import styles from "../css/Window.module.css";
import { joinClasses } from "../util/Module";

export function WindowContents({
	winState,
	children,
}: {
	winState: CreateCallbackPayload;
	children: React.ReactNode;
}) {
	return winState?.transparent ? (
		React.cloneElement(children as any, {
			win: WindowManager.getWindowById(winState?.id),
		})
	) : (
		<div className={styles.contentsContainer}>
			<div
				className={styles.windowContents}
				style={{
					boxShadow: winState?.transparent ? "none" : undefined,
					border: winState?.transparent ? "none" : undefined,
					marginTop: winState?.transparent
						? -26
						: winState?.titleBarHeight - 28,
					height: winState?.transparent
						? "calc(100% + 26px)"
						: `calc(100% - ${winState?.titleBarHeight - 28}px)`,
					borderRadius: winState?.transparent ? 0 : undefined,
					background: winState?.transparent ? "transparent" : undefined,
				}}
			>
				{React.cloneElement(children as any, {
					win: WindowManager.getWindowById(winState?.id),
				})}
			</div>
		</div>
	);
}

export function WindowHandles() {
	return (
		<div>
			<div className={joinClasses(styles.handle, styles.leftHandle)} />
			<div className={joinClasses(styles.handle, styles.rightHandle)} />
			<div className={joinClasses(styles.handle, styles.topHandle)} />
			<div className={joinClasses(styles.handle, styles.bottomHandle)} />
			<div className={joinClasses(styles.handle, styles.topLeft)} />
			<div className={joinClasses(styles.handle, styles.topRight)} />
			<div className={joinClasses(styles.handle, styles.bottomLeft)} />
			<div className={joinClasses(styles.handle, styles.bottomRight)} />
		</div>
	);
}

export function WindowButtons({
	winState,
	savedTranslate,
	setsavedTranslate,
}: {
	winState: CreateCallbackPayload;
	savedTranslate: { x: string; y: string; w: string; h: string };
	setsavedTranslate: React.Dispatch<
		React.SetStateAction<{ x: string; y: string; w: string; h: string }>
	>;
}) {
	const windowFrame = document.getElementById(winState?.id) as HTMLDivElement;
	const win = WindowManager.getWindowById(winState?.id);
	if (!windowFrame) return <></>;
	return (
		<div className={styles.buttonContainer}>
			<div className={styles.windowButtons}>
				<div
					className={joinClasses(styles.windowButton, styles.minimize)}
					onClick={() => {
						const taskbarItem = document.getElementById(
							`icon-${winState?.id}`,
						) as HTMLDivElement;
						if (!taskbarItem || !windowFrame) return;
						const box = taskbarItem.getBoundingClientRect();
						const windowBox = windowFrame.getBoundingClientRect();
						windowFrame.style.transformOrigin = `${
							box.left - windowBox.left + box.width / 2
						}px ${box.top - windowBox.top + box.height / 2}px`;

						windowFrame.animate(
							[
								{
									transform: `scale(1)`,
									opacity: 1,
								},
								{
									transform: `scale(0.5)`,
									opacity: 0,
								},
							],
							{
								duration: 200,
								easing: "ease-out",
							},
						).onfinish = () => {
							windowFrame.classList.remove(styles.fullscreen);
							windowFrame.classList.add(styles.minimized);
						};
					}}
				/>
				<div
					className={joinClasses(styles.windowButton, styles.maximize)}
					onClick={() => {
						if (windowFrame.classList.contains(styles.fullscreen)) {
							windowFrame.style.left = savedTranslate.x;
							windowFrame.style.top = savedTranslate.y;
							windowFrame.style.width = savedTranslate.w;
							windowFrame.style.height = savedTranslate.h;
							windowFrame.classList.remove(styles.fullscreen);
						} else {
							setsavedTranslate({
								x: windowFrame.style.left,
								y: windowFrame.style.top,
								w: windowFrame.style.width,
								h: windowFrame.style.height,
							});
							windowFrame.style.top = "0px";
							windowFrame.style.left = "0px";
							windowFrame.style.width = `${window.innerWidth}px`;
							windowFrame.style.height = `${window.innerHeight - 40}px`;
							windowFrame.classList.add(styles.fullscreen);
						}
					}}
				/>
				<div
					onClick={() => {
						win?.close();
					}}
					className={joinClasses(styles.windowButton, styles.close)}
				/>
			</div>
		</div>
	);
}
