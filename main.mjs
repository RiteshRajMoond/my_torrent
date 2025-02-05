"use strict";

import bencode from "bencode";

import fs from "fs";
import dgram from "dgram";
import { Buffer } from "buffer";

const torrent = bencode.decode(fs.readFileSync("my_torrent.torrent"));

const announceUrl = torrent.announce
  .toString("utf8")
  .split(",")
  .map((code) => String.fromCharCode(code))
  .join("");

const url = new URL(announceUrl);

const socket = dgram.createSocket("udp4");
const myMsg = Buffer.from(
  "Hare Krsna Hare Krsna Krsna Krsna Hare Hare Hare Rama Hare Rama Rama Rama Hare Hare",
  "utf8"
);

socket.send(myMsg, 0, myMsg.length, url.port, url.host, () => {});

socket.on('message', msg => {
    console.log("Message recieved is: ", msg);
})