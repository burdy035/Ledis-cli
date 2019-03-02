class Data {
    constructor() {
        this.data = {};

        this.expireKeys = {};

        this.cronExpiration();
    }

    cronExpiration() {
        setInterval(() => {
            const keys = Object.keys(this.expireKeys);

            if (keys.length) {
                let result = this.lazyExpiration(keys);

                if (result.length) {
                    this.expireKeys = this.removeItemsFromObject(
                        result,
                        this.expireKeys
                    );
                }
            }
        }, 1000);
    }

    keys() {
        let keys = Object.keys(this.data).map(k => k);

        return keys.length
            ? keys.reduce((result, k, index) => {
                  result += `${index + 1})  ${k}<br />`;

                  return result;
              }, "")
            : "(empty list or set)";
    }

    del(keys) {
        let result = keys.filter(k => {
            if (this.data[k]) {
                return delete this.data[k];
            }
        });

        return `(interger) ${result.length}`;
    }

    flushdb() {
        this.data = {};

        return "OK";
    }

    expire(key, second) {
        let tmp = this.data[key];
        if (tmp) {
            tmp["ttl"] = new Date().getTime() + second * 1000;
            this.expireKeys[key] = true;
            return "(interger) 1";
        } else {
            return "(interger) 0";
        }
    }
    ttl(key) {
        let tmp = this.data[key];
        if (tmp && tmp["ttl"]) {
            let current = new Date().getTime();
            let ttl = Math.ceil((tmp["ttl"] - current) / 1000);
            if (ttl < 0) {
                delete this.data[key];
                return "(interger) -2";
            }

            return `(interger) ${ttl}`;
        } else if (tmp) {
            return "(interger) -1";
        } else {
            return "(interger) -2";
        }
    }

    set(key, value) {
        this.data[key] = {
            type: "string",
            value: `"${value}"`
        };

        return "OK";
    }

    get(key) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        return this.data[key] ? this.data[key].value : "(nil)";
    }

    // list methods

    llen(key) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        if (this.data[key]) {
            return this.data[key].type === "list"
                ? `(interger) ${this.data[key]["value"].length}`
                : "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return "(interger) 0";
        }
    }

    rpush(key, values) {
        let result = "";
        if (this.data[key]) {
            if (this.data[key]["type"] === "list") {
                this.data[key]["value"].push(...values);
                result = `(interger) ${this.data[key]["value"].length}`;
            } else {
                result =
                    "(error)  wrongtype operation against a key holding the wrong kind of value ";
            }
        } else {
            this.data[key] = {
                type: "list",
                value: []
            };
            this.data[key]["value"].push(...values);
            result = `(interger) ${this.data[key]["value"].length}`;
        }
        return result;
    }

    lpop(key) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        let listK = this.data[key];

        if (listK && listK["type"] === "list") {
            listK["value"].shift();
            return `(interger) ${listK["value"].length}`;
        } else if (listK) {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return "(nil)";
        }
    }

    rpop(key) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        let listK = this.data[key];

        if (listK && listK["type"] === "list") {
            listK["value"].pop();
            return `(interger) ${listK["value"].length}`;
        } else if (listK) {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return "(nil)";
        }
    }

    lrange(key, values) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        let listK = this.data[key];
        let start = values[0];
        let stop = values[1];
        let result = "";
        if (!Number(start) || !Number(stop)) {
            result = "Error: start or stop value is not an integer";
        } else {
            if (listK && listK["type"] === "list") {
                listK["value"].forEach((value, index) => {
                    result += `${index})  ${value}<br />`;
                });
            } else if (listK) {
                result =
                    "(error)  wrongtype operation against a key holding the wrong kind of value ";
            } else {
                result = "(empty list)";
            }
        }

        return result;
    }

    // sets methods
    sadd(key, values) {
        let tmp = this.data[key] || {
            type: "sets",
            value: []
        };
        let setK = tmp["value"];

        setK = values.reduce((result, value) => {
            if (!setK.includes(value)) {
                result.push(value);
            }
            return result;
        }, setK);

        this.data[key] = tmp;

        return `(interger) ${this.data[key]["value"].length}`;
    }

    scard(key) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        return `(interger) ${
            this.data[key] ? this.data[key]["value"].length : 0
        }`;
    }

    smembers(key) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        let setK = this.data[key];

        if (setK && setK["type"] === "sets") {
            return this.data[key]["value"].reduce((result, value, index) => {
                result += `${index + 1})  ${value}<br />`;
                return result;
            }, "");
        } else if (setK) {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return "(empty set)";
        }
    }

    srem(key, values) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        let setK = this.data[key];

        if (setK && setK["type"] === "sets") {
            let removed = values.filter(value => {
                if (setK["value"].includes(value)) {
                    let idx = setK["value"].indexOf(value);

                    return setK["value"].splice(idx, 1);
                }
            });
            return `(interger) ${removed.length}`;
        } else if (setK) {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return `(interger) 0`;
        }
    }

    sinter(keys) {
        this.expireKeys = this.checkIsExpireKey(key, this.expireKeys);

        let values = keys.reduce((args, k) => {
            if (this.data[k] && this.data[k]["type"] === "sets") {
                args.push(this.data[k]["value"]);
            }
            return args;
        }, []);

        let res = values.reduce((re, arg) => {
            return re.filter(value => {
                return arg.includes(value);
            });
        });

        return res.reduce((result, value, index) => {
            result += `${index + 1})  ${value}<br />`;
            return result;
        }, "");
    }

    // ultils

    removeItemsFromObject(items, collections) {
        if (Array.isArray(collections)) {
            if (Array.isArray(items)) {
                items.map(item => {
                    delete collections[collections.indexOf(item)];
                });
            } else {
                delete collections[collections.indexOf(items)];
            }
        } else {
            if (Array.isArray(items)) {
                items.map(item => {
                    delete collections[item];
                });
            } else {
                delete collections[items];
            }
        }

        return collections;
    }

    lazyExpiration(key) {
        if (Array.isArray(key)) {
            const deletedKey = key.reduce((commulator, k) => {
                let tmp = this.data[k];
                if (tmp && tmp["ttl"]) {
                    let current = new Date().getTime();
                    let ttl = Math.ceil((tmp["ttl"] - current) / 1000);
                    if (ttl < 0) {
                        delete this.data[k];
                        commulator.push(k);
                    }
                }
                return commulator;
            }, []);
            return deletedKey;
        } else {
            const tmp = this.data[key];
            if (tmp && tmp["ttl"]) {
                let current = new Date().getTime();
                let ttl = Math.ceil((tmp["ttl"] - current) / 1000);
                if (ttl < 0) {
                    delete this.data[key];
                    return key;
                }
            }
        }
    }

    checkIsExpireKey(key, expireKeys) {
        let isExpire = this.lazyExpiration(key);

        if (isExpire) {
            return this.removeItemsFromObject(isExpire, expireKeys);
        }
        return expireKeys;
    }
}

export default new Data();
