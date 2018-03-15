# json-forge

This README outlines the details of collaborating on this library.

This library serves as client-side json 'forge' to remap a where object to waterline syntax, and as
a server-side type interpreter to handle special types that cannot be represented purely in JSON.
A good example would be Mongo Object ID's or Date Objects.  A forge instance will rebuild and return
a new object without disrupting the original object.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)

## Installation

* `git clone <repository-url>` this repository
* `cd json-forge`
* `npm install`

## Running / Development

* `npm start`
* Visit your app at [http://localhost:3000](http://localhost:3000).

## Testing

* `npm run test`

## Code Formatting

* `npm run format`

## Linting

* `npm run lint`
* `npm run lint:tests`

## Building

* `npm run build`

## !!!WARNING!!!

Ensure that you do not send objects with circular references to JSONForge! You will crash your JS VM!

## Usage

This library exports a single class called `JSONForge`.

When creating a new forge instance a single input object `options` is expected.

This `options` object can have the following definition keys:

`map`, `prune`, `compressors`.

All are expected to be objects/maps.

`map` is expected to be a map of literals, where the left-hand value of the map will be substituted
for the right-hand value of the map at every level of the input object.

`prune` is expected to be a map of truthy values, where all branches that match the left-hand value
of the prune map will be discarded at every level of the input object.

`compressors` is expected to be a map of synchronous functions that returns a replacement object for
the current object level if there is a left-hand key within the object level that matches the
compressor key.  Compressors can therefore be used to "mutate" an object level, or "compress" an
object level down to a special type like a Date object or a Mongo ID.

Creating a basic forge instance would looke like:

```javascript
import JSONForge from 'json-forge';

const forge = new JSONForge({
    compressors: {
        $date(v, k) {
            return new Date(v);
        }
    }
});
```

Invoking a forge is as easy as:

```javascript
const newObject = forge.process({
    "publishedAt": {
        "<=": {
            "$date": "2018-03-08T09:05:24.447Z"
        }
    }
});
```

The above forge would compress $date objects like:

```javascript
{
    "publishedAt": {
        "<=": {
            "$date": "2018-03-08T09:05:24.447Z"
        }
    }
}
```

to:

```javascript
{
    "publishedAt": {
        "<=":  new Date("2018-03-08T09:05:24.447Z")
    }
}
```

For simple remapping, a forge like the following can be useful:

```javascript
const forge = new JSONForge({
    map: {
        $and: 'and',
        $or: 'or',
        like: 'contains'
    }
});
```

This forge would convert the following object:

```javascript
{
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
}
```

to:

```javascript
{
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
}
```

Additionally, forges can also prune values out of an object tree.

The following forge would prune all branches starting with key `_title_`:

```javascript
const forge = new JSONForge({
    prune: {
        _title_: true
    }
});
```

Which would convert the following object:

```javascript
{
    _title_: 'A Good Day to Die',
    topics: ['a', 'b', 'c']
}
```

to:

```javascript
{
    topics: ['a', 'b', 'c']
}
```

Putting it all together, the following forge:

```javascript
import JSONForge from 'json-forge';

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
```

Would convert this object:

```javascript
{
    "_title_": "A Good Day to Die",
    "topics": [
        "a",
        "b",
        "c"
    ],
    "updatedAt": {
        "<=": {
            "DATE": "2018-03-08T09:05:24.447Z"
        }
    },
    "$and": [
        {
            "title": {
                "like": "This"
            }
        },
        {
        "$or": [
            {
                "description": {
                    "contains": "Text"
                }
            },
            {
                "classification": {
                    "contains": "U"
                }
            }
        ]
        }
    ],
    "publishedAt": {
        "<=": {
            "$date": "2018-03-08T09:05:24.447Z"
        }
    }
}
```

to:

```javascript
{
    "topics": [
        "a",
        "b",
        "c"
    ],
    "updatedAt": {
        "<=": new Date("2018-03-08T09:05:24.447Z")
    },
    "and": [
        {
            "title": {
                "contains": "This"
            }
        },
        {
            "or": [
                {
                    "description": {
                        "contains": "Text"
                    }
                },
                {
                    "classification": {
                        "contains": "U"
                    }
                }
            ]
        }
    ],
    "publishedAt": {
        "<=": new Date("2018-03-08T09:05:24.447Z")
    }
}
```

You may have noticed, that re-mapped keys can flow seamlessly into compressors!

# Forge On!
