export interface Program {
	_id: string;
	programName: string;
	quizList: string[];
}

const API_URL = 'https://quiz.seda.club/api/program';

export async function fetchPrograms(fetchFunc: typeof fetch = fetch): Promise<Program[]> {
	const response = await fetchFunc(API_URL);
	return await response.json();
}

export async function fetchProgram(id: string, fetchFunc: typeof fetch = fetch): Promise<Program> {
	const response = await fetchFunc(`${API_URL}/${id}`);
	return await response.json();
}

export async function createProgram(
	program: Omit<Program, '_id'>,
	fetchFunc: typeof fetch = fetch
): Promise<Program> {
	const response = await fetchFunc(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(program)
	});
	return await response.json();
}

export async function updateProgram(
	id: string,
	program: Partial<Program>,
	fetchFunc: typeof fetch = fetch
): Promise<Program> {
	const response = await fetchFunc(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(program)
	});
	return await response.json();
}

export async function deleteProgram(id: string, fetchFunc: typeof fetch = fetch): Promise<void> {
	await fetchFunc(`${API_URL}/${id}`, {
		method: 'DELETE'
	});
}
