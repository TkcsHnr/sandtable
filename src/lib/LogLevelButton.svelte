<script>
	import { machineStats } from './stores';
	import { sendLogLevel } from './websocket';

	function toggleLogLevel() {
		$machineStats.logEnabled = !$machineStats.logEnabled;
		sendLogLevel($machineStats.logEnabled);
	}
</script>

<button class="btn btn-square" aria-label="log-level" onclick={toggleLogLevel}>
	<i class="fa-solid {$machineStats.logEnabled ? 'fa-comment' : 'fa-comment-slash'}"></i>
</button>
