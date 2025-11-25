
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

        // ファイル名は必須、その他はオプション
        if (values.length >= 1 && values[0]) {
            const fileName = values[0]
            const author = values[1] || ""
            const license = values[2] || ""
            const licenseUrl = values[3] || ""

            // 欠損データがある場合は警告を出力
            const missing = []
            if (!author) missing.push("author")
            if (!license) missing.push("license")
            if (!licenseUrl) missing.push("licenseUrl")
            if (missing.length > 0) {
                console.warn(`警告: meta.csv の ${fileName} の行に欠損データがあります: ${missing.join(", ")}`)
            }

            metaMap.set(fileName, { author, license, licenseUrl })
        } else {
            console.warn(`警告: 行 ${i + 1} はファイル名が欠損しているためスキップしました`)
        }
    }

    return metaMap
}

const listFiles = async (dir, metaMap) => {
    const files = await fs.readdir(dir)
    return files.map((file) => {
        console.log(file)
        const fileName = path.basename(file)
        const meta = metaMap.get(fileName)

        // meta.csvにデータが存在しない場合は警告を出力
        if (!meta) {
            console.warn(`警告: ${fileName} は画像ファイルとして存在しますが、meta.csv にデータがありません`)
            return {
                name: fileName,
                url: path.join(dir, file),
                author: "",
                license: "",
                licenseUrl: "",
            }
        }

        return {
            name: fileName,
            url: path.join(dir, file),
            author: meta.author,
            license: meta.license,
            licenseUrl: meta.licenseUrl,
        }
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
await fs.writeFile(outputJsonPath, JSON.stringify(images, null, 2))
