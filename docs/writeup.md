# Ledis-cli

Simple, stripped down version of a Redis server with web-based cli interact with the server through http POST.

## Table of contents

### List of commands

Enter help on Ledis-cli to get the list of commands.

```
String:
   set [key] [value]
   get [key]
List:
   llen [key]
   rpush [key] [value] [value...]
   lpop [key]
   rpop [key]
   lrange [key] [start] [stop]
Set:
   sadd [key] [value] [value...]
   scard [key]
   smembers [key]
   srem [key] [member] [member...]
   sinter [key] [key] [key...]
Keys:
   keys
   del [key] [keys...]
   flushdb
   expire [key] [seconds]
   ttl [key]
Snapshot:
   save
   restore

```

### Technology

Express framework and Vuejs.

Express - a Node.js base web application framework.

Vuejs - a progressive framework for building user interfaces.

I chose these technologies because it is a javascript framework, which I am most familiar with is javascript, and another reason is that these technologies can help me build a web application quickly.

### Routes

```
GET/ http://localhost:3001/    // home route serves the web-base cli

POST/ http://localhost:3001/send-command   // send the command to Ledis server and get the response

```

### Implementations

The server is built on an object, each key is a command prefix of Ledis-cli.

```javascript
let commands = {
    set: {
        //code goes here
        method: (...arguments) => {
            // method from data class
            // set method from data class.
        },
        checkSyntax: () => {
            // code goes here
        },
        parseArguments: str => {
            // code goes here
        }
    }
};
```

Each command has the main method, check syntax method and parse arguments.

The main method to return the response to the client interface.

Check syntax method to check if the command is correct or not.

Parse arguments method to separate arguments from the command string.

There are two classes of data structure, one is for Data that contains (String, List, Set), one is for Snapshot.

### Data(String, List, Set)

This class has a global variable named data. The `data` variable is a global object of the class. Each key is an object contains type, value, ttl key.

The methods of the class used to handle the response of the command.

```javascript
class Data {
    contructor() {
        this.data = {
            example: {
                type: "string",
                value: "1",
                ttl: `timestamp`
            }
        };
    }

    set() {
        //code goes here

        return "response";
    }
}
```

For each key, there is an expiration time (ttl key). Unless you set the key to expire, that time is "never", means that key will never be deleted from the memory. The expiration mechanism is semi-lazy expiration. Lazy expiration means we do not delete the keys from the memory until they are read. But Ledis also adds a cronjob run every 100ms to check the expiration of watched list. If you set the key to expire Ledis will put that key into a watched list. The cronjob picks random key in the watched list to check the expiration of key. If it's expired, Ledis will delete it from memory.

### Snapshot

Ledis-cli uses html2canvas library to capture the screenshot. The html2canvas library supports convert HTML interface to base64 image. After capturing Ledis send the base64 string to the Ledis server, the server will handle the logic and return the response to the client.
