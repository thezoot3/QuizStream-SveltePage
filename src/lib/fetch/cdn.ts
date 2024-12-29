export interface VideoInfo {
	filename: string;
	duration: number;
	videoId: string;
}

export async function fetchFileLists(url: string = 'http://localhost:3200') {
	const response = await fetch(url + '/cdn/video-info');
	return await response.json();
}

export function getThumbnailURL(videoId: string, url: string = 'http://localhost:3200') {
	return url + '/cdn/thumbnail/' + videoId;
}

export async function getVideoURL(videoId: string, url: string = 'http://localhost:3200') {
	const videoFile = await fetchVideoInfo(videoId);
	return url + '/cdn/videos/' + videoFile.filename;
}

export async function fetchVideoInfo(videoId: string, url: string = 'http://localhost:3200'): Promise<VideoInfo> {
	const response = await fetch(`${url}/cdn/video-info/${videoId}`);
	return await response.json();
}
