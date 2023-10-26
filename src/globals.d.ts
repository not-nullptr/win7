declare global {
	interface Window {
		alert: (title: string, message: string, icon?: string) => void;
	}
}
