export function getAverageRGB(imgEl: HTMLImageElement): {
	r: number;
	g: number;
	b: number;
} {
	const blockSize = 5; // Visit every 5 pixels
	const defaultRGB = { r: 0, g: 0, b: 0 }; // Default values for non-supporting environments
	const canvas = document.createElement("canvas");
	const context = canvas.getContext && canvas.getContext("2d");
	let data: ImageData | undefined;
	let width: number;
	let height: number;
	let i = -4;
	let length: number;
	const rgb = { r: 0, g: 0, b: 0 };
	let count = 0;

	if (!context) {
		return defaultRGB;
	}

	height = canvas.height =
		imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
	width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

	context.drawImage(imgEl, 0, 0);

	try {
		data = context.getImageData(0, 0, width, height);
	} catch (e) {
		// Handle security error if the image is on a different domain
		console.error("Security error: Image on a different domain");
		return defaultRGB;
	}

	length = data.data.length;

	while ((i += blockSize * 4) < length) {
		++count;
		rgb.r += data.data[i];
		rgb.g += data.data[i + 1];
		rgb.b += data.data[i + 2];
	}

	// Use Math.floor to round down values
	rgb.r = Math.floor(rgb.r / count);
	rgb.g = Math.floor(rgb.g / count);
	rgb.b = Math.floor(rgb.b / count);

	return rgb;
}

export function getMostVibrantRGB(imgEl: HTMLImageElement): {
	r: number;
	g: number;
	b: number;
} {
	const blockSize = 5; // Visit every 5 pixels
	const defaultRGB = { r: 0, g: 0, b: 0 }; // Default values for non-supporting environments
	const canvas = document.createElement("canvas");
	const context = canvas.getContext && canvas.getContext("2d");
	let data: ImageData | undefined;
	let width: number;
	let height: number;
	let i = -4;
	let length: number;
	const mostVibrant = { r: 0, g: 0, b: 0, vibrancy: 0 };

	if (!context) {
		return defaultRGB;
	}

	height = canvas.height =
		imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
	width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

	context.drawImage(imgEl, 0, 0);

	try {
		data = context.getImageData(0, 0, width, height);
	} catch (e) {
		// Handle security error if the image is on a different domain
		console.error("Security error: Image on a different domain");
		return defaultRGB;
	}

	length = data.data.length;

	while ((i += blockSize * 4) < length) {
		const r = data.data[i];
		const g = data.data[i + 1];
		const b = data.data[i + 2];

		// Calculate vibrancy based on colorfulness
		const colorfulness = r / 255 + g / 255 + b / 255;

		if (colorfulness > mostVibrant.vibrancy) {
			mostVibrant.r = r;
			mostVibrant.g = g;
			mostVibrant.b = b;
			mostVibrant.vibrancy = colorfulness;
		}
	}

	return mostVibrant;
}
