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

	function handleMessage(data: string) {
		const message = JSON.parse(data);
		console.log(JSON.stringify(message));
	}

	onMount(() => {
		openSocket();
	});
	onDestroy(() => {
		closeSocket();
	});

	export let data: PageData;
</script>

<main class="flex flex-col items-center p-8 gap-4">
	<div class="flex gap-4 w-full flex-wrap justify-center items-center">
		<MovementControl />
		<RunControl />
		<div class="flex flex-col gap-4 max-w-xs w-full">
			<LedControl />
			<FeedrateControl />
			<FanControl />
		</div>
	</div>
	<Stats />
	<Canvas patterns={data.patterns} />
</main>
