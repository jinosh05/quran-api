const fs = require('fs/promises')
const fsSync = require('fs')
const path = require('path')

let pathToDir = path.join(__dirname, 'qextract')
let pathToSave = path.join(__dirname, 'qclean')


// lists all files and directories in folder, returns full path
async function listDirRecursive(pathToDir, onlyFiles, onlyDir) {
    let result = await fs.readdir(pathToDir, { withFileTypes: true, recursive: true })
    if (onlyFiles)
        result = result.filter(e => e.isFile())
    else if (onlyDir)
        result = result.filter(e => e.isDirectory())

    return result.map(e => path.join(e.parentPath, e.name))

}

async function begin() {
    let filesWithPath = await listDirRecursive(pathToDir, true)
    for (let filePath of filesWithPath) {
        let fileName = path.basename(filePath)
        let foldername = filePath.split(path.sep).at(-4)
        if (/\-\d{6}\-/gi.test(fileName)) {
            let newFileName = fileName.match(/\-(\d{6})\-/i)[1] + fileName.match(/\..*?$/i)[0]
            let pathToCopy = path.join(pathToSave, foldername)
            await fs.mkdir(pathToCopy, { recursive: true })
            await fs.copyFile(filePath, path.join(pathToCopy, newFileName))
        }
    }
}
begin()