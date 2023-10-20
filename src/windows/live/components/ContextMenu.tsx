import React, { useEffect, useRef, useState } from "react";
import { hasParentWithClass } from "../../../util/Generic";
import styles from "../../../css/ContextMenu.module.css";
import windowStyles from "../../../css/Window.module.css";

interface ContextMenuItem {
	type: "item";
	label: string;
	onClick: () => void;
}

interface ContextMenuSeparator {
	type: "separator";
}

interface ContextMenuGroup {
	type: "group";
	label: string;
	items: ContextMenuElement[];
}

export type ContextMenuElement =
	| ContextMenuItem
	| ContextMenuSeparator
	| ContextMenuGroup;

function Item(item: ContextMenuElement) {
	switch (item.type) {
		case "item": {
			return (
				<div
					className={styles.contextMenuItem}
					onClick={() => {
						item.onClick();
						const menus = document.querySelectorAll(`.${styles.contextMenu}`);
						menus.forEach((menu) => {
							(menu as HTMLDivElement).style.visibility = "hidden";
						});
						const handles = document.querySelectorAll(
							`.${windowStyles.handle}`
						);
						handles.forEach((handle) => {
							(handle as HTMLDivElement).style.pointerEvents = "all";
						});
					}}
				>
					{item.label}
				</div>
			);
		}
		case "separator": {
			return <div className={styles.contextMenuSeparator} />;
		}
		case "group": {
			return (
				<div
					className={styles.contextMenuItem}
					onClick={() => {
						const menus = document.querySelectorAll(`.${styles.contextMenu}`);
						menus.forEach((menu) => {
							(menu as HTMLDivElement).style.visibility = "hidden";
						});
						const children = document.querySelectorAll(
							`.${styles.contextMenuChild}`
						);
						children.forEach((child) => {
							(child as HTMLDivElement).style.visibility = "hidden";
						});
						const handles = document.querySelectorAll(
							`.${windowStyles.handle}`
						);
						handles.forEach((handle) => {
							(handle as HTMLDivElement).style.pointerEvents = "all";
						});
					}}
					onMouseEnter={(e) => {
						const contextMenu = hasParentWithClass(
							e.target as HTMLElement,
							styles.contextMenu
						);
						if (!contextMenu) return;
						const contextMenuChild = contextMenu.querySelector(
							`.${styles.contextMenuChild}`
						) as HTMLElement;
						contextMenuChild.style.visibility = "visible";
						const handles = document.querySelectorAll(
							`.${windowStyles.handle}`
						);
						handles.forEach((handle) => {
							(handle as HTMLDivElement).style.pointerEvents = "none";
						});
					}}
					onMouseLeave={(e) => {
						const contextMenu = hasParentWithClass(
							e.target as HTMLElement,
							styles.contextMenu
						);
						if (!contextMenu) return;
						const contextMenuChild = contextMenu.querySelector(
							`.${styles.contextMenuChild}`
						) as HTMLElement;
						contextMenuChild.style.visibility = "hidden";
						const handles = document.querySelectorAll(
							`.${windowStyles.handle}`
						);
					}}
				>
					{item.label}
					<div className={styles.contextMenuChild}>
						{item.items.map((item, index) => {
							return <Item key={index} {...item} />;
						})}
					</div>
				</div>
			);
		}
	}
}

export function Menu({
	children,
	items,
}: {
	children: React.ReactNode;
	items: ContextMenuElement[];
}) {
	return (
		<div className={styles.contextMenuContainer}>
			{children}
			<div className={styles.contextMenu}>
				{items.map((item, index) => {
					return <Item key={index} {...item} />;
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
			const children = document.querySelectorAll(`.${styles.contextMenuChild}`);
			children.forEach((child) => {
				(child as HTMLDivElement).style.visibility = "hidden";
			});
			const handles = document.querySelectorAll(`.${windowStyles.handle}`);
			handles.forEach((handle) => {
				(handle as HTMLDivElement).style.pointerEvents = "all";
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
			const handles = document.querySelectorAll(`.${windowStyles.handle}`);
			handles.forEach((handle) => {
				(handle as HTMLDivElement).style.pointerEvents = "none";
			});
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
