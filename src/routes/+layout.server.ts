import {initializeStores} from "$lib/store";

export function load({cookies}) {
    initializeStores(cookies)
    return {}
}
