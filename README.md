# Lisk-cmd
A lisk command line client.

## Install

`sudo npm install -g lisk-cmd`


## Usage

Send lisk:
`lisk-cmd send 0.5 23432423312312L`

Vote a delegate by its name:
`lisk-cmd vote dakk`

Unvote a delegate by its name:
`lisk-cmd unvote dakk`

Get address balance
`lisk-cmd balance 9156937674793601072L`


```
  Usage: lisk-cmd [options] <command> [args ...]


  Commands:

    send <amount> <destination>
    vote <delegates...>        
    unvote <delegates...>      
    votes <delegate>           
    voters <delegate>          
    balance <address>          

  Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -t, --testnet             use testnet (mainnet is the default)
    -n, --node <url>          set a custom node
    -s, --seed <seed>         pass seed from command line
    -ss, --secondseed <seed>  pass the second seed from command line
```


## Copyright

This software is release under the MIT license.

Created by Davide "dakk" Gessa from the LiskItalianGroup; if you like this software please 
consider to vote for "dakk" delegate on Lisk, or send a donation to 2324852447570841050L. 
Also thanks to delegate "corsaro" for this idea.

Check other LIG projects at: http://liskitaliangroup.github.io/