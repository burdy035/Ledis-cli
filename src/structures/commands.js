import data from "./data";

import snapshot from "./snapshot";

const commands = {
    set: {
        type: "String",
        args: "[key] [value]",
        method: (key, value) => {
            return data.set(key, value);
        },
        checkSyntax: cmd => {
            let regex = /^(set)(\s[^\s]+){2}$/g;

            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    get: {
        type: "String",
        args: "[key]",
        method: key => {
            return data.get(key);
        },
        checkSyntax: cmd => {
            let regex = /^(get)(\s[^\s]+){1}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    llen: {
        type: "List",
        args: "[key]",
        method: key => {
            return data.llen(key);
        },
        checkSyntax: cmd => {
            let regex = /^(llen)(\s[^\s]+){1}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    rpush: {
        type: "List",
        args: "[key] [value] [value...]",
        method: (key, values) => {
            return data.rpush(key, values);
        },
        checkSyntax: cmd => {
            let regex = /^(rpush)(\s[^\s]+)+/g;
            return regex.test(cmd);
        },
        getParams: p => {
            p = p.split(" ");

            return [p.shift(), p];
        }
    },
    lpop: {
        type: "List",
        args: "[key]",
        method: key => {
            return data.lpop(key);
        },
        checkSyntax: cmd => {
            let regex = /^(lpop)(\s[^\s]+){1}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    rpop: {
        type: "List",
        args: "[key]",
        method: key => {
            return data.rpop(key);
        },
        checkSyntax: cmd => {
            let regex = /^(rpop)(\s[^\s]+){1}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    lrange: {
        type: "List",
        args: "[key] [start] [stop]",
        method: (key, values) => {
            return data.lrange(key, values);
        },
        checkSyntax: cmd => {
            let regex = /^(lrange)(\s[^\s]+){3}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            p = p.split(" ");

            return [p.shift(), p];
        }
    },
    sadd: {
        type: "Set",
        args: "[key] [value] [value...]",
        method: (key, values) => {
            return data.sadd(key, values);
        },
        checkSyntax: cmd => {
            let regex = /^(sadd)(\s[^\s]+)(\s[^\s]+)+/g;
            return regex.test(cmd);
        },
        getParams: p => {
            p = p.split(" ");

            return [p.shift(), p];
        }
    },
    scard: {
        type: "Set",
        args: "[key]",
        method: (key, values) => {
            return data.scard(key, values);
        },
        checkSyntax: cmd => {
            let regex = /^(scard)(\s[^\s]+){1}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    smembers: {
        type: "Set",
        args: "[key]",
        method: (key, values) => {
            return data.smembers(key, values);
        },
        checkSyntax: cmd => {
            let regex = /^(smembers)(\s[^\s]+){1}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    srem: {
        type: "Set",
        args: "[key] [member] [member...]",
        method: (key, values) => {
            return data.srem(key, values);
        },
        checkSyntax: cmd => {
            let regex = /^(srem)(\s[^\s]+)(\s[^\s]+)+/g;
            return regex.test(cmd);
        },
        getParams: p => {
            p = p.split(" ");
            return [p.shift(), p];
        }
    },
    sinter: {
        type: "Set",
        args: "[key] [key] [key...]",
        method: values => {
            return data.sinter(values);
        },
        checkSyntax: cmd => {
            let regex = /^(sinter)(\s[^\s]+)+/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return [p.split(" ")];
        }
    },
    keys: {
        type: "Keys",
        args: "",
        method: () => {
            return data.keys();
        },
        checkSyntax: cmd => {
            let regex = /^(keys)$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return [];
        }
    },
    del: {
        type: "Keys",
        args: "[key] [keys...]",
        method: keys => {
            return data.del(keys);
        },
        checkSyntax: cmd => {
            let regex = /^(del)(\s[^\s]+)+/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return [p.split(" ")];
        }
    },
    flushdb: {
        type: "Keys",
        args: "",
        method: () => {
            return data.flushdb();
        },
        checkSyntax: cmd => {
            let regex = /^(flushdb)$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return [p.split(" ")];
        }
    },
    expire: {
        type: "Keys",
        args: "[key] [seconds]",
        method: (key, seconds) => {
            return data.expire(key, seconds);
        },
        checkSyntax: cmd => {
            let regex = /^(expire)(\s[^\s]+){2}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    ttl: {
        type: "Keys",
        args: "[key]",
        method: key => {
            return data.ttl(key);
        },
        checkSyntax: cmd => {
            let regex = /^(ttl)(\s[^\s]+){1}$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    },
    save: {
        type: "Snapshot",
        args: "",
        method: data => {
            return snapshot.save(data);
        },
        checkSyntax: cmd => {
            let regex = /^(save)$/g;
            return regex.test(cmd);
        }
    },
    restore: {
        type: "Snapshot",
        args: "",
        method: () => {
            return snapshot.restore();
        },
        checkSyntax: cmd => {
            let regex = /^(restore)$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return p.split(" ");
        }
    }
};

export const parseSyntax = syntax => {
    if (/\s/.test(syntax)) {
        syntax = syntax.trim().toLowerCase();
        syntax = syntax.replace(/\s+/g, " ");
        return {
            syntax: syntax,
            command: syntax.substr(0, syntax.indexOf(" ")),
            args: syntax.substr(syntax.indexOf(" ") + 1)
        };
    } else {
        return { syntax: syntax, command: syntax, args: "" };
    }
};

export default {
    ...commands,
    help: {
        method: () => {
            let groupByType = Object.keys(commands).reduce((result, k) => {
                let type = commands[k].type;
                let args = commands[k].args;
                if (!result[type]) {
                    result[type] = [];
                }

                result[type].push(`${k} ${args}`);

                return result;
            }, {});

            return Object.keys(groupByType).reduce((outcome, type) => {
                let tmp = groupByType[type].reduce((res, comd) => {
                    res += `&nbsp; &nbsp;${comd}  <br />`;
                    return res;
                }, "");

                outcome += `${type}: <br />${tmp}`;
                return outcome;
            }, "");
        },
        checkSyntax: cmd => {
            let regex = /^(help)$/g;
            return regex.test(cmd);
        },
        getParams: p => {
            return [];
        }
    }
};
