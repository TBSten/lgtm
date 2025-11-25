
import * as fs from "node:fs/promises"
import * as path from "node:path"

// 画像ファイル一覧を templates/images.json に出力

const outputJsonPath = "templates/images.json"

// meta.csv を読み込んでメタデータを取得
const loadMetaData = async () => {
    const csvContent = await fs.readFile("meta.csv", "utf-8")
    const lines = csvContent.trim().split("\n")
    const headers = lines[0].split(",").map(h => h.trim())
    const metaMap = new Map()

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // CSVのパース（カンマ区切り、ただし引用符内のカンマは考慮しない簡易版）
        const values = line.split(",").map(v => v.trim())
        if (values.length >= 4) {
            const fileName = values[0]
            const author = values[1]
            const license = values[2]
            const licenseUrl = values[3]
            metaMap.set(fileName, { author, license, licenseUrl })
        }
    }

    return metaMap
}

const listFiles = async (dir, metaMap) => {
    const files = await fs.readdir(dir)
    return files.map((file) => {
        console.log(file)
        const fileName = path.basename(file)
        const meta = metaMap.get(fileName) || { author: "", license: "", licenseUrl: "" }
        return ({
            name: fileName,
            url: path.join(dir, file),
            author: meta.author,
            license: meta.license,
            licenseUrl: meta.licenseUrl,
        })
    })
}

const metaMap = await loadMetaData()

const [images500x500, imagesBase] = await Promise.all([
    listFiles("500x500", metaMap),
    listFiles("base", metaMap),
])

const images = {
    "500x500": images500x500,
    "base": imagesBase,
}
await fs.writeFile(outputJsonPath, JSON.stringify(images))
