<script lang="ts">
	import { machineState } from './stores';
	import { ws, WSCmdType_t } from './websocket';

	let value = $machineState.led;

	function sendLedValue() {
		ws.send(new Uint8Array([WSCmdType_t.WSCmdType_LED, value]));
	}
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-moon"></i>
	<input
		type="range"
		min="0"
		max="255"
		step="1"
		bind:value
		class="range range-sm"
		on:change={sendLedValue}
	/>
	<i class="fa-solid fa-sun"></i>
</div>
