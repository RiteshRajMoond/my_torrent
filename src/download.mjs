"use strict";

import net from "net";
import getPeers from "./tracker.mjs";

const download = (torrent) => {
  getPeers(torrent, (peers) => {
    peers.forEach(download_peer);
  });
};

const download_peer = (peer) => {
  const socket = new net.Socket();
  socket.on("error", console.log);
  socket.connect(peer.port, peer.ip, () => {
    socket.write("Welcome to My-Torrent");
  });
  socket.on("data", (data) => {
    console.log(data.toString("utf8"));
  });
};

export default download;