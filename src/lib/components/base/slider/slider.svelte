<script lang="ts">
	import { Slider as SliderPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(null),
		value = $bindable(),
		orientation = 'horizontal',
		class: className,
		tabindex = undefined,
		...restProps
	}: WithoutChildrenOrChild<SliderPrimitive.RootProps> = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
	bind:ref
	bind:value={value as never}
	{orientation}
	class={cn(
		"relative flex touch-none items-center select-none data-[orientation='horizontal']:w-full data-[orientation='vertical']:h-full data-[orientation='vertical']:min-h-44 data-[orientation='vertical']:w-auto data-[orientation='vertical']:flex-col",
		className
	)}
	{tabindex}
	{...restProps}
>
	{#snippet children({ thumbs })}
		<span
			data-orientation={orientation}
			class="relative grow overflow-hidden rounded-full data-[orientation='horizontal']:h-2 data-[orientation='horizontal']:w-full data-[orientation='vertical']:h-full data-[orientation='vertical']:w-2"
		>
			<div
				class="bg-base-300/30 dark:bg-base-800 border-base-400/50 dark:border-base-700 absolute inset-0 rounded-full border"
			></div>

			<SliderPrimitive.Range
				class="bg-accent-400 dark:bg-accent-600 absolute rounded-full data-[orientation='horizontal']:h-full data-[orientation='vertical']:w-full"
			/>
		</span>
		{#each thumbs as thumb}
			<SliderPrimitive.Thumb
				index={thumb}
				class="border-accent-400 dark:border-accent-600 bg-accent-600 dark:bg-accent-800 focus-visible:outline-accent-700 dark:focus-visible:outline-accent-400 block size-6 rounded-full border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50"
				{tabindex}
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
