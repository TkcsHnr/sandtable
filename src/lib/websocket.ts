import { socketState } from "./stores";

export let ws: WebSocket;
type MessageCallback= (message: any) => any;
let messageCallback: MessageCallback|undefined;

export function openSocket() {
	ws = new WebSocket('wss://sandtable-websocket.onrender.com', 'webapp');
	socketState.set(ws.readyState);

	ws.onopen = () => {
		console.log('Connected to the server');
		socketState.set(ws.readyState);
	};

	ws.onmessage = (message) => {
		console.log('Message received');
        if(messageCallback) {
            messageCallback(message.data);
        }
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

export function setMessageCallback(func: MessageCallback) {
    messageCallback = func;
}

export function connected() {
    return ws.readyState == ws.OPEN;
}

export function sendMessage(type: string, ...args: any) {
    if(connected()) {
        ws.send(JSON.stringify({
            type,
            args
        }));
        return true;
    } else {
        return false;
    }
}

export function closeSocket() {
	if (ws) {
		ws.close();
		socketState.set(ws.readyState);
	}
}


