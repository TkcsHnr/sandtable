import { writable } from "svelte/store";

type MachineState = {
    homed: boolean,
    x: number,
    y: number,
    busy: boolean,
    led: number
}
const defaultMachineState: MachineState = {
    homed: false, x: 128, y: 420.5, busy: false, led: 70
}

export const socketState = writable<number>(3);
export const machineState = writable<MachineState>(defaultMachineState);
