<script>
	import { logEnabled } from './stores';
	import { sendLogLevel } from './websocket';

	function toggleLogLevel() {
		$logEnabled = !$logEnabled;
		sendLogLevel($logEnabled);
	}
</script>

<button class="btn btn-square" aria-label="log-level" onclick={toggleLogLevel}>
	<i class="fa-solid {$logEnabled ? 'fa-comment' : 'fa-comment-slash'}"></i>
</button>
