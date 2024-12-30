import type { User } from '$lib/fetch/user';

export interface ProgramProgress {
	_id: string;

	program: string;

	joinCode: string;

	currentQuizIndex: number;

	currentQuiz: string;

	users: string[];

	currentVideoTimestamp: number;

	isSubmittingQuestion: boolean;

	videoPlayerSocketId: string;

	isStarted: boolean;

	isEnd: boolean;

	isOnSubVideo: boolean;

	currentSubVideo: number;
}

const API_URL = 'https://quiz.seda.club/api/programProgress';

export async function fetchUserByProgress(
	id: string,
	fetchFunc: typeof fetch = fetch
): Promise<User[]> {
	const response = await fetchFunc(`${API_URL}/${id}/users`);
	return await response.json();
}

export async function fetchProgramProgresses(
	fetchFunc: typeof fetch = fetch
): Promise<ProgramProgress[]> {
	const response = await fetchFunc(API_URL);
	return await response.json();
}

export async function fetchProgramProgress(
	id: string,
	fetchFunc: typeof fetch = fetch
): Promise<ProgramProgress> {
	const response = await fetchFunc(`${API_URL}/${id}`);
	return await response.json();
}

export async function createProgramProgress(
	programProgress: { program: string; joinCode: string },
	fetchFunc: typeof fetch = fetch
): Promise<ProgramProgress> {
	const response = await fetchFunc(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(programProgress)
	});
	return await response.json();
}
