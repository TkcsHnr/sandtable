<script lang="ts">
	import { machineState, socketState } from './stores';

	type socketStates = { [code: number]: { name: string; color: string; icon: string } };
	const states: socketStates = {
		0: { name: 'CONNECTING', color: 'text-info', icon: 'fa-circle-info' },
		1: { name: 'OPEN', color: 'text-success', icon: 'fa-link' },
		2: { name: 'CLOSING', color: 'text-warning', icon: 'fa-triangle-exlamation' },
		3: { name: 'CLOSED', color: 'text-error', icon: 'fa-link-slash' }
	};
</script>

<div class="flex gap-2 flex-wrap justify-center">
	<div class="stats">
		<div class="stat">
			<div class="stat-title">Websocket State</div>
			<div class="stat-value {states[$socketState].color} flex items-center gap-2">
				{states[$socketState].name}
				<i class="fa-solid {states[$socketState].icon} text-xl"></i>
			</div>
		</div>
	</div>
	<div class="stats shadow">
		<div class="stat">
			<div class="stat-title"></div>
			<div class="stat-value {$machineState.homed ? 'text-success' : 'text-error'}">
				<i
					class="fa-solid {$machineState.homed ? 'fa-house-circle-check' : 'fa-house-circle-xmark'}"
				></i>
			</div>
		</div>
	</div>
	<div class="stats shadow">
		<div class="stat">
			<div class="stat-title">X position</div>
			<div class="stat-value">{$machineState.x}</div>
			<div class="stat-desc">mm</div>
		</div>
	</div>
	<div class="stats shadow">
		<div class="stat">
			<div class="stat-title">Y position</div>
			<div class="stat-value">{$machineState.y}</div>
			<div class="stat-desc">mm</div>
		</div>
	</div>
	<div class="stats shadow">
		<div class="stat">
			<div class="stat-title">Brightness</div>
			<div class="stat-value">
				{$machineState.led}%
			</div>
		</div>
	</div>
	<div class="stats shadow">
		<div class="stat">
			<div class="stat-title">Speed</div>
			<div class="stat-value">
				{$machineState.feedrate}
			</div>
			<div class="stat-desc">
				(mm/min)
			</div>
		</div>
	</div>
</div>

<style>
	.stats {
		border: 1px solid oklch(var(--bc) / 0.2);
	}
</style>
