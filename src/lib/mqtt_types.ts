export interface MqttJoinPayload {
	setId: string;
	userId: string;
	nickname: string;
}

export interface MqttJoinedPayload {
	setId: string;
	userId: string;
	nickname: string;
	joined: boolean;
}

export interface MqttAnswerPayload {
	qId: string;
	answer: string | number;
}

export type MqttStateStatus = 'idle' | 'running' | 'ended';

export interface MqttStatePayload {
	status: MqttStateStatus;
	currentQuizIndex?: number;
}

export type MqttQuizType = 'MCQ' | 'SAQ';

export interface MqttQuizCurrentPayload {
	id: string;
	type: MqttQuizType;
	question: string;
	options?: string[]; // Only for MCQ
	points: number;
}

export interface MqttMyScorePayload {
	score: number; // 누적 총점
	quizScore: number; // 이번 문제에서 받은 점수
}

export type MqttQuizControlAction = 'LOCK' | 'UNLOCK';

export interface MqttQuizControlPayload {
	action: MqttQuizControlAction;
}

export type MqttMyResult = 'CORRECT' | 'INCORRECT';

export interface MqttQuizResultPayload {
	qId: string;
	correctAnswer: string | number | null; // 정답 인덱스 또는 주관식 정답
	correctAnswerText: string; // 정답 텍스트
	myResult: MqttMyResult;
	myScore: number; // 이번 문제 점수
}
