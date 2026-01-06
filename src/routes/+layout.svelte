<script lang="ts">
	import '../app.css';
	import { myScore } from '$lib/store';
	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { dev } from '$app/environment';

	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	let { children } = $props();
</script>


<div class="z-40 w-full h-full overflow-y-hidden bg-[#121212] text-gray-200 flex items-center justify-center">
	<nav class="w-full p-6 flex items-center justify-between flex-col absolute top-0 gap-4">
		<span class="text-2xl text-white ">QuizStream</span>
		{#if $myScore?.score}
			<span class="text-xl text-white animate-bounce">{$myScore.score}점</span>
		{/if}
	</nav>
	{@render children()}
</div>

