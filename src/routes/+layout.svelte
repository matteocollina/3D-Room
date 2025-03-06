<script lang="ts">
	import '../app.css';

	import { onMount } from 'svelte';
	import { initClient, login } from '$lib/oauth';
	import BlueskyLoginModal from '$lib/components/base/modal/BlueskyLoginModal.svelte';
	import Head from '$lib/components/base/head/Head.svelte';
	import { base } from '$app/paths';

	let { children } = $props();

	onMount(() => {
		initClient();
	});
</script>

{@render children()}

<BlueskyLoginModal login={login} />

<Head emojiFavicon="🏠" title="my room" description="create your own room and share it on bluesky" image={base + "/og-image.png"} />
