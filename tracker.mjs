"use strict";

import dgram from "dgram";
import { Buffer } from "buffer";
import { URL } from "url";
import crypto from "crypto";

import { size, infoHash } from "./torrent-parser.mjs";
import genId from "./util.mjs";

const getPeers = (torrent, callback) => {
  const socket = dgram.createSocket("udp4");
  const url = Buffer.from(torrent.announce).toString("utf8");

  // 1. Sending connection request
  udpSend(socket, buildConnReq(), url);

  socket.on("message", (resp) => {
    if (respType(resp) === "connect") {
      // 2. recieve and parse connection response
      const connResp = parseConnResp(resp);
      // 3. send announce request
      const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
      udpSend(socket, announceReq, url);
    } else if (respType(resp) === "announce") {
      // 4 parse announce response
      const announceResp = parseAnnounceReq(resp);
      // 5 pass peers to callback
      callback(announceResp.peers);
    }
  });
};

const udpSend = (socket, message, rawUrl, callback = () => {}) => {
  const url = new URL(rawUrl);
  socket.send(message, 0, message.length, url.port, url.hostname, callback);
};

const respType = (resp) => {};

// Now let’s take a look at actually building the messages. Each message is a buffer with a specific format described in the BEP. Let’s take a look at the connect request first.
// The BEP describes the connect request as follows:
// Offset  Size            Name            Value
// 0       64-bit integer  connection_id   0x417 0x27101980
// 8       32-bit integer  action          0 // connect
// 12      32-bit integer  transaction_id  ? // random
// 16
const buildConnReq = () => {
  const buf = Buffer.allocUnsafe(16);

  // connection id
  buf.writeUInt32BE(0x417, 0); // (value, offset)
  buf.writeUInt32BE(0x27101980, 4);
  // action
  buf.writeUInt32BE(0, 8);
  // transaction id
  crypto.randomBytes(4).copy(buf, 12);

  return buf;
};

const parseConnResp = (resp) => {
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.slice(8),
  };
};

// BEP Format of the Announce RequestOffset  Size    Name    Value
// 0       64-bit integer  connection_id
// 8       32-bit integer  action          1 // announce
// 12      32-bit integer  transaction_id
// 16      20-byte string  info_hash
// 36      20-byte string  peer_id
// 56      64-bit integer  downloaded
// 64      64-bit integer  left
// 72      64-bit integer  uploaded
// 80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
// 84      32-bit integer  IP address      0 // default
// 88      32-bit integer  key             ? // random
// 92      32-bit integer  num_want        -1 // default
// 96      16-bit integer  port            ? // should be between 6881 and 6889
// 98

const buildAnnounceReq = (connId, torrent, port = 6881) => {
  const buf = Buffer.allocUnsafe(98);

//   connection-id
  connId.copy(buf, 0);
//   action
  buf.writeUInt32BE(1, 8);
//   transaction-id
  crypto.randomBytes(4).copy(buf, 12);
//   info-hash
  infoHash(torrent).copy(buf, 16);
//   peer-id
  genId().copy(buf, 36);
//   downloaded -> means the number of bytes downloaded
  Buffer.alloc(8).copy(buf, 56);
//   left -> means the number of bytes left
  size(torrent).copy(buf, 64);
//   uploaded -> means the number of bytes uploaded
  Buffer.alloc(8).copy(buf, 72);
//   event -> 0: none; 1: completed; 2: started; 3: stopped
  buf.writeUInt32BE(0, 80);
//   IP address -> default
  buf.writeUInt32BE(0, 80);
//   key -> random
  crypto.randomBytes(4).copy(buf, 88);
//   num-want -> means the number of peers you want to get from the tracker
  buf.writeInt32BE(-1, 92);
//   port -> should be between 6881 and 6889
  buf.writeUInt16BE(port, 96);

  return buf;
};

const parseAnnounceReq = (resp) => {
  const group = (iterable, groupSize) => {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  };

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    leechers: resp.readUInt32BE(8),
    seeders: resp.readUInt32BE(12),
    peers: group(resp.slice(20), 6).map((address) => {
      return {
        ip: address.slice(0, 4).join("."),
        port: address.readUInt16BE(4),
      };
    }),
  };
};

export default getPeers;
