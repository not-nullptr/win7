import { useEffect, useState } from "react";
import { Window } from "../../util/WindowManager";

export function useWindowState(win: Window) {
	const [winState, setWinState] = useState<Window | null>(win);
	useEffect(() => {
		const id = win?.addListener((win, isClosing) => {
			if (isClosing) return setWinState(null);
			setWinState(win);
		});
		return () => {
			win?.removeListener(id || "");
		};
	}, []);
	return winState;
}
