import { Window } from "../util/WindowManager";
import styles from "../css/Minesweeper.module.css";
import { useEffect, useState } from "react";
import zero from "../assets/minesweeper/numbers/zero.png";
import off from "../assets/minesweeper/numbers/off.png";

enum CellState {
	Unrevealed,
	Revealed,
}

interface BoardCell {
	state: CellState;
	isBomb: boolean;
}

type Board = BoardCell[][];

const BOARD_SIZE = 9; // 9 x 9
const BOMB_COUNT = 10;

// im going to fucking kill myself
function evaluateSurrounding(board: Board, x: number, y: number) {
	let count = 0;
	for (let i = x - 1; i <= x + 1; i++) {
		if (i < 0 || i >= BOARD_SIZE) continue;
		for (let j = y - 1; j <= y + 1; j++) {
			if (j < 0 || j >= BOARD_SIZE) continue;
			if (board[i][j].isBomb) count++;
		}
	}
	return count;
}

function generateBoard() {
	const board: {
		state: CellState;
		isBomb: boolean;
	}[][] = [];
	for (let i = 0; i < BOARD_SIZE; i++) {
		board.push([]);
		for (let j = 0; j < BOARD_SIZE; j++) {
			board[i].push({
				state: CellState.Unrevealed,
				isBomb: false,
			});
		}
	}
	for (let i = 0; i < BOMB_COUNT; i++) {
		const x = Math.floor(Math.random() * BOARD_SIZE);
		const y = Math.floor(Math.random() * BOARD_SIZE);
		board[x][y].isBomb = true;
	}
	return board;
}

function Minesweeper({ win }: { win: Window }) {
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
		images.forEach((img) => {
			preloadImage(img);
		});
		return () => {
			document.body.removeChild(cache);
		};
	}, []);
	const [board, setBoard] = useState<Board>(generateBoard());
	const [gameOver, setGameOver] = useState(false);
	const [images, setImages] = useState<string[]>([]);
	const [smiley, setSmiley] = useState("");
	const [first, setFirst] = useState(true);
	const [won, setWon] = useState(false);
	function reveal(board: Board, x: number, y: number) {
		const cell = board[x][y];
		if (cell.state !== CellState.Unrevealed) return;
		if (cell.isBomb) {
			// reveal all bombs and end the game
			board.forEach((row) =>
				row.forEach((cell) => {
					if (cell.isBomb) cell.state = CellState.Revealed;
				})
			);
			setBoard([...board]);
			setGameOver(true);
		}
		const evaluation = evaluateSurrounding(board, x, y);
		cell.state = CellState.Revealed;
		if (evaluation === 0) {
			// reveal all adjacent cells that are not bombs
			for (let i = x - 1; i <= x + 1; i++) {
				if (i < 0 || i >= BOARD_SIZE) continue;
				for (let j = y - 1; j <= y + 1; j++) {
					if (j < 0 || j >= BOARD_SIZE) continue;
					reveal(board, i, j);
				}
			}
		}
		setBoard([...board]);
	}
	useEffect(() => {
		let won = true;
		board.forEach((row) =>
			row.forEach((cell) => {
				console.log(cell.state === CellState.Unrevealed && !cell.isBomb);
				if (cell.state === CellState.Unrevealed && !cell.isBomb) won = false;
			})
		);
		setWon(won);
		setGameOver(won);
	}, [board]);
	useEffect(() => {
		if (gameOver) {
			if (!won) {
				import("../assets/minesweeper/faces/loss.png").then((i) =>
					setSmiley(i.default)
				);
			} else {
				import("../assets/minesweeper/faces/win.png").then((i) =>
					setSmiley(i.default)
				);
			}
		}
	}, [gameOver, won]);
	useEffect(() => {
		import("../assets/minesweeper/faces/smile.png").then((i) =>
			setSmiley(i.default)
		);
		(async () => {
			const images = await Promise.all(
				Object.values(
					import.meta.glob("../assets/minesweeper/buttons/*.png")
				).map((p) =>
					p()
						.then((m: any) => m.default)
						.catch(() => "")
				)
			);
			setImages(images);
		})();
	}, []);
	return (
		<div className={styles.window}>
			<div className={styles.info}>
				<div>
					<img src={zero} />
					<img
						src={off}
						onClick={() => {
							// instantly win
							setBoard([...generateBoard()]);
							setBoard((board) =>
								board.map((row) =>
									row.map((cell) => {
										if (!cell.isBomb) {
											return {
												isBomb: false,
												state: CellState.Revealed,
											};
										} else return cell;
									})
								)
							);
						}}
					/>
					<img src={zero} />
				</div>
				<div
					className={styles.smiley}
					onClick={() => {
						// if (!smiley.endsWith("/smile-pressed.png")) return;
						import("../assets/minesweeper/faces/smile.png").then((i) =>
							setSmiley(i.default)
						);
						setBoard(generateBoard());
						setGameOver(false);
						setFirst(true);
					}}
					style={{
						backgroundImage: `url(${smiley})`,
						height: "100%",
						backgroundPosition: "center center",
						backgroundRepeat: "no-repeat",
					}}
				></div>
				<div>
					<img src={zero} />
					<img src={zero} />
					<img src={zero} />
				</div>
			</div>
			<div className={styles.board}>
				{board.map((row, x) => (
					<div className={styles.row} key={x}>
						{row.map((mine, y) => (
							<div
								style={{
									color: mine.isBomb ? "red" : "black",
									backgroundImage:
										mine.state === CellState.Revealed
											? mine.isBomb
												? `url(${images.find((i) =>
														i.endsWith("/red-mine.png")
												  )})`
												: `url(${images.find((i) =>
														i.endsWith(
															`${evaluateSurrounding(board, x, y)}.png`
														)
												  )})`
											: undefined,
								}}
								key={y}
								className={styles.bomb}
								onMouseDown={() => {
									if (gameOver) return;
									import("../assets/minesweeper/faces/anticipation.png").then(
										(i) => setSmiley(i.default)
									);
								}}
								onClick={() => {
									if (gameOver) return;
									setFirst(false);
									const evaluation = evaluateSurrounding(board, x, y);
									if (mine.state === CellState.Revealed) return;
									if (mine.isBomb) {
										if (first) {
											mine.isBomb = false;
										} else {
											setGameOver(true);

											return setBoard((board) =>
												board.map((row) =>
													row.map((cell) => {
														if (cell.isBomb) {
															return {
																isBomb: true,
																state: CellState.Revealed,
															};
														} else return cell;
													})
												)
											);
										}
									}
									import("../assets/minesweeper/faces/smile.png").then((i) =>
										setSmiley(i.default)
									);
									if (evaluation === 0) {
										return reveal(board, x, y);
									}
									mine.state = CellState.Revealed;
									setBoard([...board]);
								}}
							>
								{/* {mine.isBomb ? "b" : evaluateSurrounding(board, x, y)} */}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export default Minesweeper;
