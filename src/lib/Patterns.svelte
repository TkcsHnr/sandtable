<script lang="ts">
	import { machinePatterns, MachineState, machineStats } from './stores';
	import { sendDeletePattern, sendStart } from './websocket.js';

	$: disabled =
		$machineStats.state == MachineState.BUSY ||
		$machineStats.state == MachineState.HOMING ||
		(!$machineStats.homed && $machineStats.safemode);
</script>

{#if $machinePatterns.length > 0}
	<div class="flex flex-col p-4 gap-4 rounded-box bg-base-200 h-fit">
		<h2 class="text-lg font-bold px-2">Patterns on ESP:</h2>
		{#each $machinePatterns as pattern}
			<div class="flex gap-2 items-baseline">
				<button
					class="btn btn-sm btn-square btn-ghost"
					aria-label="start"
					onclick={() => sendStart(pattern)}
					{disabled}
				>
					<i class="fa-solid fa-play"></i>
				</button>
				<p>{pattern.replace('/', '').replace('.bin', '')}</p>
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
