import { fetchProgram } from '$lib/fetch/program';

export const ssr = false;

export async function load({ params, fetch }) {
	const program = await fetchProgram(params.id, fetch);
	return { program };
}
