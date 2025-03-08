<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from '$lib/Scene.svelte';
	import { onMount } from 'svelte';
	import { client } from '$lib/oauth/auth.svelte';
	import {
		applyTransformOfSelected,
		deleteSelectedObject,
		editorState,
		makeSelectedObjectPlacingObject,
		roomState,
		rotateLeft,
		rotateRight,
		tryLoadingRoomFromLocalStorage
	} from '$lib/state.svelte';
	import { Button } from '$lib/components/base/button';
	import Modal from '$lib/components/base/modal/Modal.svelte';
	import Heading from '$lib/components/base/heading/Heading.svelte';

	import EditorUi from './EditorUI.svelte';
	import PreviewUi from './PreviewUI.svelte';
	import { loadRoomFromBluesky, modals, userInfo } from '$lib/ui-state.svelte';

	let loading = $state(true);

	onMount(async () => {
		window.addEventListener('keydown', (e) => {
			if (e.key === 'x') {
				deleteSelectedObject();

				if (editorState.placingObject) {
					editorState.placingObject = null;
				}
			}
			if (e.key === 'd' || e.key === 'ArrowRight') {
				rotateRight();
			} else if (e.key === 'a' || e.key === 'ArrowLeft') {
				rotateLeft();
			}

			// escape
			if (e.key === 'Escape') {
				editorState.placingObject = null;

				applyTransformOfSelected();
				editorState.selectedObject = null;
			}

			if (e.key === 'g') {
				makeSelectedObjectPlacingObject();
			}

			if (e.key === 'c') {
				// duplicate selected object
				if (editorState.selectedObject) {
					editorState.placingObject = JSON.parse(JSON.stringify(editorState.selectedObject));

					applyTransformOfSelected();
					editorState.selectedObject = null;
				}
			}
		});

		// get handle from url search params
		let handle = new URLSearchParams(window.location.search).get('handle');
		if (!handle) {
			tryLoadingRoomFromLocalStorage();
			loading = false;
			userInfo.handle = '';
			editorState.isEditing = true;
			return;
		}

		userInfo.handle = handle;

		await loadRoomFromBluesky(handle);

		loading = false;
	});

	$effect(() => {
		if (client.justLoggedIn) {
			modals.signInSuccessModalState = true;
			client.justLoggedIn = false;
		}
	});
</script>

<div class="fixed inset-0 -z-20 h-[100dvh] w-screen">
	<Canvas>
		<Scene />
	</Canvas>
</div>

{#if editorState.isEditing}
	<EditorUi />
{:else if !loading}
	<PreviewUi />
{:else}
	<div
		class="bg-base-100 dark:bg-base-950 fixed inset-0 flex h-[100dvh] w-screen items-center justify-center"
	>
		<Heading>Loading...</Heading>
	</div>
{/if}

<Modal bind:open={modals.signInSuccessModalState}>
	<Heading class="flex items-center gap-4">
		<svg
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			fill="currentColor"
			class="text-accent-600 dark:text-accent-400 size-8"
			><path
				d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
			/></svg
		>
		Sign in successful</Heading
	>

	<div class="text-base-800 dark:text-base-200 flex flex-col gap-2 text-sm">
		<p>If you haven't already, create a room to get started.</p>

		<p>You can then save your room to your profile and share it on bluesky.</p>

		<p>Feel free to tag me when sharing your room so I can admire your creation 😊</p>

		<p class="mt-4">
			my handle: <a
				href="https://bsky.app/profile/flo-bit.dev"
				target="_blank"
				class="text-accent-700 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-500 font-medium"
				>@flo-bit.dev</a
			>
		</p>

		<Button
			class="mt-4"
			onclick={() => {
				tryLoadingRoomFromLocalStorage(true);

				editorState.isEditing = true;
				modals.signInSuccessModalState = false;
			}}
		>
			Go to my room
		</Button>
	</div>
</Modal>
