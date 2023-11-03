function VirtualMachine() {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
			}}
		>
			<iframe src={window.location.href} height="100%" width="100%" />
		</div>
	);
}

export default VirtualMachine;
