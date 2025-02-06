<script lang="ts">
	import { machineState } from './stores';
	import { ws, WSCmdType_t } from './websocket';

	let value = $machineState.fan;

	function sendFanValue() {
		ws.send(new Uint8Array([WSCmdType_t.WSCmdType_FAN, value]));
	}
</script>

<div class="flex justify-center gap-2 items-center">
	<i class="fa-solid fa-ban"></i>
	<input
		type="range"
		min="0"
		max="255"
		step="1"
		bind:value
		class="range range-sm"
		on:change={sendFanValue}
	/>
	<i class="fa-solid fa-fan"></i>
</div>
