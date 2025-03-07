<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { interactivity, useCursor, useViewport } from '@threlte/extras';
	import { ACESFilmicToneMapping } from 'three';
	import { applyTransformOfSelected, editorState } from './state.svelte';
	import { onMount } from 'svelte';
	import { AllObjects, type RoomObjectKind } from './models';

	interactivity();

	const { onPointerEnter, onPointerLeave } = useCursor();

	const viewport = useViewport();

	const { renderer } = useThrelte();

	onMount(() => {
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.2;

		window.addEventListener('resize', (e) => {
			updateShownCount();
		});

		updateShownCount();
	});

	function updateShownCount() {
		editorState.shownCount = Math.max(Math.floor(window.innerWidth / 200), 3);
	}

	let hoveredKey: string | null = $state(null);

	const visibleObjects = Object.fromEntries(
		Object.entries(AllObjects).filter(([key, value]) => value.visible !== false)
	);

	const visibleKeys = Object.keys(visibleObjects);

	let objectsShown = $derived(
		Object.values(visibleObjects).slice(
			editorState.startIndex,
			editorState.startIndex + editorState.shownCount
		)
	);

	$inspect(objectsShown);
</script>

<T.OrthographicCamera makeDefault zoom={80} position={[0, 0, 10]} />
<T.AmbientLight intensity={Math.PI / 2} />

<T.DirectionalLight position={[10, 10, 10]} intensity={3} />

{#each objectsShown as Kind, i}
	<T.Group
		position={[
			$viewport.width * (((i + 0.5) / objectsShown.length - 0.5) * 0.8),
			-$viewport.height / 2 + 0.3,
			0
		]}
	>
		<Kind.component scale={0.5} rotation={[0.2, 0.5, 0]} />

		<T.Mesh
			position={[0, 0.2, -10]}
			onclick={async () => {
				if (editorState.placingObject) {
					editorState.placingObject = null;

					// wait 10 ms
					await new Promise((resolve) => setTimeout(resolve, 10));
				}

				applyTransformOfSelected();

				setTimeout(() => {
					editorState.selectedObject = null;
				}, 100);

				console.log(visibleKeys[i + editorState.startIndex], editorState.placingObject);

				editorState.placingObject = {
					kind: visibleKeys[i + editorState.startIndex] as RoomObjectKind,
					position: [0, 0, 0],
					rotation: 0,
					colors: ['#f1f1f1', '#f1f1f1', '#f1f1f1', '#f1f1f1', '#f1f1f1'],
					placement: 'floor'
				};
			}}
			onpointerenter={() => {
				hoveredKey = visibleKeys[i + editorState.startIndex];

				onPointerEnter();
			}}
			onpointerleave={() => {
				hoveredKey = null;

				onPointerLeave();
			}}
		>
			<T.PlaneGeometry args={[1.5, 2]} />
			<T.MeshBasicMaterial
				opacity={editorState.placingObject?.kind === visibleKeys[i + editorState.startIndex]
					? 0.5
					: hoveredKey === visibleKeys[i + editorState.startIndex]
						? 0.15
						: 0}
				transparent
			/>
		</T.Mesh>
	</T.Group>
{/each}
