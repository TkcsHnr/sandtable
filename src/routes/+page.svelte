<script lang="ts">
	import Canvas from '$lib/Canvas.svelte';
	import Controls from '$lib/Controls.svelte';
	import Stats from '$lib/Stats.svelte';
	import { machineState } from '$lib/stores';
	import { closeSocket, openSocket, setMessageCallback } from '$lib/websocket';
	import { onMount, onDestroy } from 'svelte';

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
</script>

<main class="flex flex-col items-center p-8 gap-4">
	<!-- <Controls /> -->
	<Canvas />
	<!-- <Stats /> -->
</main>
