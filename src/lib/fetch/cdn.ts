export interface VideoInfo {
	filename: string;
	duration: number;
	videoId: string;
}

export async function fetchFileLists() {
	const response = await fetch('/cdn/video-info');
	return await response.json();
}

export function getThumbnailURL(videoId: string) {
	return '/cdn/thumbnail/' + videoId;
}

export async function getVideoURL(videoId: string) {
	const videoFile = await fetchVideoInfo(videoId);
	return '/cdn/videos/' + videoFile.filename;
}

export async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
	const response = await fetch(`/cdn/video-info/${videoId}`);
	console.log(response);
	return await response.json();
}
