<script lang="ts">
	import { T } from '@threlte/core';
	import { defaultColorImage, defaultColors } from './types';

	let {
		index,
		colors,
		opacity,
		youtube,
		image,
		isImage
	}: {
		index?: number;
		colors?: string[];
		opacity?: number;
		youtube?: string;
		image?: string;
	} = $props();

	function getColor() {
		if (image) {
			return defaultColorImage;
		}
		return colors?.[index ?? 0] ?? defaultColors[index ?? 0];
	}
</script>

<T.MeshStandardMaterial color={getColor()} {opacity} transparent={opacity ? opacity < 1 : false} />
