<script lang="ts">
	import { machineStats } from './stores';
	import { sendFanValue } from './websocket';

	$: fanPercentage = Math.round(($machineStats.fan * 100) / 255);

	$: numberInput = fanPercentage;
	function convertAndSend() {
		if (numberInput > 100) return;
		$machineStats.fan = Math.floor((numberInput * 255) / 100);
		sendFanValue($machineStats.fan);
	}
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-ban"></i>
	<input
		type="range"
		min="0"
		max="100"
		step="1"
		bind:value={fanPercentage}
		class="range range-sm"
		oninput={convertAndSend}
	/>
	<i class="fa-solid fa-fan"></i>
	<form class="contents" onsubmit={convertAndSend}>
		<input
			type="number"
			min="0"
			max="100"
			class="badge min-w-14 text-center"
			bind:value={numberInput}
		/>
	</form>
</div>

<style>
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
