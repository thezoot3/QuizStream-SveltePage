<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();


</script>


<div class="z-40 w-full h-full overflow-y-hidden bg-[#121212] text-gray-200 flex items-center justify-center">
	{#if !$page.url.pathname.startsWith("/admin/videoPlayer")}
		<nav class="w-full p-6 flex items-center justify-between absolute top-0">
			<span class="text-2xl text-white">QuizStream</span>
		</nav>
	{/if}
	{@render children()}
</div>

