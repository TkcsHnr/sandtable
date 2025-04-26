<script lang="ts">
	import { currentFile, machinePatterns, machineStats } from './stores';
	import { sendDeletePattern, sendPause, sendResume, sendStart } from './websocket.js';

	$: disabled = $machineStats.busy || (!$machineStats.homed && $machineStats.safemode);
</script>

{#if $machinePatterns.length > 0}
	<div class="flex flex-col p-4 gap-4 rounded-box bg-base-200 h-fit">
		<h2 class="text-lg font-bold px-2">Patterns on ESP:</h2>
		{#each $machinePatterns as pattern}
			<div class="flex gap-2 items-baseline">
				{#if pattern == $currentFile}
					<button
						class="btn btn-sm btn-square btn-primary"
						aria-label="start"
						onclick={() => ($machineStats.executing ? sendPause() : sendResume())}
					>
						<i class="fa-solid {$machineStats.executing ? 'fa-pause' : 'fa-play'}"
						></i>
					</button>
				{:else}
					<button
						class="btn btn-sm btn-square btn-ghost"
						aria-label="start"
						onclick={() => sendStart(pattern)}
						{disabled}
					>
						<i class="fa-solid fa-play"></i>
					</button>
				{/if}
				<p class:font-bold={pattern == $currentFile}>
					{pattern.replace('/', '').replace('.bin', '')}
				</p>
				<button
					class="btn btn-sm btn-square btn-ghost ml-auto"
					aria-label="delete"
					onclick={() => sendDeletePattern(pattern)}
				>
					<i class="fa-solid fa-trash text-error"></i>
				</button>
			</div>
		{/each}
	</div>
{/if}
