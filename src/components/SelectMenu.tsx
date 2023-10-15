import { useEffect, useRef, useState } from "react";
import styles from "../css/Select.module.css";
import { hasParentWithClass } from "../util/Generic";

export default function ({
	items,
	width,
	id,
}: {
	items: { label: string; value: string }[];
	width?: number;
	id?: string;
}) {
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState(items[0]);
	useEffect(() => {
		(rootRef.current as any).value = items[0];
		function mouseDownHandler(e: MouseEvent) {
			if (e.target instanceof HTMLElement) {
				if (
					!hasParentWithClass(e.target, styles.selectButton) &&
					!e.target.classList.contains(styles.selectButton) &&
					!e.target.parentElement?.classList.contains(styles.selectMenu)
				) {
					setOpen(false);
				}
			}
		}
		document.addEventListener("mousedown", mouseDownHandler);
		return () => document.removeEventListener("mousedown", mouseDownHandler);
	}, []);
	useEffect(() => {
		if (rootRef.current === null) return;
		(rootRef.current as any).value = selected.value;
	}, [selected]);
	return (
		<div
			ref={rootRef}
			id={id}
			style={{ width }}
			className={styles.selectContainer}
		>
			<button
				style={{ width }}
				onClick={() => {
					setOpen(!open);
				}}
				className={styles.selectButton}
				aria-pressed={open}
			>
				{selected.label}
			</button>
			{open && (
				<div style={{ width }} className={styles.selectMenu}>
					{items.map((i) => (
						<div
							onClick={() => {
								setSelected(i);
								setOpen(false);
							}}
							id={i.value}
							key={i.value}
							className={styles.selectItem}
						>
							{i.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
