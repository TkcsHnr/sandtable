<script lang="ts">
	import { onMount } from 'svelte';
	import { sendMessage } from './websocket';
	import colors from 'tailwindcss/colors';
	const { amber, orange, yellow } = colors;

	type point = { x: number; y: number };
	let points: point[] = [];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let drawing = false;

	export let patterns: string[];

	export function clear() {
		points = [];
		ctx?.clearRect(0, 0, canvas.width, canvas.height);
	}

	export function getPoints() {
		return points;
	}

	function startDrawing(p: point) {
		drawing = true;
		points.push(p);
		draw(p);
	}

	function draw(p: point) {
		if (!ctx) return;
		if (!drawing) return;

		ctx.beginPath();
		ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);

		ctx.strokeStyle = orange[300];
		ctx.lineWidth = 6;
		ctx.lineTo(p.x, p.y);
		ctx.stroke();

		ctx.strokeStyle = orange[200];
		ctx.lineWidth = 4;
		ctx.lineTo(p.x, p.y);
		ctx.stroke();

		points.push(p);
	}

	function stopDrawing() {
		drawing = false;
	}

	function tokenizeGCodeLine(line: string): { [key: string]: string | number } {
		const tokens: { [key: string]: string | number } = {};
		const words = line.trim().split(/\s+/);

		for (const word of words) {
			const code = word.charAt(0);
			const value = word.slice(1).trim();

			const parsedValue = !isNaN(parseFloat(value)) ? parseFloat(value) : value;

			if (code) {
				tokens[code] = parsedValue;
			}
		}

		return tokens;
	}

	function drawGcode(lines: string[]) {
		let x: number = 0;
		let y: number = 0;
		clear();
		startDrawing({x, y});
		for (let line of lines) {
			line.trim();
			if (line.startsWith(';') || line == '') continue;

			const tokens = tokenizeGCodeLine(line);
			if ('G' in tokens && tokens['G'] == 1) {
				if ('X' in tokens) x = parseFloat(tokens['X'].toString());
				if ('Y' in tokens) y = parseFloat(tokens['Y'].toString());

				draw({x, y});
			}
		}
		stopDrawing();
	}

	let patternSelector: HTMLSelectElement;
	async function handlePatternChange(event: any) {
		const selectedPath = event.target.value;
		if (!selectedPath) return;

		try {
			const response = await fetch(selectedPath);
			if (response.ok) {
				const content = await response.text();
				const lines = content.split('\n');
				drawGcode(lines);
			}
		} catch (error) {
			console.error("Coudln't fetch pattern from files.");
		}
	}

	function handleFileChange(event: any) {
		const selectedFile = event.target.files[0];
		if (!selectedFile) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			if (reader.result) {
				const lines = reader.result.toString().split('\n');
				drawGcode(lines);
			}
		};
		reader.readAsText(selectedFile);
	}
	function getCanvasCoords(event:MouseEvent|TouchEvent) {
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		let clientX, clientY;

		if (event instanceof TouchEvent) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else {
			clientX = event.clientX;
			clientY = event.clientY;
		}

		const x = (clientX - rect.left) * scaleX;
		const y = (clientY - rect.top) * scaleY;

		const invertedY = canvas.height - y;

		return { x, y: invertedY };
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			ctx.translate(0, canvas.height);
			ctx.scale(1, -1);
		}
	});
</script>

<div class="flex gap-2 flex-wrap">
	<button class="btn" onclick={clear}>
		Clear
		<i class="fa-solid fa-eraser"></i>
	</button>
	<input
		id="gcode"
		type="file"
		accept=".gcode"
		class="hidden"
		onchange={(e) => handleFileChange(e)}
	/>
	<select
		bind:this={patternSelector}
		class="select select-bordered w-fit max-w-40 bg-base-200 border-none"
		onchange={handlePatternChange}
		onfocus={() => {
			patternSelector.selectedIndex = 0;
		}}
	>
		<option value="" disabled selected>Select pattern</option>
		{#each patterns as pattern}
			<option value="/patterns/{pattern}">{pattern}</option>
		{/each}
	</select>
	<label for="gcode" class="btn"> Upload .gcode </label>
	<button class="btn" onclick={() => sendMessage('draw', points)}>
		Send
		<i class="fa-solid fa-paper-plane"></i>
	</button>
</div>
<canvas
	bind:this={canvas}
	onmousedown={(e) => startDrawing(getCanvasCoords(e))}
	onmousemove={(e) => draw(getCanvasCoords(e))}
	onmouseup={stopDrawing}
	ontouchstart={(e) => startDrawing(getCanvasCoords(e))}
	ontouchmove={(e) => draw(getCanvasCoords(e))}
	ontouchend={stopDrawing}
	width="490"
	height="490"
	class="touch-none bg-yellow-100 max-w-[490px] w-full"
></canvas>
