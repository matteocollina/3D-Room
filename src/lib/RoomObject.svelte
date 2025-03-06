<script lang="ts">
	import { type Props } from '@threlte/core';
	import type * as THREE from 'three';
	import type { RoomObjectKind } from './state.svelte';
	import { AllObjects } from './state.svelte';

	let {
		kind,
		selected,
		colors,
		opacity,
		...restProps
	}: {
		kind: RoomObjectKind;
		selected?: boolean;
		colors?: (number | string)[];
		opacity?: number;
	} & Props<THREE.Group> = $props();

		console.log(kind);

	let ObjectComponent = AllObjects[kind]?.component;
</script>

{@render object()}

{#snippet object()}
	<ObjectComponent {...restProps} colors={colors} opacity={opacity} />
{/snippet}