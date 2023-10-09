declare module "*.cur";
declare module "*.ani";

declare module "@forlagshuset/simple-fs" {
	export class FileSystem {
		constructor(storage?: any);
		mkdir(path: string): Promise<void>;
		mkdirParents(path: string): Promise<void>;
		rmdir(path: string): Promise<void>;
		rmdirRecursive(path: string): Promise<void>;
		readFile(path: string, options?: any): Promise<Blob>;
		writeFile(path: string, data: Blob, options?: any): Promise<void>;
		outputFile(path: string, data: Blob, options?: any): Promise<void>;
		bulkOutputFiles(files: any[]): Promise<void>;
		unlink(path: string): Promise<void>;
		exists(path: string): Promise<boolean>;
		stats(path: string): Promise<any>;
	}
}
