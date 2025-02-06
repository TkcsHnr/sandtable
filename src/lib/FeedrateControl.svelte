<script lang="ts">
	import { machineState } from './stores';
	import { sendTextMessage } from './websocket';

	let value = $machineState.feedrate;
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-angle-right"></i>
	<input
		type="range"
		min="200"
		max="4000"
		step="1"
		bind:value
		class="range range-sm"
		on:change={() => sendTextMessage("feedrate", value)}
	/>
	<div class="flex">
		<i class="fa-solid fa-angle-right -mr-1"></i>
		<i class="fa-solid fa-angle-right"></i>
		<i class="fa-solid fa-angle-right -ml-1"></i>
	</div>
</div>
