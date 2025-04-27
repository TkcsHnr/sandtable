<script lang="ts">
	import StopButton from '$lib/StopButton.svelte';
	import ResumePauseButton from '$lib/ResumePauseButton.svelte';
	import Canvas from '$lib/Canvas.svelte';
	import MovementControl from '$lib/MovementControl.svelte';
	import Stats from '$lib/Stats.svelte';
	import { closeSocket, openSocket } from '$lib/websocket';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import LedControl from '$lib/LedControl.svelte';
	import FeedrateControl from '$lib/FeedrateControl.svelte';
	import FanControl from '$lib/FanControl.svelte';
	import SafemodeButton from '$lib/SafemodeButton.svelte';
	import Patterns from '$lib/Patterns.svelte';
	import LogLevelButton from '$lib/LogLevelButton.svelte';

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
	<div class="grid gap-1 grid-cols-2">
		<ResumePauseButton />
		<SafemodeButton />
		<StopButton />
		<LogLevelButton />
	</div>
	<div class="flex flex-col gap-2 max-w-xs w-full">
		<LedControl />
		<FeedrateControl />
		<FanControl />
	</div>
</div>
<Stats />
<div class="flex gap-4 flex-wrap">
	<Canvas patterns={data.patterns} />
	<Patterns />
</div>
