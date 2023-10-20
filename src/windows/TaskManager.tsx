import { useEffect, useRef } from "react";
import styles from "../css/Canvas.module.css";

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

function TaskManager() {
	return (
		<>
			<Canvas width="250px" className={styles.canvas} />
		</>
	);
}

export default TaskManager;
