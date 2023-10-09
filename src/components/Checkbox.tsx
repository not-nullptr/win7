import { useEffect, useState } from "react";

export default function ({ checked }: { checked?: boolean }) {
	const [enabled, setEnabled] = useState(checked || false);
	useEffect(() => {
		setEnabled(checked || false);
	}, [checked]);
	return <div aria-checked={enabled} className="checkbox" />;
}
