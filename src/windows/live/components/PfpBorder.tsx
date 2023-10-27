import { useRef, useState, useEffect } from "react";
import styles from "../../../css/Live.module.css";

export default function PfpBorder({
	pfp,
	win,
	state = "active",
	variant = "default",
}: {
	pfp: string;
	win?: Window;
	state?: string;
	variant?: "default" | "small" | "large";
}) {
	function getStateFromPath(state: string) {
		switch (state) {
			case "live/active.png":
				return "active";
			case "live/idle.png":
				return "idle";
			case "live/dnd.png":
				return "dnd";
			case "live/invisible.png":
				return "invisible";
			default:
				return state;
		}
	}
	const containerRef = useRef<HTMLDivElement>(null);
	const [src, setSrc] = useState(
		`/ui/wlm/statuses/${variant}/active-static.png`,
	);
	const [prevActivity, setPrevActivity] = useState("active");
	const [borderDummy1, setBorderDummy1] = useState(
		`/ui/wlm/statuses/${variant}/active-animated-from.png`,
	);
	const [borderDummy2, setBorderDummy2] = useState(
		`/ui/wlm/statuses/${variant}/active-animated-to.png`,
	);

	const [borderRef, borderDummy1Ref, borderDummy2Ref] = [
		useRef<HTMLImageElement>(null),
		useRef<HTMLImageElement>(null),
		useRef<HTMLImageElement>(null),
	];

	useEffect(() => {
		const [border, borderDummy1, borderDummy2] = [
			borderRef.current!,
			borderDummy1Ref.current!,
			borderDummy2Ref.current!,
		] as HTMLImageElement[];

		if (!containerRef.current) return;
		// eslint-disable-next-line react-hooks/exhaustive-deps
		state = getStateFromPath(state);
		if (state !== prevActivity) {
			setPrevActivity(state);
			(async () => {
				if (!containerRef.current) return;
				const sleep = (ms: number) =>
					new Promise((resolve) => setTimeout(resolve, ms));
				if (state === "invisible") {
					containerRef.current.style.opacity = "0.5";
					setSrc(`/ui/wlm/statuses/${variant}/invisible-static.png`);
					return;
				} else {
					containerRef.current.style.opacity = "1";
					border.style.opacity = "0";
					borderDummy1.style.opacity = "1";
					borderDummy2.style.opacity = "0";
					if (prevActivity === "invisible") {
						setBorderDummy1(
							`/ui/wlm/statuses/${variant}/${
								state || "active"
							}-animated-from.png`,
						);
						setBorderDummy2(
							`/ui/wlm/statuses/${variant}/${
								state || "active"
							}-animated-to.png`,
						);
					} else {
						setBorderDummy1(
							`/ui/wlm/statuses/${variant}/${
								prevActivity || "active"
							}-animated-from.png`,
						);
					}
					await sleep(550);
					borderDummy1.animate(
						[
							{
								opacity: "1",
							},
							{
								opacity: "0",
							},
						],
						{
							easing: "linear",
							duration: 250,
						},
					);
					setTimeout(() => (borderDummy1.style.opacity = "0"), 250);
					borderDummy2.style.opacity = "1";
					setBorderDummy2(
						`/ui/wlm/statuses/${variant}/${state}-animated-to.png`,
					);
					await sleep(730);
					borderDummy1.style.opacity = "0";
					borderDummy2.style.opacity = "0";
					border.style.opacity = "1";
					setSrc(`/ui/wlm/statuses/${variant}/${state}-static.png`);
				}
			})();
		}
	}, [borderDummy1Ref, borderDummy2Ref, borderRef, prevActivity, win, state]);
	useEffect(() => {
		// preload images
		const cache = document.createElement("CACHE");
		cache.style.position = "absolute";
		cache.style.zIndex = "-1000";
		cache.style.opacity = "0";
		document.body.appendChild(cache);
		function preloadImage(url: string) {
			const img = new Image();
			img.src = url;
			img.style.position = "absolute";
			cache.appendChild(img);
		}
		["active", "dnd", "idle"].forEach((state) => {
			preloadImage(
				`${
					import.meta.env.BASE_URL
				}ui/wlm/statuses/${variant}/${state}-static.png`,
			);
			preloadImage(
				`${
					import.meta.env.BASE_URL
				}ui/wlm/statuses/${variant}/${state}-animated-from.png`,
			);
			preloadImage(
				`${
					import.meta.env.BASE_URL
				}ui/wlm/statuses/${variant}/${state}-animated-to.png`,
			);
		});
		return () => {
			document.body.removeChild(cache);
		};
	}, [variant]);
	function getImageStyle(): React.CSSProperties {
		switch (variant) {
			case "default":
				return { width: 46, left: 19, top: 14 };
			case "small":
				return {
					width: 22,
					top: 11,
					left: 12,
				};
			case "large":
				return {
					width: 94,
					left: 25,
					top: 19,
				};
		}
	}
	return (
		<div ref={containerRef} className={styles.pfpBorder}>
			<img
				ref={borderRef}
				src={`${import.meta.env.BASE_URL}.${src}`}
				id="border"
			/>
			<img
				ref={borderDummy2Ref}
				src={borderDummy2}
				id="borderDummy2"
				className={styles.borderDummy2}
			/>
			<img
				ref={borderDummy1Ref}
				src={borderDummy1}
				id="borderDummy1"
				className={styles.borderDummy1}
			/>
			<img style={getImageStyle()} src={pfp} className={styles.pfp} />
		</div>
	);
}
