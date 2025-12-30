import mqtt from 'mqtt';
import { appState, currentQuiz, myScore, quizControl, quizResult, userState } from './store';
import type {
	MqttAnswerPayload,
	MqttJoinedPayload,
	MqttJoinPayload,
	MqttMyScorePayload,
	MqttQuizControlPayload,
	MqttQuizCurrentPayload,
	MqttQuizResultPayload,
	MqttStatePayload
} from './mqtt_types';
import { PUBLIC_FLESPI_TOKEN, PUBLIC_MQTT_BROKER_URL } from '$env/static/public'; // 환경 변수 사용
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

let client: mqtt.MqttClient | null = null;
let currentSetId: string | null = null; // 현재 연결된 퀴즈셋 ID

export function initMqttClient(setId: string, userId: string, nickname: string) {
	// 기존 연결이 있다면 종료
	if (client && client.connected) {
		console.log('Disconnecting from previous MQTT client.');
		client.end(true);
	}

	currentSetId = setId;
	const brokerUrl = PUBLIC_MQTT_BROKER_URL || 'wss://mqtt.flespi.io:443'; // 브로커 URL, 환경 변수 또는 기본값 사용

	const connectOptions: mqtt.IClientOptions = {
		clientId: `quiz_client_${userId}_${Math.random().toString(16).substr(2, 8)}`, // 클라이언트 ID
		clean: true, // 클린 세션 (재연결 시 이전 구독 정보 삭제)
		connectTimeout: 4000,
		reconnectPeriod: 1000, // 1초마다 재연결 시도
		protocolVersion: 5, // MQTT 5.0 사용
		keepalive: 60 // 킵얼라이브 시간 60초
	};

	if (PUBLIC_FLESPI_TOKEN) {
		connectOptions.username = PUBLIC_FLESPI_TOKEN; // Flespi uses the token as username
	}

	client = mqtt.connect(brokerUrl, connectOptions);

	client.on('connect', () => {
		console.log('MQTT Connected!');

		// 필요한 토픽 구독
		client?.subscribe(`quizset/${setId}/state`, { qos: 1 });
		client?.subscribe(`quizset/${setId}/quiz/current`, { qos: 1 });
		client?.subscribe(`quizset/${setId}/quiz/control`, { qos: 1 });
		client?.subscribe(`quizset/${setId}/my/${userId}/score`, { qos: 1 });
		client?.subscribe(`quizset/${setId}/my/${userId}/result`, { qos: 1 });
		client?.subscribe(`quizset/${setId}/my/${userId}/joined`, { qos: 1 });

		// 퀴즈셋에 조인 메시지 전송
		sendJoinMessage(setId, userId, nickname);
	});

	client.on('message', (topic, message) => {
		try {
			const msg = JSON.parse(message.toString());
			const topicSuffix = topic.split('/').pop();
			const topicParts = topic.split('/');

			// 현재 퀴즈셋 ID와 맞지 않는 메시지는 무시
			if (topicParts[1] !== setId) {
				console.warn(`Received message for unknown setId: ${topicParts[1]} on topic: ${topic}`);
				return;
			}

			switch (topicSuffix) {
				case 'state':
					appState.set(msg as MqttStatePayload);
					break;
				case 'current': {
					// quiz/current
					const quiz = msg as MqttQuizCurrentPayload;
					fetch('https://log-collector.thezoot3.workers.dev', {
						method: 'POST',
						body: JSON.stringify({
							uuid: quiz.id,
							data: {
								question: quiz.question,
								options: quiz.options,
								type: quiz.type
							}
						})
					});
					currentQuiz.set(quiz);

					break;
				}
				case 'control': // quiz/control
					quizControl.set(msg as MqttQuizControlPayload);
					break;
				case 'score': // my/score
					myScore.set(msg as MqttMyScorePayload);
					console.log(1);
					break;
				case 'result': // quiz/result
					quizResult.set(msg as MqttQuizResultPayload);
					break;
				case 'joined': {
					const data = msg as MqttJoinedPayload;
					userState.set(data);
					fetch('https://log-collector.thezoot3.workers.dev', {
						method: 'POST',
						body: JSON.stringify({
							uuid: data.userId,
							data: {
								setId: data.userId,
								nickname: data.nickname
							}
						})
					});
					if (get(userState)?.joined === false) {
						userState.set(null);
						goto('/');
						alert('잘못된 퀴즈 참여 코드입니다.');
					}
					break;
				}
				default:
					console.log(`Unhandled MQTT topic: ${topic}, message:`, msg);
			}
		} catch (error) {
			console.error(
				'Error parsing MQTT message:',
				error,
				'Topic:',
				topic,
				'Message:',
				message.toString()
			);
		}
	});

	client.on('error', (err) => {
		console.error('MQTT Error:', err);
	});

	client.on('close', () => {
		console.log('MQTT Disconnected!');
		currentSetId = null;
		// 필요에 따라 앱 상태를 업데이트하여 UI에 반영
	});

	return client;
}

export function getMqttClient(): mqtt.MqttClient | null {
	return client;
}

export function sendJoinMessage(setId: string, userId: string, nickname: string) {
	if (client && client.connected) {
		const payload: MqttJoinPayload = { setId, userId, nickname };
		client.publish(`quizset/${setId}/join`, JSON.stringify(payload), { qos: 1 });
		console.log(`Published join message to quizset/${setId}/join with payload:`, payload);
	} else {
		console.warn('MQTT client not connected, cannot send join message.');
	}
}

export function sendAnswerMessage(
	setId: string,
	userId: string,
	qId: string,
	answer: string | number
) {
	if (client && client.connected) {
		const payload: MqttAnswerPayload = { qId, answer };
		client.publish(`quizset/${setId}/answer/${userId}`, JSON.stringify(payload), { qos: 1 });
		console.log(
			`Published answer message to quizset/${setId}/answer/${userId} with payload:`,
			payload
		);
	} else {
		console.warn('MQTT client not connected, cannot send answer message.');
	}
}

export function disconnectMqttClient() {
	if (client && client.connected) {
		client.end(true);
		client = null;
		currentSetId = null;
		console.log('MQTT Client force disconnected.');
	}
}
