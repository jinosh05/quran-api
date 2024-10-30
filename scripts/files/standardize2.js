const fs = require('fs/promises')
const path = require('path')

let pathToDir = path.join(__dirname, 'downextract')


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
     //   if (!/^\d{6}/gi.test(fileName)) 
         if(path.parse(filePath).name.endsWith("000"))
            await fs.rm(filePath, {recursive:true, force:true})
      //  console.log(filePath)
            
        
    }
}
begin()