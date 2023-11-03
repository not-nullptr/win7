import styles from "../../../css/SingleplayerMinesweeper.module.css";
import { useEffect, useRef, useState } from "react";
import zero from "../../../assets/minesweeper/numbers/zero.png";
import off from "../../../assets/minesweeper/numbers/off.png";
import red from "../../../assets/minesweeper/buttons/red-mine.png";
import zeroButton from "../../../assets/minesweeper/buttons/0.png";
import oneButton from "../../../assets/minesweeper/buttons/1.png";
import twoButton from "../../../assets/minesweeper/buttons/2.png";
import threeButton from "../../../assets/minesweeper/buttons/3.png";
import fourButton from "../../../assets/minesweeper/buttons/4.png";
import fiveButton from "../../../assets/minesweeper/buttons/5.png";
import sixButton from "../../../assets/minesweeper/buttons/6.png";
import sevenButton from "../../../assets/minesweeper/buttons/7.png";
import eightButton from "../../../assets/minesweeper/buttons/8.png";

const buttons = [
	zeroButton,
	oneButton,
	twoButton,
	threeButton,
	fourButton,
	fiveButton,
	sixButton,
	sevenButton,
	eightButton,
];

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

function Minesweeper() {
	const [board, setBoard] = useState<Board>(generateBoard());
	const [gameOver, setGameOver] = useState(false);
	const [smiley, setSmiley] = useState("");
	const first = useRef(true);
	const [won, setWon] = useState(false);
	function reveal(board: Board, x: number, y: number) {
		const cell = board[x][y];
		if (cell.state !== CellState.Unrevealed) return;
		if (cell.isBomb) {
			// reveal all bombs and end the game
			board.forEach((row) =>
				row.forEach((cell) => {
					if (cell.isBomb) cell.state = CellState.Revealed;
				}),
			);
			setBoard([...board]);
			console.log("game over?");
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
				if (cell.state === CellState.Unrevealed && !cell.isBomb) won = false;
			}),
		);
		setWon(won);
	}, [board]);
	useEffect(() => {
		if (gameOver) {
			if (!won) {
				import("../../../assets/minesweeper/faces/loss.png").then((i) =>
					setSmiley(i.default),
				);
			} else {
				import("../../../assets/minesweeper/faces/win.png").then((i) =>
					setSmiley(i.default),
				);
			}
		}
	}, [gameOver, won]);
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
									}),
								),
							);
						}}
					/>
					<img src={zero} />
				</div>
				<div
					className={styles.smiley}
					onClick={() => {
						// if (!smiley.endsWith("/smile-pressed.png")) return;
						import("../../../assets/minesweeper/faces/smile.png").then((i) =>
							setSmiley(i.default),
						);
						setBoard(generateBoard());
						setGameOver(false);
						first.current = true;
					}}
					onMouseDown={() => {
						import("../../../assets/minesweeper/faces/smile-pressed.png").then(
							(i) => setSmiley(i.default),
						);
					}}
					onMouseUp={() => {
						import("../../../assets/minesweeper/faces/smile.png").then((i) =>
							setSmiley(i.default),
						);
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
												? `url(${red})`
												: `url(${buttons[evaluateSurrounding(board, x, y)]})`
											: undefined,
								}}
								key={y}
								className={styles.bomb}
								onMouseDown={() => {
									if (gameOver) return;
									console.log(gameOver);
									import(
										"../../../assets/minesweeper/faces/anticipation.png"
									).then((i) => setSmiley(i.default));
								}}
								onClick={() => {
									if (gameOver) return;
									first.current = false;
									const evaluation = evaluateSurrounding(board, x, y);
									if (mine.state === CellState.Revealed) return;
									if (mine.isBomb) {
										if (first.current) {
											mine.isBomb = false;
										} else {
											setGameOver(true);
											setWon(false);
											return setBoard((board) =>
												board.map((row) =>
													row.map((cell) => {
														if (cell.isBomb) {
															setGameOver(true);
															return {
																isBomb: true,
																state: CellState.Revealed,
															};
														} else return cell;
													}),
												),
											);
										}
									}
									import("../../../assets/minesweeper/faces/smile.png").then(
										(i) => setSmiley(i.default),
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
