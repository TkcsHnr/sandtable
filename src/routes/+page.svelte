<script lang="ts">
	import Canvas from '$lib/Canvas.svelte';
	import MovementControl from '$lib/MovementControl.svelte';
	import Stats from '$lib/Stats.svelte';
	import { closeSocket, openSocket } from '$lib/websocket';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import LedControl from '$lib/LedControl.svelte';
	import FeedrateControl from '$lib/FeedrateControl.svelte';
	import RunControl from '$lib/RunControl.svelte';
	import FanControl from '$lib/FanControl.svelte';
	import SafemodeButton from '$lib/SafemodeButton.svelte';

	export let data: PageData;

	onMount(() => {
		openSocket(data.websocket_password);
	});
	onDestroy(() => {
		closeSocket();
	});
</script>

<div class="flex gap-4 w-full flex-wrap justify-center items-center">
	<MovementControl />
	<div class="flex flex-col gap-1 items-center">
		<SafemodeButton />
		<RunControl />
	</div>
	<div class="flex flex-col gap-4 max-w-xs w-full">
		<LedControl />
		<FeedrateControl />
		<FanControl />
	</div>
</div>
<Stats />
<Canvas patterns={data.patterns} />
