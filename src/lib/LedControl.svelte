<script lang="ts">
	import { led } from './stores';
	import { sendLedValue } from './websocket';

	$: ledPercentage = Math.round(($led * 100) / 255);

	$: numberInput = ledPercentage;
	function convertAndSend() {
		if (numberInput > 100) return;
		$led = Math.floor((numberInput * 255) / 100);
		sendLedValue($led);
	}

	let glow: HTMLDivElement;
	$: {
		if (glow) {
			glow.style.boxShadow =
				ledPercentage == 0
					? ''
					: `0 0 ${ledPercentage / 20 + 6}px ${ledPercentage / 20 + 6}px #fff,
					   0 0 ${(ledPercentage / 20) * 2 + 6}px ${ledPercentage / 20 + 6}px #ffcc00`;
		}
	}
</script>

<div class="flex justify-center gap-2 items-center">
	<input
		type="range"
		min="0"
		max="100"
		step="1"
		bind:value={ledPercentage}
		class="range range-sm"
		oninput={convertAndSend}
	/>
	<div class="w-10 aspect-square flex justify-center items-center relative">
		<div class="absolute top-[9px] rounded-full" bind:this={glow}></div>
		<i class="fa-solid fa-lightbulb text-2xl text-center"></i>
	</div>
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
