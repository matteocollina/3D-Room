<!--
Auto-generated by: https://github.com/threlte/threlte/tree/main/packages/gltf
Command: npx @threlte/gltf@3.0.0 -t -s -u models/kaykit-furniture-kit/shelf_b_small.glb -r /room/
-->

<script lang="ts">
	import type * as THREE from 'three';

	import type { Snippet } from 'svelte';
	import { T, type Props } from '@threlte/core';
	import { useGltf, useSuspense } from '@threlte/extras';

	import { type ExtraRoomObjectProps } from '../types';
	import RoomObjectMaterial from '../RoomObjectMaterial.svelte';
	import { base } from '$app/paths';

	let {
		fallback,
		error,
		children,
		ref = $bindable(),
		colors,
		opacity,
		...props
	}: Props<THREE.Group> & {
		ref?: THREE.Group;
		children?: Snippet<[{ ref: THREE.Group }]>;
		fallback?: Snippet;
		error?: Snippet<[{ error: Error }]>;
	} & ExtraRoomObjectProps = $props();

	const suspend = useSuspense();

	type GLTFResult = {
		nodes: {
			Cube027: THREE.Mesh;
			Cube027_1: THREE.Mesh;
		};
		materials: {
			a: THREE.MeshStandardMaterial;
			b: THREE.MeshStandardMaterial;
		};
	};

	const gltf = suspend(
		useGltf<GLTFResult>(base + '/models/kaykit-furniture-kit/shelf_b_small.glb')
	);
</script>

<T.Group bind:ref dispose={false} {...props}>
	{#await gltf}
		{@render fallback?.()}
	{:then gltf}
		<T.Group>
			<T.Mesh castShadow receiveShadow geometry={gltf.nodes.Cube027.geometry}
				><RoomObjectMaterial index={0} {colors} {opacity} /></T.Mesh
			>
			<T.Mesh castShadow receiveShadow geometry={gltf.nodes.Cube027_1.geometry}
				><RoomObjectMaterial index={1} {colors} {opacity} /></T.Mesh
			>
		</T.Group>
	{:catch err}
		{@render error?.({ error: err })}
	{/await}

	{@render children?.({ ref })}
</T.Group>
