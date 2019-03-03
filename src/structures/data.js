class Data {
    constructor() {
        this.data = {};

        this.watchedKeys = {};

        this.cronToCheckExpiration();
    }

    //cron job to check expiration.

    cronToCheckExpiration() {
        setInterval(() => {
            const keys = Object.keys(this.watchedKeys);

            if (keys.length) {
                let randomKey = this.getRandomKey(this.watchedKeys);

                let result = this.lazyExpiration(randomKey);

                if (result) {
                    this.watchedKeys = this.removeItemsFromObject(
                        result,
                        this.watchedKeys
                    );
                }
            }
        }, 100);
    }

    // data expiration

    keys() {
        let keys = this.checkIsExpireKeys();

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
        second = parseInt(second);
        let tmp = this.data[key];
        if (tmp && !Number.isInteger(second)) {
            return "(error) seconds must be interger";
        } else if (tmp && Number.isInteger(second)) {
            if (second <= 0) {
                delete this.data[key];
            } else {
                tmp["ttl"] = new Date().getTime() + second * 1000;
                this.watchedKeys[key] = true;
            }

            return "(interger) 1";
        } else {
            return "(interger) 0";
        }
    }
    ttl(key) {
        let tmp = this.checkIsExpireKey(key);
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

    // string methods

    set(key, value) {
        this.data[key] = {
            type: "string",
            value: `"${value}"`
        };

        return "OK";
    }

    get(key) {
        let tmp = this.checkIsExpireKey(key);

        return tmp ? tmp.value : "(nil)";
    }

    // list methods

    llen(key) {
        let tmp = this.checkIsExpireKey(key);

        if (tmp) {
            return tmp.type === "list"
                ? `(interger) ${tmp["value"].length}`
                : "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return "(interger) 0";
        }
    }

    rpush(key, values) {
        let tmp = this.checkIsExpireKey(key);

        let result = "";
        if (tmp) {
            if (tmp["type"] === "list") {
                tmp["value"].push(...values);
                result = `(interger) ${tmp["value"].length}`;
            } else {
                result =
                    "(error)  wrongtype operation against a key holding the wrong kind of value ";
            }
        } else {
            tmp = {
                type: "list",
                value: []
            };
            tmp["value"].push(...values);
            result = `(interger) ${tmp["value"].length}`;
        }
        this.data[key] = tmp;

        return result;
    }

    lpop(key) {
        let tmp = this.checkIsExpireKey(key);

        if (tmp && tmp["type"] === "list") {
            return `"${tmp["value"].shift()}"`;
        } else if (tmp) {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return "(nil)";
        }
    }

    rpop(key) {
        let tmp = this.checkIsExpireKey(key);

        if (tmp && tmp["type"] === "list") {
            return `"${tmp["value"].pop()}"`;
        } else if (tmp) {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return "(nil)";
        }
    }

    lrange(key, values) {
        let tmp = this.checkIsExpireKey(key);

        let start = parseInt(values[0]);
        let stop = parseInt(values[1]);
        let result = "";
        if (!Number.isInteger(start) || !Number.isInteger(stop)) {
            result = "(error) start or stop value is not an integer";
        } else if (start < 0 || stop < 0) {
            result = "(error) arguments must be non-negative interger";
        } else {
            if (tmp && tmp["type"] === "list") {
                let lrange = tmp["value"].slice(start, stop + 1);

                result = lrange.reduce((re, value, index) => {
                    re += `${index})  "${value}"<br />`;
                    return re;
                }, "");
            } else if (tmp) {
                result =
                    "(error)  wrongtype operation against a key holding the wrong kind of value ";
            } else {
                result = "(empty list)";
            }
        }
        return result;
    }

    // set methods
    sadd(key, values) {
        let tmp = this.checkIsExpireKey(key);

        if (!tmp) {
            tmp = {
                type: "set",
                value: []
            };
        } else if (tmp.type !== "set") {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        }

        tmp.value = values.reduce((result, value) => {
            if (!tmp.value.includes(value)) {
                result.push(value);
            }
            return result;
        }, tmp.value || []);

        this.data[key] = tmp;

        return `(interger) ${this.data[key]["value"].length}`;
    }

    scard(key) {
        let tmp = this.checkIsExpireKey(key);

        if (tmp && tmp["type"] !== "set") {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        }

        return `(interger) ${tmp ? tmp["value"].length : 0}`;
    }

    smembers(key) {
        let tmp = this.checkIsExpireKey(key);

        if (tmp && tmp["type"] === "set") {
            return tmp["value"].reduce((result, value, index) => {
                result += `${index + 1})  "${value}"<br />`;
                return result;
            }, "");
        } else if (tmp && tmp["type"] !== "set") {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return "(empty set)";
        }
    }

    srem(key, values) {
        let tmp = this.checkIsExpireKey(key);

        if (tmp && tmp["type"] === "set") {
            let removed = values.filter(value => {
                if (tmp["value"].includes(value)) {
                    let idx = tmp["value"].indexOf(value);

                    return tmp["value"].splice(idx, 1);
                }
            });
            return `(interger) ${removed.length}`;
        } else if (tmp) {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        } else {
            return `(interger) 0`;
        }
    }

    sinter(keys) {
        let values = keys.reduce((result, k) => {
            let tmp = this.checkIsExpireKey(k);
            if (tmp && tmp["type"] === "set") {
                result.push(tmp["value"]);
            } else if (tmp && tmp["type"] !== "set") {
                throw new Error(
                    "wrongtype operation against a key holding the wrong kind of value "
                );
            } else if (!tmp) {
                result.push([]);
            }
            return result;
        }, []);

        if (values) {
            let interact = values.slice(1).reduce((result, set) => {
                return set.filter(v => {
                    return result.includes(v);
                });
            }, values[0] || []);

            return interact.length
                ? interact.reduce((result, value, index) => {
                      result += `${index + 1})  "${value}"<br />`;
                      return result;
                  }, "")
                : "(empty set or list)";
        } else {
            return "(error)  wrongtype operation against a key holding the wrong kind of value ";
        }
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
        const tmp = this.data[key];
        if (tmp && tmp["ttl"]) {
            let current = new Date().getTime();
            let ttl = Math.ceil((tmp["ttl"] - current) / 1000);
            if (ttl < 0) {
                delete this.data[key];
                return key;
            }
        }
        return false;
    }

    checkIsExpireKeys() {
        const keys = Object.keys(this.watchedKeys);
        const expiredKeys = keys.reduce((result, key) => {
            let tmp = this.data[key];
            if (tmp && tmp["ttl"]) {
                let current = new Date().getTime();
                let ttl = Math.ceil((tmp["ttl"] - current) / 1000);
                if (ttl < 0) {
                    delete this.data[key];
                    result.push(key);
                }
            }

            return result;
        }, []);

        this.watchedKeys = this.removeItemsFromObject(
            expiredKeys,
            this.watchedKeys
        );

        return Object.keys(this.data);
    }

    checkIsExpireKey(key) {
        let isExpired = this.lazyExpiration(key);
        if (isExpired) {
            this.watchedKeys = this.removeItemsFromObject(
                isExpired,
                this.watchedKeys
            );
        }
        return this.data[key];
    }

    getRandomKey(dict) {
        let keys = Object.keys(dict);

        return keys[Math.floor(keys.length * Math.random())];
    }
}

export default new Data();
