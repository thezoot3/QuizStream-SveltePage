<script lang="ts">

	import { type CreateQuiz, createQuiz, fetchQuiz, type Quiz, updateQuiz } from '$lib/fetch/quiz';
	import { fetchFileLists, type VideoInfo } from '$lib/fetch/cdn.js';
	import { onMount } from 'svelte';
	import AddIcon from '../static/AddIcon.svelte';
	import SaveIcon from '../static/SaveIcon.svelte';
	import CancelIcon from '../static/CancelIcon.svelte';

	export let presetData: Partial<Quiz> = {};

	export let submit: (quiz: Quiz) => void = () => {
	};
	export let cancel: (quiz: Quiz) => void = () => {
	};

	let availableMedia: VideoInfo[] = [];
	let triggerMinutes: number = 0;
	let triggerSeconds: number = 0;
	let subVideoIdByOptions: string[] = [];

	onMount(async () => {
		availableMedia = await fetchFileLists();
		if (presetData.questionTriggerTime) {
			triggerMinutes = Math.floor(presetData.questionTriggerTime / 60);
			triggerSeconds = presetData.questionTriggerTime % 60;
		}
		subVideoIdByOptions = new Array(presetData.options?.length || 0).fill(null);
	});

	$: if (presetData.videoId) {
		const media = availableMedia.find(media => media.videoId === presetData.videoId);
		if (media && media.duration !== presetData.videoDuration) {
			presetData.videoDuration = media.duration;
		}
	}

	$: if (triggerSeconds || triggerMinutes) {
		const changeTime = triggerMinutes * 60 + triggerSeconds;
		if (presetData.questionTriggerTime !== changeTime) {
			if (!presetData.submittingDuration) {
				alert('퀴즈 제출 시간을 먼저 설정해주세요.');
			} else if (!presetData.videoId || !presetData.videoDuration) {
				alert('비디오를 먼저 선택해주세요.');
			} else if (changeTime <= 0) {
				if (presetData.questionTriggerTime) {
					triggerMinutes = Math.floor(presetData.questionTriggerTime / 60);
					triggerSeconds = presetData.questionTriggerTime % 60;
				}
				alert('시간을 1 이상으로 설정해주세요.');
			} else if (changeTime + presetData.submittingDuration > presetData.videoDuration) {
				if (presetData.questionTriggerTime) {
					triggerMinutes = Math.floor(presetData.questionTriggerTime / 60);
					triggerSeconds = presetData.questionTriggerTime % 60;
				}
				alert('퀴즈 제출 시간이 비디오 길이를 초과합니다.');
			} else {
				presetData.questionTriggerTime = changeTime;
			}
		}
	}

	$: {
		console.log(presetData);
	}

	async function addOptions() {
		presetData.options = presetData.options || [];
		presetData.options.push('');
		presetData.points = presetData.points || [];
		presetData.points.push(0);
	}

	async function submitHandler() {
		if (presetData.options && presetData.options.length < 2) {
			alert('퀴즈 옵션은 2개 이상이어야 합니다.');
			return;
		}
		if (presetData.options && presetData.options.length !== new Set(presetData.options).size) {
			alert('중복된 퀴즈 옵션이 있습니다.');
			return;
		}
		if (presetData.submittingDuration === undefined) {
			alert('제출 시간을 설정해주세요.');
			return;
		}
		if (presetData.points === undefined) {
			alert('포인트를 설정해주세요.');
			return;
		}
		if (presetData.videoId === undefined) {
			alert('비디오를 선택해주세요.');
			return;
		}
		if (presetData.questionTriggerTime === undefined) {
			alert('퀴즈 트리거 시간을 설정해주세요.');
			return;
		}
		if (presetData.displayName === undefined) {
			alert('퀴즈 이름을 설정해주세요.');
			return;
		}
		if (presetData.questionText === undefined) {
			alert('퀴즈 질문을 설정해주세요.');
			return;
		}
		if (presetData._id) {
			const subVideoData = subVideoIdByOptions.map(i => {
				if (i) {
					return { videoId: i, duration: availableMedia.find(media => media.videoId === i)?.duration! };
				} else {
					return null;
				}
			});
			const newQuiz = await updateQuiz(presetData._id, {
				...presetData,
				subVideoByOptions: subVideoData
			});
			presetData = await fetchQuiz(newQuiz._id!);
			submit(newQuiz);
		} else {
			const subVideoData = subVideoIdByOptions.map(i => {
				if (i) {
					return { videoId: i, duration: availableMedia.find(media => media.videoId === i)?.duration! };
				} else {
					return null;
				}
			});
			const newQuiz = await createQuiz({ ...presetData as CreateQuiz, subVideoByOptions: subVideoData });
			presetData = await fetchQuiz(newQuiz._id!);
			submit(newQuiz);
		}

		alert('퀴즈가 저장되었습니다.');
	}

</script>

{#if presetData}
	<div class="absolute w-full h-full top-0 left-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
		<div class="flex flex-col gap-6 bg-[#222222] p-6 rounded-xl overflow-y-scroll max-h-[80%] max-w-[80%] shadow-inner">
			<span class="text-2xl font-semibold ">Create/Edit Quiz</span>
			<div class="flex flex-col justify-center items-center gap-4">
				<input type="text" class="text-lg font-medium text-[#999999] p-2 bg-[#2e2e2e] rounded-lg w-full"
							 bind:value={presetData.displayName} placeholder="Quiz Name" />
				<input type="text" class="text-lg font-medium text-[#999999] p-2 bg-[#2e2e2e] rounded-lg w-full"
							 bind:value={presetData.questionText} placeholder="Question Text" />
			</div>
			<div class="flex flex-col gap-2">
				<span class="w-full text-xl font-medium">Video/Media</span>
				<div class="flex justify-between items-center">
					<span class="text-base text-[#999999]">Video File</span>
					<span class="text-base text-[#999999]">Trigger Time</span>
				</div>
				<div class="flex justify-between items-center gap-6">
					<select class=" bg-[#2e2e2e] text-gray-300 rounded-lg w-full text-lg p-3" bind:value={presetData.videoId}
									name="mediaId">
						{#each availableMedia as media}
							<option value={media.videoId}>{media.filename}</option>
						{/each}
					</select>
					<div class="flex gap-1 items-center justify-between">
						<input type="number" class="p-2 w-12 bg-[#2e2e2e] text-gray-300 rounded-lg text-center"
									 bind:value={triggerMinutes} placeholder="Min" />
						<span class="text-sm font-light text-[#999999]">/</span>
						<input type="number" class="p-2 w-12 bg-[#2e2e2e] text-gray-300 rounded-lg text-center"
									 bind:value={triggerSeconds} placeholder="Sec" />
					</div>
				</div>
			</div>
			<div class="flex flex-col justify-center items-center gap-2">
				<div class="flex justify-between items-center w-full">
					<span class="w-full text-xl font-medium">Quiz Options</span>
					<button on:click={addOptions} class="text-2xl">
						<AddIcon />
					</button>
				</div>
				<div class="w-full grid grid-cols-8 items-center gap-3">
					<span class="text-base text-[#999999] col-span-1">Index</span>
					<span class="text-base text-[#999999] col-span-6">Option text</span>
					<span class="text-base text-[#999999] col-span-1">Points</span>
					{#each presetData.options || [] as options, index}
						<span class="text-xl font-light text-[#999999] col-span-1">{index + 1}.</span>
						<input bind:value={presetData.options[index]} placeholder="option"
									 class="bg-[#2e2e2e] rounded-lg  p-2 text-lg col-span-6" />
						<input bind:value={presetData.points[index]} placeholder="점수" type="number"
									 class="bg-[#2e2e2e] rounded-lg  p-2 text-lg col-span-1">
					{/each}
				</div>
			</div>
			<div class="flex flex-col justify-center items-center gap-2">
				<div class="flex justify-between items-center w-full">
					<span class="w-full text-xl font-medium">SubVideo by Options</span>
					<button on:click={addOptions} class="text-2xl">
						<AddIcon />
					</button>
				</div>
				<div class="w-full grid grid-cols-7 items-center gap-y-3">
					<span class="text-base text-[#999999] col-span-1">Index</span>
					<span class="text-base text-[#999999] col-span-6">SubVideo</span>
					{#each presetData.options || [] as options, index}
						<span class="text-xl font-light text-[#999999] col-span-1">{index + 1}.</span>
						<select class=" bg-[#2e2e2e] text-gray-300 rounded-lg w-full text-lg p-3 col-span-6"
										bind:value={subVideoIdByOptions[index]} name="subVideoId">
							<option value={null}>None</option>
							{#each availableMedia as media}
								{#if media.videoId === presetData.subVideoByOptions[index]?.videoId}
									<option value={media.videoId} selected>{media.filename}</option>
								{:else}
									<option value={media.videoId}>{media.filename}</option>
								{/if}
							{/each}
						</select>
					{/each}
				</div>
			</div>
			<div class="flex flex-col justify-center items-center gap-2">
				<span class="w-full text-xl font-medium">Submitting Duration</span>
				<div class="flex gap-4 items-center justify-between">
					<input type="number" class="p-2 bg-[#2e2e2e] text-gray-300 rounded-lg"
								 bind:value={presetData.submittingDuration} placeholder="Submitting Duration" />
				</div>
			</div>
			<div class="justify-between items-center grid grid-cols-2 gap-6">
				<button class="p-2 bg-[#306844] rounded-lg text-xl text-gray-300 flex gap-2 items-center justify-center"
								on:click={submitHandler}>
					<SaveIcon />
					Save
				</button>
				<button class="p-2 bg-red-900 rounded-lg text-xl text-gray-300 flex gap-2 items-center justify-center"
								on:click={cancel}>
					<CancelIcon />
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type='number'] {
        -moz-appearance: textfield;
    }
</style>
