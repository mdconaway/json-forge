import isPlainObject from 'lodash.isplainobject';
import isArray from 'lodash.isarray';
import keys from 'lodash.keys';

export default class JSONForge {
    constructor(opts = {}) {
        const { map = {}, prune = {}, compressors = {} } = opts;
        this._map = map;
        this._prune = prune;
        this._compressors = compressors;
    }

    process(obj) {
        if (isArray(obj)) {
            return obj.map(this.process.bind(this));
        } else if (isPlainObject(obj)) {
            const iterables = keys(obj);
            const level = {};
            for (let i = 0; i < iterables.length; i++) {
                let key = iterables[i];
                let mapVal = this._map[key];
                if (this._prune[key]) {
                    //do nothing!
                } else if (mapVal) {
                    if (this._compressors[mapVal]) {
                        return this._compressors[mapVal](obj[key], mapVal);
                    }
                    level[mapVal] = this.process(obj[key]);
                } else if (this._compressors[key]) {
                    return this._compressors[key](obj[key], key);
                } else {
                    level[key] = this.process(obj[key]);
                }
            }
            return level;
        }
        return obj;
    }
}
