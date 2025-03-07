<script lang="ts">
	import * as THREE from 'three';
	import { T, type Props } from '@threlte/core';
	import Wall from './Wall.svelte';
	import { applyTransformOfSelected, editorState, roomState, rotateObject } from './state.svelte';
	import RoomObject from './RoomObject.svelte';
	import { Grid, TransformControls } from '@threlte/extras';
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

<T.Group position.y={editorState.isEditing ? 0 : -1}>
	<!-- walls on left and right -->
	{#each Array.from({ length: roomState.size.x }, (_, i) => i) as x}
		<Wall position={[-roomState.size.z / 2 - 0.05, 0.9, x - roomState.size.x / 2 + 0.5]} />
	{/each}

	<!-- walls on left and right -->
	{#each Array.from({ length: roomState.size.z }, (_, i) => i) as z}
		{#if z !== 0}
			<Wall
				position={[z - roomState.size.z / 2 + 0.5, 0.9, -roomState.size.x / 2 - 0.05]}
				rotation.y={Math.PI / 2}
			/>
		{:else}
			<Wall
				position={[z - roomState.size.z / 2 + 0.5 - 0.05, 0.9, -roomState.size.x / 2 - 0.05]}
				rotation.y={Math.PI / 2}
				size={[0.1, 2, 1.1]}
			/>
		{/if}
	{/each}

	{#if editorState.isEditing}
		<Grid
			gridSize={[roomState.size.z * 2, roomState.size.x * 2]}
			scale={0.5}
			sectionThickness={0}
		/>
	{/if}

	<T.Mesh
		position={[0, -0.0502, 0]}
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
		<T.BoxGeometry args={[roomState.size.z, 0.1, roomState.size.x]} />
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
