import { socketState } from './stores';

export enum WSCmdType_t {
	WSCmdType_ACK = 0x00, // Acknowledgement
	WSCmdType_HOME = 0x01, // Home command
	WSCmdType_MOVE = 0x02, // Move command
	WSCmdType_STOP = 0x03, // Stop command
	WSCmdType_PAUSE = 0x04, // Pause command
	WSCmdType_RESUME = 0x05, // Resume command
	WSCmdType_LED = 0x06, // LED control command
	WSCmdType_FEEDRATE = 0x07, // Feedrate adjustment command
	WSCmdType_GCODE_START = 0x08, // Start G-code command
	WSCmdType_GCODE = 0x09, // G-code command
	WSCmdType_GCODE_FIN = 0x0a, // End G-code command
	WSCmdType_FAN = 0x0b // Fan speed
}

export let ws: WebSocket;

let ackResolve: () => void;
export async function waitForAck() {
	return new Promise<void>((resolve) => {
		ackResolve = resolve;
	});
}
function handleBinaryMessage(data: any) {
	const dataView = new DataView(data);
	if (dataView.byteLength == 0) return;

	const cmdByte = dataView.getUint8(0);

	switch (cmdByte as WSCmdType_t) {
		case WSCmdType_t.WSCmdType_ACK:
			ackResolve();
			break;
	}

	for (let i = 0; i < dataView.byteLength; i++) {
		const byte = dataView.getUint8(i); // Read 1 byte at a time
		console.log(`Byte ${i}: ${byte}`);
	}
}

export function openSocket() {
	ws = new WebSocket('wss://sandtable-websocket.onrender.com', 'webapp');
	ws.binaryType = 'arraybuffer';
	socketState.set(ws.readyState);

	ws.onopen = () => {
		console.log('Connected to the server');
		socketState.set(ws.readyState);
	};

	ws.onmessage = (message) => {
		console.log('Message received');
		handleBinaryMessage(message.data);
	};

	ws.onerror = (error) => {
		console.error('WebSocket Error:', error);
		socketState.set(ws.readyState);
	};

	ws.onclose = ({ code, reason }) => {
		console.error(`Disconnected (Code: ${code}, Reason: ${reason.toString()})`);
		socketState.set(ws.readyState);
	};
}

export function closeSocket() {
	if (ws) {
		ws.close();
		socketState.set(ws.readyState);
	}
}

export function sendTextMessage(...args: any[]) {
	const message = args.join(' ');
	if (ws.readyState == ws.OPEN && message) {
		ws.send(message);
	}
}
