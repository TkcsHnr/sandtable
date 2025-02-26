<script lang="ts">
	import { machineStats } from './stores';
	import { sendFanValue } from './websocket';

</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-ban"></i>
	<input
		type="range"
		min="0"
		max="255"
		step="1"
		bind:value={$machineStats.fan}
		class="range range-sm"
		on:input={() => sendFanValue($machineStats.fan)}
	/>
	<i class="fa-solid fa-fan"></i>
	<span class="badge min-w-14">{Math.round($machineStats.fan * 100 / 255)}%</span>
</div>
