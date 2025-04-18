import { Window } from "../../../util/WindowManager";
import extraStyles from "../../../css/MultiplayerMinesweeper.module.css";
import styles from "../../../css/SingleplayerMinesweeper.module.css";
import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import lowQualityExplosion from "../../../assets/minesweeper/explosion.gif";

import {
	BOARD_SIZE,
	Board,
	CellState,
	MPBoard,
	MinesweeperUser,
	evaluateSurrounding,
} from "../../../../shared/src/types";

function GameBoard({
	interactive,
	initialBoard,
	onCellClick,
	player,
}: {
	interactive: boolean;
	initialBoard: Board;
	onCellClick?: (x: number, y: number) => void;
	player?: MinesweeperUser;
}) {
	const [images, setImages] = useState<string[]>([]);
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
	}, [images]);
	const [gameOver, setGameOver] = useState(false);
	useEffect(() => {
		let won = true;
		initialBoard.forEach((row) =>
			row.forEach((cell) => {
				if (cell.state === CellState.Unrevealed && !cell.isBomb) won = false;
			}),
		);
		setGameOver(won);
	}, [initialBoard]);
	useEffect(() => {
		(async () => {
			const images = await Promise.all(
				Object.values(
					import.meta.glob("../../../assets/minesweeper/buttons/*.png"),
				).map((p) =>
					p()
						.then((m: any) => m.default)
						.catch(() => ""),
				),
			);
			setImages(images);
		})();
	}, []);
	return (
		<div
			className={styles.window}
			style={{
				width: 180,
			}}
		>
			<div className={extraStyles.info}>
				{/* <div>
					<img src={zero} />
					<img
						src={off}
						onClick={() => {
							if (!interactive) return;
							// instantly win
						}}
					/>
					<img src={zero} />
				</div> */}
				<div className={extraStyles.username}>
					{player?.username || player?.id}
				</div>
				{/* <div>
					<img src={zero} />
					<img src={zero} />
					<img src={zero} />
				</div> */}
			</div>
			<div className={styles.board}>
				{initialBoard.map((row, x) => (
					<div className={styles.row} key={x}>
						{row.map((mine, y) => (
							<div
								onClick={() => {
									if (!interactive || gameOver) return;
									onCellClick?.(x, y);
								}}
								style={{
									color: mine.isBomb ? "red" : "black",
									backgroundImage:
										mine.state === CellState.Revealed
											? mine.isBomb
												? `url(${images.find((i) =>
														i.endsWith("/red-mine.png"),
												  )})`
												: `url(${images.find((i) =>
														i.endsWith(
															`${evaluateSurrounding(initialBoard, x, y)}.png`,
														),
												  )})`
											: undefined,
								}}
								key={y}
								className={styles.bomb}
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

function Multiplayer({ win }: { win: Window }) {
	const [users, setUsers] = useState<MinesweeperUser[]>([]);
	const [id, setId] = useState("");
	const [user, setUser] = useState<MinesweeperUser>();
	const [opponent, setOpponent] = useState<MinesweeperUser>();
	const [, setBoards] = useState<[MPBoard, MPBoard]>([] as any);

	const [myBoard, setMyBoard] = useState<Board>();
	const [opponentBoard, setOpponentBoard] = useState<Board>();

	const [gameState, setGameState] = useState<"win" | "loss" | "ongoing">(
		"ongoing",
	);

	function sendMessage(type: string, data: any) {
		sendJsonMessage({ type, data });
	}
	useEffect(() => {
		console.log(myBoard, opponentBoard);
	}, [myBoard, opponentBoard]);
	const { sendJsonMessage } = useWebSocket(
		`${import.meta.env.VITE_WS_URL}/minesweeper`,
		{
			onMessage(e) {
				const { type, data } = JSON.parse(e.data) as {
					type: string;
					data: any;
				};
				if (!type || !data) return;
				switch (type) {
					case "INITIALIZE": {
						setId(data.id);
						setUsers(data.users);
						setUser(data.users.find((u: MinesweeperUser) => u.id === data.id));
						console.log(data);
						break;
					}
					case "UPDATE_USERS": {
						setUsers(data.users);
						break;
					}
					case "START_GAME": {
						const players = data.players as MinesweeperUser[];
						const opponent = players.find((p) => p.id !== id);
						if (!opponent) return;
						const emptyBoard: Board = [];
						for (let i = 0; i < BOARD_SIZE; i++) {
							emptyBoard.push([]);
							for (let j = 0; j < BOARD_SIZE; j++) {
								emptyBoard[i].push({
									isBomb: false,
									state: CellState.Unrevealed,
								});
							}
						}
						setUser(players.find((p) => p.id === id));
						setOpponent(opponent);
						setBoards(data.boards);
						setMyBoard(emptyBoard);
						setOpponentBoard(emptyBoard);
						break;
					}
					case "MAKE_MOVE": {
						if (!data.board) return;
						setBoards((boards) => {
							if (!boards) return;
							if (data.id === opponent?.id) {
								setOpponentBoard(data.board);
							} else {
								setMyBoard(data.board);
							}
							const newBoards = boards.filter((b) => b.id !== data.id);
							newBoards.push(data.board);
							return newBoards as any;
						});
						break;
					}
					case "GAME_OVER": {
						if (data.winner === id) {
							setGameState("win");
						} else {
							setGameState("loss");
						}
					}
				}
			},
			onOpen() {
				sendMessage("INITIALIZE", {
					username: localStorage.getItem("username"),
				});
			},
		},
	);
	useEffect(() => {
		if (gameState !== "ongoing") {
			const timeout = setTimeout(() => {
				win?.close();
			}, 1000);
			return () => clearTimeout(timeout);
		}
	}, [gameState, win]);
	return (
		<div className={extraStyles.window}>
			{myBoard !== undefined && opponentBoard !== undefined ? (
				<div className={extraStyles.board}>
					{gameState === "loss" && (
						<img
							src={lowQualityExplosion}
							className={extraStyles.shittyLowQualityExplosionGifLoss}
						/>
					)}
					{gameState === "win" && (
						<img
							src={lowQualityExplosion}
							className={extraStyles.shittyLowQualityExplosionGifWin}
						/>
					)}
					<GameBoard
						onCellClick={(x, y) => {
							sendMessage("MAKE_MOVE", {
								x,
								y,
							});
						}}
						interactive
						initialBoard={myBoard}
						player={user}
					/>
					<GameBoard
						player={opponent}
						interactive={false}
						initialBoard={opponentBoard}
					/>
				</div>
			) : (
				<div className={extraStyles.main}>
					<h1>Users waiting for a partner:</h1>
					<div>Click on a user to begin a game.</div>
					<div className={extraStyles.users}>
						{users.length > 0 ? (
							users
								.filter((u) => u.id !== user?.id)
								.filter((u) => !u.isInGame)
								.map((u) => (
									<div
										className={extraStyles.user}
										onClick={() => {
											sendMessage("START_GAME", { id: u.id });
										}}
										key={u.id}
									>
										{u.username}
									</div>
								))
						) : (
							<div className={extraStyles.disappointment}>(...none)</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default Multiplayer;
