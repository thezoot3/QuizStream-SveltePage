import { writable, type Writable } from 'svelte/store';
import type {
	MqttStatePayload,
	MqttQuizCurrentPayload,
	MqttMyScorePayload,
	MqttQuizResultPayload,
	MqttQuizControlPayload
} from './mqtt_types'; // mqtt_types에서 필요한 타입 임포트

// --- MQTT 관련 스토어 (메모리 기반) ---

/**
 * 퀴즈의 전반적인 상태 (idle, running, ended) 및 현재 퀴즈 인덱스를 나타냅니다.
 * 초기 상태는 'idle'입니다.
 * @type {Writable<MqttStatePayload>}
 */
export const appState = writable<MqttStatePayload>({ status: 'idle' });

/**
 * 현재 진행 중인 퀴즈의 상세 정보를 담습니다. (문제 ID, 타입, 질문, 옵션, 점수 등)
 * 퀴즈가 진행 중이 아닐 때는 null이 될 수 있습니다.
 * @type {Writable<MqttQuizCurrentPayload | null>}
 */
export const currentQuiz = writable<MqttQuizCurrentPayload | null>(null);

/**
 * 퀴즈에 대한 입력 제어 상태 (LOCK/UNLOCK)를 담습니다.
 * @type {Writable<MqttQuizControlPayload | null>}
 */
export const quizControl = writable<MqttQuizControlPayload | null>(null);

/**
 * 클라이언트 자신의 누적 점수 및 이번 문제에서 획득한 점수를 담습니다.
 * 초기 점수는 0점으로 설정됩니다.
 * @type {Writable<MqttMyScorePayload>}
 */
export const myScore = writable<MqttMyScorePayload>({ score: 0, quizScore: 0 });

/**
 * 개별 퀴즈 문제에 대한 피드백 결과 (정답 여부, 정답 텍스트, 획득 점수 등)를 담습니다.
 * 퀴즈 결과가 없을 때는 null이 될 수 있습니다.
 * @type {Writable<MqttQuizResultPayload | null>}
 */
export const quizResult = writable<MqttQuizResultPayload | null>(null);

/**
 * 현재 퀴즈에 대한 정답 제출 여부를 나타냅니다.
 * @type {Writable<boolean>}
 */
export const isAnswerSubmitted = writable<boolean>(false);

export interface userState {
	setId: string;
	userId: string;
	nickname: string;
	joined: boolean;
}

export const userState = writable<userState | null>(null);
