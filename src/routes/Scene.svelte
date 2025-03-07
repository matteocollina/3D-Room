<script lang="ts">
	import RoomObject from '$lib/RoomObject.svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { Color } from 'three';
	import { Align } from '@threlte/extras';

	let { kind } = $props();

	const { scene } = useThrelte();
	let rotation = $state(0);

	useTask((delta) => {
		rotation += delta;
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 0, 2]}
	fov={50}
	near={1}
	far={10}
></T.PerspectiveCamera>

<T.HemisphereLight args={[0xaaaaaa, 0x444444, 1]} />
<T.DirectionalLight args={[0xffffff, 1]} position={[1, 1, 1]} />

<RoomObject {kind} rotation={[0.5, rotation, 0]} scale={0.4} />
