const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const fs = require('fs/promises')
const fsSync = require('fs')
const path = require('path')

let zipFilesPath = path.join(__dirname, 'qcomplex audios')
let pathToSave = path.join(__dirname, 'qextract')

// Returns files path in Array
async function extractWith7zip(pathToZip, pathToSave, password) {
    let passwordWithFlag = ` -p${password}`
    await fs.mkdir(pathToSave, { recursive: true })
    await exec(`"C:\\Program Files\\7-Zip\\7z.exe" x -y "${pathToZip}" -o"${pathToSave}"${password ? passwordWithFlag : ''}`).catch(console.error)
}

async function begin() {
    for (let zipFile of (await fs.readdir(zipFilesPath)))
        await extractWith7zip(path.join(zipFilesPath, zipFile), path.join(pathToSave, zipFile.replace(/\..*?$/gi, "") ))
}
begin()