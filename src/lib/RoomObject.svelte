<script lang="ts">
	import { type Props } from '@threlte/core';
	import type * as THREE from 'three';
	import { AllObjects, type RoomObjectKind } from './models';

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