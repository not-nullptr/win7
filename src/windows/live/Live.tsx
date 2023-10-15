import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { Window } from "../../util/WindowManager";
import Home from "./pages/Home";
import Message from "./pages/Message";

function Live({ win }: { win: Window }) {
	return (
		<MemoryRouter>
			<Routes>
				<Route path="/" element={<Navigate to={win?.initialPath} />} />
				<Route path="/live" element={<Home win={win} />} />
				<Route path="/message" element={<Message win={win} />} />
			</Routes>
		</MemoryRouter>
	);
}

export default Live;
