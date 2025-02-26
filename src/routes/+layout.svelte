<script lang="ts">
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';

	let { children } = $props();
</script>

<main class="flex flex-col items-center p-8 gap-4">
	{@render children()}
</main>
