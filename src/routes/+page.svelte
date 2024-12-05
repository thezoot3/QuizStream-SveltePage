<script lang="ts">
	import { goto } from '$app/navigation';
	import { getGameInfo, getUserInfo } from '$lib/store';

	let userInfo = getUserInfo();
	let gameInfo = getGameInfo();
	let gameCode = '';

	interface ProgramProgressResponse {
		_id: string;
	}

	$: {
		if (gameCode.length === 6) {
			fetch('/api/programProgress/joinCode/' + gameCode)
				.then(res => res.json())
				.then((json: ProgramProgressResponse) => {
					gameInfo.set({ programProgressId: json._id });
					goto('/quiz');
				})
				.catch(() => {
					alert('존재하지 않는 게임 코드입니다.');
					gameCode = '';
				});
		}
	}
</script>
<div class="flex items-center justify-center flex-col gap-12">
	<h1 class="text-3xl font-semibold">퀴즈</h1>
	{#if $userInfo.nickname}
		<input type="text" bind:value={gameCode} class="py-3 w-48 text-center rounded-lg bg-gray-300 text-black font-medium"
					 placeholder="퀴즈 참여 코드">
	{:else}
		<button class="px-10 py-3 rounded-lg bg-gray-300 text-black font-medium" on:click={() => goto('/login')}>
			로그인
		</button>
	{/if}
</div>
