<script lang="ts">
	import { appState, currentQuiz, isAnswerSubmitted, quizControl, quizResult, userState } from '$lib/store';
	import { disconnectMqttClient, initMqttClient, sendAnswerMessage } from '$lib/mqttClient';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import QuizAnswerSelection from '../../component/QuizAnswerSelection.svelte';
	import QuizResultFeedback from '../../component/QuizResultFeedback.svelte';
	import QuizAnswerInput from '../../component/QuizAnswerInput.svelte';
	import { resetSession } from '$lib/utils'; // Import the new SAQ component


	onMount(() => {
		try {
			// $userState가 존재하고 (null이 아니고) joined 상태가 false일 때
			if ($userState && $userState.joined === false) {
				initMqttClient($userState.setId, $userState.userId, $userState.nickname);
			}
			// $userState가 존재하고 (null이 아니고) joined 상태가 true일 때
			else if ($userState && $userState.joined === true) {
				// 이미 참가했지만 연결을 다시 초기화해야 하는 경우
				disconnectMqttClient();
				initMqttClient($userState.setId, $userState.userId, $userState.nickname);
			} else if ($userState === null) { // $userState가 null일 때는 홈으로 리다이렉션
				goto('/');
			}
		} catch (error) {
			console.error('MQTT 클라이언트 초기화 중 오류 발생:', error);
			$userState = null; // 오류 발생 시 userState를 null로 초기화
			goto('/');
		}
	});

	if ($appState.status === 'ended') {
		resetSession();
		goto('/result');
	}

	let lastQuizId: any = null;

	$: if ($currentQuiz?.id !== lastQuizId) {
		lastQuizId = $currentQuiz?.id;
		isAnswerSubmitted.set(false);
	}

	// QuizAnswerSelection 컴포넌트에 전달할 onSubmitting 함수 정의 (예시)
	// 이 함수는 원본 코드에 없었지만 QuizAnswerSelection의 prop으로 전달되므로 필요합니다.
	function onSubmitting(answer: string | number) {
		if ($userState && $currentQuiz && $userState.joined === true) {
			sendAnswerMessage($userState.setId, $userState.userId, $currentQuiz.id, answer);
			console.log(answer);
			isAnswerSubmitted.set(true);
		}
	}

	// QuizResultFeedback 컴포넌트에서 애니메이션 종료 시 호출할 함수
	function handleFeedbackAnimationEnd() {
		quizResult.set(null);
	}

	console.log($userState);
	console.log($appState);
	console.log($quizControl);
	console.log($currentQuiz);

</script>

{#if $quizResult}
	<QuizResultFeedback result={$quizResult} onAnimationEnd={handleFeedbackAnimationEnd} />
{/if}

<div class="flex items-center justify-center relative w-full">
	{#if $userState?.joined} <!-- $userState가 null이 아니고 joined 속성이 true일 때만 내부를 렌더링 -->
		{#if $appState.status === "idle" || ($appState.status === "running" && $quizControl?.action === "LOCK")}
			<span class="text-3xl text-white animate-pulse font-bold">영상의 지시를 따르십시오</span>
		{:else if $appState.status === "running" && $quizControl?.action === "UNLOCK" && $currentQuiz}
			<!--
				$appState.status가 "running"이고,
				$quizControl이 null이 아니며 action이 "UNLOCK"이고,
				$currentQuiz가 null이 아닐 때만 렌더링
			-->
			<div class="flex flex-col items-center drop-shadow-xl rounded-xl w-[80%] bg-[#1e1e1e] text-gray-200 p-6">
				<span class="text-xl font-medium text-white p-6">{$currentQuiz.question}</span>
				{#if !$isAnswerSubmitted}
					{#if $currentQuiz.type === 'MCQ'}
						<QuizAnswerSelection options={$currentQuiz.options} clickCallback={onSubmitting} />
					{:else if $currentQuiz.type === 'SAQ'}
						<QuizAnswerInput clickCallback={onSubmitting} />
					{/if}
				{:else}
					<div class="text-2xl font-bold text-center p-6 animate-bounce">
						정답을 제출했습니다!
					</div>
				{/if}
			</div>
		{/if}
	{:else}
		<div class="flex flex-col gap-2 items-center">
			<span class="animate-pulse text-2xl font-bold">게임에 참가하고 있는 중입니다...</span>
			<button class="text-sm text-gray-500 underline-offset-2 underline" on:click={resetSession}>접속이 안되면 누르세요(세션 초기화)
			</button>
		</div>
		<!-- $userState가 null이거나 joined가 false일 때 -->

	{/if}
</div>
