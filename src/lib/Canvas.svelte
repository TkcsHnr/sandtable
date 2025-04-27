<script lang="ts">
	import { onMount } from 'svelte';
	import colors from 'tailwindcss/colors';
	import { sendPatternFragments } from './websocket';
	import { currentFile, machineStats, sendingPattern } from './stores';
	const { amber, orange, yellow } = colors;

	let pointNums: number[] = [];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let drawing = false;

	export let patterns: string[];

	let patternName = 'pattern';
	export function clear() {
		stopDrawing();
		pointNums = [];
		ctx?.clearRect(0, 0, canvas.width, canvas.height);
	}

	function reset() {
		clear();
		patternSelector.selectedIndex = 0;
		patternName = 'pattern';
	}

	export function getpointNums() {
		return pointNums;
	}

	function startDrawing() {
		drawing = true;
	}

	function draw(x: number, y: number) {
		if (!ctx) return;
		if (!drawing) return;

		ctx.beginPath();
		if (pointNums.length > 0)
			ctx.moveTo(pointNums[pointNums.length - 2], pointNums[pointNums.length - 1]);
		else ctx.moveTo(x, y);

		ctx.lineTo(x, y);
		ctx.strokeStyle = orange[300];
		ctx.lineWidth = 8;
		ctx.stroke();
		ctx.strokeStyle = orange[200];
		ctx.lineWidth = 4;
		ctx.stroke();

		pointNums.push(x, y);
	}

	function stopDrawing() {
		drawing = false;
		preview = false;
	}

	async function preciseMessageDelay(iterations = 1) {
		for (let i = 0; i < iterations; i++) {
			await new Promise((resolve) => {
				const mc = new MessageChannel();
				mc.port1.onmessage = resolve;
				mc.port2.postMessage(null);
			});
		}
	}

	let preview = false;
	async function previewPattern(delay = 1) {
		let pointsCopy = structuredClone(pointNums);
		clear();
		startDrawing();
		preview = true;
		for (let i = 0; i < pointsCopy.length; i += 2) {
			if (!drawing) {
				return;
			}
			draw(pointsCopy[i], pointsCopy[i + 1]);
			await preciseMessageDelay(delay);
		}
		stopDrawing();
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

	async function drawGcode(lines: string[]) {
		let x: number = 0;
		let y: number = 0;
		clear();
		startDrawing();
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
	let lines: string[] = [];
	async function handlePatternChange() {
		patternName = patternSelector.value;
		if (!patternName) return;

		try {
			const response = await fetch(`/patterns/${patternName}`);
			if (response.ok) {
				const content = await response.text();
				lines = content.split('\n');
				drawGcode(lines);
			}
		} catch (error) {
			console.error("Couldn't fetch pattern from files.");
		}
	}

	function handleFileChange(event: any) {
		const selectedFile = event.target.files[0];
		if (!selectedFile) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			if (reader.result) {
				lines = reader.result.toString().split('\n');
				drawGcode(lines);
			}
		};
		reader.readAsText(selectedFile);
	}

	function getCanvasCoords(event: MouseEvent | TouchEvent): [number, number] {
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

		return [x, invertedY];
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

	let prevX: number, prevY: number;
	machineStats.subscribe(($machineStats) => {
		if (!ctx) return;
		if ($machineStats.homing || !$machineStats.executing) return;

		ctx.moveTo(prevX || $machineStats.x, prevY || $machineStats.y);
		ctx.lineTo($machineStats.x, $machineStats.y);
		ctx.lineWidth = 8;
		ctx.strokeStyle = 'orange';
		ctx.stroke();
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'red';
		ctx.stroke();

		prevX = $machineStats.x;
		prevY = $machineStats.y;
	});

	currentFile.subscribe(($currentFile) => {
		if (patternSelector == null) return;
		patternSelector.value = $currentFile.replace('.bin', '.gcode');
		handlePatternChange();
	});
</script>

<div class="flex flex-col items-center relative">
	<div class="flex gap-2 justify-center bg-neutral p-4 rounded-t-box w-full max-w-[490px]">
		<button class="btn" onclick={reset} aria-label="clear">
			<!-- <span class="hidden sm:block">Clear</span> -->
			<i class="fa-solid fa-eraser"></i>
		</button>
		<input
			id="gcode"
			type="file"
			accept=".gcode"
			class="hidden"
			onchange={(e) => handleFileChange(e)}
		/>
		<label for="gcode" class="btn">
			<span class="hidden sm:block">Upload</span>
			<i class="fa-solid fa-upload"></i>
		</label>
		<select
			bind:this={patternSelector}
			class="select select-bordered min-w-0 w-full bg-base-200 border-none"
			onchange={() => handlePatternChange()}
			onfocus={() => {
				patternSelector.selectedIndex = 0;
			}}
		>
			<option value="" disabled selected>Patterns</option>
			{#each patterns as pattern}
				<option value={pattern}>{pattern.replace('.gcode', '')}</option>
			{/each}
		</select>
		<button class="btn" onclick={() => previewPattern()} aria-label="preview">
			<i class="fa-solid fa-eye"></i>
		</button>
		{#if $sendingPattern}
			<button class="btn" aria-label="loading">
				<span class="loading loading-spinner"></span>
			</button>
		{:else}
			<button
				class="btn"
				onclick={() => sendPatternFragments(pointNums, patternName)}
				disabled={patternName == ''}
			>
				<span class="hidden sm:block">Send</span>
				<i class="fa-solid fa-paper-plane"></i>
			</button>
		{/if}
	</div>
	<canvas
		bind:this={canvas}
		onmousedown={startDrawing}
		onmousemove={(e) => draw(...getCanvasCoords(e))}
		onmouseup={stopDrawing}
		ontouchstart={startDrawing}
		ontouchmove={(e) => draw(...getCanvasCoords(e))}
		ontouchend={stopDrawing}
		width="490"
		height="490"
		class="touch-none bg-orange-100 max-w-[490px] w-full {preview ? 'pointer-events-none' : ''}"
	>
	</canvas>
</div>
