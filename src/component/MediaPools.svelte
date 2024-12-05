<script lang="ts">
	import { fetchFileLists, getThumbnailURL, type VideoInfo } from '$lib/fetch/cdn';
	import { onMount } from 'svelte';

	export let videoInfo: VideoInfo[] = [];
	let selectedIndex: number | undefined;
	export let selected: string | undefined;

	function selectVideoFactory(index: number) {
		return () => {
			if (selected === videoInfo[index].videoId) {
				selected = undefined;
				selectedIndex = undefined;
				return;
			}
			selectedIndex = index;
			selected = videoInfo[index].videoId;
		};
	}

	function leftArrow() {
		if (selectedIndex === undefined) return;
		if (selectedIndex === 0) return;
		selected = videoInfo[selectedIndex - 1].videoId;
		selectedIndex--;
	}

	function rightArrow() {
		if (selectedIndex === undefined) return;
		if (selectedIndex === videoInfo.length - 1) return;
		selected = videoInfo[selectedIndex + 1].videoId;
		selectedIndex++;
	}

</script>
<svelte:window
	on:keydown={e => {if(e.key === "ArrowLeft") leftArrow(); else if(e.key === "ArrowRight") { rightArrow() }}} />
<div class="gap-4 flex justify-start overflow-x-scroll bg-[#222222] h-full px-6 rounded-xl items-center">
	{#each videoInfo as video, index}
		<button
			class={`relative flex flex-col gap-1 items-center justify-center h-min p-2 ${selected === video.videoId ? "ring-2 ring-white rounded-lg" : ""}`}
			on:click={selectVideoFactory(index)}>
			<img src={getThumbnailURL(video.videoId)} alt={`${video.videoId}.jpg`} class="h-12 drop-shadow-lg" />
			<span class="text-sm font-medium text-gray-100">{video.filename}</span>
			<span class="absolute text-sm right-10 text-white px-2 bg-black">{Math.floor(video.duration / 60)}
				:{video.duration % 60}</span>
		</button>
	{/each}
</div>
