<script lang="ts">
	export let optionText: string = '';
	export let selected: boolean = false;
	export let onClick: () => void = () => {
	};
</script>

{#if selected}
	<button
		class={`flex justify-center items-center py-2 w-full aspect-[1.2/1] border-2 border-[#777777] rounded-lg bg-[#333333] drop-shadow hover:bg-[#3e3e3e] p-6`}
		on:click={onClick}>
		<span class="text-gray-200">{optionText}</span>
	</button>
{:else}
	<button
		class={`flex justify-center items-center py-2 w-full aspect-[1.2/1] border-2 border-[#222222] rounded-lg bg-[#333333] drop-shadow hover:bg-[#3e3e3e] p-6`}
		on:click={onClick}>
		<span class="text-gray-200">{optionText}</span>
	</button>
{/if}

