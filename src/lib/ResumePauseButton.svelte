<script lang="ts">
	import { currentFile, machineStats } from './stores';
	import { sendPause, sendResume } from './websocket';

	function resumePauseToggleButton() {
		if ($machineStats.executing) sendPause();
		else sendResume();
	}
</script>

<button
	class="btn btn-square"
	aria-label={$machineStats.executing ? 'Pause' : 'Resume'}
	onclick={resumePauseToggleButton}
	disabled={$machineStats.homing || (!$machineStats.executing && $currentFile == '')}
>
	<i class="fa-solid {$machineStats.executing ? 'fa-pause' : 'fa-play'}"></i>
</button>
