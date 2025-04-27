import {
	espConnected,
	machinePatterns,
	machineStats,
	socketState,
	sendingPattern,
	currentFile,
	position,
	feedrate,
	led,
	fan
} from './stores';

enum BoolMask {
	BUSY = 0x80,
	EXECUTING = 0x40,
	HOMING = 0x20,
	YHOMED = 0x10,
	HOMED = 0x08,
	SAFEMODE = 0x04,
	LOG_ENABLED = 0x02
}

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
	WSCmdType_DELETE_FILE = 0x11,
	WSCmdType_LOG_LEVEL = 0x12,
	WSCmdType_POSITION = 0x13,
	WSCmdType_CURRENT_FILE = 0x14
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

	let decoder: TextDecoder;
	let charArray: Uint8Array;
	switch (cmdByte as WSCmdType_t) {
		case WSCmdType_t.WSCmdType_ACK:
			ackResolve();
			break;
		case WSCmdType_t.WSCmdType_POSITION:
			position.set({
				x: dataView.getUint16(1) / 100.0,
				y: dataView.getUint16(3) / 100.0
			});
			break;
		case WSCmdType_t.WSCmdType_STAT:
			let bools = dataView.getUint8(1);
			position.set({
				x: dataView.getUint16(2) / 100.0,
				y: dataView.getUint16(4) / 100.0
			});
			feedrate.set(dataView.getUint16(6));
			led.set(dataView.getUint8(8));
			fan.set(dataView.getUint8(9));
			machineStats.set({
				busy: Boolean(bools & BoolMask.BUSY),
				executing: Boolean(bools & BoolMask.EXECUTING),
				homing: Boolean(bools & BoolMask.HOMING),
				yHomed: Boolean(bools & BoolMask.YHOMED),
				homed: Boolean(bools & BoolMask.HOMED),
				safemode: Boolean(bools & BoolMask.SAFEMODE)
			});
			break;
		case WSCmdType_t.WSCmdType_FILE_NAMES:
			const fileCount = dataView.getUint8(1);
			charArray = new Uint8Array(dataView.buffer);
			let fileNames: string[] = [];
			if (fileCount > 0) {
				decoder = new TextDecoder('utf-8');
				fileNames = decoder.decode(charArray.slice(2, charArray.length - 1)).split(',');
			}
			machinePatterns.set(fileNames);
			break;
		case WSCmdType_t.WSCmdType_CURRENT_FILE:
			charArray = new Uint8Array(dataView.buffer);
			decoder = new TextDecoder('utf-8');
			currentFile.set(decoder.decode(charArray.slice(1, charArray.length - 1)));
			break;
		case WSCmdType_t.WSCmdType_ESP_STATE:
			espConnected.set(dataView.getUint8(1) > 0);
			break;
	}
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let reconnecting = false;
async function reconnect(websocket_password: string) {
	if (reconnecting) return;
	reconnecting = true;
	while (!ws || ws.readyState != WebSocket.OPEN) {
		console.log('reconnecting to websocket');
		openSocket(websocket_password);
		await sleep(5000);
	}
	reconnecting = false;
}

export function openSocket(websocket_password: string) {
	ws = new WebSocket('wss://sandtable-websocket.onrender.com', ['webapp', websocket_password]);
	ws.binaryType = 'arraybuffer';
	socketState.set(ws.readyState);

	ws.onopen = () => {
		socketState.set(ws.readyState);
		console.log('Connected: Requesting stats and files');
		sendStatRequest();
		sendFilenamesRequest();
		sendCurrentFileRequest();
	};

	ws.onmessage = (message) => {
		handleBinaryMessage(message.data);
	};

	ws.onerror = (error) => {
		console.error('WebSocket Error:', error);
		socketState.set(ws.readyState);
		reconnect(websocket_password);
	};

	ws.onclose = ({ code, reason }) => {
		console.error(`Disconnected (Code: ${code}, Reason: ${reason.toString()})`);
		socketState.set(ws.readyState);
		reconnect(websocket_password);
	};
}

export function closeSocket() {
	if (ws) {
		ws.close();
		socketState.set(ws.readyState);
	}
}

export function sendFanValue(value: number) {
	console.log('sending fan value');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_FAN, value]));
}

export function sendLedValue(value: number) {
	console.log('sending led value');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_LED, value]));
}

export function sendStart(pattern: string) {
	console.log('sending start command');
	const charArray = new TextEncoder().encode(pattern);
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_START, ...charArray, 0x00]));
}

export function sendPause() {
	console.log('sending pause command');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_PAUSE]));
}

export function sendResume() {
	console.log('sending resume command');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_RESUME]));
}

export function sendStop() {
	console.log('sending stop command');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_STOP]));
}

export function sendHome() {
	console.log('sending home command');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_HOME]));
}
export function sendMove(dx: number, dy: number) {
	console.log('sending move command');
	let view = new DataView(new ArrayBuffer(3));
	view.setUint8(0, WSCmdType_t.WSCmdType_MOVE);
	view.setInt8(1, dx);
	view.setInt8(2, dy);
	ws.send(new Uint8Array(view.buffer));
}

export function sendSafemode(safemode: boolean) {
	console.log('sending safemode');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_SAFEMODE, safemode ? 1 : 0]));
}

export function sendStatRequest() {
	console.log('requesting stats');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_STAT]));
}

export function sendCurrentFileRequest() {
	console.log('requesting current file');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_CURRENT_FILE]));
}

export function sendFilenamesRequest() {
	console.log('requesting file names');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_FILE_NAMES]));
}

export function sendDeletePattern(pattern: string) {
	console.log('requesting file deletion');
	const charArray = new TextEncoder().encode(pattern);
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_DELETE_FILE, ...charArray, 0x00]));
}

export function sendFeedrateValue(value: number) {
	console.log('sending feedrate value');
	let view = new DataView(new ArrayBuffer(3));
	view.setUint8(0, WSCmdType_t.WSCmdType_FEEDRATE);
	view.setUint16(1, value);
	ws.send(new Uint8Array(view.buffer));
}

function scaleNum(num: number) {
	return Math.round(num * 100) & 0xffff;
}

async function sendPacket(offset: number, nums: number, pointNums: number[]) {
	let dataView = new DataView(new ArrayBuffer(1 + 2 * nums)); // 1byte command + 2byte numbers
	dataView.setUint8(0, WSCmdType_t.WSCmdType_GCODE);
	for (let i = 0; i < nums; i++) {
		dataView.setUint16(1 + i * 2, scaleNum(pointNums[offset + i]));
	}
	ws.send(dataView.buffer);
	await waitForAck();
	console.log(dataView.buffer.byteLength, 'bytes sent');
}

export async function sendPatternFragments(
	pointNums: number[],
	name = 'pattern',
	coordinatePairs: number = 512
) {
	if (ws.readyState != ws.OPEN) return;
	sendingPattern.set(true);

	const filePath = name.replace('.gcode', '') + '.bin';
	const charArray = new TextEncoder().encode(filePath);

	let dataView = new DataView(new ArrayBuffer(5));
	dataView.setUint8(0, WSCmdType_t.WSCmdType_GCODE_START);
	dataView.setUint32(1, pointNums.length * 2);
	ws.send(new Uint8Array([...new Uint8Array(dataView.buffer), ...charArray, 0x00]));
	await waitForAck();

	let nums = coordinatePairs * 2;
	let offset = 0;
	while (offset <= pointNums.length - nums) {
		await sendPacket(offset, nums, pointNums);
		offset += nums;
	}
	if (offset < pointNums.length) {
		let len = pointNums.length - offset;
		await sendPacket(offset, len, pointNums);
	}

	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_GCODE_FIN]));
	await waitForAck();
	sendingPattern.set(false);
}

export function sendLogLevel(level: boolean) {
	console.log('sending log level');
	ws.send(new Uint8Array([WSCmdType_t.WSCmdType_LOG_LEVEL, level ? 1 : 0]));
}
