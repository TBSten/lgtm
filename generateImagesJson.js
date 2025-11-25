
import * as fs from "node:fs/promises"
import * as path from "node:path"

// 画像ファイル一覧を templates/images.json に出力

const outputJsonPath = "templates/images.json"

// meta.json を読み込んでメタデータを取得
const loadMetaData = async () => {
    try {
        const jsonContent = await fs.readFile("meta.json", "utf-8")
        const metaObject = JSON.parse(jsonContent)
        const metaMap = new Map()

        for (const [fileName, meta] of Object.entries(metaObject)) {
            if (!fileName) {
                console.warn(`警告: meta.json にファイル名が空のエントリがあります`)
                continue
            }

            const author = meta.author || ""
            const license = meta.license || ""
            const licenseUrl = meta.licenseUrl || ""

            // 欠損データがある場合は警告を出力
            const missing = []
            if (!author) missing.push("author")
            if (!license) missing.push("license")
            if (!licenseUrl) missing.push("licenseUrl")
            if (missing.length > 0) {
                console.warn(`警告: meta.json の ${fileName} に欠損データがあります: ${missing.join(", ")}`)
            }

            metaMap.set(fileName, { author, license, licenseUrl })
        }

        return metaMap
    } catch (error) {
        if (error.code === "ENOENT") {
            console.warn("警告: meta.json が見つかりません。メタデータなしで処理を続行します。")
            return new Map()
        }
        throw error
    }
}

const listFiles = async (dir, metaMap) => {
    const files = await fs.readdir(dir)
    return files.map((file) => {
        console.log(file)
        const fileName = path.basename(file)
        const meta = metaMap.get(fileName)

        // meta.jsonにデータが存在しない場合は警告を出力
        if (!meta) {
            console.warn(`警告: ${fileName} は画像ファイルとして存在しますが、meta.json にデータがありません`)
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
