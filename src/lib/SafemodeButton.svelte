<script>
	import { machineStats } from "./stores";
	import { sendSafemode } from "./websocket";

    function toggleSafemode() {
        $machineStats.safemode = !$machineStats.safemode;
        sendSafemode($machineStats.safemode)
    }

</script>

<button class="btn btn-square" aria-label="safemode" onclick={toggleSafemode}>
    <i class="fa-solid {$machineStats.safemode ? 'fa-lock' : 'fa-lock-open'}"></i>
</button>