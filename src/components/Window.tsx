import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "../css/Window.module.css";
import { Context } from "../util/Context";
import { joinClasses } from "../util/Module";
import {
	CreateCallbackPayload,
	Window,
	WindowManager,
} from "../util/WindowManager";

export default function WindowComponent({
	map,
	win,
}: {
	map: { [key: string]: () => JSX.Element };
	win?: Window;
}) {
	const { state, setState } = useContext(Context);
	const windowFrame = useRef<HTMLDivElement>(null);
	const titlebar = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [savedTranslate, setsavedTranslate] = useState({
		x: "0",
		y: "0",
		w: "0",
		h: "0",
	});
	const [fromFullscreen, setFromFullscreen] = useState(false);
	const [fullscreenIndicator, setfullscreenIndicator] = useState(false);
	const [fullscreenOnRelease, setFullScreenOnRelease] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [resizeHandle, setResizeHandle] = useState("");
	const [initialResizePosition, setInitialResizePosition] = useState({
		x: 0,
		y: 0,
	});
	const [initialWindowSize, setInitialWindowSize] = useState({
		width: 0,
		height: 0,
	});
	const [winState, setWinState] = useState<CreateCallbackPayload>(win!);

	useEffect(() => {
		const listener = win?.addListener((e) => {
			setWinState((old) => {
				return { ...old, ...e };
			});
		});
		return () => (listener ? win?.removeListener(listener) : undefined);
	}, [win]);
	useEffect(() => {
		const windows = Array.from(
			document.getElementsByClassName(styles.windowFrame)
		) as HTMLDivElement[];
		windows.forEach((w) => {
			w.classList.add(styles.unfocused);
		});
		windowFrame.current!.classList.remove(styles.unfocused);
		windowFrame.current!.style.zIndex = `${state.zIndex + 1}`;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const refresh = () => {
		const windows = Array.from(
			document.getElementsByClassName(styles.windowFrame)
		) as HTMLDivElement[];
		let highest = 0;
		windows.forEach((w) => {
			const zindex = Number(w.style.zIndex);
			if (zindex > highest) {
				highest = zindex;
			}
		});
		if (Number(windowFrame.current?.style.zIndex) >= highest) {
			windowFrame.current?.classList.remove(styles.unfocused);
		} else {
			windowFrame.current?.classList.add(styles.unfocused);
		}
	};

	useEffect(() => {
		if (!windowFrame.current || !titlebar.current) return;
		refresh();
		const handleMouseDown = (e: MouseEvent) => {
			refresh();
			windowFrame.current!.style.zIndex = `${state.zIndex + 1}`;
			setState({
				...state,
				zIndex: state.zIndex + 1,
			});

			if (e.target === titlebar.current) {
				if (windowFrame.current!.classList.contains(styles.fullscreen)) {
					setFromFullscreen(true);
				}
				setIsDragging(true);
				setPosition({
					x: e.clientX - windowFrame.current!.getBoundingClientRect().left,
					y: e.clientY - windowFrame.current!.getBoundingClientRect().top,
				});
			} else {
				const resizeHandles = [
					styles.leftHandle,
					styles.rightHandle,
					styles.topHandle,
					styles.bottomHandle,
					styles.topLeft,
					styles.topRight,
					styles.bottomLeft,
					styles.bottomRight,
				];

				const handle = resizeHandles.find((handleClass) =>
					(e.target as HTMLDivElement)?.classList.contains(handleClass)
				);

				if (handle) {
					setIsResizing(true);
					setResizeHandle(handle);
					setInitialResizePosition({
						x: e.clientX,
						y: e.clientY,
					});
					setInitialWindowSize({
						width: windowFrame.current!.getBoundingClientRect().width,
						height: windowFrame.current!.getBoundingClientRect().height,
					});
				}
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (isResizing) {
				const deltaX = e.clientX - initialResizePosition.x;
				const deltaY = e.clientY - initialResizePosition.y;
				let newWidth = initialWindowSize.width;
				let newHeight = initialWindowSize.height;

				switch (resizeHandle) {
					case styles.leftHandle:
						newWidth -= deltaX;
						windowFrame.current!.style.left = `${e.clientX}px`;
						break;
					case styles.rightHandle:
						newWidth += deltaX;
						break;
					case styles.topHandle:
						newHeight -= deltaY;
						windowFrame.current!.style.top = `${e.clientY}px`;
						break;
					case styles.bottomHandle:
						newHeight += deltaY;
						break;
					case styles.topLeft:
						newWidth -= deltaX;
						newHeight -= deltaY;
						windowFrame.current!.style.top = `${e.clientY}px`;
						windowFrame.current!.style.left = `${e.clientX}px`;
						break;
					case styles.topRight:
						newWidth += deltaX;
						newHeight -= deltaY;
						windowFrame.current!.style.top = `${e.clientY}px`;
						break;
					case styles.bottomLeft:
						newWidth -= deltaX;
						newHeight += deltaY;
						windowFrame.current!.style.left = `${e.clientX}px`;
						break;
					case styles.bottomRight:
						newWidth += deltaX;
						newHeight += deltaY;
						break;
					default:
						break;
				}

				if (newWidth < winState?.minWidth) newWidth = winState?.minWidth;
				if (newHeight < winState?.minHeight) newHeight = winState?.minHeight;
				windowFrame.current!.style.width = `${newWidth}px`;
				windowFrame.current!.style.height = `${newHeight}px`;
				return;
			}
			if (isDragging) {
				const newX = e.clientX - position.x;
				let newY = e.clientY - position.y;
				if (newY < 0) newY = 0;
				const preview = document.getElementsByClassName(
					"fullscreen-preview"
				)[0] as HTMLDivElement;
				if (e.clientY < 3 && !fullscreenIndicator) {
					setfullscreenIndicator(true);
					setFullScreenOnRelease(true);
					const el = document.createElement("div");
					el.classList.add(styles.fullscreenIndicator);
					el.style.left = `${e.clientX - 26}px`;
					el.style.top = "-18px";
					document.getElementById("root")!.appendChild(el);
					setTimeout(() => {
						el.remove();
					}, 500);
					preview.style.marginLeft = `${
						Number(windowFrame.current!.style.left.replace("px", "")) - 8
					}px`;
					preview.style.marginTop = `${
						Number(windowFrame.current!.style.top.replace("px", "")) - 8
					}px`;
					const computed = window.getComputedStyle(windowFrame.current!);
					preview.style.transition = "none";
					preview.classList.remove(styles.fade);
					preview.style.width = computed.width;
					preview.style.height = computed.height;
					preview.classList.remove(styles.scaleTo100);
					preview.offsetWidth;
					preview.classList.add(styles.scaleTo100);
				} else if (newY >= 3) {
					setfullscreenIndicator(false);
					setFullScreenOnRelease(false);
					preview.style.transition = "";
					preview.classList.add(styles.fade);
				}

				if (
					!fromFullscreen &&
					!windowFrame.current!.classList.contains(styles.fullscreen)
				) {
					windowFrame.current!.style.left = `${newX}px`;
					windowFrame.current!.style.top = `${newY}px`;
				} else {
					const width = Number(
						window
							.getComputedStyle(windowFrame.current!)
							.width.replace("px", "")
					);
					windowFrame.current!.style.left = `${
						e.clientX - width + width / 2
					}px`;
					windowFrame.current!.style.top = `${newY}px`;
				}
				if (windowFrame.current!.classList.contains(styles.fullscreen)) {
					windowFrame.current!.style.width = savedTranslate.w;
					windowFrame.current!.style.height = savedTranslate.h;
					windowFrame.current!.style.left = `${e.clientX}px`;
					windowFrame.current!.style.top = `${e.clientY}px`;
					setFromFullscreen(true);
					windowFrame.current!.classList.remove(styles.fullscreen);
				}
				(
					windowFrame.current!.getElementsByClassName(
						styles.windowFrameFg
					)[0] as HTMLDivElement
				).style.backgroundPosition = `${newX / 6}px ${newY / 8}px`;
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setFromFullscreen(false);
			setIsResizing(false);
			setResizeHandle("");
			if (fullscreenOnRelease) {
				const preview = document.getElementsByClassName(
					"fullscreen-preview"
				)[0] as HTMLDivElement;
				setFullScreenOnRelease(false);
				setsavedTranslate({
					x: windowFrame.current!.style.left,
					y: windowFrame.current!.style.top,
					w: windowFrame.current!.style.width,
					h: windowFrame.current!.style.height,
				});
				windowFrame.current!.style.top = "0px";
				windowFrame.current!.style.left = "0px";
				windowFrame.current!.style.width = `${window.innerWidth}px`;
				windowFrame.current!.style.height = `${window.innerHeight - 40}px`;
				windowFrame.current!.classList.add(styles.fullscreen);
				preview.style.transition = "";
				preview.classList.add(styles.fade);
			}
		};

		windowFrame.current!.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			if (windowFrame.current)
				// eslint-disable-next-line react-hooks/exhaustive-deps
				windowFrame.current!.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [
		isResizing,
		isDragging,
		position,
		state.zIndex,
		fromFullscreen,
		fullscreenIndicator,
		winState,
		state,
		setState,
		initialResizePosition.x,
		initialResizePosition.y,
		initialWindowSize.width,
		initialWindowSize.height,
		resizeHandle,
		savedTranslate.w,
		savedTranslate.h,
		fullscreenOnRelease,
	]);

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
			<div className={joinClasses(styles.handle, styles.leftHandle)} />
			<div className={joinClasses(styles.handle, styles.rightHandle)} />
			<div className={joinClasses(styles.handle, styles.topHandle)} />
			<div className={joinClasses(styles.handle, styles.bottomHandle)} />
			<div className={joinClasses(styles.handle, styles.topLeft)} />
			<div className={joinClasses(styles.handle, styles.topRight)} />
			<div className={joinClasses(styles.handle, styles.bottomLeft)} />
			<div className={joinClasses(styles.handle, styles.bottomRight)} />
			<div
				style={{
					height: windowFrame.current?.classList.contains(styles.fullscreen)
						? 20
						: 28,
				}}
				className={joinClasses(styles.titleBar)}
				ref={titlebar}
			>
				<img
					src={`/icons/window/${winState?.icon}`}
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
				<div className={styles.buttonContainer}>
					<div className={styles.windowButtons}>
						<div
							className={joinClasses(styles.windowButton, styles.minimize)}
						/>
						<div
							className={joinClasses(styles.windowButton, styles.maximize)}
							onClick={() => {
								if (
									windowFrame.current!.classList.contains(styles.fullscreen)
								) {
									windowFrame.current!.style.left = savedTranslate.x;
									windowFrame.current!.style.top = savedTranslate.y;
									windowFrame.current!.style.width = savedTranslate.w;
									windowFrame.current!.style.height = savedTranslate.h;
									windowFrame.current!.classList.remove(styles.fullscreen);
								} else {
									setsavedTranslate({
										x: windowFrame.current!.style.left,
										y: windowFrame.current!.style.top,
										w: windowFrame.current!.style.width,
										h: windowFrame.current!.style.height,
									});
									windowFrame.current!.style.top = "0px";
									windowFrame.current!.style.left = "0px";
									windowFrame.current!.style.width = `${window.innerWidth}px`;
									windowFrame.current!.style.height = `${
										window.innerHeight - 40
									}px`;
									windowFrame.current!.classList.add(styles.fullscreen);
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
			</div>
			{winState?.transparent ? (
				React.createElement((map as any)[winState?.component || "Explorer"], {
					win,
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
						{winState?.component
							? React.createElement((map as any)[winState?.component], {
									win: WindowManager.getWindowById(winState?.id),
							  })
							: null}
					</div>
				</div>
			)}
			<div className={styles.windowFrameBg} />
			<div className={styles.windowFrameFg} />
		</div>
	);
}
