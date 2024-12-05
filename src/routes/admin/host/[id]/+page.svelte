<script lang="ts">
	import PlayIcon from '../../../../static/PlayIcon.svelte';
	import PreviewMonitor from '../../../../component/PreviewMonitor.svelte';
	import { fetchQuiz, type Quiz } from '$lib/fetch/quiz';
	import CancelIcon from '../../../../static/CancelIcon.svelte';
	import EditIcon from '../../../../static/EditIcon.svelte';
	import OpenIcon from '../../../../static/OpenIcon.svelte';
	import { fetchUserByProgress, fetchProgramProgress, type ProgramProgress } from '$lib/fetch/programProgress';
	import { onDestroy, onMount } from 'svelte';
	import {
		initHostWebsocket
	} from '$lib/websocket';
	import type { Socket } from 'socket.io-client';
	import { type User } from '$lib/fetch/user';
	import {
		fetchQuestionResponsesByProgress,
		fetchQuestionResponsesByProgressAndQuizId,
		type QuestionResponse
	} from '$lib/fetch/questionResponse';
	import StopIcon from '../../../../static/StopIcon.svelte';

	export let data: { programProgress: ProgramProgress };

	let socket: Socket;
	let currentProgramProgress: ProgramProgress;
	let wsConnected: boolean = false;
	let currentUser: User[] = [];
	let currentQuizResponse: QuestionResponse[] = [];
	let quizResponseCountByOptions: number[] = [];
	let currentVideoId: string = '';
	let currentQuiz: Quiz;

	onMount(() => {
		socket = initHostWebsocket();

		//when the socket is connected
		socket.on('connect', () => {
			socket.emit('join', { programProgressId: data.programProgress._id });
		});

		socket.on('joined', async () => {
			wsConnected = true;
			currentProgramProgress = await fetchProgramProgress(data.programProgress._id);
			currentUser = await fetchUserByProgress(currentProgramProgress._id);
			currentQuiz = await fetchQuiz(currentProgramProgress.currentQuiz);
			currentQuizResponse = (await fetchQuestionResponsesByProgress(currentProgramProgress._id)).filter(i => i.quizId === currentQuiz._id);
		});

		socket.on('progressUpdateCue', async () => {
			currentProgramProgress = await fetchProgramProgress(data.programProgress._id);
			currentQuiz = await fetchQuiz(currentProgramProgress.currentQuiz);
			//console.log(currentQuiz, currentProgramProgress);
		});

		socket.on('responseUpdateCue', async () => {
			currentQuizResponse = await fetchQuestionResponsesByProgressAndQuizId(data.programProgress._id, currentProgramProgress.currentQuiz);
			currentUser = await fetchUserByProgress(currentProgramProgress._id);
		});

		socket.on('userUpdateCue', async () => {
			currentUser = await fetchUserByProgress(currentProgramProgress._id);
			currentQuizResponse = await fetchQuestionResponsesByProgressAndQuizId(data.programProgress._id, currentProgramProgress.currentQuiz);
		});

		socket.on('programStarted', async () => {
			currentProgramProgress = await fetchProgramProgress(data.programProgress._id);
			currentUser = await fetchUserByProgress(currentProgramProgress._id);
			currentQuiz = await fetchQuiz(currentProgramProgress.currentQuiz);
			currentQuizResponse = await fetchQuestionResponsesByProgressAndQuizId(data.programProgress._id, currentProgramProgress.currentQuiz);
		});

		socket.on('programEnded', async () => {
			currentProgramProgress = await fetchProgramProgress(data.programProgress._id);
		});
	});

	onDestroy(() => {
		if (socket && socket.connected) {
			socket.disconnect();
		}
	});

	$: if (currentQuiz && currentQuizResponse) {
		quizResponseCountByOptions = new Array(currentQuiz.options.length).fill(0, 0, currentQuiz.options.length);
		currentQuizResponse.forEach(i => {
			quizResponseCountByOptions[i.submittedAnswer] += 1;
		});
	}

	$: if (currentQuiz && currentProgramProgress) {
		if (currentProgramProgress.isOnSubVideo) {
			currentVideoId = currentQuiz.subVideoByOptions[currentProgramProgress.currentSubVideo]?.videoId || '';
		} else {
			currentVideoId = currentQuiz.videoId;
		}
	}

	async function startHandler() {
		socket.emit('startProgram', { programProgressId: data.programProgress._id });
	}

	async function stopHandler() {
		socket.emit('endProgram', { programProgressId: data.programProgress._id });
	}

	function quitUserFactory(userId: string) {
		return () => {
			socket.emit('quitUser', { programProgressId: data.programProgress._id, userId });
		};
	}
</script>
{#if wsConnected && currentProgramProgress && currentQuiz}
	<div class="grid h-[80%] w-[80%] grid-cols-3 grid-rows-5 gap-8">
		<div class="col-span-2 row-span-3 flex flex-col gap-4">
			<span class="text-2xl font-medium text-[#aaaaaa]">Video Control</span>
			{#if currentQuiz}
				<PreviewMonitor videoId={currentVideoId} currentVideoTime={currentProgramProgress.currentVideoTimestamp} />
			{:else}
				<span class="text-2xl font-medium text-[#cccccc]">No Quiz to appear</span>
			{/if}
		</div>
		<div class="col-span-1 row-span-4 flex grid-rows-2 flex-col gap-4 rounded-xl">
			<span class="text-2xl font-medium text-[#aaaaaa]">Leaderboard</span>
			<div class="flex flex-col gap-4 rounded-xl bg-[#222222] p-4 overflow-y-scroll">
				{#if currentUser.length > 0}
					{#each currentUser as user}
						{#if user}
							<div class="flex items-center justify-between rounded-xl bg-[#2e2e2e] px-4 py-3">
								<div class="flex flex-col gap-1">
									<span class="font-medium text-xl">{user.nickname}</span>
									<div class="flex items-center gap-2">
									<span class="text-sm">Points: <span
										class="text-blue-500 font-semibold">{user.earnedPoints}</span></span>
										<span class="text-xs font-light text-[#999999]">{user._id}</span>
									</div>
								</div>
								<button on:click={quitUserFactory(user._id)}>
									<CancelIcon />
								</button>
							</div>
						{/if}

					{/each}
				{:else}
					<span
						class="flex items-center justify-center py-20 px-6 text-2xl font-medium text-[#999999]">No one joined</span>
				{/if}
			</div>
		</div>
		<div class="col-span-2 row-span-2 flex grid-rows-2 flex-col gap-4 rounded-xl h-full">
			<span class="text-2xl font-medium text-[#aaaaaa]">Quiz Control</span>
			<div class="flex flex-col gap-4 rounded-xl bg-[#222222] p-6 h-full">
				<div class="flex items-center justify-between">
					<span class="text-2xl font-medium">{currentQuiz.displayName}</span>
					{#if currentProgramProgress.isSubmittingQuestion}
						<progress
							class="h-6 w-60 rounded-xl"
							max={currentQuiz.submittingDuration}
							value={(currentQuiz.questionTriggerTime + currentQuiz.submittingDuration - currentProgramProgress.currentVideoTimestamp)}
						></progress>
					{:else if currentQuiz.questionTriggerTime < currentProgramProgress.currentVideoTimestamp}
						<span class="text-xl font-medium">Quiz Ended</span>
					{:else}
						<span class="text-xl font-medium">Waiting for trigger quiz</span>
					{/if}
				</div>
				<span class="text-lg text-[#777777]">{currentQuiz.questionText}</span>
				<div class="grid grid-cols-2 gap-6 h-full">
					{#if currentQuizResponse.length > 0}
						{#each currentQuiz.options as option, index}
							<div
								class="flex flex-col items-center rounded-xl p-2 shadow-inner bg-[#2e2e2e] justify-center"
								style={`background: linear-gradient(to right, #4C3BCF ${Math.round(currentQuizResponse.length / quizResponseCountByOptions[index] * 100)}%, #3e3e3e ${100 - Math.round(currentQuizResponse.length / quizResponseCountByOptions[index] * 100)}%)`}
							>
								<span class="text-lg">{option}</span>
								<span class="text-sm font-light">{quizResponseCountByOptions[index]}
									명 ({Math.round(currentQuizResponse.length / quizResponseCountByOptions[index] * 100)}%)</span>
							</div>
						{/each}
					{:else}
						{#each currentQuiz.options as option}
							<div
								class="flex flex-col items-center rounded-xl p-4 shadow-inner bg-[#2e2e2e] justify-center"
							>
								<span class="text-lg">{option}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-6">
			<span class="text-2xl font-semibold text-[#cccccc]">Join Code: {currentProgramProgress.joinCode}</span>
			<div class="grid grid-cols-3 gap-6 w-full h-full">
				{#if !currentProgramProgress.isStarted}
					<button class="flex items-center col-span-2 justify-center bg-[#306844] rounded-xl text-2xl"
									on:click={startHandler}>
						<PlayIcon />
					</button>
				{:else if !currentProgramProgress.isEnd}
					<button class="flex items-center col-span-2 justify-center bg-red-900 rounded-xl text-2xl"
									on:click={stopHandler}>
						<StopIcon />
					</button>
				{:else}
					<button class="flex items-center col-span-2 justify-center bg-[#182C25] rounded-xl text-2xl">
						<span class="text-xl font-medium">Program Ends</span>
					</button>
				{/if}
				<button on:click={() => window.open(`/admin/videoPlayer/${data.programProgress._id}`, '_blank')}
								class="flex items-center col-span-1 justify-center bg-[#2e2e2e] rounded-xl text-2xl">
					<OpenIcon />
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="flex items-center justify-center">
		<span class="text-4xl animate-pulse font-medium">Loading...</span>
	</div>
{/if}
