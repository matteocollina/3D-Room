<script lang="ts">
	import type * as THREE from 'three';
	import { T, type Props } from '@threlte/core';
	import { roomState } from './state.svelte';

	let { size = [0.1, 2, 1], ...restProps }: Props<THREE.Mesh> & { size?: [number, number, number] } = $props();
</script>

<T.Mesh {...restProps} receiveShadow castShadow>
	<T.BoxGeometry args={size} />
	<T.MeshStandardMaterial color={roomState.wallColor} />
</T.Mesh>
