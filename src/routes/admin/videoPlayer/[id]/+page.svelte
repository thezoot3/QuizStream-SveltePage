<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { initVideoPlayerWebsocket } from '$lib/websocket';
	import { type ProgramProgress } from '$lib/fetch/programProgress';
	import type { Socket } from 'socket.io-client';
	import { getThumbnailURL, getVideoURL } from '$lib/fetch/cdn';

	export let data: { programProgress: ProgramProgress };

	let video: HTMLVideoElement;

	let socket: Socket;
	let timestamp: number = 0;
	let wsConnected: boolean = false;

	let currentVideoId: string = '';

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
			currentVideoId = d.videoId;
			video.load();
			socket.emit('videoTimestamp', { programProgressId: data.programProgress._id, timestamp: 0 });
		});

		socket.on('programEnd', async () => {
			currentVideoId = '';
		});

		socket.on('preloadNextVideo', async (d: { videoId: string }) => {
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
		socket.emit('videoEnd', { programProgressId: data.programProgress._id });
	}
</script>
<div class="z-50 bg-black items-center justify-center flex relative">
	{#if wsConnected}
		<img bind:this={preloadImg} class="absolute inset-0 w-screen aspect-auto object-cover z-30" />
		<video
			class="h-screen z-50"
			src={getVideoURL(currentVideoId, cdnURL)}
			bind:this={video}
			preload="auto"
			playsinline
			autoplay
			on:timeupdate={timeUpdateHandler}
			on:ended={videoEndHandler}
		></video>
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
