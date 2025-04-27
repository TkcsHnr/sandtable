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
		if (fanIcon) {
			if (fanPercentage > 0) {
				fanIcon.style.animationName = 'spin';
				fanIcon.style.animationDuration = `${30 / fanPercentage}s`;
				fanIcon.style.animationTimingFunction = 'linear';
				fanIcon.style.animationIterationCount = 'infinite';
			} else {
				fanIcon.style.animationName = 'none';
			}
		}
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
	<div class="w-10 aspect-square flex justify-center items-center">
		<i class="fa-solid fa-fan text-center text-2xl" bind:this={fanIcon}></i>
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

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
