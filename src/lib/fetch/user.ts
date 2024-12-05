export interface User {
	_id: string;

	socketId: string;

	nickname: string;

	joinedProgram: string;

	earnedPoints: number;
}

const API_URL = '/api/user';

export async function fetchUsers(fetchFunc: typeof fetch = fetch): Promise<User[]> {
	const response = await fetchFunc(API_URL);
	return await response.json();
}

export async function fetchUser(id: string, fetchFunc: typeof fetch = fetch): Promise<User> {
	const response = await fetchFunc(`${API_URL}/${id}`);
	return await response.json();
}
