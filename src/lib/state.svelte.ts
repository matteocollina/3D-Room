import type { TransformControls } from '@threlte/extras';
import type { RoomObjectKind } from './models';

export const currentVersion = 0;

export const roomState: {
	wallColor: string;
	floorColor: string;
	objects: RoomObjectData[];

	size: { x: number; z: number };

	id: number;

	version: number;
} = $state({
	wallColor: '#f1f1f1',
	floorColor: '#a1a1a1',

	objects: [],

	size: { x: 2, z: 3 },

	id: 0,

	version: currentVersion
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

export type RoomObjectData = {
	kind: RoomObjectKind;
	position: [number, number, number];
	rotation: number;
	colors: string[];
	placement: 'floor' | 'wallX' | 'wallZ';
};

export function applyTransformOfSelected() {
	if (editorState.selectedObject && editorState.transformControls?.object) {
		editorState.selectedObject.position = [
			editorState.transformControls.object.position.x,
			editorState.transformControls.object.position.y,
			editorState.transformControls.object.position.z
		];

		editorState.selectedObject.rotation = editorState.transformControls.object.rotation.y;

		saveRoomToLocalStorage();
	}
}

export function saveRoomToLocalStorage() {
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

export function tryLoadingRoomFromLocalStorage(otherWiseReset: boolean = false) {
	const room = localStorage.getItem('roomState');
	if (room) {
		const roomObject = JSON.parse(room);
		roomState.floorColor = roomObject.floorColor;
		roomState.wallColor = roomObject.wallColor;
		roomState.objects = roomObject.objects;
		roomState.size = roomObject.size;
		roomState.id = roomObject.id ?? Math.random();
	} else if (otherWiseReset) {
		roomState.floorColor = '#a1a1a1';
		roomState.wallColor = '#f1f1f1';
		roomState.objects = [];
		roomState.size = { x: 2, z: 3 };
		roomState.id = Math.random();
		roomState.version = currentVersion;
	}
}
