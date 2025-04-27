<script lang="ts">
	import { fan } from './stores';
	import { sendFanValue } from './websocket';

	$: fanPercentage = Math.round(($fan * 100) / 255);

	$: numberInput = fanPercentage;
	function convertAndSend() {
		if (numberInput > 100) return;
		$fan = Math.floor((numberInput * 255) / 100);
		sendFanValue($fan);
	}

	let fanIcon: HTMLElement;
	$: {
		if (fanIcon)
			fanIcon.style.animation =
				fanPercentage > 0 ? `spin linear infinite ${30 / fanPercentage}s` : '';
	}
</script>

<div class="flex justify-center gap-2 items-center">
	<input
		type="range"
		min="0"
		max="100"
		step="1"
		bind:value={fanPercentage}
		class="range range-sm"
		oninput={convertAndSend}
	/>
	<i class="fa-solid fa-fan w-10 text-center text-xl" bind:this={fanIcon}></i>
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
