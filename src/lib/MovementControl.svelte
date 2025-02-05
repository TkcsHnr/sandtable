<script lang="ts">
	import { sendMessage } from './websocket';
	import { machineState } from '$lib/stores';

	function home() {
		sendMessage('home');
	}
	function move(dx: number, dy: number) {
		sendMessage('move', dx, dy);
	}
</script>

<div class="grid grid-cols-3 grid-rows-3 gap-1 w-fit">
	<button class="btn btn-square row-start-2 col-start-2" aria-label="home" onclick={home}>
		<i class="fa-solid {$machineState.homed ? 'fa-house-circle-check' : 'fa-house'} text-lg"></i>
	</button>
	<button
		class="btn rounded-t-badge row-start-1 col-start-2"
		aria-label="up"
		onclick={() => move(0, 1)}
	>
		<i class="fa-solid fa-angle-up text-lg"></i>
	</button>
	<button
		class="btn btn-sm btn-square rounded-r-badge rounded-tl-badge row-start-1 col-start-3 self-end"
		aria-label="upright"
		onclick={() => move(1, 1)}
	>
		<i class="fa-solid fa-angle-up rotate-45"></i>
	</button>
	<button
		class="btn btn-square rounded-r-badge row-start-2 col-start-3"
		aria-label="right"
		onclick={() => move(1, 0)}
	>
		<i class="fa-solid fa-angle-right text-lg"></i>
	</button>
	<button
		class="btn btn-sm btn-square rounded-b-badge rounded-tr-badge row-start-3 col-start-3"
		aria-label="downright"
		onclick={() => move(1, -1)}
	>
		<i class="fa-solid fa-angle-right rotate-45"></i>
	</button>
	<button
		class="btn btn-square rounded-b-badge row-start-3 col-start-2"
		aria-label="down"
		onclick={() => move(0, -1)}
	>
		<i class="fa-solid fa-angle-down text-lg"></i>
	</button>
	<button
		class="btn btn-sm btn-square rounded-l-badge rounded-br-badge row-start-3 col-start-1 justify-self-end"
		aria-label="downleft"
		onclick={() => move(-1, -1)}
	>
		<i class="fa-solid fa-angle-down rotate-45"></i>
	</button>
	<button
		class="btn btn-square rounded-l-badge row-start-2 col-start-1"
		aria-label="left"
		onclick={() => move(-1, 0)}
	>
		<i class="fa-solid fa-angle-left text-lg"></i>
	</button>
	<button
		class="btn btn-sm btn-square rounded-t-badge rounded-bl-badge row-start-1 col-start-1 self-end justify-self-end"
		aria-label="upleft"
		onclick={() => move(-1, 1)}
	>
		<i class="fa-solid fa-angle-left rotate-45"></i>
	</button>
</div>