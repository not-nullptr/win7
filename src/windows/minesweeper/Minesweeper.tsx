import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { Window } from "../../util/WindowManager";
import Singleplayer from "./pages/Singleplayer";
import Multiplayer from "./pages/Multiplayer";

function Minesweeper({ win }: { win: Window }) {
	return (
		<MemoryRouter>
			<Routes>
				<Route path="/" element={<Navigate to={win?.initialPath} />} />
				<Route path="/singleplayer" element={<Singleplayer win={win} />} />
				<Route path="/multiplayer" element={<Multiplayer win={win} />} />
			</Routes>
		</MemoryRouter>
	);
}

export default Minesweeper;
