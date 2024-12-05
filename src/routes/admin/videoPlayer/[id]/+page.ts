import { fetchProgramProgress } from '$lib/fetch/programProgress';

export const ssr = false;

export async function load({ params, fetch }) {
	const programProgress = await fetchProgramProgress(params.id, fetch);
	return { programProgress };
}
