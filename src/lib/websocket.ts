import { espConnected, machinePatterns, MachineState, machineStats, socketState, sendingPattern } from './stores';

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
	WSCmdType_FAN = 0x0b, // Fan speed
	WSCmdType_STAT = 0x0c, // Statisctics request/data
	WSCmdType_START = 0x0d, // Start command
	WSCmdType_FILE_NAMES = 0x0e, // Uploaded pattern files
	WSCmdType_ESP_STATE = 0x0f,
	WSCmdType_SAFEMODE = 0x10,
	WSCmdType_DELETE_FILE = 0x11
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
		case WSCmdType_t.WSCmdType_STAT:
			console.log('Stats received');
			machineStats.set({
				x: dataView.getUint16(1) / 100.0,
				y: dataView.getUint16(3) / 100.0,
				feedrate: dataView.getUint16(5),
				homed: dataView.getUint8(7) != 0,
				state: dataView.getUint8(8) as MachineState,
				led: dataView.getUint8(9),
				fan: dataView.getUint8(10),
				safemode: dataView.getUint8(11) != 0
			});
			break;
		case WSCmdType_t.WSCmdType_FILE_NAMES:
			const charArray = new Uint8Array(dataView.buffer);
			const fileNames = String.fromCharCode(...charArray.slice(1))
				.split(',')
				.filter((f) => f !== '');
			machinePatterns.set(fileNames);
			break;
		case WSCmdType_t.WSCmdType_ESP_STATE:
			espConnected.set(dataView.getUint8(1) > 0);
			break;
	}
}

export function openSocket(websocket_password: string) {
	ws = new WebSocket('wss://sandtable-websocket.onrender.com', ['webapp', websocket_password]);
	ws.binaryType = 'arraybuffer';
	socketState.set(ws.readyState);

	ws.onopen = () => {
		socketState.set(ws.readyState);
		console.log('Connected: Requesting machine stats');
		sendStatRequest();
	};

	ws.onmessage = (message) => {
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

export function sendFanValue(value: number) {
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_FAN, value]));
}

export function sendLedValue(value: number) {
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_LED, value]));
}

export function sendStart(pattern: string) {
	const charArray = new TextEncoder().encode(pattern);
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_START, ...charArray, 0x00]));
}

export function sendPause() {
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_PAUSE]));
}

export function sendResume() {
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_RESUME]));
}

export function sendStop() {
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_STOP]));
}

export function sendHome() {
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_HOME]));
}
export function sendMove(dx: number, dy: number) {
	let view = new DataView(new ArrayBuffer(3));
	view.setUint8(0, WSCmdType_t.WSCmdType_MOVE);
	view.setInt8(1, dx);
	view.setInt8(2, dy);
	ws.send(new Uint8Array(view.buffer));
}

export function sendSafemode(safemode: boolean) {
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_SAFEMODE, safemode ? 1 : 0]));
}

export function sendStatRequest() {
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_STAT]));
}

export function sendDeletePattern(pattern: string) {
	const charArray = new TextEncoder().encode(pattern);
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_DELETE_FILE, ...charArray, 0x00]));
}

export function sendFeedrateValue(value: number) {
	let view = new DataView(new ArrayBuffer(3));
	view.setUint8(0, WSCmdType_t.WSCmdType_FEEDRATE);
	view.setUint16(1, value);
	ws.send(new Uint8Array(view.buffer));
}

function scaleNum(num: number) {
	return Math.round(num * 100);
}

export async function sendPatternFragments(
	pointNums: number[],
	name = 'pattern',
	coordinatePairs: number = 512
) {
	if (ws.readyState != ws.OPEN) return;
	sendingPattern.set(true);

	const filePath = '/' + name.replace('.gcode', '') + '.bin';
	console.log(filePath);
	const charArray = new TextEncoder().encode(filePath);

	let dataView = new DataView(new ArrayBuffer(5));
	dataView.setUint8(0, WSCmdType_t.WSCmdType_GCODE_START);
	dataView.setUint32(1, pointNums.length * 2);

	ws.send(new Uint8Array([...new Uint8Array(dataView.buffer), ...charArray, 0x00]));
	await waitForAck();

	let nums = coordinatePairs * 2;
	dataView = new DataView(new ArrayBuffer(1 + 2 * nums)); // 1byte command + 2byte numbers
	let offset = 0;
	dataView.setUint8(0, WSCmdType_t.WSCmdType_GCODE);

	while (offset <= pointNums.length - nums) {
		for (let i = 0; i < nums; i++) {
			dataView.setUint16(1 + i * 2, scaleNum(pointNums[offset + i]));
		}
		ws.send(dataView.buffer);
		await waitForAck();

		offset += nums;
		console.log('packet sent');
	}
	if (offset < pointNums.length) {
		let len = pointNums.length - offset;
		for (let i = 0; i < len; i++) {
			dataView.setUint16(1 + i * 2, scaleNum(pointNums[offset + i]));
		}
		let sliced = dataView.buffer.slice(0, len * 2);
		ws.send(sliced);
		await waitForAck();
		console.log('last packet sent');
	}
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_GCODE_FIN]));
	await waitForAck();
	sendingPattern.set(false);
}
