<script lang="ts">
	import type * as THREE from 'three';
	import { T, type Props } from '@threlte/core';
	import { roomState } from './state.svelte';

	let { ...restProps }: Props<THREE.Mesh> = $props();
</script>

<T.Mesh {...restProps} receiveShadow castShadow>
	<T.BoxGeometry args={[0.1, 2, 1]} />
	<T.MeshStandardMaterial color={roomState.wallColor} />
</T.Mesh>
