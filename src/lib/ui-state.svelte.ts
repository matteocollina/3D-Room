import { trackEvent } from './analytics';
import { AllObjects } from './models';
import { getRoom, resolveHandle } from './oauth/auth.svelte';
import { roomState, type RoomObjectData } from './state.svelte';
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
	const room = await getRoom({ did });

	roomState.did = room.room.did || did;
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

	userInfo.profile = room.profile;

	trackEvent('room_view', {
		view_handle: handle
	});

	return room.profile;
}
