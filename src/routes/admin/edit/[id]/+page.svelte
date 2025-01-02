<script lang="ts">
	import { fetchProgram, type Program, updateProgram } from '$lib/fetch/program';
	import PreviewMonitor from '../../../../component/PreviewMonitor.svelte';
	import QuizList from '../../../../component/QuizList.svelte';
	import MediaPools from '../../../../component/MediaPools.svelte';
	import PlayIcon from '../../../../static/PlayIcon.svelte';
	import CreateQuiz from '../../../../component/CreateQuiz.svelte';
	import { deleteQuiz, type Quiz } from '$lib/fetch/quiz';
	import PlusIcon from '../../../../static/PlusIcon.svelte';
	import { fetchFileLists, type VideoInfo } from '$lib/fetch/cdn';
	import { onMount } from 'svelte';
	import { createProgramProgress } from '$lib/fetch/programProgress';
	import { goto } from '$app/navigation';
	import RefreshIcon from '../../../../static/RefreshIcon.svelte';
	import RoomIcon from '../../../../static/RoomIcon.svelte';

	export let data: {
		program: Program;
	};

	let presetQuizData: Partial<Quiz> = {};

	let createQuiz: boolean = false;

	let selectedVideo: string | undefined;

	let videoInfo: VideoInfo[] = [];

	let currentProgram = data.program;

	function editHandler(quiz: Quiz) {
		presetQuizData = quiz;
		createQuiz = true;
	}

	function cancelCreateHandler() {
		createQuiz = false;
		presetQuizData = {};
	}

	async function submitQuiz(quiz: Quiz) {
		await updateProgram(currentProgram._id, { quizList: Array.from(new Set([...currentProgram.quizList, quiz._id!])) });
		currentProgram = await fetchProgram(currentProgram._id);
		location.reload();
	}

	function createNewQuiz() {
		createQuiz = true;
		presetQuizData = {};
	}

	async function deleteHandler(quiz: Quiz) {
		await updateProgram(currentProgram._id, { quizList: currentProgram.quizList.filter(q => q !== quiz._id) });
		await deleteQuiz(quiz._id!);
		currentProgram = await fetchProgram(currentProgram._id);
		alert('Deleted');
		location.reload();
	}

	function createNewQuizByTimestampHandler(timestamp: number) {
		createQuiz = true;
		presetQuizData = { questionTriggerTime: timestamp, videoId: selectedVideo };
	}

	//upload new video select from local device
	function uploadHandler() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'video/*';
		input.multiple = false;
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				const formData = new FormData();
				formData.append('video', file);
				fetch('https://quiz.seda.club/cdn/upload', {
					method: 'POST',
					body: formData
				}).then(res => res.json()).then(async (data) => {
					selectedVideo = data.videoId;
					videoInfo = await fetchFileLists();
				});
			}
		};
		input.click();
	}

	onMount(async () => {
		videoInfo = await fetchFileLists();
	});

	async function startHandler() {
		const joinCode = prompt('Enter Join Code') || '';
		if (joinCode.length === 6) {
			const progress = await createProgramProgress({ program: currentProgram._id, joinCode });
			await goto('/admin/host/' + progress._id);
		} else {
			alert('Invalid Join Code. Must be 6 characters long.');
		}
	}
</script>
{#if createQuiz}
	<CreateQuiz bind:presetData={presetQuizData} cancel={cancelCreateHandler} submit={submitQuiz} />
{/if}
{#if currentProgram}
	<div class="grid grid-cols-3 grid-rows-4 gap-8 w-[80%] h-[80%]">
		<div class="col-span-2 row-span-3 w-full gap-4 flex flex-col">
		<span class="text-2xl font-semibold text-[#999999]">
			Media Preview
			{#if selectedVideo}
				({selectedVideo})
			{/if}
		</span>
			<PreviewMonitor videoId={selectedVideo} createQuizHandler={createNewQuizByTimestampHandler} editing={true} />
		</div>
		<div class="col-span-1 row-span-3 w-full gap-4 flex flex-col">
			<div class="flex justify-between items-center">
				<span class="text-2xl font-semibold text-[#999999]">Quizzes</span>
				<button class="text-2xl" on:click={createNewQuiz}>
					<PlusIcon />
				</button>
				<button class="text-2xl" on:click={() => { location.reload() }}>
					<RefreshIcon />
				</button>
			</div>
			<QuizList quizIdList={currentProgram.quizList} editQuizHandler={editHandler} deleteQuizHandler={deleteHandler} />
		</div>
		<div class="col-span-2 row-span-1 w-full h-full flex flex-col gap-4">
			<div class="flex justify-between items-center w-full">
				<span class="text-2xl font-semibold text-[#999999]">Media Pools</span>
				<button class="text-2xl" on:click={uploadHandler}>
					<PlusIcon />
				</button>
			</div>
			<MediaPools bind:selected={selectedVideo} videoInfo={videoInfo} />
		</div>
		<div class="col-span-1 row-span-1 w-full h-full rounded-xl flex flex-col gap-4">
			<span class="text-xl font-semibold text-[#999999]">Last Modified On: </span>
			<button on:click={startHandler} class="flex justify-center items-center h-full p-4 bg-[#306844] rounded-lg">
				<span class="text-5xl text-gray-300">
					<RoomIcon />
				</span>
			</button>
		</div>
	</div>

{/if}
