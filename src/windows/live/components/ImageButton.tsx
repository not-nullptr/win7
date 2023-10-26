import styles from "../../../css/ImageButton.module.css";

function ImageButton(
	props: React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> & {
		image: string;
	},
) {
	return (
		<div {...props} className={styles.imageButton}>
			<img src={props.image} />
		</div>
	);
}

export default ImageButton;
