<script lang="ts">
	import { getThumbnailURL, fetchVideoInfo, type VideoInfo } from '$lib/fetch/cdn';
	import { constantDigit } from '$lib/utils';

	export let videoId: string | undefined;
	export let currentVideoTime: number = 0;
	export let editing: boolean = false;

	export let createQuizHandler: (timestamp: number) => void = () => {
	};

	let video: HTMLVideoElement;

	$: {
		if (video) {
			video.addEventListener('timeupdate', () => {
				const roundedTime = Math.floor(video.currentTime);
				if (roundedTime !== currentVideoTime) {
					currentVideoTime = roundedTime;
				}
			});
		}
	}

	function createQuizFactory() {
		return () => {
			createQuizHandler(currentVideoTime);
		};
	}
</script>
<svelte:window on:keydown={e => {if(e.key === " ") video.paused ? video.play() : video.pause()}} />
{#if videoId}
	<video
		bind:this={video}
		src={`http://localhost:3200/cdn/videos/${videoId}`}
		class="max-h-[80%]"
		controls
		poster={getThumbnailURL(videoId)}
		preload="auto"
	></video>
	{#if video}
		{#await fetchVideoInfo(videoId)}
			<span>Loading...</span>
		{:then info}
			<div class="flex items-center justify-center gap-4">
				<div class="flex justify-center items-center h-full gap-2">
					<span class="text-2xl text-gray-300">{constantDigit(Math.floor(currentVideoTime / 60), 2)}
						:{constantDigit(currentVideoTime % 60, 2)}</span>
					<span>/</span>
					<span class="text-2xl text-gray-300">{constantDigit(Math.floor(info.duration / 60), 2)}
						:{constantDigit(info.duration % 60, 2)}</span>
				</div>
				{#if editing}
					<button class="text-xl underline-offset-2 underline" on:click={createQuizFactory()}>Create Quiz</button>
				{/if}
			</div>
		{/await}
	{/if}
{:else}
	<span class="text-2xl text-gray-300">No Video Selected</span>
{/if}
