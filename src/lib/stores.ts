import { writable } from 'svelte/store';

type MachineStats = {
	busy: boolean;
	executing: boolean;
	homing: boolean;
	yHomed: boolean;
	homed: boolean;
	safemode: boolean;
};
type Position = {
	x: number;
	y: number;
};
const defaultMachineStats: MachineStats = {
	busy: false,
	executing: false,
	homing: false,
	yHomed: false,
	homed: false,
	safemode: true
};

export const prevPosition = writable<Position>({ x: 0, y: 0 });
export const position = writable<Position>({ x: 0, y: 0 });
export const feedrate = writable<number>(2000);
export const led = writable<number>(0);
export const fan = writable<number>(0);
export const machinePatterns = writable<string[]>([]);
export const socketState = writable<number>(3);
export const espConnected = writable<boolean>(false);
export const machineStats = writable<MachineStats>(defaultMachineStats);
export const sendingPattern = writable<boolean>(false);
export const currentFile = writable<string>('');
export const logEnabled = writable<boolean>(true);
