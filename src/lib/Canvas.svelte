<script lang="ts">
	import { onMount } from 'svelte';
	import colors from 'tailwindcss/colors';
	import { sendPatternFragments } from './websocket';
	import { currentFile, machineStats, position, prevPosition, sendingPattern } from './stores';
	const { amber, orange, yellow } = colors;

	export let patterns: string[];

	let pointNums: number[] = [];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let drawing = false;
	let preview = false;

	export function clear() {
		if (!ctx) return;
		preview = false;
		drawing = false;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	let patternName = 'pattern';
	function reset() {
		clear();
		patternSelector.selectedIndex = 0;
		patternName = 'pattern';
	}

	export function getpointNums() {
		return pointNums;
	}

	async function preciseMessageDelay(iterations: number) {
		for (let i = 0; i < iterations; i++) {
			await new Promise((resolve) => {
				const mc = new MessageChannel();
				mc.port1.onmessage = resolve;
				mc.port2.postMessage(null);
			});
		}
	}

	async function drawPoints(points: number[], delay = 0) {
		if (!ctx || points.length < 4) return;

		clear();
		preview = true;
		for (let i = 0; i < points.length - 2; i += 2) {
			draw(points[i], points[i + 1], points[i + 2], points[i + 3]);
			if (delay > 0) await preciseMessageDelay(delay);
			if (!preview) {
				return;
			}
		}
		preview = false;
	}

	function draw(x1: number, y1: number, x2: number, y2: number, stroke: string = orange[300], fill: string = orange[200]) {
		if (!ctx) return;

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);

		ctx.strokeStyle = stroke;
		ctx.lineWidth = 10;
		ctx.stroke();

		ctx.strokeStyle = fill;
		ctx.lineWidth = 9;
		ctx.stroke();

		ctx.closePath();
	}

	function manualDraw(x: number, y: number) {
		if (!drawing) return;

		if (pointNums.length == 0) {
			draw(x, y, x, y);
		} else {
			draw(pointNums[pointNums.length - 2], pointNums[pointNums.length - 1], x, y);
		}
		pointNums.push(x, y);
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

	async function parseGcode(lines: string[]) {
		let nums: number[] = [];
		let x: number = 0;
		let y: number = 0;
		for (let line of lines) {
			line.trim();
			if (line.startsWith(';') || line == '') continue;

			const tokens = tokenizeGCodeLine(line);
			if ('G' in tokens && tokens['G'] == 1) {
				if ('X' in tokens) x = parseFloat(tokens['X'].toString());
				if ('Y' in tokens) y = parseFloat(tokens['Y'].toString());

				nums.push(x, y);
			}
		}
		return nums;
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
				pointNums = await parseGcode(lines);
				drawPoints(pointNums);
			}
		} catch (error) {
			console.error("Couldn't fetch pattern from files.");
		}
	}

	function handleFileChange(event: any) {
		const selectedFile = event.target.files[0];
		if (!selectedFile) return;

		const reader = new FileReader();
		reader.onloadend = async () => {
			if (reader.result) {
				lines = reader.result.toString().split('\n');
				pointNums = await parseGcode(lines);
				drawPoints(pointNums);
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
			ctx.globalAlpha = 0.9;
			ctx.translate(0, canvas.height);
			ctx.scale(1, -1);
		}
	});

	position.subscribe(($position) => {
		if (!ctx) return;
		if ($machineStats.homing || !$machineStats.executing) return;

		draw($prevPosition.x, $prevPosition.y, $position.x, $position.y, orange[400], orange[300]);

		ctx.beginPath();
		ctx.arc($position.x, $position.y, 4, 0, 2 * Math.PI, true);
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.closePath();
	});

	currentFile.subscribe(($currentFile) => {
		if (patternSelector == null) return;
		patternSelector.value = $currentFile.replace('.bin', '.gcode');
		handlePatternChange();
	});
	
	function startManualDraw() {
		if(preview) return;
		drawing = true;
	}
	function stopManualDraw() {
		drawing = false;
	}
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
		<button class="btn" onclick={() => drawPoints(pointNums, 1)} aria-label="preview">
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
		onmousedown={startManualDraw}
		onmousemove={(e) => manualDraw(...getCanvasCoords(e))}
		onmouseup={stopManualDraw}
		ontouchstart={startManualDraw}
		ontouchmove={(e) => manualDraw(...getCanvasCoords(e))}
		ontouchend={stopManualDraw}
		width="490"
		height="490"
		class="touch-none bg-orange-100 max-w-[490px] w-full {preview ? 'pointer-events-none' : ''}"
	>
	</canvas>
</div>
