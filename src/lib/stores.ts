import { writable } from "svelte/store";


type MachineStats = {
    x: number,
    y: number,
    feedrate: number,
    homed: boolean,
    state: MachineState
    led: number,
    fan: number,
    safemode: boolean,
}
export enum MachineState {
	IDLE = 0x01,
	PAUSED = 0x02,
	BUSY = 0x03,
    HOMING = 0x04
}
const defaultMachineStats: MachineStats = {
    homed: false, x: 128, y: 420.5, state: MachineState.IDLE, led: 255, feedrate: 1000, fan: 0, safemode: true
}

export const machinePatterns = writable<string[]>([]);
export const socketState = writable<number>(3);
export const espConnected = writable<number>(1);
export const machineStats = writable<MachineStats>(defaultMachineStats);
