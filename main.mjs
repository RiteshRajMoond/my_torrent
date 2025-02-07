"use strict";

import getPeers from "./tracker.mjs";
import { open } from "./torrent-parser.mjs";

// We are establishing a connection with the tracker and getting a list of peers. We are using the open function from torrent-parser to read the torrent file and pass it to the getPeers function.
const torrent = open('my_torrent.torrent');

getPeers(torrent, (peers) => {
  console.log("list of peers: ", peers);
});