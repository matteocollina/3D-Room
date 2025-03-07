<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Environment, OrbitControls } from '@threlte/extras';
	import { interactivity } from '@threlte/extras';
	interactivity();

	import Room from './Room.svelte';
	import Outline from './Outline.svelte';
	import { roomState } from './state.svelte';
	import { onMount } from 'svelte';
	import { ACESFilmicToneMapping } from 'three';
	import { base } from '$app/paths';

	const { renderer, scene } = useThrelte();

	let lightIntensity = $state(0.4);

	onMount(() => {
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.5;

		let lightModeEnvIntensity = 0.4;
		let darkModeEnvIntensity = 0.1;

		let lightModeLightIntensity = 2;
		let darkModeLightIntensity = 0.3;

		scene.environmentIntensity = window.matchMedia('(prefers-color-scheme: dark)').matches
			? darkModeEnvIntensity
			: lightModeEnvIntensity;
		lightIntensity = window.matchMedia('(prefers-color-scheme: dark)').matches
			? darkModeLightIntensity
			: lightModeLightIntensity;

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			scene.environmentIntensity = e.matches ? darkModeEnvIntensity : lightModeEnvIntensity;
			lightIntensity = e.matches ? darkModeLightIntensity : lightModeLightIntensity;
		});
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[3, 3, 3]}
	oncreate={(ref) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls
		maxDistance={20}
		maxPolarAngle={Math.PI / 2}
		maxAzimuthAngle={2}
		minAzimuthAngle={-1}
	/>
</T.PerspectiveCamera>

{#key roomState.id}
	<Room />
{/key}

<T.DirectionalLight position={[0, 10, 10]} intensity={lightIntensity} castShadow />
<T.DirectionalLight position={[-10, 5, 0]} intensity={lightIntensity} castShadow />
<T.AmbientLight intensity={0.1} />

<Outline />

<Environment isBackground={false} url={base + '/env/workshop.jpg'} />
