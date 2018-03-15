import JSONForge from '../src/index.js';

const forge = new JSONForge({
    map: {
        $and: 'and',
        $or: 'or',
        like: 'contains',
        DATE: '$date'
    },
    prune: {
        _title_: true
    },
    compressors: {
        $date(v, k) {
            return new Date(v);
        },
        $objectId(v, k) {
            if (Array.isArray(v)) {
                return v.map(e => {
                    return e; //here you would handle wrapping many objectIds (if needed)
                });
            }
            return v; //here you would wrap a single element
        }
    }
});

const testDate = new Date();
const stringDate = testDate.toISOString();

const q1 = {
    publishedAt: {
        '<=': {
            $date: stringDate
        }
    }
};

const q2 = {
    $and: [
        {
            title: {
                like: 'This'
            }
        },
        {
            $or: [
                {
                    description: {
                        contains: 'Text'
                    }
                },
                {
                    classification: {
                        contains: 'U'
                    }
                }
            ]
        }
    ]
};

const q3 = {
    updatedAt: {
        '<=': {
            DATE: stringDate
        }
    }
};

const q4 = {
    _title_: 'A Good Day to Die',
    topics: ['a', 'b', 'c']
};

const q5 = Object.assign({}, q4, q3, q2, q1);

const r1 = {
    publishedAt: {
        '<=': testDate
    }
};

const r2 = {
    and: [
        {
            title: {
                contains: 'This'
            }
        },
        {
            or: [
                {
                    description: {
                        contains: 'Text'
                    }
                },
                {
                    classification: {
                        contains: 'U'
                    }
                }
            ]
        }
    ]
};

const r3 = {
    updatedAt: {
        '<=': testDate
    }
};

const r4 = {
    topics: ['a', 'b', 'c']
};

const r5 = {
    topics: ['a', 'b', 'c'],
    updatedAt: {
        '<=': testDate
    },
    and: [
        {
            title: {
                contains: 'This'
            }
        },
        {
            or: [
                {
                    description: {
                        contains: 'Text'
                    }
                },
                {
                    classification: {
                        contains: 'U'
                    }
                }
            ]
        }
    ],
    publishedAt: {
        '<=': testDate
    }
};

describe('JSON Forge', () => {
    it('Should properly compress values', () => {
        expect(forge.process(q1)).toEqual(r1);
    });
    it('Should properly remap values', () => {
        expect(forge.process(q2)).toEqual(r2);
    });
    it('Should properly remap and compress a value', () => {
        expect(forge.process(q3)).toEqual(r3);
    });
    it('Should properly prune a branch', () => {
        expect(forge.process(q4)).toEqual(r4);
    });
    it('Should perform all tasks simultaneously', () => {
        expect(forge.process(q5)).toEqual(r5);
    });
});
