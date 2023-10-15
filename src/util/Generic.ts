export function hasParentWithClass(
	element: HTMLElement,
	className: string
): boolean {
	if (element.classList.contains(className)) return true;
	let parent = element.parentElement;
	while (parent) {
		if (parent.classList.contains(className)) {
			return true;
		}
		parent = parent.parentElement;
	}
	return false;
}
