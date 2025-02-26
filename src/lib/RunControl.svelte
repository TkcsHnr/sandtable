<script lang="ts">
	import { MachineState, machineStats } from './stores';
	import { sendPause, sendResume, sendStart, sendStop, ws } from './websocket';

	$: state = $machineStats.state;

	function startPauseToggleButton() {
		if(state == MachineState.BUSY) 
			sendPause();
		if(state == MachineState.IDLE)
			sendStart();
		if(state == MachineState.PAUSED)
			sendResume();
	}
</script>

<div class="flex flex-col gap-1">
	<button
		class="btn btn-square"
		aria-label={state == MachineState.BUSY ? 'Pause' : state == MachineState.IDLE ? 'Start' : 'Resume'}
		onclick={startPauseToggleButton}
	>
		<i class="fa-solid {state == MachineState.BUSY ? 'fa-pause' : 'fa-play'}"></i>
	</button>
	<button
		class="btn btn-square"
		aria-label="Stop"
		disabled={state == MachineState.IDLE}
		onclick={sendStop}
	>
		<i class="fa-solid fa-stop"></i>
	</button>
</div>
