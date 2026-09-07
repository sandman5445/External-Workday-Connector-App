import logo from "../assets/banner.png";

export function BrandHeader() {
	return (
		<div
			style={{
				position: "relative",
				left: "50%",
				right: "50%",
				marginLeft: "-50vw",
				marginRight: "-50vw",
				width: "100vw",
			}}
		>
			<img
				src={logo}
				alt="Valet Living"
				style={{ width: "100%", height: "auto", display: "block" }}
			/>
		</div>
	);
}
