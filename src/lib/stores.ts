import { writable } from "svelte/store";

type MachineState = {
    homed: boolean,
    x: number,
    y: number,
    state: "idle"|"busy"|"paused"
    led: number,
    feedrate: number
}
const defaultMachineState: MachineState = {
    homed: false, x: 128, y: 420.5, state: "idle", led: 70, feedrate: 1000
}

export const socketState = writable<number>(3);
export const machineState = writable<MachineState>(defaultMachineState);
