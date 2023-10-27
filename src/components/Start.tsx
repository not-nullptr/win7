import styles from "../css/Start.module.css";
import { Program } from "../util/Program";

// TODO: dedicated program type
// TODO: auto-populate programs from WindowManager (see above?)

export default function Start({
	onClose,
	sideButtons,
	programs,
}: {
	onClose?: () => void;
	sideButtons: { label: string; onClick?: () => void }[];
	programs: Program[];
}) {
	return (
		<div className={styles.startMenuFrame}>
			<div className={styles.startMenuContents}>
				{programs.slice(0, 10).map((p) => (
					<div
						key={p.name}
						onClick={() => {
							onClose?.();
							p.spawn();
						}}
						className={styles.startMenuProgram}
					>
						<img
							src={`${import.meta.env.BASE_URL}icons/main/${
								p.icon || "unknown.png"
							}`}
						/>
						<div>{p.name}</div>
					</div>
				))}
			</div>
			<div className={styles.startMenuList}>
				<div className={styles.userPictureContainer}>
					<div className={styles.userPicture} />
				</div>
				<div className={styles.listContainer}>
					{sideButtons.map((b) => {
						return b.label === "divider" ? (
							<div className={styles.divider} />
						) : (
							<div
								onClick={() => {
									onClose?.();
									b.onClick?.();
								}}
								className={styles.startMenuListItem}
							>
								<div className={styles.startMenuListItemLabel}>{b.label}</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
