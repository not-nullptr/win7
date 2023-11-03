import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "../css/Window.module.css";
import { Context } from "../util/Context";
import { joinClasses } from "../util/Module";
import { CreateCallbackPayload, Window } from "../util/WindowManager";
import {
	WindowButtons,
	WindowContents,
	WindowHandles,
} from "./WindowComponents";
import { useSize, useWindowManagement } from "./hooks/hooks";

export default function WindowComponent({
	win,
	children,
}: {
	win?: Window;
	children: React.ReactNode;
}) {
	const [winState, setWinState] = useState<CreateCallbackPayload>(win!);
	const { state, setState } = useContext(Context);
	const windowFrame = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const listener = win?.addListener((e) => {
			setWinState((old) => {
				return { ...old, ...e };
			});
		});
		return () => (listener ? win?.removeListener(listener) : undefined);
	}, [win]);
	useEffect(() => {
		if (!windowFrame.current) return;
		const windows = Array.from(
			document.getElementsByClassName(styles.windowFrame),
		) as HTMLDivElement[];
		windows.forEach((w) => {
			w.classList.add(styles.unfocused);
		});
		windowFrame.current.classList.remove(styles.unfocused);
		windowFrame.current.style.zIndex = `${state.zIndex + 1}`;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		// set z index
		if (!windowFrame.current) return;
		windowFrame.current.style.zIndex = `${state.zIndex + 1}`;
		setState({
			...state,
			zIndex: state.zIndex + 1,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		if (!windowFrame.current) return;
		windowFrame.current.style.top = `${
			window.innerHeight / 2 - winState?.height / 2 - 24
		}px`;
		windowFrame.current.style.left = `${
			window.innerWidth / 2 - winState?.width / 2
		}px`;
	}, [winState?.width, winState?.height]);

	const [savedTranslate, setsavedTranslate] = useWindowManagement(
		winState,
		windowFrame,
	);
	const size = useSize(windowFrame);
	return (
		<div
			style={{
				width: winState?.width,
				height: winState?.height,
			}}
			className={styles.windowFrame}
			id={winState?.id}
			ref={windowFrame}
		>
			<WindowHandles />
			<div
				style={{
					height: winState?.titleBarHeight || 28,
				}}
				className={joinClasses(styles.titleBar)}
			>
				<img
					src={`${import.meta.env.BASE_URL}icons/window/${winState?.icon}`}
					className={styles.windowIcon}
					style={{
						visibility: winState?.titleBarHeight === 28 ? "visible" : "hidden",
					}}
				/>
				<div
					style={{
						visibility: winState?.titleBarHeight === 28 ? "visible" : "hidden",
					}}
					className={styles.windowTitle}
					data-text={winState?.title}
				>
					{winState?.title}
				</div>
				<div className={styles.linkContainer}>
					<a
						href={winState?.link.link}
						className={styles.link}
						target="_blank"
						rel="noreferrer"
					>
						{winState?.link.text}
					</a>
				</div>
				<WindowButtons
					savedTranslate={savedTranslate}
					setsavedTranslate={setsavedTranslate}
					winState={winState}
				/>
			</div>
			<div
				style={{
					maxWidth: size.w,
					maxHeight: size.h,
				}}
				className={styles.windowFrameGradientLeft}
			/>
			<div
				style={{
					maxWidth: size.w,
					maxHeight: size.h,
				}}
				className={styles.windowFrameGradientRight}
			/>

			<WindowContents winState={winState}>{children}</WindowContents>
		</div>
	);
}
