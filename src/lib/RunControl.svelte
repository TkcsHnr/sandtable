<script lang="ts">
    import { machineState } from "./stores";

    $: state = $machineState.state;
</script>

<div class="flex gap-2">
    <button class="btn btn-square" aria-label="{state == 'busy' ? 'Pause' : 'Resume'}" disabled={state == "idle"}>
        <i class="fa-solid {state == 'busy' ? 'fa-pause' : 'fa-play'}"></i>
    </button>
    <button class="btn btn-square" aria-label="Stop" disabled={state == "idle"}>
        <i class="fa-solid fa-stop"></i>
    </button>
</div>