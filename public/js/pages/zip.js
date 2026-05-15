export function downloadAsZip(files, archiveName) {
  const encoder = new TextEncoder();
  const localBlocks = [];
  const centralBlocks = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(content || '');
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0x0800, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, size, true);
    dv.setUint32(22, size, true);
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    localBlocks.push(local);
    localBlocks.push(dataBytes);

    const central = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(central.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0x0800, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, 0, true);
    cdv.setUint16(14, 0, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, size, true);
    cdv.setUint32(24, size, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true);
    cdv.setUint16(32, 0, true);
    cdv.setUint16(34, 0, true);
    cdv.setUint16(36, 0, true);
    cdv.setUint32(38, 0, true);
    cdv.setUint32(42, offset, true);
    central.set(nameBytes, 46);

    centralBlocks.push(central);
    offset += local.length + dataBytes.length;
  }

  const cdSize = centralBlocks.reduce((s, b) => s + b.length, 0);
  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(4, 0, true);
  edv.setUint16(6, 0, true);
  edv.setUint16(8, centralBlocks.length, true);
  edv.setUint16(10, centralBlocks.length, true);
  edv.setUint32(12, cdSize, true);
  edv.setUint32(16, offset, true);
  edv.setUint16(20, 0, true);

  const blob = new Blob([...localBlocks, ...centralBlocks, eocd], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = archiveName.replace(/\.zip$/, '') + '.zip';
  a.click();
  URL.revokeObjectURL(url);
}

export function readZip(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result;
        const dv = new DataView(buf);
        const len = buf.byteLength;

        // Find EOCD (search backward for PK\x05\x06)
        let eocdPos = -1;
        for (let i = len - 22; i >= 0; i--) {
          if (dv.getUint32(i, true) === 0x06054b50) { eocdPos = i; break; }
        }
        if (eocdPos < 0) { reject(new Error('Not a valid ZIP')); return; }

        const cdOffset = dv.getUint32(eocdPos + 16, true);
        const cdCount = dv.getUint16(eocdPos + 8, true);
        const files = {};

        let cdPos = cdOffset;
        for (let i = 0; i < cdCount; i++) {
          if (dv.getUint32(cdPos, true) !== 0x02014b50) break;
          const nameLen = dv.getUint16(cdPos + 28, true);
          const extraLen = dv.getUint16(cdPos + 30, true);
          const commentLen = dv.getUint16(cdPos + 32, true);
          const localOffset = dv.getUint32(cdPos + 42, true);
          const compSize = dv.getUint32(cdPos + 20, true);
          const uncompSize = dv.getUint32(cdPos + 24, true);
          const method = dv.getUint16(cdPos + 10, true);

          const nameBytes = new Uint8Array(buf, cdPos + 46, nameLen);
          const name = new TextDecoder().decode(nameBytes);
          if (name.endsWith('/')) { cdPos += 46 + nameLen + extraLen + commentLen; continue; }

          // Read local file data — read extraLen from local header too
          const localExtraLen = dv.getUint16(localOffset + 28, true);
          const localHdr = localOffset + 30 + nameLen + localExtraLen;
          const raw = new Uint8Array(buf, localHdr, compSize);

          if (method === 0) {
            files[name] = new TextDecoder().decode(raw);
          }
          cdPos += 46 + nameLen + extraLen + commentLen;
        }
        resolve(files);
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
