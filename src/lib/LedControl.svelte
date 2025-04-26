<script lang="ts">
	import { machineStats } from './stores';
	import { sendLedValue } from './websocket';

	$: ledPercentage = Math.round(($machineStats.led * 100) / 255);

	$: numberInput = ledPercentage;
	function convertAndSend() {
		if (numberInput > 100) return;
		$machineStats.led = Math.floor((numberInput * 255) / 100);
		sendLedValue($machineStats.led);
	}
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-moon"></i>
	<input
		type="range"
		min="0"
		max="100"
		step="1"
		bind:value={ledPercentage}
		class="range range-sm"
		oninput={convertAndSend}
	/>
	<i class="fa-solid fa-sun"></i>
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
