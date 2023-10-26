import { useContext, useEffect, useRef, useState } from "react";
import { CreateCallbackPayload, Window } from "../../util/WindowManager";
import { Context } from "../../util/Context";
import styles from "../../css/Window.module.css";

export function useWindowState(win: Window) {
	const [winState, setWinState] = useState<Window | null>(win);
	useEffect(() => {
		const id = win?.addListener((win, isClosing) => {
			if (isClosing) return setWinState(null);
			setWinState(win);
		});
		return () => {
			win?.removeListener(id || "");
		};
	}, []);
	return winState;
}

export function useWindowManagement(
	winState: CreateCallbackPayload,
	windowFrame: React.RefObject<HTMLDivElement>,
): [
	{
		x: string;
		y: string;
		w: string;
		h: string;
	},
	React.Dispatch<
		React.SetStateAction<{
			x: string;
			y: string;
			w: string;
			h: string;
		}>
	>,
] {
	const [savedTranslate, setsavedTranslate] = useState({
		x: "0",
		y: "0",
		w: "0",
		h: "0",
	});
	const { state, setState } = useContext(Context);
	const [isDragging, setIsDragging] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
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
	const refresh = () => {
		// const windows = Array.from(
		// 	document.getElementsByClassName(styles.windowFrame.current)
		// ) as HTMLDivElement[];
		// let highest = 0;
		// windows.forEach((w) => {
		// 	const zindex = Number(w.style.zIndex);
		// 	if (zindex > highest) {
		// 		highest = zindex;
		// 	}
		// });
		// if (Number(windowFrame.current?.style.zIndex) >= highest) {
		// 	windowFrame.current?.classList.remove(styles.unfocused);
		// 	console.log("focused", windowFrame.current.id);
		// } else {
		// 	windowFrame.current?.classList.add(styles.unfocused);
		// }
	};

	useEffect(() => {
		if (!windowFrame.current) return;
		const titlebar = windowFrame.current.getElementsByClassName(
			styles.titleBar,
		)[0] as HTMLDivElement;
		refresh();
		const handleMouseDown = (e: MouseEvent) => {
			if (!windowFrame.current) return;
			if (e.button !== 0) return;
			refresh();
			windowFrame.current.style.zIndex = `${state.zIndex + 1}`;
			setState({
				...state,
				zIndex: state.zIndex + 1,
			});

			if (e.target === titlebar) {
				if (windowFrame.current.classList.contains(styles.fullscreen)) {
					setFromFullscreen(true);
				}
				setIsDragging(true);
				setPosition({
					x: e.clientX - windowFrame.current.getBoundingClientRect().left,
					y: e.clientY - windowFrame.current.getBoundingClientRect().top,
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

				const handle = resizeHandles.find(
					(handleClass) =>
						(e.target as HTMLDivElement)?.classList.contains(handleClass),
				);

				if (handle) {
					setIsResizing(true);
					setResizeHandle(handle);
					setInitialResizePosition({
						x: e.clientX,
						y: e.clientY,
					});
					setInitialWindowSize({
						width: windowFrame.current.getBoundingClientRect().width,
						height: windowFrame.current.getBoundingClientRect().height,
					});
				}
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!windowFrame.current) return;
			if (isResizing) {
				const deltaX = e.clientX - initialResizePosition.x;
				const deltaY = e.clientY - initialResizePosition.y;
				const shouldMoveX =
					initialWindowSize.width === winState?.minWidth && deltaX < 0;
				const shouldMoveY =
					initialWindowSize.height === winState?.minHeight && deltaY < 0;
				let newWidth = initialWindowSize.width;
				let newHeight = initialWindowSize.height;
				let newTop = Number(windowFrame.current.style.top.replace("px", ""));
				let newLeft = Number(windowFrame.current.style.left.replace("px", ""));

				switch (resizeHandle) {
					case styles.leftHandle:
						newWidth -= deltaX;
						newLeft = e.clientX;
						break;
					case styles.rightHandle:
						newWidth += deltaX;
						break;
					case styles.topHandle:
						newHeight -= deltaY;
						newTop = e.clientY;
						break;
					case styles.bottomHandle:
						newHeight += deltaY;
						break;
					case styles.topLeft:
						newWidth -= deltaX;
						newHeight -= deltaY;
						newLeft = e.clientX;
						newTop = e.clientY;
						break;
					case styles.topRight:
						newWidth += deltaX;
						newHeight -= deltaY;
						newTop = e.clientY;
						break;
					case styles.bottomLeft:
						newWidth -= deltaX;
						newHeight += deltaY;
						newLeft = e.clientX;
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

				if (shouldMoveX) windowFrame.current.style.left = `${newLeft}px`;
				if (shouldMoveY) windowFrame.current.style.top = `${newTop}px`;
				windowFrame.current.style.width = `${newWidth}px`;
				windowFrame.current.style.height = `${newHeight}px`;
				return;
			}
			if (isDragging) {
				const newX = e.clientX - position.x;
				let newY = e.clientY - position.y;
				if (newY < 0) newY = 0;
				const preview = document.getElementsByClassName(
					"fullscreen-preview",
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
						Number(windowFrame.current.style.left.replace("px", "")) - 8
					}px`;
					preview.style.marginTop = `${
						Number(windowFrame.current.style.top.replace("px", "")) - 8
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
					!windowFrame.current.classList.contains(styles.fullscreen)
				) {
					windowFrame.current.style.left = `${newX}px`;
					windowFrame.current.style.top = `${newY}px`;
				} else {
					const width = Number(
						window
							.getComputedStyle(windowFrame.current!)
							.width.replace("px", ""),
					);
					windowFrame.current.style.left = `${e.clientX - width + width / 2}px`;
					windowFrame.current.style.top = `${newY}px`;
				}
				if (windowFrame.current.classList.contains(styles.fullscreen)) {
					windowFrame.current.style.width = savedTranslate.w;
					windowFrame.current.style.height = savedTranslate.h;
					windowFrame.current.style.left = `${e.clientX}px`;
					windowFrame.current.style.top = `${e.clientY}px`;
					setFromFullscreen(true);
					windowFrame.current.classList.remove(styles.fullscreen);
				}
			}
		};

		const handleMouseUp = (e: MouseEvent) => {
			if (!windowFrame.current) return;
			if (e.button !== 0) return;
			setIsDragging(false);
			setFromFullscreen(false);
			setIsResizing(false);
			setResizeHandle("");
			if (fullscreenOnRelease) {
				const preview = document.getElementsByClassName(
					"fullscreen-preview",
				)[0] as HTMLDivElement;
				setFullScreenOnRelease(false);
				setsavedTranslate({
					x: windowFrame.current.style.left,
					y: windowFrame.current.style.top,
					w: windowFrame.current.style.width,
					h: windowFrame.current.style.height,
				});
				windowFrame.current.style.top = "0px";
				windowFrame.current.style.left = "0px";
				windowFrame.current.style.width = `${window.innerWidth}px`;
				windowFrame.current.style.height = `${window.innerHeight - 40}px`;
				windowFrame.current.classList.add(styles.fullscreen);
				preview.style.transition = "";
				preview.classList.add(styles.fade);
			}
		};

		windowFrame.current.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			if (windowFrame.current)
				// eslint-disable-next-line react-hooks/exhaustive-deps
				windowFrame.current.removeEventListener("mousedown", handleMouseDown);
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
	return [savedTranslate, setsavedTranslate];
}
