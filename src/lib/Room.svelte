<script lang="ts">
	import * as THREE from 'three';
	import { T } from '@threlte/core';
	import {
		applyTransformOfSelected,
		editorState,
		placeObject,
		roomState,
		type RoomObjectData
	} from './state.svelte';
	import RoomObject from './RoomObject.svelte';
	import { Grid, RoundedBoxGeometry, TransformControls } from '@threlte/extras';

	type PointerEvent = {
		stopPropagation: () => void;
		point: { x: number; y: number; z: number };
		normal: { x: number; y: number; z: number };
	};
</script>

<T.Group position.y={-1}>
	<T.Mesh position={[-0.05, 1 - 0.099, -roomState.size.x / 2 - 0.1]} receiveShadow>
		<RoundedBoxGeometry args={[roomState.size.z + 0.18, 2, 0.1]} radius={0.03} />
		<T.MeshStandardMaterial color={roomState.wallColor} />
	</T.Mesh>

	<T.Mesh position={[-roomState.size.z / 2 - 0.1, 1 - 0.099, -0.05]} receiveShadow>
		<RoundedBoxGeometry args={[0.1, 2, roomState.size.x + 0.18]} radius={0.03} />
		<T.MeshStandardMaterial color={roomState.wallColor} />
	</T.Mesh>

	{#if editorState.isEditing}
		<Grid
			gridSize={[roomState.size.z * 2, roomState.size.x * 2]}
			scale={0.5}
			sectionThickness={0}
		/>
	{/if}

	<T.Mesh
		position={[-0.05, -0.0502, -0.05]}
		onpointermove={(e: PointerEvent) => {
			e.stopPropagation();

			if (editorState.placingObject) {
				editorState.placingObject.position = [e.point.x, 0, e.point.z];
			}
		}}
		onclick={(e: PointerEvent) => {
			e.stopPropagation();

			placeObject({ x: e.point.x, y: e.point.y + 1, z: e.point.z });
		}}
		ondblclick={() => {
			if (editorState.selectedObject) {
				applyTransformOfSelected();

				editorState.selectedObject = null;
			}
		}}
		receiveShadow
	>
		<RoundedBoxGeometry
			args={[roomState.size.z + 0.15, 0.1, roomState.size.x + 0.15]}
			radius={0.03}
		/>
		<!-- <T.BoxGeometry args={[roomState.size.z, 0.1, roomState.size.x]} /> -->
		<T.MeshStandardMaterial color={roomState.floorColor} />
	</T.Mesh>

	{#each roomState.objects as object, index (object.kind + index.toString() + object.colors.join(''))}
		{#if editorState.selectedObject === object}
			<TransformControls
				bind:controls={editorState.transformControls}
				rotationSnap={Math.PI / 2}
				position={object.position}
				rotation={[0, object.rotation, 0]}
				enableRotate={false}
				onchange={(e) => {
					if (!e.target || !e.target.object) return;

					e.target.object.position.clamp(
						new THREE.Vector3(-roomState.size.z / 2, 0, -roomState.size.x / 2),
						new THREE.Vector3(roomState.size.z / 2, 2, roomState.size.x / 2)
					);
				}}
			>
				<RoomObject kind={object.kind} colors={object.colors} />
			</TransformControls>
		{:else if editorState.isEditing}
			<T.Group
				onclick={(evt: PointerEvent) => {
					evt.stopPropagation();
					if (editorState.placingObject) {
						placeObject({ x: evt.point.x, y: evt.point.y + 1, z: evt.point.z });
						return;
					}

					applyTransformOfSelected();

					editorState.selectedObject = null;

					setTimeout(() => {
						editorState.selectedObject = object;
					}, 0);
				}}
				onpointermove={(e: PointerEvent) => {
					e.stopPropagation();

					if (editorState.placingObject) {
						editorState.placingObject.position = [e.point.x, e.point.y + 1, e.point.z];
					}
				}}
			>
				<RoomObject {...object} rotation={[0, object.rotation, 0]} />
			</T.Group>
		{:else}
			<RoomObject {...object} rotation={[0, object.rotation, 0]} />
		{/if}
	{/each}

	{#if editorState.placingObject}
		<RoomObject
			{...editorState.placingObject}
			rotation={[0, editorState.placingObject.rotation, 0]}
			colors={['#f1f1f1', '#f1f1f1', '#f1f1f1', '#f1f1f1', '#f1f1f1']}
			opacity={0.8}
		/>
	{/if}
</T.Group>
