import {createCookieStore} from "$lib/cookie";
import type {Cookies} from "@sveltejs/kit";
import type {Writable} from "svelte/store";

interface UserInfo {
    userId: string,
    nickname: string
}

const initialUserState: UserInfo = {
    userId: '',
    nickname: ''
};

let userInfo: ReturnType<typeof createCookieStore<UserInfo>>;

export function getUserInfo(cookies?: Cookies): Writable<UserInfo> {
    if (!userInfo) {
        userInfo = createCookieStore<UserInfo>('userInfo', initialUserState, {
            cookies,
            path: '/',
            expires: new Date(Date.now() + 60 * 60 * 1000) // 1시간후 만료
        });
    }
    return userInfo;
}

interface GameInfo {
    programProgressId: string
}

const initialGameState: GameInfo = {
    programProgressId: ''
};

let gameInfo: ReturnType<typeof createCookieStore<GameInfo>>;

export function getGameInfo(cookies?: Cookies): Writable<GameInfo> {
    if (!gameInfo) {
        gameInfo = createCookieStore<GameInfo>('gameInfo', initialGameState, {
            cookies,
            path: '/',
            expires: new Date(Date.now() + 60 * 60 * 1000) // 1시간후 만료
        });
    }
    return gameInfo;
}

export function initializeStores(cookies: Cookies) {
    getUserInfo(cookies)
    getGameInfo(cookies)
}
