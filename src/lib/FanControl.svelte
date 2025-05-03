<script lang="ts">
	import { fan } from './stores';
	import { sendFanValue } from './websocket';

	let sliding = false;
	$: localValue = 0;
	$: if(!sliding) {
		localValue = $fan;
	}
	$: fanPercentage = Math.round((localValue * 100) / 255);
	$: numberInput = fanPercentage;

	function convertAndSend() {
		if (numberInput > 100) return;
		sendFanValue(Math.floor((numberInput * 255) / 100));
	}

	function slideInput() {
		sliding = true;
		sendFanValue(localValue);
	}

	let fanIcon: HTMLElement;
	$: {
		if (fanIcon) {
			if (fanPercentage > 0) {
				const speed = `${30 / fanPercentage}s`;
				fanIcon.style.setProperty('--fan-speed', speed);
			} else {
				fanIcon.style.setProperty('--fan-speed', '0s');
			}
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
	<div class="w-10 aspect-square flex justify-center items-center">
		<i id="fanIcon" class="fa-solid fa-fan text-center text-2xl" bind:this={fanIcon}></i>
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

	#fanIcon {
		--fan-speed: 0s;
		animation-name: spin;
		animation-duration: var(--fan-speed);
		animation-iteration-count: infinite;
		animation-timing-function: linear;
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
