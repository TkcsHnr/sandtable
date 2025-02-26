<script lang="ts">
	import { machineStats } from './stores';
	import { sendFeedrateValue } from './websocket';
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-angle-right"></i>
	<input
		type="range"
		min="200"
		max="4000"
		step="1"
		bind:value={$machineStats.feedrate}
		class="range range-sm"
		on:input={() => sendFeedrateValue($machineStats.feedrate)}
	/>
	<div class="flex">
		<i class="fa-solid fa-angle-right -mr-1"></i>
		<i class="fa-solid fa-angle-right"></i>
		<i class="fa-solid fa-angle-right -ml-1"></i>
	</div>
	<span class="badge min-w-14">{$machineStats.feedrate}</span>
</div>
