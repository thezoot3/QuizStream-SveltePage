<script lang="ts">
	import { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import {
		initClientWebsocket,
		type WsBroadcastTimeLeft,
		type WsCueQuestionEvent,
		type WsJoinedEvent
	} from '$lib/websocket';
	import { getGameInfo, getUserInfo } from '$lib/store';
	import QuizRemainingTimeBar from '../../component/QuizRemainingTimeBar.svelte';
	import QuizAnswerSelection from '../../component/QuizAnswerSelection.svelte';
	import { fetchQuiz } from '$lib/fetch/quiz';
	import { goto } from '$app/navigation';
	import { fetchProgramProgress, type ProgramProgress } from '$lib/fetch/programProgress';

	let gameInfo = getGameInfo();
	let userInfo = getUserInfo();

	let socket: Socket;

	let wsConnected: boolean = false;
	let isSubmitting: boolean = false;
	let currentQuiz: {
		quizId: string,
		questionText: string,
		options: string[],
		submittingDuration: number,
		points: number
	};
	let programProgress: ProgramProgress;
	let remainingDuration: number = 5;
	let questionSubmitted: boolean = false;

	onMount(() => {
		socket = initClientWebsocket();

		//when the socket is connected
		socket.on('connect', () => {
			if ($userInfo.userId) {
				socket.emit('join', {
					programProgressId: $gameInfo.programProgressId,
					nickname: $userInfo.nickname,
					userId: $userInfo.userId
				});
				return;
			}
			socket.emit('join', { programProgressId: $gameInfo.programProgressId, nickname: $userInfo.nickname });
			return;
		});

		socket.on('joined', async (data: WsJoinedEvent) => {
			userInfo.set({ ...$userInfo, userId: data.userId });
			programProgress = await fetchProgramProgress($gameInfo.programProgressId);
			wsConnected = true;
		});

		socket.on('cueQuestion', async (data: WsCueQuestionEvent) => {
			const quizId = data.quizId;
			const quizFetchData = await fetchQuiz(quizId);
			currentQuiz = {
				quizId: data.quizId,
				options: quizFetchData.options,
				points: quizFetchData.points,
				questionText: quizFetchData.questionText,
				submittingDuration: quizFetchData.submittingDuration
			};
			remainingDuration = quizFetchData.submittingDuration;
			isSubmitting = true;
			questionSubmitted = false;
		});

		socket.on('broadcastTimeLeft', (data: WsBroadcastTimeLeft) => {
			remainingDuration = data.timeLeft;
		});

		socket.on('endQuestionSubmitting', () => {
			isSubmitting = false;
			remainingDuration = 0;
		});

		socket.on('endProgram', () => {
			$gameInfo = { programProgressId: '' };
			$userInfo = { ...$userInfo, userId: '' };
			goto('/result');
		});

		socket.on('quitUser', () => {
			$gameInfo = { programProgressId: '' };
			$userInfo = { ...$userInfo, userId: '' };
			goto('/');
			alert('관리자에 의해 퇴장 처리되었습니다.');
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

	async function onSubmitting(answer: number) {
		questionSubmitted = true;
		socket.emit('answer', { quizId: currentQuiz.quizId, answer });
	}

	async function resetSession() {
		$userInfo = { userId: '', nickname: '' };
		$gameInfo = { programProgressId: '' };
		await goto('/');
	}

	$: if (programProgress) {
		if (programProgress.isEnd && programProgress.isStarted) {
			goto('/result');
		}
	}
</script>
<div class="flex items-center justify-center relative w-full">
	{#if wsConnected}
		{#if isSubmitting && !questionSubmitted}
			<div class="flex flex-col items-center drop-shadow-xl rounded-xl w-[80%] bg-[#1e1e1e] text-gray-200 p-6">
				<QuizRemainingTimeBar maxDuration={currentQuiz.submittingDuration} remainingDuration={remainingDuration} />
				<span class="text-xl font-medium text-white p-6">{currentQuiz.questionText}</span>
				<QuizAnswerSelection options={currentQuiz.options} clickCallback={onSubmitting} />
			</div>
		{:else}
			<span class="text-3xl text-white animate-pulse">영상의 지시를 따르십시오</span>
		{/if}
	{:else if $userInfo.userId}
		<div class="flex items-center flex-col gap-4 animate-pulse text-lg">
			<span>세션을 복구하고 있는 중입니다...</span>
			<span>곧 게임에 다시 참가합니다.</span>
			<button on:click={resetSession} class="text-sm underline-offset-2">세션 초기화</button>
		</div>
	{:else}
		<span class="animate-pulse text-lg">게임에 참가하고 있는 중입니다...</span>
	{/if}
</div>
