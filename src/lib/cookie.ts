// lib/stores/cookieStore.ts
import { type Writable, writable } from 'svelte/store';
import type { Cookies } from '@sveltejs/kit';
import { browser } from '$app/environment';
import * as cookies from 'js-cookie';

export function createCookieStore<T>(
	key: string,
	initialValue: T,
	options: {
		cookies?: Cookies;
		expires?: Date;
		path?: string;
	} = {}
): Writable<T> {
	// 초기값 설정
	let cookieValue = options.cookies?.get(key);
	if (browser && !cookieValue) {
		cookieValue = cookies.default.get(key);
	}
	const initial = cookieValue ? JSON.parse(cookieValue) : initialValue;

	// writable 스토어 생성
	const store = writable<T>(initial);

	// 스토어 구독 및 쿠키 동기화
	if (browser) {
		store.subscribe((value) => {
			const cookie = JSON.stringify(value);
			cookies.default.set(key, cookie, {
				path: options.path || '/',
				expires: options.expires || new Date(Date.now() + 60 * 60 * 3),
				sameSite: 'strict'
			});
		});
	}

	return store;
}
