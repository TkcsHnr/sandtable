<script lang="ts">
	import { onMount } from 'svelte';
	import { sendMessage } from './websocket';

	type point = { x: number; y: number };
	let points: point[] = [];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let drawing = false;

	export function clear() {
		points = [];
		ctx?.clearRect(0, 0, canvas.width, canvas.height);
	}

	export function getPoints() {
		return points;
	}

	function startDrawing(x: number, y: number) {
		drawing = true;
		draw(x, y);
		points.push({ x, y });
	}

	function draw(x: number, y: number) {
		if (!ctx) return;
		if (!drawing) return;
		if (points.length == 0) {
			ctx.moveTo(x, y);
			ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
			ctx.fill();
			return;
		}

		ctx.beginPath();
		ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
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

	onMount(() => {
		ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.lineWidth = 5;
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			ctx.strokeStyle = getComputedStyle(document.documentElement)
				.getPropertyValue('--canvas-stroke')
				.trim();
			ctx.fillStyle = ctx.strokeStyle;
		}
	});
</script>

<div class="flex flex-col gap-2 items-end">
	<div class="flex gap-2">
		<button class="btn" onclick={clear}>
			Clear
			<i class="fa-solid fa-eraser"></i>
		</button>
		<button class="btn" onclick={() => sendMessage("draw", points)}>
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
		class="touch-none bg-base-300"
	></canvas>
</div>

<style>
	:root {
		--canvas-stroke: oklch(var(--bc));
	}
</style>
