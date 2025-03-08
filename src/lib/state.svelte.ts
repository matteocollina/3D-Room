import type { TransformControls } from '@threlte/extras';
import { AllObjects, type RoomObjectKind } from './models';
import { trackEvent } from './analytics';

export const currentVersion = 0;

export const roomState: {
	wallColor: string;
	floorColor: string;
	objects: RoomObjectData[];

	size: { x: number; z: number };

	id: number;

	version: number;

	did: string;
} = $state({
	wallColor: '#f1f1f1',
	floorColor: '#a1a1a1',

	objects: [],

	size: { x: 2, z: 3 },

	id: 0,

	version: currentVersion,

	did: ''
});

export const editorState: {
	startIndex: number;
	shownCount: number;

	selectedObject: RoomObjectData | null;
	transformControls: TransformControls | undefined;
	placingObject: RoomObjectData | null;

	isEditing: boolean;
} = $state({
	startIndex: 0,
	shownCount: 3,

	selectedObject: null,
	transformControls: undefined,
	placingObject: null,

	isEditing: false
});

export type BlueskyBlob = {
	$type: 'blob';
	ref: {
		$link: string;
	};
	mimeType: string;
	size: number;
};

export type RoomObjectData = {
	kind: RoomObjectKind;
	position: [number, number, number];
	rotation: number;
	colors: string[];
	placement: 'floor' | 'wallX' | 'wallZ';
	link?: string;
	image?: string | BlueskyBlob;
};

export function applyTransformOfSelected() {
	if (editorState.selectedObject && editorState.transformControls?.object) {
		editorState.selectedObject.position = [
			editorState.transformControls.object.position.x,
			editorState.transformControls.object.position.y,
			editorState.transformControls.object.position.z
		];

		if (editorState.selectedObject.placement === 'wallX') {
			editorState.selectedObject.rotation = editorState.transformControls.object.rotation.x;
		} else if (editorState.selectedObject.placement === 'wallZ') {
			editorState.selectedObject.rotation = editorState.transformControls.object.rotation.z;
		} else {
			editorState.selectedObject.rotation = editorState.transformControls.object.rotation.y;
		}

		saveRoomToLocalStorage();
	}
}

export function saveRoomToLocalStorage() {
	trackEvent('room_save_local', { count: roomState.objects.length });

	localStorage.setItem('roomState', JSON.stringify(roomState));
}

export function rotateObject(rotation: number) {
	if (editorState.selectedObject) {
		applyTransformOfSelected();

		const selectedObject = editorState.selectedObject;
		editorState.selectedObject = null;

		setTimeout(() => {
			// rotate right
			selectedObject.rotation -= rotation;
			editorState.selectedObject = selectedObject;
		}, 0);
		saveRoomToLocalStorage();
	} else if (editorState.placingObject) {
		editorState.placingObject.rotation = (editorState.placingObject.rotation ?? 0) - rotation;
		saveRoomToLocalStorage();
	}
}

export function rotateRight() {
	rotateObject(Math.PI / 8);
}

export function rotateLeft() {
	rotateObject(-Math.PI / 8);
}

export function tryLoadingRoomFromLocalStorage(otherWiseReset: boolean = false) {
	const room = localStorage.getItem('roomState');
	if (room) {
		trackEvent('room_load_local', { count: roomState.objects.length });

		const roomObject = JSON.parse(room);
		roomState.floorColor = roomObject.floorColor;
		roomState.wallColor = roomObject.wallColor;
		roomState.objects = roomObject.objects;
		roomState.size = roomObject.size;
		roomState.id = roomObject.id ?? Math.random();
		roomState.did = roomObject.did;
	} else if (otherWiseReset) {
		roomState.floorColor = '#a1a1a1';
		roomState.wallColor = '#f1f1f1';
		roomState.objects = [];
		roomState.size = { x: 2, z: 3 };
		roomState.id = Math.random();
		roomState.version = currentVersion;
		roomState.did = '';
	}
}

export function deleteSelectedObject() {
	roomState.objects = roomState.objects.filter((object) => object !== editorState.selectedObject);

	editorState.selectedObject = null;

	saveRoomToLocalStorage();
}

export function placeObject(point: { x: number; y: number; z: number }) {
	if (editorState.placingObject) {
		roomState.objects.push(editorState.placingObject);
		editorState.placingObject.position = [point.x, point.y, point.z];
		editorState.selectedObject = editorState.placingObject;

		editorState.placingObject = null;

		saveRoomToLocalStorage();
	}
}

export function makeSelectedObjectPlacingObject() {
	if (editorState.selectedObject && !editorState.placingObject) {
		editorState.placingObject = editorState.selectedObject;
		roomState.objects = roomState.objects.filter((object) => object !== editorState.selectedObject);
	}
}

export function getPossiblePlacementForPlacingObject() {
	if (!editorState.placingObject) return undefined;

	const object = editorState.placingObject;

	return AllObjects[object.kind]?.placement ?? 'floor';
}
