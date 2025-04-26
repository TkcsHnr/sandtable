import { writable } from 'svelte/store';

type MachineStats = {
	x: number;
	y: number;
	feedrate: number;
	led: number;
	fan: number;
	busy: boolean;
	executing: boolean;
	homing: boolean;
	yHomed: boolean;
	homed: boolean;
	safemode: boolean;
};
const defaultMachineStats: MachineStats = {
	x: 0,
	y: 0,
	feedrate: 1600,
	led: 0,
	fan: 0,
	busy: false,
	executing: false,
	homing: false,
	yHomed: false,
	homed: false,
	safemode: true,
};

export const machinePatterns = writable<string[]>([]);
export const socketState = writable<number>(3);
export const espConnected = writable<boolean>(false);
export const machineStats = writable<MachineStats>(defaultMachineStats);
export const sendingPattern = writable<boolean>(false);
export const currentFile = writable<string>("");
export const logEnabled = writable<boolean>(true);
