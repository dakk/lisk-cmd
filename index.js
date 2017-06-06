#!/usr/bin/env node
"use strict";

const program   = require ('commander');
const lisk      = require ('lisk-js');
const request   = require ('request-promise');
const readline  = require ('readline');


const rl = readline.createInterface ({ input: process.stdin, output: process.stdout });

const secretInput = (query) => {
    return new Promise ((resolve, reject) => {
        var stdin = process.openStdin();
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
        });

        rl.question(query, value => {
            rl.history = rl.history.slice(1);
            return resolve (value);
        });
    });
};


const broadcastTransaction = (node, data, testnet) => {
    if (testnet == undefined || testnet == false)
        nethash = 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511';
    else
        nethash = 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';

    return request.post ({
        uri: node + '/peer/transactions/',
        headers: {
            version: '0.8.2',
            nethash: nethash,
            port: '1'
        },
        body: data
    });
};


let node = 'https://liskworld.info';


let pr = program.version('0.4.0')
    .usage ('[options] <command> [args ...]')
    .option('-t, --testnet', 'Use testnet')
    .option('-n, --node <url>', 'Set a custom node');

/* Send lisk */ 
pr.command ('send <amount> <destination>').action ((amount, destination) => {
    let testnet = pr.testnet || false;
    let node = pr.node || ('https://liskworld.info' ? testnet : 'https://testnet.lisk.io');
    var lsk = lisk.api({testnet: testnet});
    let am = parseFloat (amount) * Math.pow(10, 8);

    console.log (`Sending ${am} to ${destination} (testnet: ${testnet})`);

    secretInput ('Insert your secret: ')
    .then (secret => {
        let tx = lsk.transaction.createTransaction (destination, am, secret);
        broadcastTransaction (node, tx, testnet)
        .then (d => {

        })
        .catch (e => {
        });
    })
    .catch (e => {
    });
});

/* Vote delegate */
pr.command ('vote <delegate>').action ((delegate) => {
    console.log ('ciaooov');
});


pr.parse (process.argv);
//pr.help ();