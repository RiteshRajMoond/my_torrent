'use strict';

import bencode from 'bencode';
import fs from 'fs';

const torrent = bencode.decode(fs.readFileSync('my_torrent.torrent'));
console.log(torrent.announce.toString('utf8'));