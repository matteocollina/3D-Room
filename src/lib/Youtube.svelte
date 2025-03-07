<script lang="ts">
	import type { Props } from '@threlte/core';

	import { HTML } from '@threlte/extras';
	import type { Snippet } from 'svelte';
	import type * as THREE from 'three';
	import VideoPlayer from './components/extra/video-player/VideoPlayer.svelte';

	let {
		children,
		ref = $bindable(),
		videoId,
		playPause = $bindable(),
		...props
	}: Props<THREE.Group> & {
		ref?: THREE.Group;
		videoId?: string;
		children?: Snippet<[{ ref: THREE.Group }]>;
		playPause?: () => void;
	} = $props();
</script>

<HTML transform {...props} bind:ref occlude="blending" scale={0.1} pointerEvents="none">
	<div class="h-[150px] w-[270px]">
		<VideoPlayer id={videoId} bind:playPause />
	</div>
</HTML>
