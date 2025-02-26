<script lang="ts">
	import { machineStats } from './stores';
	import { sendLedValue } from './websocket';
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-moon"></i>
	<input
		type="range"
		min="0"
		max="255"
		step="1"
		bind:value={$machineStats.led}
		class="range range-sm"
		on:input={() => sendLedValue($machineStats.led)}
	/>
	<i class="fa-solid fa-sun"></i>
	<span class="badge min-w-14">{Math.round($machineStats.led * 100 / 255)}%</span>

</div>
