'use strict';

import download from "./src/download.mjs";
import { open } from "./src/torrent-parser.mjs";

const torrent = open(process.argv[2]);

download(torrent);