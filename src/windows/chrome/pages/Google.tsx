import styles from "../css/Google.module.css";
import logo from "../assets/logo.gif";

function Google() {
	return (
		<div className={styles.windowContainer}>
			<div className={styles.ghead}>
				<div className={styles.gbar}>
					<b className={styles.gb1}>Web</b>
					<a className={styles.gb1}>Images</a>
					<a className={styles.gb1}>Videos</a>
					<a className={styles.gb1}>Maps</a>
					<a className={styles.gb1}>News</a>
					<a className={styles.gb1}>Shopping</a>
					<a className={styles.gb1}>Gmail</a>
					<a aria-haspopup="true" className={styles.gb3}>
						<u>more</u>
						<small> ▼</small>
					</a>
					{/* <div className={styles.gbm}>
						<a className={styles.gb2}>Books</a>
						<a className={styles.gb2}>Finance</a>
						<a className={styles.gb2}>Translate</a>
						<a className={styles.gb2}>Scholar</a>
						<a className={styles.gb2}>Blogs</a>
						<div className={styles.gb2}>
							<div className={styles.gbd}></div>
						</div>
						<a className={styles.gb2}>YouTube</a>
						<a className={styles.gb2}>Calendar</a>
						<a className={styles.gb2}>Photos</a>
						<a className={styles.gb2}>Documents</a>
						<a className={styles.gb2}>Reader</a>
						<a className={styles.gb2}>Sites</a>
						<a className={styles.gb2}>Groups</a>
						<div className={styles.gb2}>
							<div className={styles.gbd}></div>
						</div>
						<a className={styles.gb2}>even more »</a>
					</div> */}
				</div>
				<div className={styles.guser}></div>
				<div className={styles.gbh}></div>
				<div className={styles.gbh}></div>
			</div>
			<div className={styles.pageContent}>
				<img src={logo} />
				<input type="text" size={55} className={styles.search} />
				<div className={styles.buttons}>
					<button>Google Search</button>
					<button>I'm Feeling Lucky</button>
				</div>
			</div>
		</div>
	);
}

export default Google;
