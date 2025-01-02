export interface VideoInfo {
	filename: string;
	duration: number;
	videoId: string;
}

const API_URL = 'https://quiz.seda.club/cdn';

export async function fetchFileLists(url: string = API_URL): Promise<VideoInfo[]> {
	const response = await fetch(url + '/video-info');
	return await response.json();
}

export function getThumbnailURL(videoId: string, url: string = API_URL) {
	return url + '/thumbnail/' + videoId;
}

export function getVideoURL(videoId: string, url: string = API_URL): string {
	return url + '/videos/' + videoId;
}

export async function fetchVideoInfo(videoId: string, url: string = API_URL): Promise<VideoInfo> {
	const response = await fetch(`${url}/video-info/${videoId}`);
	return await response.json();
}
