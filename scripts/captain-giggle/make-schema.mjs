import fs from 'node:fs';
const source=new URL('../../docs/captain-giggle/scene-schema.json',import.meta.url);
fs.copyFileSync(source,process.argv[2]);
