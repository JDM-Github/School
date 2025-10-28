import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";

const ParticlesBackground = () => {
	const containerRef = useRef(null),
		[init, setInit] = useState(false);

	useEffect(() => {
		if (init) return;

		initParticlesEngine(async (engine) => {
			await loadFull(engine);
		}).then(() => setInit(true));
	}, [init]);

	const particlesLoaded = useCallback(async (container: any) => {
		containerRef.current = container;
		return Promise.resolve();
	}, []);

	const options = useMemo(
		() => ({
			fullScreen: { enable: true },
			particles: {
				number: { value: 20 },
				links: { enable: true, distance: 200, color: "#0F5C2B22" },
				move: { enable: true, speed: 2 },
				color: { value: "#11753522" },
				opacity: { value: 0.2 },
			},
			background: { color: "transparent" },
		}),
		[]
	);

	return init ? (
		<Particles
			id="tsparticles"
			particlesLoaded={particlesLoaded}
			options={options}
			className="absolute bottom-0 left-0 w-full h-[50vh] z-0"
		/>
	) : null;
};

export default ParticlesBackground;
