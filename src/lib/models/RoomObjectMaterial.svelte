<script lang="ts">
	import { T, type Props } from '@threlte/core';
	import { defaultColorImage, defaultColors } from './types';
	import type { MeshStandardMaterial } from 'three';

	let {
		index,
		colors,
		opacity,
		youtube,
		image,
		isImage,
		...props
	}: {
		index?: number;
		colors?: string[];
		opacity?: number;
		youtube?: string;
		image?: string;
	} & Props<MeshStandardMaterial> = $props();

	function getColor() {
		if (image) {
			return defaultColorImage;
		}
		return colors?.[index ?? 0] ?? defaultColors[index ?? 0];
	}
</script>

<T.MeshStandardMaterial
	color={getColor()}
	{opacity}
	transparent={opacity ? opacity < 1 : false}
	{...props}
/>
