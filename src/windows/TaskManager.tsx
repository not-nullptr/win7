import { useEffect, useState } from "react";
import { Process, ProcessManager } from "../util/Process";
import { Program } from "../util/Program";
import { Window } from "../util/WindowManager";

function TaskManager() {
	const [processes, setProcesses] = useState<Process[]>(
		ProcessManager.getProcesses()
	);
	useEffect(() => {
		const id = ProcessManager.addListener((p) => setProcesses([...p]));
		return () => {
			ProcessManager.removeListener(id);
		};
	}, []);
	return (
		<>
			{processes.map((p) => (
				<div key={p.pid}>{JSON.stringify(p, null, 4)}</div>
			))}
			<button
				onClick={() => {
					const program = new Program(
						new Window({
							title: "New Process",
							icon: "terminal.png",
							component: "Notepad",
						}),
						"Notepad",
						"notepad.png"
					);
					const process = program.spawn();
					alert(process.pid);
				}}
			>
				Create Process
			</button>
		</>
	);
}

export default TaskManager;
