import { appState, currentQuiz, quizControl, quizResult, userState } from '$lib/store';
import { getMqttClient } from '$lib/mqttClient';
import { goto } from '$app/navigation';

export function constantDigit(num: number, digit: number) {
	return num.toString().padStart(digit, '0');
}

export function resetSession() {
	appState.set({ status: 'idle', currentQuizIndex: undefined });
	quizResult.set(null);
	userState.set(null);
	currentQuiz.set(null);
	quizControl.set(null);
	getMqttClient()?.end();
	goto('/');
}
