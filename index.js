#!/usr/bin/env node
"use strict";

const program   = require ('commander');
const lisk      = require ('lisk-js');
const request   = require ('request-promise');
const readline  = require ('readline');

const rl = readline.createInterface ({ input: process.stdin, output: process.stdout });

const secretInput = (query, seed) => {
    return new Promise ((resolve, reject) => {
        /*var stdin = process.openStdin();
        process.stdin.on("data", char => {
            char = char + "";
            switch (char) {
                case "\n":
                case "\r":
                case "\u0004":
                    stdin.pause();
                    break;
                default:
                    process.stdout.write("\x1B[2K\x1B[200D" + query + Array(rl.line.length+1).join("*"));
                    break;
            }
        });*/

        if (seed) 
            return resolve (seed);

        rl.question(query, value => {
            rl.history = rl.history.slice(1);
            return resolve (value);
        });
    });
};




const broadcastTransaction = (node, data, testnet) => {
    let nethash = 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';
    if (testnet == undefined || testnet == false)
        nethash = 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511';

    return request.post ({
        uri: node + '/peer/transactions/',
        headers: {
            version: '0.8.2',
            nethash: nethash,
            port: '1'
        },
        body: data,
        json: true
    });
};


const getDelegate = (node, name) => {
    return new Promise ((resolve, reject) => {
        request.get ({
            uri: node + '/api/delegates/get?username=' + name,
            json: true
        }).then (data => {
            if (!data.success)
                return reject (data);

            return resolve (data.delegate);
        }).catch (err => {
            return reject (err);
        });
    });
};



let pr = program.version('0.4.0')
    .usage ('[options] <command> [args ...]')
    .option ('-t, --testnet', 'use testnet (mainnet is the default)')
    .option ('-n, --node <url>', 'set a custom node')
    .option ('-s, --seed <seed>', 'pass seed from command line')
    .option ('-ss, --secondseed <seed>', 'pass the second seed from command line');


let testnet = pr.testnet || false;
let node = pr.node || (testnet ? 'https://testnet.lisk.io' : 'https://liskworld.info');
let lsk = lisk.api({testnet: testnet});


/* Send lisk */ 
pr.command ('send <amount> <destination>').action ((amount, destination) => {
    let am = parseFloat (amount) * Math.pow(10, 8);

    console.log (`Sending ${am} to ${destination} (testnet: ${testnet})`);

    secretInput ('Insert your secret: ', pr.seed)
    .then (secret => {
        let tx = lsk.transaction.createTransaction (destination, am, secret);

        console.log ('tx', tx);
        broadcastTransaction (node, tx, testnet)
        .then (d => {
            console.log (d);
            process.exit (0);
        })
        .catch (err => {
            console.log (`Error: ${err}`);
            process.exit (0);
        });
    })
    .catch (err => {
        console.log (`Error: ${err}`);
        process.exit (0);
    });
});

/* Vote delegate */
pr.command ('vote <delegates...>').action (delegates => {
    secretInput ('Insert your secret: ', pr.seed)
    .then (secret => {
        let keys = lisk.crypto.getKeys (secret);
        let address = lisk.crypto.getAddress (keys.publicKey);

        request.get ({
            uri: node + '/api/accounts/delegates/?address=' + address,
            json: true
        }).then (data => {
            /* Check if already voted */
            data.delegates = data.delegates || [];
            data.delegates.forEach ((acc) => {
                if (acc.username in delegates) {
                    console.log (`${acc.username} already voted, exiting`);
                    process.exit (0);
                }
            });

            /* Get the delegates publicKeys */
            var prms = [];
            delegates.forEach (del => { prms.push (getDelegate (del)); });

            Promise.all (prms)
            .then (dels => {
                console.log (dels);
                let list = dels.map (del => { return '+' + del.publicKey; });
                let tx = lsk.transaction.createVote (secret, list);

                console.log ('tx', tx);
                broadcastTransaction (node, tx, testnet)
                .then (d => {
                    console.log ('asd', d);
                    process.exit (0);
                })
                .catch (err => {
                    console.log (`Error: ${err}`);
                    process.exit (0);
                });
            });

            process.exit (0);
        }).catch (err => {
            console.log (`Error: ${err}`);
            process.exit (0);
        });
    });
});

/* Unvote delegate */
pr.command ('unvote <delegates...>').action (delegates => {
    secretInput ('Insert your secret: ', pr.seed)
    .then (secret => {
        let keys = lisk.crypto.getKeys (secret);
        let address = lisk.crypto.getAddress (keys.publicKey);

        request.get ({
            uri: node + '/api/accounts/delegates/?address=' + address,
            json: true
        }).then (data => {
            /* Check if already voted */
            data.delegates = data.delegates || [];
            data.delegates.forEach ((acc) => {
                if (! (acc.username in delegates)) {
                    console.log (`${acc.username} not voted, exiting`);
                    process.exit (0);
                }
            });

            /* Get the delegates publicKeys */
            var prms = [];
            delegates.forEach (del => { prms.push (getDelegate (del)); });

            Promise.all (prms)
            .then (dels => {
                let list = dels.map (del => { return '-' + del.publicKey; });
                let tx = lsk.transaction.createVote (secret, list);

                console.log ('tx', tx);
                broadcastTransaction (node, tx, testnet)
                .then (d => {
                    console.log (d);
                    process.exit (0);
                })
                .catch (err => {
                    console.log (`Error: ${err}`);
                    process.exit (0);
                });
            });

            process.exit (0);
        }).catch (err => {
            console.log (`Error: ${err}`);
            process.exit (0);
        });
    });
});


/* Votes */
pr.command ('votes <delegate>').action ((delegate) => {
    getDelegate (node, delegate)
    .then (delob => {
        request.get ({
            uri: node + '/api/accounts/delegates/?address=' + delob.address,
            json: true
        }).then (data => {
            data.delegates.forEach ((acc) => {
                console.log (`${acc.address}\t${acc.username}`);
            });
            process.exit (0);
        }).catch (err => {
            console.log (`Error: ${err}`);
            process.exit (0);
        });
    }).catch (err => {
        console.log (`Error: ${err}`);
        process.exit (0);
    });
});

/* Voters */
pr.command ('voters <delegate>').action ((delegate) => {
    getDelegate (node, delegate)
    .then (delob => {
        request.get ({
            uri: node + '/api/delegates/voters?publicKey=' + delob.publicKey,
            json: true
        }).then (data => {
            data.accounts.forEach ((acc) => {
                console.log (`${acc.address}\t${acc.username}`);
            });
            process.exit (0);
        }).catch (err => {
            console.log (`Error: ${err}`);
            process.exit (0);
        });
    }).catch (err => {
        console.log (`Error: ${err}`);
        process.exit (0);
    });
});

/* Balance */
pr.command ('balance <address>').action ((address) => {
    request.get ({
        uri: node + '/api/accounts/getBalance?address=' + address,
        json: true
    }).then (data => {
        console.log (data.balance / Math.pow (10, 8));
        process.exit (0);
    }).catch (err => {
        console.log (`Error: ${err}`);
        process.exit (0);
    });
});


pr.parse (process.argv);

if ((process.argv.length == 2 && process.argv[0].indexOf ('node') != -1) || process.argv.length < 2)
    pr.help ();