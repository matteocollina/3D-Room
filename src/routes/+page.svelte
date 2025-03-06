<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from '$lib/Scene.svelte';
	import { onMount } from 'svelte';
	import { client, getRoom, resolveHandle } from '$lib/oauth/auth.svelte';
	import {
		AllObjects,
		editorState,
		roomState,
		applyTransformOfSelected,
		rotateObject,
		type RoomObjectData,
		saveRoomToLocalStorage,
		currentVersion,
		tryLoadingRoomFromLocalStorage
	} from '$lib/state.svelte';
	import { Button } from '$lib/components/base/button';
	import { blueskyLoginModalState } from '$lib/components/base/modal/BlueskyLoginModal.svelte';
	import NumberInput from '$lib/components/base/number-input/NumberInput.svelte';
	import Modal from '$lib/components/base/modal/Modal.svelte';
	import Heading from '$lib/components/base/heading/Heading.svelte';
	import Subheading from '$lib/components/base/heading/Subheading.svelte';

	import * as Popover from '$lib/components/base/popover';
	import { cn } from '$lib/utils';
	import ColorPicker from '$lib/components/extra/color-picker';
	import {
		hex_to_rgb,
		okhsv_to_rgb,
		rgb_to_hex,
		rgb_to_okhsv
	} from '$lib/components/extra/color-picker/color';
	import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
	import Avatar from '$lib/components/base/avatar/Avatar.svelte';

	async function saveRoomToBluesky() {
		if (!client.rpc || !client.profile) return;

		applyTransformOfSelected();

		editorState.selectedObject = null;

		try {
			const hello = await client.rpc.call('com.atproto.repo.putRecord', {
				data: {
					collection: 'dev.flo-bit.room',
					repo: client.profile.did,
					rkey: 'self',
					record: {
						roomState: JSON.parse(
							JSON.stringify({
								wallColor: roomState.wallColor,
								floorColor: roomState.floorColor,
								objects: roomState.objects,
								size: roomState.size,
								id: roomState.id,
								version: roomState.version
							})
						)
					}
				}
			});

			// @ts-ignore
			if (window.umami) {
				// @ts-ignore
				window.umami?.track('room_save', {
					handle: client.profile.handle,
					objectCount: roomState.objects.length
				});
			}

			// TODO: show success modal
			successModalState = true;
		} catch (e) {
			console.error(e);
		}
	}

	let profile: ProfileViewDetailed | null = $state(null);

	let loading = $state(true);

	let currentHandle = $state('flo-bit.dev');

	let successModalState = $state(false);

	let signInSuccessModalState = $state(false);

	async function loadRoomFromBluesky(handle: string) {
		const did = await resolveHandle({ handle });
		console.log(did);
		const room = await getRoom({ did });
		console.log(room);

		roomState.wallColor = room.room.wallColor;
		roomState.floorColor = room.room.floorColor;

		let availableObjects = new Set(Object.keys(AllObjects));

		roomState.objects = room.room.objects.filter((object: RoomObjectData) =>
			availableObjects.has(object.kind)
		);
		if (roomState.objects.length !== room.room.objects.length) {
			console.warn('some objects were not found and removed!');
		}

		roomState.size = room.room.size;
		roomState.id = room.room.id;
		roomState.version = room.room.version;

		profile = room.profile;

		// @ts-ignore
		if (window.umami) {
			// @ts-ignore
			window.umami.track('room_view', {
				handle: handle
			});
		}
	}

	onMount(async () => {
		if (client.justLoggedIn) {
			successModalState = true;
			client.justLoggedIn = false;
		}

		window.addEventListener('keydown', (e) => {
			if (e.key === 'x') {
				deleteSelectedObject();
			}
		});

		// get handle from url search params
		let handle = new URLSearchParams(window.location.search).get('handle');
		if (!handle) {
			handle = 'flo-bit.dev';
		}

		currentHandle = handle;

		await loadRoomFromBluesky(handle);

		loading = false;
	});

	let roomSettingsModalState = $state(false);
	let createRoomModalState = $state(false);
	let infoModalState = $state(false);

	let okhsv = $state({ h: 180, s: 0.0, v: 0.95 });
	let okhsv2 = $state({ h: 180, s: 0.0, v: 0.95 });
	let okhsv3 = $state({ h: 180, s: 0.0, v: 0.95 });
	let okhsv4 = $state({ h: 180, s: 0.0, v: 0.95 });
	let okhsv5 = $state({ h: 180, s: 0.0, v: 0.95 });

	let okhsv_wall = $state({ h: 180, s: 0.0, v: 0.95 });
	let okhsv_floor = $state({ h: 180, s: 0.0, v: 0.95 });

	function deleteSelectedObject() {
		roomState.objects = roomState.objects.filter((object) => object !== editorState.selectedObject);

		editorState.selectedObject = null;
	}

	$effect(() => {
		if (!editorState.selectedObject) return;

		okhsv = rgb_to_okhsv(hex_to_rgb(editorState.selectedObject.colors[0]));
		okhsv2 = rgb_to_okhsv(hex_to_rgb(editorState.selectedObject.colors[1]));
		okhsv3 = rgb_to_okhsv(hex_to_rgb(editorState.selectedObject.colors[2]));

		okhsv_wall = rgb_to_okhsv(hex_to_rgb(roomState.wallColor));
		okhsv_floor = rgb_to_okhsv(hex_to_rgb(roomState.floorColor));
	});

	$effect(() => {
		if (client.justLoggedIn) {
			signInSuccessModalState = true;
			client.justLoggedIn = false;
		}
	});
</script>

<div class="h-[100dvh] w-screen">
	<Canvas>
		<Scene />
	</Canvas>
</div>

{#if editorState.isEditing}
	<Button
		class="fixed right-4 bottom-4"
		onclick={() => {
			editorState.startIndex += editorState.shownCount;
			if (editorState.startIndex >= Object.keys(AllObjects).length) {
				editorState.startIndex = 0;
			}
		}}>&rarr;</Button
	>

	<Button
		class="fixed bottom-4 left-4"
		onclick={() => {
			editorState.startIndex -= editorState.shownCount;
			if (editorState.startIndex < 0) {
				editorState.startIndex = Object.keys(AllObjects).length - editorState.shownCount;
			}
		}}>&larr;</Button
	>

	<div class="fixed top-4 left-4 flex flex-col items-start gap-2">
		<Button
			size="iconLg"
			onclick={() => {
				roomSettingsModalState = true;
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="size-6"
			>
				<path
					fill-rule="evenodd"
					d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
					clip-rule="evenodd"
				/>
			</svg>
		</Button>

		{#if editorState.selectedObject}
			<Button
				variant="red"
				size="icon"
				class="mt-8"
				onclick={() => {
					roomState.objects = roomState.objects.filter(
						(object) => object !== editorState.selectedObject
					);

					editorState.selectedObject = null;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-6"
				>
					<path
						fill-rule="evenodd"
						d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
						clip-rule="evenodd"
					/>
				</svg>

				<span class="sr-only">Delete selected object</span>
			</Button>

			<div class="mt-4">
				<Button
					size="icon"
					onclick={() => {
						rotateObject(-Math.PI / 6);
					}}
					variant="secondary"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="-scale-x-100"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
						/>
					</svg>
				</Button>

				<Button
					size="icon"
					onclick={() => {
						rotateObject(Math.PI / 6);
					}}
					variant="secondary"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class=""
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
						/>
					</svg>
				</Button>
			</div>

			<Popover.Root>
				<Popover.Trigger class={cn('mt-5 ml-1 cursor-pointer')}>
					<div
						class="border-base-300 dark:border-base-700 z-10 size-8 rounded-full border"
						style={`background-color: ${editorState.selectedObject.colors[0]};`}
					></div>
				</Popover.Trigger>
				<Popover.Content side="right" sideOffset={10}>
					<ColorPicker
						bind:okhsv
						on:change={(e) => {
							if (!editorState.selectedObject) return;

							const rgb = okhsv_to_rgb(okhsv);
							editorState.selectedObject.colors[0] = rgb_to_hex(rgb);
						}}
					/>
				</Popover.Content>
			</Popover.Root>

			{#if AllObjects[editorState.selectedObject.kind].colors > 1}
				<Popover.Root>
					<Popover.Trigger class={cn('mt-2 ml-1 cursor-pointer')}>
						<div
							class="border-base-300 dark:border-base-700 z-10 size-8 rounded-full border"
							style={`background-color: ${editorState.selectedObject.colors[1]};`}
						></div>
					</Popover.Trigger>
					<Popover.Content side="left" sideOffset={10}>
						<ColorPicker
							bind:okhsv={okhsv2}
							on:change={(e) => {
								if (!editorState.selectedObject) return;

								const rgb = okhsv_to_rgb(okhsv2);
								editorState.selectedObject.colors[1] = rgb_to_hex(rgb);

								saveRoomToLocalStorage();
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			{/if}

			{#if AllObjects[editorState.selectedObject.kind].colors > 2}
				<Popover.Root>
					<Popover.Trigger class={cn('mt-2 ml-1 cursor-pointer')}>
						<div
							class="border-base-300 dark:border-base-700 z-10 size-8 rounded-full border"
							style={`background-color: ${editorState.selectedObject.colors[2]};`}
						></div>
					</Popover.Trigger>
					<Popover.Content side="left" sideOffset={10}>
						<ColorPicker
							bind:okhsv={okhsv3}
							on:change={(e) => {
								if (!editorState.selectedObject) return;

								const rgb = okhsv_to_rgb(okhsv3);
								editorState.selectedObject.colors[2] = rgb_to_hex(rgb);

								saveRoomToLocalStorage();
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			{/if}

			{#if AllObjects[editorState.selectedObject.kind].colors > 3}
				<Popover.Root>
					<Popover.Trigger class={cn('mt-2 ml-1 cursor-pointer')}>
						<div
							class="border-base-300 dark:border-base-700 z-10 size-8 rounded-full border"
							style={`background-color: ${editorState.selectedObject.colors[3]};`}
						></div>
					</Popover.Trigger>
					<Popover.Content side="left" sideOffset={10}>
						<ColorPicker
							bind:okhsv={okhsv4}
							on:change={(e) => {
								if (!editorState.selectedObject) return;

								const rgb = okhsv_to_rgb(okhsv4);
								editorState.selectedObject.colors[3] = rgb_to_hex(rgb);

								saveRoomToLocalStorage();
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			{/if}

			{#if AllObjects[editorState.selectedObject.kind].colors > 4}
				<Popover.Root>
					<Popover.Trigger class={cn('mt-2 ml-1 cursor-pointer')}>
						<div
							class="border-base-300 dark:border-base-700 z-10 size-8 rounded-full border"
							style={`background-color: ${editorState.selectedObject.colors[4]};`}
						></div>
					</Popover.Trigger>
					<Popover.Content side="left" sideOffset={10}>
						<ColorPicker
							bind:okhsv={okhsv5}
							on:change={(e) => {
								if (!editorState.selectedObject) return;

								const rgb = okhsv_to_rgb(okhsv5);
								editorState.selectedObject.colors[4] = rgb_to_hex(rgb);

								saveRoomToLocalStorage();
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			{/if}
		{/if}
	</div>
	<div class="fixed top-4 right-4 flex flex-col items-end gap-2">
		{#if !client || !client.isLoggedIn}
			<Button
				onclick={() => {
					applyTransformOfSelected();

					blueskyLoginModalState.open = true;
				}}
			>
				<svg
					role="img"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					fill="currentColor"
					><path
						d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
					/></svg
				>
				Login</Button
			>
		{:else}
			<Button
				onclick={() => {
					saveRoomToBluesky();
				}}>Save & Share</Button
			>
		{/if}

		<Popover.Root>
			<Popover.Trigger class={cn('mt-5 ml-1 cursor-pointer')}>
				<div
					class="border-base-300 dark:border-base-700 z-10 size-8 rounded-full border"
					style={`background-color: ${roomState.wallColor};`}
				></div>
			</Popover.Trigger>
			<Popover.Content side="right" sideOffset={10}>
				<ColorPicker
					bind:okhsv={okhsv_wall}
					on:change={(e) => {
						const rgb = okhsv_to_rgb(okhsv_wall);
						roomState.wallColor = rgb_to_hex(rgb);
						saveRoomToLocalStorage();
					}}
				/>
			</Popover.Content>
		</Popover.Root>

		<Popover.Root>
			<Popover.Trigger class={cn('mt-5 ml-1 cursor-pointer')}>
				<div
					class="border-base-300 dark:border-base-700 z-10 size-8 rounded-full border"
					style={`background-color: ${roomState.floorColor};`}
				></div>
			</Popover.Trigger>
			<Popover.Content side="right" sideOffset={10}>
				<ColorPicker
					bind:okhsv={okhsv_floor}
					on:change={(e) => {
						const rgb = okhsv_to_rgb(okhsv_floor);
						roomState.floorColor = rgb_to_hex(rgb);
						saveRoomToLocalStorage();
					}}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>

	<Modal bind:open={roomSettingsModalState}>
		<div class="flex flex-col items-start gap-4">
			<Heading>Room settings</Heading>

			<Button
				variant="secondary"
				class="mt-4"
				onclick={() => {
					currentHandle = client.profile?.handle ?? '';
					profile = client.profile;
					editorState.isEditing = false;
					roomSettingsModalState = false;
				}}
			>
				Stop editing & Preview
			</Button>

			<Subheading class="mt-2">Room Size</Subheading>
			<div class="flex items-center gap-2">
				<NumberInput
					bind:value={roomState.size.x}
					min={1}
					max={8}
					onchange={() => saveRoomToLocalStorage()}
				/>
				<span class="text-accent-700 dark:text-accent-300">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="3"
						stroke="currentColor"
						class="size-4"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</span>
				<NumberInput
					bind:value={roomState.size.z}
					min={1}
					max={8}
					onchange={() => saveRoomToLocalStorage()}
				/>
			</div>

			<Subheading class="mt-4">Danger zone</Subheading>
			<div class="mt-4 flex gap-2">
				{#if client.isLoggedIn}
					<Button
						variant="red"
						onclick={async () => {
							if (!client.profile?.handle) {
								console.error('no handle found');
								return;
							}
							await loadRoomFromBluesky(client.profile.handle);
							roomSettingsModalState = false;
						}}
					>
						Load from bluesky
					</Button>
				{/if}

				<Button
					variant="red"
					onclick={() => {
						roomState.objects = [];
						editorState.selectedObject = null;
						roomState.size = { x: 2, z: 3 };
						roomState.wallColor = '#f1f1f1';
						roomState.floorColor = '#a1a1a1';

						saveRoomToLocalStorage();
					}}
				>
					Clear room
				</Button>
			</div>
		</div>
	</Modal>
{:else if !loading}
	<div
		class="pointer-events-none fixed top-8 right-4 left-4 flex items-center justify-center gap-2"
	>
		{#if currentHandle}
			<Avatar src={profile?.avatar} />
		{/if}
		<Heading>
			<a
				href={`https://bsky.app/profile/${profile?.handle}`}
				target="_blank"
				class="hover:text-accent-600 dark:hover:text-accent-500 pointer-events-auto"
				>{currentHandle}'s</a
			>
			room</Heading
		>
	</div>

	<div class="pointer-events-none fixed right-4 bottom-4 left-4 flex justify-between">
		<Button
			onclick={() => {
				infoModalState = true;
			}}
			variant="secondary"
		>
			Info
		</Button>

		<Button
			onclick={() => {
				if (client.profile?.handle == currentHandle) {
					editorState.isEditing = true;
					return;
				}

				tryLoadingRoomFromLocalStorage(true);

				editorState.isEditing = true;
			}}
		>
			{client.profile?.handle == currentHandle ? 'Edit room' : 'Create room'}
		</Button>
	</div>
{:else}
	<div
		class="bg-base-100 dark:bg-base-950 fixed inset-0 flex h-[100dvh] w-screen items-center justify-center"
	>
		<Heading>Loading...</Heading>
	</div>
{/if}

<Modal bind:open={infoModalState} class="text-base-900 dark:text-base-50">
	<div>
		This is an experimental web app for creating tiny 3d rooms (and sharing them on bluesky) built
		by
		<a
			href="https://flo-bit.dev"
			target="_blank"
			class="text-accent-700 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-500 font-medium"
			>flo-bit</a
		>
	</div>
	<div>
		It's still a work in progress, but it's open source (<a
			href="https://github.com/flo-bit/room"
			target="_blank"
			class="text-accent-700 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-500 font-medium"
			>source code available here</a
		>), so feel free to contribute or suggest features on github 😊
	</div>

	<div>
		You can also send me a message on <a
			href="https://bsky.app/profile/flo-bit.dev"
			target="_blank"
			class="text-accent-700 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-500 font-medium"
			>bluesky</a
		> (or tag me when sharing your room so I can admire your creation 😊)
	</div>
</Modal>

<Modal bind:open={createRoomModalState}></Modal>

<Modal bind:open={successModalState}>
	<Heading class="flex items-center gap-4">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="text-accent-600 dark:text-accent-400 size-8"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
			/>
		</svg>

		Room saved to your profile</Heading
	>
	<Button
		size="lg"
		class="mt-4 py-3"
		href={'https://bsky.app/intent/compose?text=' +
			encodeURIComponent(
				`Check out my bluesky room: https://flo-bit.dev/room/?handle=${client.profile?.handle}`
			)}
		target="_blank"
	>
		<svg
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			fill="currentColor"
			><path
				d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
			/></svg
		>
		Share on Bluesky</Button
	>
</Modal>

<Modal bind:open={signInSuccessModalState}>
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
				signInSuccessModalState = false;
			}}
		>
			Go to my room
		</Button>
	</div>
</Modal>
