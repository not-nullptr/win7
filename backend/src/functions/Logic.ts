import fs from "fs";
import { MessengerConnection } from "../classes/MessengerConnection";
import { MinesweeperConnection } from "../classes/MinesweeperConnection";

export async function handleMessageMessenger(
	type: string,
	connection: MessengerConnection,
	data: any
) {
	let module: ((conn: MessengerConnection, data: any) => any) | undefined =
		undefined;
	console.log(type);
	const path = "src/handlers/messenger";
	const files = fs.readdirSync(path);
	for (const file of files) {
		if (file.split(".")[0] !== type) continue;
		const imported = await import(`../handlers/messenger/${file}`);
		module = imported.default;
		break;
	}
	if (!module) return;
	module?.(connection, data);
}

export async function handleMessageMinesweeper(
	type: string,
	connection: MinesweeperConnection,
	data: any
) {
	let module: ((conn: MinesweeperConnection, data: any) => any) | undefined =
		undefined;
	console.log(type);
	const path = "src/handlers/minesweeper";
	const files = fs.readdirSync(path);
	for (const file of files) {
		if (file.split(".")[0] !== type) continue;
		const imported = await import(`../handlers/minesweeper/${file}`);
		module = imported.default;
		break;
	}
	if (!module) return;
	module?.(connection, data);
}
