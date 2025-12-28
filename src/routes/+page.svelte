<script lang="ts">
	import { userState } from '$lib/store';
	import { v4 } from 'uuid';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import RecentSession from '../component/RecentSession.svelte';

	let setId = '';
	let nickname = '';

	let prevSession: { setId: string, nickname: string } | null = null;

	onMount(() => {
		const storedSetId = localStorage.getItem('lastSetId');
		const storedNickname = localStorage.getItem('lastNickname');

		if (storedSetId && storedNickname) {
			prevSession = { setId: storedSetId, nickname: storedNickname };
		}
	});

	const init = async () => {
		if (setId && nickname) {
			localStorage.setItem('lastSetId', setId);
			localStorage.setItem('lastNickname', nickname);
		}

		let userId = v4();
		userState.set({ setId, userId, nickname, joined: false });
		await goto('/quiz');
	};

	const quickInit = async () => {
		if (prevSession) {
			setId = prevSession.setId;
			nickname = prevSession.nickname;
			await init();
		}
	};

</script>

<div class="flex items-center justify-center flex-col gap-8 w-full max-w-md mx-auto px-4">

	{#if prevSession}
		<RecentSession
			setId={prevSession.setId}
			nickname={prevSession.nickname}
			onConfirm={quickInit}
		/>

		<div class="flex items-center w-full gap-4">
			<div class="h-[1px] bg-gray-700 flex-grow"></div>
			<span class="text-xs text-gray-500 font-medium">또는 직접 입력</span>
			<div class="h-[1px] bg-gray-700 flex-grow"></div>
		</div>
	{/if}

	<div class="flex flex-col gap-4 w-full bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
		<div class="space-y-2">
			<label for="nickname" class="text-base font-semibold text-gray-400 ml-1">닉네임</label>
			<input
				id="nickname"
				type="text"
				bind:value={nickname}
				class="w-full py-3 px-4 rounded-lg bg-[#2e2e2e] text-white border border-gray-700 focus:border-[#4080FF] focus:outline-none transition-colors"
				placeholder="닉네임을 입력하세요"
			>
		</div>

		<div class="space-y-2">
			<label for="setId" class="text-base font-semibold text-gray-400 ml-1">퀴즈 참여 코드</label>
			<input
				id="setId"
				type="text"
				bind:value={setId}
				class="w-full py-3 px-4 rounded-lg bg-[#2e2e2e] text-white border border-gray-700 focus:border-[#4080FF] focus:outline-none transition-colors"
				placeholder="코드를 입력하세요"
			>
		</div>

		<button
			class="w-full py-3 mt-2 rounded-lg bg-gray-200 hover:bg-white text-black font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
			on:click={init}
			disabled={!nickname || !setId}
		>
			새로 참가
		</button>
	</div>
</div>
