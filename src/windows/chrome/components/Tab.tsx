import styles from "../css/Chrome.module.css";
import { joinClasses } from "../../../util/Module";
import { useEffect, useRef } from "react";

export interface Tab {
	title: string;
	id: string;
}

function useRadialGradient(ref: React.RefObject<HTMLDivElement>) {
	const GRADIENT_SIZE = 120;
	useEffect(() => {
		const tab = ref.current;
		if (!tab) return;
		const overlays = Array.from<HTMLDivElement>(
			tab.parentElement!.querySelectorAll(`.${styles.radialGradientOverlay}`),
		);
		function calculateGradient(
			e: MouseEvent,
			offset?: { x: number; y: number },
		) {
			if (tab?.classList.contains(styles.unselected)) return "";
			const target = e.target as HTMLDivElement;
			const rect = target.getBoundingClientRect();
			let x: number, y: number;
			if (offset) {
				x = e.clientX - rect.left - offset.x;
				y = e.clientY - rect.top - offset.y;
			} else {
				x = e.clientX - rect.left;
				y = e.clientY - rect.top;
			}
			const gradient = `radial-gradient(circle at center center, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 80%) no-repeat ${
				x - GRADIENT_SIZE / 2
			}px ${y - GRADIENT_SIZE / 2}px / ${GRADIENT_SIZE}px ${GRADIENT_SIZE}px`;
			return gradient;
		}
		function mouseHandler(e: MouseEvent) {
			overlays.forEach((o) => {
				if (!tab) return;
				const tabBounds = tab.getBoundingClientRect();
				const overlayBounds = o.getBoundingClientRect();
				const offset = {
					x: overlayBounds.left - tabBounds.left,
					y: overlayBounds.top - tabBounds.top,
				};
				const gradient = calculateGradient(e, offset);
				o.style.opacity = "1";
				o.style.background = gradient;
			});
		}
		function mouseLeaveHandler() {
			overlays.forEach((o) => {
				o.style.opacity = "0";
			});
		}
		tab.addEventListener("mousemove", mouseHandler);
		tab.addEventListener("mouseleave", mouseLeaveHandler);
	}, [ref]);
}

export function Tab({
	selected,
	onClick,
	onClose,
	onDragBegin,
	onDragEnd,
	currentTab,
}: {
	selected?: boolean | undefined | null;
	onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	onClose?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	onDragBegin?: (
		e: MouseEvent,
		initialPos: { x: number; y: number },
		initialTransformX: number,
	) => void;
	onDragEnd?: (e: MouseEvent) => void;
	currentTab: Tab;
}) {
	const gradient = useRef<HTMLDivElement>(null);
	useRadialGradient(gradient);
	useEffect(() => {
		// when mouse down on gradient, add mouse move listener to window
		// on mouse up, remove mouse move listener
		if (!onDragBegin) return;
		let initialPos: { x: number; y: number } = { x: 0, y: 0 };
		let initialTransformX = 0;
		const tab = gradient.current;
		function mouseMoveHandler(e: MouseEvent) {
			onDragBegin?.(e, initialPos, initialTransformX);
		}
		function mouseUpHandler(e) {
			window.removeEventListener("mousemove", mouseMoveHandler);
			window.removeEventListener("mouseup", mouseUpHandler);
			onDragEnd?.(e);
		}
		function mouseDownHandler(e: MouseEvent) {
			initialPos = { x: e.clientX, y: e.clientY };
			if (!tab) return;
			const style = getComputedStyle(document.getElementById(currentTab.id)!);
			const matrix = new DOMMatrixReadOnly(style.transform);
			console.log(matrix);
			initialTransformX = matrix.m41 || 0;
			window.addEventListener("mousemove", mouseMoveHandler);
			window.addEventListener("mouseup", mouseUpHandler);
			onDragBegin?.(e, initialPos, initialTransformX);
		}
		tab?.addEventListener("mousedown", mouseDownHandler);
		return () => {
			tab?.removeEventListener("mousedown", mouseDownHandler);
		};
	}, [onDragBegin, currentTab.id, onDragEnd]);
	return (
		<div
			className={joinClasses(
				styles.tabContainer,
				!selected ? styles.unselected : "",
			)}
			style={{
				zIndex: selected ? 99999999 : undefined,
			}}
			id={currentTab.id}
		>
			<div
				className={styles.x}
				onClick={(e) => {
					onClose?.(e);
				}}
			>
				✖
			</div>
			<div
				className={joinClasses(styles.tab, !selected ? styles.unselected : "")}
				onMouseDown={onClick}
			>
				<div
					ref={gradient}
					className={styles.radialGradientRef}
					title={currentTab.title}
				/>
				<div className={styles.tabBorderLeft}>
					{!selected && <div className={styles.potentialShadow} />}
					<div className={styles.radialGradientOverlay} />
				</div>
				<div className={styles.tabCenter}>
					{!selected && <div className={styles.potentialShadow} />}
					<div className={styles.radialGradientOverlay} />
				</div>
				<div className={styles.title}>{currentTab.title}</div>
				<div className={styles.tabBorderRight}>
					{!selected && <div className={styles.potentialShadow} />}
					<div
						style={{
							transform: "scaleX(-1)",
						}}
						className={styles.radialGradientOverlay}
					/>
				</div>
			</div>
		</div>
	);
}
