<script lang="ts">
	import { espConnected, MachineState, machineStats, socketState } from './stores';

	type socketStates = { [code: number]: { name: string; color: string; icon: string } };
	const states: socketStates = {
		0: { name: 'CONNECTING', color: 'text-info', icon: 'fa-circle-info' },
		1: { name: 'OPEN', color: 'text-success', icon: 'fa-link' },
		2: { name: 'CLOSING', color: 'text-warning', icon: 'fa-triangle-exlamation' },
		3: { name: 'CLOSED', color: 'text-error', icon: 'fa-link-slash' }
	};
	const espStates: socketStates = {
		0: { name: 'NO', color: 'text-error', icon: 'fa-link-slash' },
		1: { name: 'YES', color: 'text-success', icon: 'fa-link' }
	};
	const machineStates: { [state: number]: string } = {};
	machineStates[MachineState.BUSY] = 'Busy';
	machineStates[MachineState.IDLE] = 'Idle';
	machineStates[MachineState.HOMING] = 'Homing';
	machineStates[MachineState.PAUSED] = 'Paused';
</script>

<div class="flex gap-2 flex-wrap justify-center">
	<div class="stats">
		<div class="stat">
			<div class="stat-title">Websocket</div>
			<div class="stat-value {states[$socketState].color} flex items-center gap-2">
				{states[$socketState].name}
				<i class="fa-solid {states[$socketState].icon} text-xl"></i>
			</div>
		</div>
	</div>
	<div class="stats">
		<div class="stat">
			<div class="stat-title">ESP32</div>
			<div class="stat-value {espStates[$espConnected].color} flex items-center gap-2">
				{espStates[$espConnected].name}
				<i class="fa-solid {espStates[$espConnected].icon}"></i>
			</div>
		</div>
	</div>
	<div class="stats shadow">
		<div class="stat">
			<div class="stat-title">X position</div>
			<div class="stat-value">{Math.round($machineStats.x)}</div>
			<div class="stat-desc">mm</div>
		</div>
	</div>
	<div class="stats shadow">
		<div class="stat">
			<div class="stat-title">Y position</div>
			<div class="stat-value">{Math.round($machineStats.y)}</div>
			<div class="stat-desc">mm</div>
		</div>
	</div>
	<div class="stats shadow">
		<div class="stat">
			<div class="stat-title">State</div>
			<div class="stat-value">
				{machineStates[$machineStats.state].toString()}
			</div>
		</div>
	</div>
</div>

<style>
	.stats {
		border: 1px solid oklch(var(--bc) / 0.2);
	}
</style>
