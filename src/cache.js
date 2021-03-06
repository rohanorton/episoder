import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const isWindows = os.platform() === 'win32';
const dot = isWindows ? '_' : '.';

const storeLocation = path.join(os.homedir(), `${dot}episoder`, 'cache');
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
