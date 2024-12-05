export interface QuestionResponse {
	_id: string;

	programProgressId: string;

	userId: string;

	quizId: string;

	submittedAnswer: number;

	isCorrect: boolean;

	earnedPoints: number;

	answeredAt: Date;
}

const API_URL = '/api/questionResponse';

export async function fetchQuestionResponses(
	fetchFunc: typeof fetch = fetch
): Promise<QuestionResponse[]> {
	const response = await fetchFunc(API_URL);
	return await response.json();
}

export async function fetchQuestionResponse(
	id: string,
	fetchFunc: typeof fetch = fetch
): Promise<QuestionResponse> {
	const response = await fetchFunc(`${API_URL}/${id}`);
	return await response.json();
}

export async function fetchQuestionResponsesByProgress(
	id: string,
	fetchFunc: typeof fetch = fetch
): Promise<QuestionResponse[]> {
	const response = await fetchFunc(`${API_URL}/programProgress/${id}`);
	return await response.json();
}

export async function fetchQuestionResponsesByProgressAndQuizId(
	id: string,
	quizId: string,
	fetchFunc: typeof fetch = fetch
): Promise<QuestionResponse[]> {
	const response = await fetchFunc(`${API_URL}/programProgress/${id}/quiz/${quizId}`);
	return await response.json();
}
