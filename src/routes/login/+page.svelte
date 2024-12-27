<script lang="ts">
	import { getUserInfo } from '$lib/store';
	import { goto } from '$app/navigation';

	interface loginResponse {
		userId: string;
	}

	let userInfo = getUserInfo();
	let nickname = '';

	const login = async () => {
		userInfo.set({ nickname: nickname, userId: '' });
		await goto('/');
	};

</script>
<div class="flex items-center justify-center flex-col gap-8">
	<h1 class="text-3xl font-semibold">유저 로그인</h1>
	<input type="text" bind:value={nickname} class="py-3 w-48 text-center rounded-lg bg-gray-300 text-black font-medium"
				 placeholder="닉네임">
	<button class="px-10 py-3 rounded-lg bg-gray-300 text-black font-medium" on:click={login}>
		로그인
	</button>
</div>
