<script lang="ts">
	import { feedrate } from './stores';
	import { sendFeedrateValue } from './websocket';

	const min = 200;
	const max = 4000;

	let sliding = false;
	$: localValue = 0;
	$: if(!sliding) {
		localValue = $feedrate
	}
	$: feedrateRatio = (localValue - min) / (max - min);
	$: numberInput = localValue;
	
	function checkAndSend() {
		if (numberInput < min || numberInput > max) return;
		sendFeedrateValue(numberInput);
	}

	function slideInput() {
		sliding = true;
		sendFeedrateValue(localValue);
	}

	const r = 50;
	$: angle = feedrateRatio * 270 - 135;
	$: radians = (angle * Math.PI) / 180;
	$: x2 = r + (r - 10) * Math.sin(radians);
	$: y2 = r - (r - 10) * Math.cos(radians);
</script>

<div class="flex justify-center gap-2 items-center">
	<input
		type="range"
		min="200"
		max="4000"
		step="1"
		bind:value={localValue}
		class="range range-sm"
		oninput={slideInput}
		onchange={() => (sliding = false)}
	/>
	<svg xmlns="http://www.w3.org/2000/svg" class="w-10 aspect-square" viewBox="0 0 {2 * r} {2 * r}">
		<path
			d=" M 25 75 A 35 35 135 1 1 75 75"
			stroke-width="10"
			stroke-linecap="round"
			class="fill-none stroke-base-content"
		/>

		<line x1={r} y1={r} {x2} {y2} stroke-width="10" stroke-linecap="round" class="stroke-error" />

		<circle cx={r} cy={r} r={10} class="fill-error" />
	</svg>

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
