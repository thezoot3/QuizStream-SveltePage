<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import type { MqttQuizResultPayload } from '$lib/mqtt_types';

	export let result: MqttQuizResultPayload;
	export let onAnimationEnd: () => void; // Callback to parent to clear store

	let show = true;

	// Reactively set up a timeout when result changes
	// This will re-trigger if result changes again while still showing
	$: if (result) {
		show = true;
		// Clear previous timeout if exists to avoid multiple timeouts running
		// This is important if results come in quickly
		setTimeout(() => {
			show = false;
			// Give a small delay before calling onAnimationEnd to allow exit transition
			// The 500ms should match the transition duration
			const exitTimeoutId = setTimeout(onAnimationEnd, 500);
			// Cleanup exitTimeoutId if component is unmounted or result changes again
			return () => clearTimeout(exitTimeoutId);
		}, 3000); // Display for 3 seconds
	}
</script>

{#if show && result}
	<div
		class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-lg"
		transition:fly={{ y: -200, duration: 500, easing: quintOut }}
	>
		<div
			class="flex flex-col items-center p-8 rounded-lg shadow-2xl
                   {result.myResult === 'CORRECT' ? 'bg-green-600' : 'bg-red-600'}
                   text-white text-center"
		>
			<h2 class="text-4xl font-bold mb-4">
				{result.myResult === 'CORRECT' ? '정답!' : '오답!'}
			</h2>
			<p class="text-2xl font-semibold">
				획득 점수: {result.myScore}점
			</p>
		</div>
	</div>
{/if}