<script lang="ts">
	import QuizOptions from './QuizOptions.svelte';
	import CheckIcon from '../static/CheckIcon.svelte';
	import CancelIcon from '../static/CancelIcon.svelte';
	import { fly } from 'svelte/transition';

	export let options: string[] = [];
	export let clickCallback: (index: number) => void;

	const submitColor = { enabled: '#306844', disabled: '#182C25' };
	const cancelColor = { enabled: '#aa3030', disabled: '#662e33' };
	const iconColor = { enabled: '#cccccc', disabled: '#aaaaaa' };

	let selected: number | undefined;

	function clickHandlerFactory(index: number) {
		return () => {
			if (selected === index) {
				selected = undefined;
				return;
			}
			selected = index;
		};
	}
</script>

<div class="grid grid-cols-2 gap-4 items-center w-full">
	{#each options as option, index}
		{#if index === selected}
			<QuizOptions optionText={option} onClick={clickHandlerFactory(index)} selected={true} />
		{:else}
			<QuizOptions optionText={option} onClick={clickHandlerFactory(index)} />
		{/if}
	{/each}
	<div class="w-full rounded-xl col-span-2">
		{#if selected !== undefined}
			<button class="flex items-center justify-center h-full bg-[#306844] w-full p-3 rounded-xl text-2xl"
							on:click={() => clickCallback(selected)}>
				<CheckIcon class="transition-colors" />
			</button>
		{:else}
			<button class="flex items-center justify-center h-full bg-[#182C25] w-full p-3 rounded-xl text-2xl">
				<CheckIcon class="text-[#aaaaaa]" />
			</button>
		{/if}
	</div>

</div>
