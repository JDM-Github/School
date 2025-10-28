import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function AgribotViewer() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			45,
			containerRef.current.clientWidth /
				containerRef.current.clientHeight,
			0.001,
			1000
		);
		camera.position.set(0, 2, 1);

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
		renderer.setSize(
			containerRef.current.clientWidth,
			containerRef.current.clientHeight
		);
		renderer.setPixelRatio(window.devicePixelRatio);
		containerRef.current.appendChild(renderer.domElement);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 10, 14.5);
		scene.add(directionalLight);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const loader = new GLTFLoader();
		loader.load(
			"https://www.dropbox.com/scl/fi/pek1ab847i5w47ejgkpg5/ASSEMBLED.glb?rlkey=hoyodxgxcd5v74tj17xkhcuef&st=h9icsizr&dl=1",
			(gltf: any) => {
				const model = gltf.scene;
				scene.add(model);
				model.rotation.y = Math.PI;
			},
			undefined,
			(error: any) => {
				console.error("Error loading GLB:", error);
			}
		);

		const animate = () => {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		};

		animate();

		const onResize = () => {
			if (!containerRef.current) return;
			camera.aspect =
				containerRef.current.clientWidth /
				containerRef.current.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(
				containerRef.current.clientWidth,
				containerRef.current.clientHeight
			);
		};

		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
			renderer.dispose();
		};
	}, []);

	return (
		<div ref={containerRef} style={{ width: "100%", height: "600px" }} />
	);
}
