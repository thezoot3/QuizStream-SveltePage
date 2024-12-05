<script lang="ts">
	import PlusIcon from '../../static/PlusIcon.svelte';
	import { onMount } from 'svelte';
	import { fetchPrograms, type Program } from '$lib/fetch/program';
	import EditIcon from '../../static/EditIcon.svelte';
	import PlayIcon from '../../static/PlayIcon.svelte';
	import DeleteIcon from '../../static/DeleteIcon.svelte';
	import { goto } from '$app/navigation';

	let programList: Program[] = [];

	onMount(async () => {
		programList = await fetchPrograms();
	})

</script>

<div class="flex flex-col justify-center items-center gap-4 w-[30%]">
	<div class="flex w-full justify-between items-center mb-6">
		<span class="text-4xl font-semibold">Program</span>
		<PlusIcon class="text-4xl"/>
	</div>
	{#each programList as program}
		<div class="flex w-full justify-between py-4 px-6 bg-[#222222] rounded-xl">
			<span class="font-medium text-xl text-gray-300">{program.programName}</span>
			<div class="flex items-center justify-center gap-2">
				<button class="text-xl" on:click={() => goto("/admin/edit/" + program._id)}><EditIcon/></button>
				<button class="text-xl"><DeleteIcon/></button>
				<button class="text-xl"><PlayIcon/></button>
			</div>
		</div>
	{/each}
</div>
