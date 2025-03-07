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
		colors?: string[];
		opacity?: number;
	} & Props<THREE.Group> = $props();

	let ObjectComponent = AllObjects[kind]?.component;
</script>

{@render object()}

{#snippet object()}
	<ObjectComponent
		{...restProps}
		{colors}
		{opacity}
		videoId={'https://www.youtube.com/watch?v=k1BneeJTDcU'}
		scale={0.3}
	/>
{/snippet}
