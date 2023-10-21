import { Window, WindowManager } from "../util/WindowManager";
import styles from "../css/CommandPrompt.module.css";
import { useEffect, useRef, useState } from "react";
import { ProcessManager } from "../util/Process";
import { programs } from "../App";

interface Output {
	text: string; // \n should work here?
}

function CommandPrompt({ win }: { win: Window }) {
	const ps2 = "%dir%>";
	const [path, setPath] = useState("C:\\Binbows\\System32");
	const [out, setOut] = useState<Output[]>([
		{
			text: "Michaelsoft Binbows [Version 6.1.7601.17514]",
		},
		{
			text: "This software is licensed under the GNU GPL v3, with some assets under a proprietary license from Microsoft.",
		},
		{
			text: "",
		},
	]);
	const [running, setRunning] = useState(false);
	const inputRef = useRef<HTMLSpanElement>(null);
	const windowRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		windowRef.current?.scrollTo(0, windowRef.current.scrollHeight);
	}, [out]);
	function printf(text: string) {
		setOut((out) => [...out, { text }]);
	}
	class Command {
		constructor(
			public name: string,
			public execute: (args: string[]) => Promise<void> | void
		) {}
	}
	const commands = [
		new Command("cd", (args) => {
			const pathToGoto = args.at(-1);
			if (!pathToGoto) return printf("The syntax of the command is incorrect.");
			const tokens = pathToGoto
				.split("\\")
				.map((t) => t.split("/"))
				.flat();
			console.log(tokens);
			tokens.forEach((t) => {
				switch (t) {
					case "..": {
						setPath((path) =>
							path.split("\\").length === 1
								? path
								: path.split("\\").slice(0, -1).join("\\")
						);
						break;
					}
					case ".": {
						break;
					}
					default: {
						setPath((path) => `${path}\\${t}`);
					}
				}
			});
		}),
		new Command("dir", () => {
			printf(` Volume in drive C is Michaelsoft Binbows`);
			printf(` Volume Serial Number is 8008-1369`);
			printf(``);
			printf(` Directory of ${path}`);
			printf(``);
			printf(``);
			printf(` What The Fuck?`);
			printf(``);
		}),
		new Command("clear", () => setOut([])),
		new Command("proclist", () => {
			const processes = ProcessManager.getProcesses();
			processes.forEach((p) => {
				const window = WindowManager.getWindowById(p.mainWindowId);
				if (!window) return printf("Window Not Found");
				printf(``);
				printf(`Process name is ${p.name}`);
				printf(`    Process ID:      ${p.pid}`);
				printf(`    Window count:    ${p.getWindows().length}`);
				printf(`    Open windows:`);
				p.getWindows().forEach((w) => {
					printf(``);
					printf(`        Window title:     ${w.title}`);
					printf(`        Window component: ${w.component}`);
				});
				printf(``);
			});
		}),
		new Command("proglist", () => {
			const progs = programs.map((p) => p.name);
			printf(`There are ${progs.length} programs installed:`);
			printf(progs.join("    "));
			printf(``);
		}),
		new Command("help", () => {
			printf(commands.map((c) => c.name).join("    "));
		}),
	];
	function calculatePs2(ps2: string) {
		const searches = [
			{
				find: "%dir%",
				replace: path,
			},
		];
		for (const search of searches) {
			ps2 = ps2.replaceAll(search.find, search.replace);
		}
		return ps2;
	}
	async function runCommand(input: string) {
		const [command, ...args] = input.split(" ");
		const cmd = commands.find((cmd) => cmd.name === command);
		if (!cmd) {
			return printf(
				`'${command}' is not recognized as an internal or external command, operable program or batch file.`
			);
		}
		await cmd.execute(args);
	}
	async function onCmdInput(e: React.KeyboardEvent<HTMLSpanElement>) {
		const target = e.target as HTMLSpanElement;
		switch (e.key) {
			case "Enter": {
				e.preventDefault();
				setRunning(true);
				setOut((out) => [
					...out,
					{
						text: `${calculatePs2(ps2)}${inputRef.current?.innerText || ""}`,
					},
				]);
				if (target.innerText) await runCommand(target.innerText);
				target.innerText = "";
				setRunning(false);
				break;
			}
			case "Tab": {
				e.preventDefault();
				const text = target.innerText;
				const split = text.split(" ");
				const token = split.at(-1);
				if (!token) return;
				const matches = commands
					.map((cmd) => cmd.name)
					.filter((name) => name.startsWith(token));
				if (matches.length === 0 || split.length > 1) return;
				if (matches.length === 1) {
					target.innerText = `${`${split.slice(0, -1).join(" ")} ${
						matches[0]
					}`.trim()} `;
					// set cursor to end
					const range = document.createRange();
					const sel = window.getSelection();
					range.setStart(target.childNodes[0], target.innerText.length);
					range.collapse(true);
					sel?.removeAllRanges();
					sel?.addRange(range);
				} else {
					printf(matches.join("    "));
					target.innerText = text;
					const range = document.createRange();
					const sel = window.getSelection();
					range.setStart(target.childNodes[0], target.innerText.length);
					range.collapse(true);
					sel?.removeAllRanges();
					sel?.addRange(range);
				}
				break;
			}
		}
	}
	return (
		<div
			ref={windowRef}
			onClick={() => {
				if (inputRef.current) inputRef.current.focus();
			}}
			className={styles.window}
		>
			<div className={styles.history}>
				{out.map((item, i) => (
					<div key={i}>{item.text}</div>
					// index is fine her because we shouldnt be removing elements
				))}
			</div>
			<div
				className={styles.currentLine}
				style={{
					visibility: running ? "hidden" : "visible",
				}}
			>
				{calculatePs2(ps2)}
				{/* <div className={styles.cursor} /> */}
			</div>
			<span
				onKeyDown={onCmdInput}
				contentEditable
				role="textbox"
				autoCorrect="off"
				spellCheck={false}
				ref={inputRef}
				className={styles.prompt}
			/>
		</div>
	);
}

export default CommandPrompt;
