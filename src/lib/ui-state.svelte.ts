import { toast } from 'svelte-sonner';
import { AllObjects } from './models';
import { client, getRoom, resolveHandle } from './oauth/auth.svelte';
import {
	applyTransformOfSelected,
	editorState,
	roomState,
	type RoomObjectData
} from './state.svelte';
import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export const modals = $state({
	selectCategoryModalOpen: false,
	roomSettingsModalState: false,
	linkModalState: false,
	infoModalState: false,
	successModalState: false,
	signInSuccessModalState: false
});

export const userInfo: {
	handle: string;
	did: string;
	profile: ProfileViewDetailed | null;
} = $state({
	handle: '',
	did: '',
	profile: null
});

export async function loadRoomFromBluesky(handle: string) {
	const did = await resolveHandle({ handle });
	console.log(did);
	const room = await getRoom({ did });
	console.log(room);

	roomState.wallColor = room.room.wallColor;
	roomState.floorColor = room.room.floorColor;

	const availableObjects = new Set(Object.keys(AllObjects));

	roomState.objects = room.room.objects.filter((object: RoomObjectData) =>
		availableObjects.has(object.kind as string)
	);
	if (roomState.objects.length !== room.room.objects.length) {
		console.warn('some objects were not found and removed!');
	}

	roomState.size = room.room.size;
	roomState.id = room.room.id;
	roomState.version = room.room.version;

	// @ts-expect-error umami is not defined in the global scope
	if (window.umami) {
		// @ts-expect-error umami is not defined in the global scope
		window.umami.track('room_view', {
			handle: handle
		});
	}
	return room.profile;
}

export async function saveRoomToBluesky() {
	if (!client.rpc || !client.profile) {
		toast.error('Failed to save room, please log in first');
		return;
	}

	applyTransformOfSelected();

	editorState.selectedObject = null;

	try {
		// @ts-expect-error umami is not defined in the global scope
		if (window.umami) {
			// @ts-expect-error umami is not defined in the global scope
			window.umami?.track('room_save_try', {
				handle: client.profile.handle,
				did: client.profile.did,
				objectCount: roomState.objects.length
			});
		}

		await client.rpc.call('com.atproto.repo.putRecord', {
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

		// @ts-expect-error umami is not defined in the global scope
		if (window.umami) {
			// @ts-expect-error umami is not defined in the global scope
			window.umami?.track('room_save_success', {
				handle: client.profile.handle,
				did: client.profile.did,
				objectCount: roomState.objects.length
			});
			console.log('saved room_save');
		}

		modals.successModalState = true;

		toast.success('Room saved to your profile');
	} catch (e) {
		console.error(e);
		// @ts-expect-error umami is not defined in the global scope
		if (window.umami) {
			// @ts-expect-error umami is not defined in the global scope
			window.umami?.track('room_save_error', {
				handle: client.profile.handle,
				did: client.profile.did
			});
		}
		toast.error('Failed to save room, please try again');
	}
}
