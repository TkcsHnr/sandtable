<script lang="ts">
	import { get } from 'svelte/store';
	import { led } from './stores';
	import { sendLedValue } from './websocket';



	let sliding = false;
	$: localValue = get(led);
	$: ledPercentage = Math.round((localValue * 100) / 255);
	led.subscribe((value) => {
		if (!sliding) {
			localValue = value;
		}
	});

	function convertAndSend() {
		if (ledPercentage > 100) return;
		sendLedValue(Math.floor((ledPercentage * 255) / 100));
	}

	function slideInput() {
		sliding = true;
		sendLedValue(localValue);
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
		max="255"
		step="1"
		bind:value={localValue}
		class="range range-sm"
		oninput={slideInput}
		onchange={() => (sliding = false)}
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
			bind:value={ledPercentage}
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
