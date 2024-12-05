<script lang="ts">
	import { deleteQuiz, fetchQuiz, type Quiz } from '$lib/fetch/quiz';
	import { createEventDispatcher, onMount } from 'svelte';
	import EditIcon from '../static/EditIcon.svelte';
	import DeleteIcon from '../static/DeleteIcon.svelte';

	export let quizIdList: string[] = [];
	export let editQuizHandler: (quiz: Quiz) => void = () => {
	};
	export let deleteQuizHandler: (quiz: Quiz) => void = () => {
	};

	let quizList: Quiz[] = [];

	onMount(async () => {
		quizList = await Promise.all(quizIdList.map(async i => {
			return await fetchQuiz(i);
		}));
	});

	function editClickFactory(quiz: Quiz) {
		return () => {
			editQuizHandler(quiz);
		};
	}

	function deleteClickFactory(quiz: Quiz) {
		return async () => {
			await deleteQuiz(quiz._id!);
			deleteQuizHandler(quiz);
		};
	}
</script>

<div class="flex flex-col justify-center items-center gap-4">
	{#each quizList as quiz, index}
		<div class="flex w-full justify-between p-4 bg-[#202020] rounded-xl items-center">
			<div class="flex items-center gap-4">
				<span class="font-semibold text-2xl text-[#666666]">{index + 1}</span>
				<div class="flex flex-col">
					<span class="font-medium text-lg text-gray-300">{quiz.displayName}</span>
					<div class="flex items-center gap-1">
						<span class="text-xs font-light text-gray-400">{quiz._id}</span>
						<span class="text-xs font-light text-gray-400">/</span>
						<span class="text-xs font-light text-gray-400">{quiz.videoId}</span>
					</div>
				</div>

			</div>
			<div class="flex items-center justify-center gap-4 text-2xl">
				<button on:click={editClickFactory(quiz)}>
					<EditIcon />
				</button>
				<button on:click={deleteClickFactory(quiz)}>
					<DeleteIcon />
				</button>
			</div>
		</div>
	{/each}
</div>
