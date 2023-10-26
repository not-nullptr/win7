export function hasParentWithClass(
	element: HTMLElement,
	className: string,
): HTMLElement | false {
	if (element.classList.contains(className)) return element;
	let parent = element.parentElement;
	while (parent) {
		if (parent.classList.contains(className)) {
			return parent;
		}
		parent = parent.parentElement;
	}
	return false;
}
