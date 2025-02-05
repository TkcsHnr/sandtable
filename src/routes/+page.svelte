<script lang="ts">
	import Canvas from '$lib/Canvas.svelte';
	import Controls from '$lib/Controls.svelte';
	import Stats from '$lib/Stats.svelte';
	import { machineState } from '$lib/stores';
	import { closeSocket, openSocket, setMessageCallback } from '$lib/websocket';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';

	function handleMessage(data: string) {
		const message = JSON.parse(data);
		console.log(JSON.stringify(message));
	}

	onMount(() => {
		openSocket();
		setMessageCallback(handleMessage);
	});
	onDestroy(() => {
		closeSocket();
	});

	export let data: PageData;

</script>

<main class="flex flex-col items-center p-8 gap-4">
	<!-- <Controls /> -->
	<Canvas patterns={data.patterns}/>
	<!-- <Stats /> -->
</main>
