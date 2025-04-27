<script lang="ts">
	import { currentFile, machineStats } from './stores';
	import { sendPause, sendResume, sendStop, ws } from './websocket';

	function startPauseToggleButton() {
		if ($machineStats.executing) sendPause();
		else sendResume();
	}
</script>

<div class="flex flex-col gap-1">
	<button
		class="btn btn-square"
		aria-label={$machineStats.executing ? 'Pause' : 'Resume'}
		onclick={startPauseToggleButton}
		disabled={$machineStats.homing || (!$machineStats.executing && $currentFile == "")}
	>
		<i class="fa-solid {$machineStats.executing ? 'fa-pause' : 'fa-play'}"></i>
	</button>
	<button
		class="btn btn-square"
		aria-label="Stop"
		onclick={sendStop}
	>
		<i class="fa-solid fa-stop"></i>
	</button>
</div>
