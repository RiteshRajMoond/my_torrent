"use stict";

import fs from "fs";
import bencode from "bencode";

const open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

const size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files
        .map((file) => BigInt(file.length))
        .reduce((a, b) => a + b, BigInt(0))
    : BigInt(torrent.info.length);

  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(size, 0);
  return buf;
};

const infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash("sha1").update(info).digest();
};

export { open, size, infoHash };
