import { writable } from "svelte/store";

type MachineState = {
    homed: boolean,
    x: number,
    y: number,
    state: "idle"|"busy"|"paused"
    led: number,
    feedrate: number,
    fan: number
}
const defaultMachineState: MachineState = {
    homed: false, x: 128, y: 420.5, state: "idle", led: 255, feedrate: 1000, fan: 0
}

export const socketState = writable<number>(3);
export const machineState = writable<MachineState>(defaultMachineState);
