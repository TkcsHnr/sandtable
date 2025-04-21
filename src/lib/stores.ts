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
    homed: false, x: 0, y: 0, state: MachineState.IDLE, led: 255, feedrate: 1000, fan: 0, safemode: true
}

export const machinePatterns = writable<string[]>([]);
export const socketState = writable<number>(3);
export const espConnected = writable<boolean>(false);
export const machineStats = writable<MachineStats>(defaultMachineStats);
export const sendingPattern = writable<boolean>(false);