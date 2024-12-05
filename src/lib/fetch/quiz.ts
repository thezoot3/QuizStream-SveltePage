export interface Quiz {
	_id?: string;
	displayName: string;
	videoId: string;
	questionTriggerTime: number;
	questionText: string;
	submittingDuration: number;
	videoDuration: number;
	options: string[];
	correctAnswer: number;
	points: number;
	subVideoByOptions: ({ duration: number; videoId: string } | null)[];
}

export interface CreateQuiz {
	displayName: string;
	videoId: string;
	questionTriggerTime: number;
	questionText: string;
	submittingDuration: number;
	videoDuration: number;
	options: string[];
	correctAnswer: number;
	points: number;
	subVideoByOptions: ({ duration: number; videoId: string } | null)[];
}

const API_URL = '/api/quiz';

export async function fetchQuizzes(fetchFunc: typeof fetch = fetch): Promise<Quiz[]> {
	const response = await fetchFunc(API_URL);
	return await response.json();
}

export async function fetchQuiz(id: string, fetchFunc: typeof fetch = fetch): Promise<Quiz> {
	const response = await fetchFunc(`${API_URL}/${id}`);
	return await response.json();
}

export async function createQuiz(quiz: CreateQuiz, fetchFunc: typeof fetch = fetch): Promise<Quiz> {
	const response = await fetchFunc(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(quiz)
	});
	return await response.json();
}

export async function updateQuiz(
	id: string,
	quiz: Partial<Quiz>,
	fetchFunc: typeof fetch = fetch
): Promise<Quiz> {
	const response = await fetchFunc(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(quiz)
	});
	return await response.json();
}

export async function deleteQuiz(id: string, fetchFunc: typeof fetch = fetch): Promise<void> {
	await fetchFunc(`${API_URL}/${id}`, {
		method: 'DELETE'
	});
}
