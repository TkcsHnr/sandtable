<script lang="ts">
	import { machineStats } from './stores';
	import { sendFeedrateValue } from './websocket';

	const min = 200;
	const max = 4000;

	$: numberInput = $machineStats.feedrate;
	function checkAndSend() {
		if (numberInput < min || numberInput > max) return;
		$machineStats.feedrate = numberInput;
		sendFeedrateValue($machineStats.feedrate);
	}
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
		oninput={checkAndSend}
	/>
	<div class="flex">
		<i class="fa-solid fa-angle-right -mr-1"></i>
		<i class="fa-solid fa-angle-right"></i>
		<i class="fa-solid fa-angle-right -ml-1"></i>
	</div>
	<form class="contents" onsubmit={checkAndSend}>
		<input type="number" {min} {max} class="badge min-w-14 text-center" bind:value={numberInput} />
	</form>
</div>

<style>
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>