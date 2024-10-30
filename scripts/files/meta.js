
const removeDiacritics = value => value.normalize("NFD").replace(/\p{Diacritic}|\p{Mark}|\p{Extender}|\p{Bidi_Control}/gu, "").replaceAll('ٱ', 'ا')

const fs = require('fs/promises')
const fsSync = require('fs')
const path = require('path')
const readline = require('node:readline')
const stream = require("stream")
const { pipeline } = require('node:stream/promises');

let chaplength = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6]
let lineMappings = {}
let lineCount = 1
for (let i = 1; i <= 114; i++) {
    for (let j = 1; j <= chaplength[i - 1]; j++)
        lineMappings[`${i},${j}`] = lineCount++
}


let pathToDir = path.join(__dirname, 'data')
let arr = []
async function begin() {
    let qText = []
    for (let i = 0; i < 116; i++)
        qText[i] = []

    let data = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranuthmanihaf.json').then(res => res.json())
    data.quran.map(e => qText[e.chapter][e.verse] = e.text)

    let filesWithPath = (await listDirRecursive(pathToDir, true)).sort()
    for (let filePath of filesWithPath) {
        let reciter = filePath.split(path.sep).at(-2)
        let filename = path.parse(filePath).base
        let chapter = parseInt(filename.match(/^\d{3}/)[0])
        let verse = parseInt(filename.match(/\d{3}\./)[0])
        let transcription = removeDiacritics(qText[chapter][verse])
        let text = qText[chapter][verse]
        let line = lineMappings[`${chapter},${verse}`]
        arr.push({ file_name: filePath.split(path.sep).slice(-3).join(path.posix.sep), reciter, transcription, line, chapter, verse, text })
    }

    await saveNDJSON(path.join(__dirname, 'metadata.jsonl'), arr)
}
begin()

// lists all files and directories in folder, returns full path
async function listDirRecursive(pathToDir, onlyFiles, onlyDir) {
    let result = await fs.readdir(pathToDir, { withFileTypes: true, recursive: true })
    if (onlyFiles)
        result = result.filter(e => e.isFile())
    else if (onlyDir)
        result = result.filter(e => e.isDirectory())

    return result.map(e => path.join(e.parentPath, e.name))

}

// the json should be in records format i.e [{column1:value,column2:value},{column1:value,column2:value},...]
async function saveNDJSON(pathToSave, json, append = false) {
    await pipeline(
        stream.Readable.from(json.map(e => JSON.stringify(e) + '\n')),
        fsSync.createWriteStream(pathToSave, { flags: append ? 'a' : 'w' }),
    )
}