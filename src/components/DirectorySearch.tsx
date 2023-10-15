import folderSmall from "../assets/explorer/folder-small.png";
import styles from "../css/DirectorySearch.module.css";

export default function DirectorySearch({ path }: { path: string }) {
	return (
		<div className={styles.searchContainer}>
			<img src={folderSmall} className={styles.folder} />
		</div>
	);
}
