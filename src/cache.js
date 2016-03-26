import store from 'node-persist';
import sanitize from 'sanitize-filename';

store.init();

const cache = (fn) => {
    return async (key) => {
        let safeKey = sanitize(key)
        let data = store.getItem(safeKey);
        if (data) {
            return data;
        }
        data = await fn(key);
        await store.setItem(safeKey, data);
        return data;
    }
}

export default cache;
