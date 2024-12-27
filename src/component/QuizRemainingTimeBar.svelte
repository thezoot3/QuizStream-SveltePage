<script lang="ts">

	import { ProgressBar } from '@prgm/sveltekit-progress-bar';

	export let maxDuration: number = 0;
	export let remainingDuration: number = 0;

</script>
<div class="w-full flex flex-col gap-2">
	<progress max={maxDuration} value={remainingDuration} class="w-full text-[0.5rem] border-0 rounded-xl">
		{remainingDuration}s
	</progress>
</div>
