<script lang="ts">
	import { machineState } from './stores';
	import { sendMessage } from './websocket';

	let range: HTMLInputElement;
	function setFeedrate() {
		sendMessage('feedrate', {
			value: range.value
		});
	}
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-angle-right"></i>
	<input
		type="range"
		min="200"
		max="4000"
		value={$machineState.feedrate}
		class="range range-sm"
		on:change={setFeedrate}
		bind:this={range}
	/>
	<div class="flex">
		<i class="fa-solid fa-angle-right -mr-1"></i>
		<i class="fa-solid fa-angle-right"></i>
		<i class="fa-solid fa-angle-right -ml-1"></i>
	</div>
</div>
