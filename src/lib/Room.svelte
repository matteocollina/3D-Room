<script lang="ts">
	import * as THREE from 'three';
	import { T } from '@threlte/core';
	import { applyTransformOfSelected, editorState, roomState, rotateObject } from './state.svelte';
	import RoomObject from './RoomObject.svelte';
	import { Grid, RoundedBoxGeometry, TransformControls } from '@threlte/extras';
	import { onMount } from 'svelte';

	onMount(() => {
		window.addEventListener('keydown', (e) => {
			if (e.key === 'd' || e.key === 'ArrowRight') {
				rotateObject(-rotation);
			} else if (e.key === 'a' || e.key === 'ArrowLeft') {
				rotateObject(rotation);
			}
		});
	});

	let rotation = Math.PI / 8;
	let snap = 0.125 * 0.125;
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
		onpointermove={(e: { point: { x: number; z: number } }) => {
			let point = e.point;

			// round to snap point
			point.x = Math.round(point.x / snap) * snap;
			point.z = Math.round(point.z / snap) * snap;

			if (editorState.placingObject) {
				editorState.placingObject.position = [point.x, 0, point.z];
			}
		}}
		onpointerdown={(e: { point: { x: number; z: number } }) => {
			let point = e.point;

			// round to snap point
			point.x = Math.round(point.x / snap) * snap;
			point.z = Math.round(point.z / snap) * snap;

			if (editorState.placingObject) {
				roomState.objects.push(editorState.placingObject);
				editorState.placingObject.position = [point.x, 0, point.z];
				editorState.selectedObject = editorState.placingObject;

				editorState.placingObject = null;
			}
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

	{#each roomState.objects as object}
		{#if editorState.selectedObject === object}
			<TransformControls
				bind:controls={editorState.transformControls}
				translationSnap={snap}
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
				onclick={() => {
					applyTransformOfSelected();

					editorState.selectedObject = null;

					setTimeout(() => {
						editorState.selectedObject = object;
					}, 100);
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
