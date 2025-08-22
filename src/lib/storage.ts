
const storage = window.localStorage;

export function get(key: string, _default: string) {
    const value = storage.getItem(key);
    return value != null ? value : _default;
}

export function set(key: string, value: string) {
    storage.setItem(key, value);
}

export function del(key: string) {
    storage.removeItem(key);
}

export function clear() {
    storage.clear();
}