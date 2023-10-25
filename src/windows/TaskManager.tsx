import { useEffect, useRef } from "react";
import styles from "../css/TestApp.module.css";
import { Window } from "../util/WindowManager";

export function Canvas(
	props: React.DetailedHTMLProps<
		React.CanvasHTMLAttributes<HTMLCanvasElement>,
		HTMLCanvasElement
	> & { color?: string; lineWidth?: number }
) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
		ctx.strokeStyle = props.color || "black";
		ctx.lineWidth = props.lineWidth || 1;
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		function mouseMove(e: MouseEvent) {
			if (!ctx) return;
			ctx.lineTo(e.offsetX, e.offsetY);
			ctx.stroke();
		}
		function mouseDown(e: MouseEvent) {
			if (!ctx) return;
			ctx.beginPath();
			ctx.moveTo(e.offsetX, e.offsetY);
			ctx.lineTo(e.offsetX, e.offsetY);
			ctx.stroke();
			document.addEventListener("mousemove", mouseMove);
			canvasRef.current?.addEventListener("mouseenter", mouseDown);
			canvasRef.current?.addEventListener("mouseleave", mouseUp);
		}
		function mouseUp() {
			document.removeEventListener("mousemove", mouseMove);
			canvasRef.current?.removeEventListener("mouseenter", mouseDown);
		}
		canvasRef.current.addEventListener("mousedown", mouseDown);
		document.addEventListener("mouseup", mouseUp);
		return () => {
			canvasRef.current?.removeEventListener("mousedown", mouseDown);
			document.removeEventListener("mouseup", mouseUp);
			document.removeEventListener("mousemove", mouseMove);
			canvasRef.current?.removeEventListener("mouseenter", mouseDown);
			canvasRef.current?.removeEventListener("mouseleave", mouseUp);
		};
	}, []);
	return <canvas {...props} ref={canvasRef}></canvas>;
}

function TaskManager({ win }: { win: Window }) {
	return (
		<div className={styles.window}>
			<h1>To-do list</h1>
			<ul>
				<li>
					Live for Binbows games (multiplayer minesweeper? todo: architectural
					arrangements)
				</li>
				<li>Software SDK, maybe??</li>
				<li>Add widget thingy to clock, bottom right</li>
				<li>
					Fix aero hide button (transparency is fucky, change theme to see)
				</li>
				<li>Potentially gadgets? Later 7 builds excluded them</li>
				<li>Fix colours for Getting Started when I get home</li>
				<li>
					Window component <b>TOTAL REWRITE, NOT OPTIONAL.</b>
				</li>
				<li>
					Fix saturation (multiplies colours behind?? huh) for more accurate DWM
				</li>
			</ul>
		</div>
	);
}

export default TaskManager;
