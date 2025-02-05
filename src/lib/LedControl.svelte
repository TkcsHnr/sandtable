<script lang="ts">
	import { machineState } from './stores';
	import { sendMessage } from './websocket';

	let range: HTMLInputElement;
	function setLed() {
		sendMessage('led', {
			value: range.value
		});
	}
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-moon"></i>
	<input
		type="range"
		min="0"
		max="100"
		value={$machineState.led}
		class="range range-sm"
		on:change={setLed}
		bind:this={range}
	/>
	<i class="fa-solid fa-sun"></i>
</div>
