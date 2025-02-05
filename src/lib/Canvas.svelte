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

	function startDrawing(x: number, y: number) {
		drawing = true;
		points.push({ x, y });
		draw(x, y);
	}

	function draw(x: number, y: number) {
		if (!ctx) return;
		if (!drawing) return;

		ctx.beginPath();
		ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
		
		ctx.strokeStyle = orange[300];
		ctx.lineWidth = 6;
		ctx.lineTo(x, y);
		ctx.stroke();

		ctx.strokeStyle = orange[200];
		ctx.lineWidth = 4;
		ctx.lineTo(x, y);
		ctx.stroke();
		
		points.push({ x, y });
	}

	function handleTouchStart(e: TouchEvent) {
		e.preventDefault();
		const touch = e.touches[0];
		startDrawing(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault();
		const touch = e.touches[0];
		draw(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
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
				console.log(code, parsedValue);
			}
		}

		return tokens;
	}

	function drawGcode(lines: string[]) {
		let x: number = 0;
		let y: number = 0;
		clear();
		startDrawing(x, y);
		for (let line of lines) {
			line.trim();
			if (line.startsWith(';') || line == '') continue;

			const tokens = tokenizeGCodeLine(line);
			if ('G' in tokens && tokens['G'] == 1) {
				if ('X' in tokens) x = parseFloat(tokens['X'].toString());
				if ('Y' in tokens) y = parseFloat(tokens['Y'].toString());

				draw(x, y);
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

	onMount(() => {
		ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
		}
	});
</script>

<div class="flex flex-col gap-2 items-end">
	<div class="flex gap-2">
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
			class="select select-bordered w-fit max-w-40"
			onchange={handlePatternChange}
			onfocus={() => {
				patternSelector.selectedIndex = -1;
			}}
		>
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
		onmousedown={(e) => startDrawing(e.offsetX, e.offsetY)}
		onmousemove={(e) => draw(e.offsetX, e.offsetY)}
		onmouseup={stopDrawing}
		ontouchstart={(e) => handleTouchStart(e)}
		ontouchmove={(e) => handleTouchMove(e)}
		ontouchend={stopDrawing}
		width="490"
		height="490"
		class="touch-none bg-yellow-100"
	></canvas>
</div>
