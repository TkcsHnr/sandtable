<script>
	import { sendStop } from './websocket';
</script>

<button class="btn btn-square" aria-label="Stop" onclick={sendStop}>
	<i class="fa-solid fa-stop"></i>
</button>
