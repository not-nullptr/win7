import fs from "fs";
import { Connection } from "../classes/Connection";

export async function handleMessage(
	type: string,
	connection: Connection,
	data: any
) {
	let module: ((conn: Connection, data: any) => any) | undefined = undefined;

	const path = "src/handlers";
	const files = fs.readdirSync(path);
	for (const file of files) {
		if (file.split(".")[0] !== type) continue;
		const imported = await import(`../handlers/${file}`);
		module = imported.default;
		break;
	}
	if (!module) return;
	module?.(connection, data);
}
