<script lang="ts">
	import CheckIcon from '../static/CheckIcon.svelte';

	export let clickCallback: (answer: string) => void;

	let answerText: string = '';

	function submitAnswer() {
		if (answerText.trim() !== '') {
			clickCallback(answerText.trim());
			answerText = ''; // Clear input after submission
		}
	}
</script>

<div class="flex flex-col gap-4 items-center w-full">
	<input
		type="text"
		class="w-full p-3 rounded-xl bg-[#2e2e2e] text-white text-xl focus:outline-none focus:ring-2 focus:ring-[#4080FF]"
		placeholder="정답을 입력하세요..."
		bind:value={answerText}
		on:keydown={(e) => { if (e.key === 'Enter') submitAnswer(); }}
	/>
	<div class="w-full flex items-center justify-between gap-4">
		<button
			class="flex items-center justify-center h-full w-full p-3 rounded-xl text-2xl
					{answerText.trim() !== '' ? 'bg-[#306844]' : 'bg-[#182C25] pointer-events-none'}"
			on:click={submitAnswer}
			disabled={answerText.trim() === ''}
		>
			<CheckIcon class="{answerText.trim() !== '' ? 'transition-colors' : 'text-[#aaaaaa]'}" />
		</button>
	</div>
</div>
