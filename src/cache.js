import fs from 'fs-extra';
import path from 'path';

const getUserHome = () =>
    process.env.HOME || process.env.USERPROFILE;

const storeLocation = path.join(getUserHome(), '.episoder', 'cache');
let store = {};

try {
    const persisted = fs.readFileSync(storeLocation);
    store = JSON.parse(persisted);
} catch (err) {
    // ignore error
}

process.on('exit', () => {
    fs.mkdirpSync(path.dirname(storeLocation));
    fs.writeFileSync(storeLocation, JSON.stringify(store));
});

const cache = (fn) => {
    return async (key) => {
        let data = store[key];
        if (data) {
            return data;
        }
        data = await fn(key);
        store[key] = data;
        return data;
    }
}

export default cache;
