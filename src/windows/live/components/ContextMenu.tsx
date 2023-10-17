import React, { useEffect, useRef, useState } from "react";
import { hasParentWithClass } from "../../../util/Generic";
import styles from "../../../css/ContextMenu.module.css";

export function Menu({
	children,
	items,
}: {
	children: React.ReactNode;
	items: { label: string; onClick: () => void }[];
}) {
	return (
		<div className={styles.contextMenuContainer}>
			{children}
			<div className={styles.contextMenu}>
				{items.map((item, index) => {
					return (
						<div
							key={index}
							className={styles.contextMenuItem}
							onClick={() => {
								item.onClick();
								const menus = document.querySelectorAll(
									`.${styles.contextMenu}`
								);
								menus.forEach((menu) => {
									(menu as HTMLDivElement).style.visibility = "hidden";
								});
							}}
						>
							{item.label}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function Provider() {
	useEffect(() => {
		function mouseDown(e: MouseEvent) {
			if (hasParentWithClass(e.target as HTMLElement, styles.contextMenu))
				return;
			const menus = document.querySelectorAll(`.${styles.contextMenu}`);
			menus.forEach((menu) => {
				(menu as HTMLDivElement).style.visibility = "hidden";
			});
		}
		function onContextMenu(e: MouseEvent) {
			e.preventDefault();
			const contextMenuContainer = hasParentWithClass(
				e.target as HTMLElement,
				styles.contextMenuContainer
			);
			if (!contextMenuContainer) return;
			const contextMenu = contextMenuContainer.querySelector(
				`.${styles.contextMenu}`
			) as HTMLElement;
			contextMenu.style.visibility = "visible";
			contextMenu.style.left = `${e.clientX}px`;
			contextMenu.style.top = `${e.clientY}px`;
		}
		document.addEventListener("contextmenu", onContextMenu);
		document.addEventListener("mousedown", mouseDown);
		return () => {
			document.removeEventListener("mousedown", mouseDown);
			document.removeEventListener("contextmenu", onContextMenu);
		};
	}, []);

	return <></>;
}
