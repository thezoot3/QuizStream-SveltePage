import { connect, io } from 'socket.io-client';

export function initClientWebsocket() {
	return io('wss://quizalt.seda.club/quizClient', {
		path: '/api/socket.io', // api 경로 뒤의 socket.io 경로
		transports: ['websocket']
	});
}

export function initHostWebsocket() {
	return io('wss://quizalt.seda.club/quizHost', {
		path: '/api/socket.io',
		transports: ['websocket']
	});
}

export function initVideoPlayerWebsocket() {
	return io('wss://quizalt.seda.club/quizVideoPlayer', {
		path: '/api/socket.io',
		transports: ['websocket']
	});
}

export interface WsJoinedEvent {
	userId: string;
}

export interface WsCueQuestionEvent {
	quizId: string;
}

export interface WsBroadcastTimeLeft {
	timeLeft: number;
}

export interface WsAnswerData {
	quizId: string;
	answer: number;
}
