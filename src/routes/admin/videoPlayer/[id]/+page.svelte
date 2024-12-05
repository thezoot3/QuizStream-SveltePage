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
	let currentVideoId: string;
	let currentTimestamp: number = 0;
	let preloadThumbnail: string;

	onMount(() => {
		socket = initVideoPlayerWebsocket();

		//when the socket is connected
		socket.on('connect', () => {
			socket.emit('join', { programProgressId: data.programProgress._id });
		});

		socket.on('joined', async () => {
			wsConnected = true;
		});

		socket.on('startVideo', async (d: { videoId: string }) => {
			currentTimestamp = 0;
			currentVideoId = d.videoId;
			await video.play();
			socket.emit('videoTimestamp', { programProgressId: data.programProgress._id, timestamp: 0 });
		});

		socket.on('programEnd', async () => {
			currentVideoId = '';
		});

		socket.on('setVideoTimestamp', (d: { timestamp: number }) => {
			currentTimestamp = d.timestamp;
		});

		socket.on('preloadNextVideo', async (d: { videoId: string }) => {
			preloadThumbnail = getThumbnailURL(d.videoId);
			console.log('preloadNextVideo', d.videoId);
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

	function videoStartHandler() {
		if (preloadThumbnail) {
			preloadThumbnail = '';
		}
	}

	function videoEndHandler() {

		socket.emit('videoEnd', { programProgressId: data.programProgress._id });
	}


</script>

<div class="z-50 w-screen h-screen bg-black absolute top-0 left-0 items-center justify-center flex">
	{#if wsConnected}
		{#await getVideoURL(currentVideoId) then url}
			{#if url}
				<video class="z-50 w-screen h-screen" bind:this={video} controls
							 src={url} preload="metadata" autoplay on:timeupdate={timeUpdateHandler}
							 on:ended={videoEndHandler} poster={getThumbnailURL(currentVideoId)} on:play={videoStartHandler}></video>
			{/if}

		{/await}
	{/if}
</div>

