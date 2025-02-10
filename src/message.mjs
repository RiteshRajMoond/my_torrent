"use strict";

import Buffer from "buffer";
import { infoHash } from "./torrent-parser.mjs";
import genId from "./util.mjs";

const buildHandshake = (torrent) => {
  const buf = Buffer.alloc(68);
  buf.writeUInt8(19, 0);
  buf.write("BitTorrent Protocol", 1);
  buf.writeUInt32BE(0, 20);
  buf.writeUInt32BE(0, 24);
  infoHash(torrent).copy(buf, 28);
  genId().copy(buf, 48);
  return buf;
};

const buildKeepAlive = () => Buffer.alloc(4);

const buildChoke = () => {
  constbuf = Buffer.alloc(5);
  buf.writeUInt32BE(1, 0);
  buf.writeUInt8(0, 4);
  return buf;
};

const buildUnChoke = () => {
  const buf = Buffer.alloc(5);
  buf.writeUInt32BE(1, 0);
  buf.writeUInt8(1, 4);
  return buf;
};

const buildIntrested = () => {
  const buf = Buffer.alloc(5);
  buf.writeUInt32BE(1, 0);
  buf.writeUInt8(2, 4);
  return buf;
};

const buildUnintrested = () => {
  const buf = Buffer.alloc(5);
  buf.writeUInt32BE(1, 0);
  buf.writeInt8(3, 4);
  return buf;
};

const buildHave = (payload) => {
  const buf = Buffer.alloc(9);
  buf.writeUInt32BE(5, 0);
  buf.writeUInt8(4, 4);
  buf.writeUInt32BE(payload, 5);
  return buf;
};

const buildBitfield = (bitfield) => {
  const buf = Buffer.alloc(14);
  buf.writeUInt32BE(1 + bitfield.length, 0);
  buf.writeUInt8(5, 4);
  bitfield.copy(buf, 5);
  return buf;
};

const buildRequest = (payload) => {
  const buf = Buffer.alloc(17);
  buf.writeUInt32BE(13, 0);
  buf.writeUInt8(6, 4);
  buf.writeUInt32BE(payload.index, 5);
  buf.writeUInt32BE(payload.begin, 9);
  buf.writeUInt32BE(payload.length, 13);
  return buf;
};

const buildPiece = (payload) => {
  const buf = Buffer.alloc(13 + payload.block.length);
  buf.writeUInt32BE(9 + payload.block.length, 0);
  buf.writeUInt8(7, 4);
  buf.writeUInt32BE(payload.index, 5);
  buf.writeUInt32BE(payload.begin, 9);
  payload.block.copy(buf, 13);
  return buf;
};

const buildCancel = (payload) => {
  const buf = Buffer.alloc(17);
  buf.writeUInt32BE(13, 0);
  buf.writeUInt8(8, 4);
  buf.writeUInt32BE(payload.index, 5);
  buf.writeUInt32BE(payload.begin, 9);
  buf.writeUInt32BE(payload.length, 13);
  return buf;
};

const buildPort = (payload) => {
  const buf = Buffer.alloc(7);
  buf.writeUInt32BE(3, 0);
  buf.writeUInt8(9, 4);
  buf.writeUInt16BE(payload, 5);
  return buf;
};

export {
  buildBitfield,
  buildCancel,
  buildChoke,
  buildHandshake,
  buildHave,
  buildIntrested,
  buildKeepAlive,
  buildPiece,
  buildPort,
  buildRequest,
  buildUnChoke,
  buildUnintrested,
};
