<script lang="ts">
	import type { Props } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import type * as THREE from 'three';
	import { getImage } from './images.svelte';
	import { userInfo } from './ui-state.svelte';
	import { getImageBlobUrl } from './oauth/auth.svelte';
	import { roomState } from './state.svelte';

	let {
		ref = $bindable(),
		size = [270, 150],
		image,
		...props
	}: Props<THREE.Group> & {
		ref?: THREE.Group;
		size?: [number, number];
		image?: string;
	} = $props();

	let myImage = $derived.by(() => {
		if (!image) return;

		if (typeof image === 'string' && image.startsWith('local:')) {
			return getImage(image.replace('local:', ''));
			// @ts-ignore
		} else if (typeof image === 'object' && image.$type === 'blob' && roomState.did) {
			// @ts-ignore
			return getImageBlobUrl({ did: roomState.did, link: image.ref.$link });
		}
		return null;
	});

</script>

<HTML transform bind:ref occlude="blending" scale={0.1} pointerEvents="none" {...props}>
	<div style="width: {size?.[0] ?? 270}px; height: {size?.[1] ?? 150}px;" class="bg-black">
		{#await myImage then myImage}
			{#if myImage}
				<img src={myImage} alt="" class="h-full w-full object-cover select-none touch-none" />
			{/if}
		{/await}
	</div>
</HTML>
