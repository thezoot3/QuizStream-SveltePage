<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { initVideoPlayerWebsocket } from '$lib/websocket';
	import { type ProgramProgress } from '$lib/fetch/programProgress';
	import type { Socket } from 'socket.io-client';
	import { getThumbnailURL, getVideoURL } from '$lib/fetch/cdn';
	import type { Quiz } from '$lib/fetch/quiz';

	export let data: { programProgress: ProgramProgress };

	let video: HTMLVideoElement;

	let socket: Socket;
	let timestamp: number = 0;
	let wsConnected: boolean = false;

	let videoIdWaitingList: string[] = [];

	let preloadImg: HTMLImageElement;

	let cdnURL: string = 'https://quiz.seda.club/cdn';

	onMount(() => {
		/*const customCdnURL = prompt('Enter CDN URL (empty for default)');
		if (customCdnURL && customCdnURL.length > 0) {
			cdnURL = customCdnURL;
		}*/
		socket = initVideoPlayerWebsocket();

		//when the socket is connected
		socket.on('connect', () => {
			socket.emit('join', { programProgressId: data.programProgress._id });
		});

		socket.on('joined', async () => {
			wsConnected = true;
		});

		socket.on('startVideo', async (d: { videoId: string }) => {
			if (!videoIdWaitingList.includes(d.videoId)) {
				videoIdWaitingList = [...videoIdWaitingList, d.videoId];
				await video.play();
			} else {
				await video.play();
			}
			socket.emit('videoTimestamp', { programProgressId: data.programProgress._id, timestamp: 0 });
		});

		socket.on('programEnd', async () => {
			videoIdWaitingList = [];
		});

		socket.on('preloadNextVideo', async (d: { videoId: string }) => {
			if (videoIdWaitingList.includes(d.videoId)) return;
			videoIdWaitingList = [...videoIdWaitingList, d.videoId];
			preloadImg.src = getThumbnailURL(d.videoId);
			console.log('preloadNextVideo', d.videoId);
		});

		socket.onAny((event, ...args) => {
			console.log(event, args);
		});
	});

	onDestroy(() => {
		if (socket && socket.connected) {
			socket.disconnect();
		}
	});

	function timeUpdateHandler() {
		if (timestamp !== Math.round(video.currentTime)) {
			timestamp = Math.round(video.currentTime);
			socket.emit('videoTimestamp', { programProgressId: data.programProgress._id, timestamp });
		}
	}

	function videoEndHandler() {
		videoIdWaitingList = videoIdWaitingList.slice(1);
		socket.emit('videoEnd', { programProgressId: data.programProgress._id });
	}
</script>
<svelte:window on:keydown={e => {if(e.key === " ") video.paused ? video.play() : video.pause()}} />
<div class="z-50 w-screen bg-black absolute top-0 left-0 items-center justify-center flex relative">
	{#if wsConnected}
		{#if videoIdWaitingList.length > 0}
			<img bind:this={preloadImg} class="absolute inset-0 w-screen aspect-auto object-cover z-30" />
			{#each videoIdWaitingList as videoId, index}
				{#if index === 0}
					<video
						class="w-screen aspect-auto object-cover z-50"
						bind:this={video}
						src={getVideoURL(videoId, cdnURL)}
						preload="auto"
						playsinline
						on:timeupdate={timeUpdateHandler}
						on:ended={videoEndHandler}
					></video>
				{:else}
					<video
						class="absolute inset-0 w-screen aspect-auto object-cover z-0 hidden"
						src={getVideoURL(videoId, cdnURL)}
						preload="auto"
						playsinline
						poster={getThumbnailURL(videoId)}
					></video>
				{/if}
			{/each}
		{/if}
	{/if}
</div>
<style>
    video::-webkit-media-controls-timeline {
        display: none;
    }

    video::-webkit-media-controls-current-time-display {
        display: none;
    }

    video::-webkit-media-controls-time-remaining-display {
        display: none;
    }

    video::-webkit-media-controls-loading-spinner {
        display: none;
    }

    /* Firefox */
    video::-moz-loading-spinner {
        display: none;
    }
</style>
