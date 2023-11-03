import { useEffect, useRef, useState } from "react";
import { Tab } from "./components/Tab";
import styles from "./css/Chrome.module.css";
import { v4 } from "uuid";
import { Window } from "../../util/WindowManager";

function Chrome({ win }: { win?: Window }) {
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);

	const handleTabClick = (index: number) => {
		setSelectedTabIndex(index);
	};
	const ext = useRef<HTMLDivElement>(null);
	const [tabs, setTabs] = useState<Tab[]>([{ id: v4(), title: "Google" }]);
	useEffect(() => {
		console.log(tabs.length, selectedTabIndex + 1);
	}, [tabs, selectedTabIndex, win]);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	return (
		<div className={styles.window}>
			<div className={styles.titleBarExtension} ref={ext}>
				<div className={styles.titleBarElements}>
					{tabs.map((tab) => (
						<Tab
							onDragBegin={(e, initialPos, initialTransformX) => {
								const target = document.getElementById(
									tab.id,
								) as HTMLDivElement;
								if (!target) throw new Error("????");
								target.style.transition = "0s linear";
								const rect = target.getBoundingClientRect();
								const relativePos = e.clientX - rect.left;
								const relativeInitialPos = initialPos.x - rect.left;
								const x = relativePos - relativeInitialPos + initialTransformX;
								target.style.transform = `translateX(${x}px)`;
							}}
							onDragEnd={() => {
								const target = document.getElementById(
									tab.id,
								) as HTMLDivElement;
								if (!target) throw new Error("????");
								target.style.transition = "";

								target.style.transform = "";
							}}
							key={tab.id}
							selected={tabs.indexOf(tab) === selectedTabIndex}
							onClick={() => handleTabClick(tabs.indexOf(tab))}
							onClose={(e) => {
								if (tabs.length === 1) win?.close();
								const target = e.target as HTMLDivElement;
								target.parentElement
									?.querySelector(`.${styles.tab}`)
									?.classList.add(styles.closing);
								setTimeout(() => {
									setTabs((t) => t.filter((tabItem) => tabItem.id !== tab.id));
									if (selectedTabIndex === tabs.length - 1) {
										setSelectedTabIndex(selectedTabIndex - 1);
									} else if (selectedTabIndex === 0) {
										setSelectedTabIndex(0);
									} else if (selectedTabIndex > tabs.indexOf(tab)) {
										setSelectedTabIndex(selectedTabIndex - 1);
									}
								}, 125);
							}}
							currentTab={tab}
						/>
					))}
					<div
						className={styles.tabAdder}
						onClick={() => {
							setTabs((t) => [
								...t,
								{
									id: v4(),
									title: "New Tab Except It Has A Super Duper Long Name",
								},
							]);
							setSelectedTabIndex(tabs.length);
						}}
					/>
				</div>
			</div>
			<div className={styles.windowContentsBg} />
			<div className={styles.windowContents}>
				<div className={styles.toolbar}>
					<input type="search" placeholder="Search the web..." />
				</div>
				{/* <Google /> */}
				<iframe
					ref={iframeRef}
					style={{
						width: "100%",
						height: "calc(100% - 36px)",
						borderRadius: 6,
						border: "none",
					}}
					src="https://web.archive.org/web/20100107063652if_/http://www.google.com/"
					sandbox="allow-scripts"
				></iframe>
			</div>
		</div>
	);
}

export default Chrome;
