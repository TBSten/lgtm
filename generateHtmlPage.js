
import * as fs from "node:fs/promises"
import * as path from "node:path"

// 画像ファイル一覧を templates/images.json に出力

const outputJsonPath = "templates/images.json"

const listFiles = async (dir) => {
    const files = await fs.readdir(dir)
    return files.map((file) => {
        console.log(file)
        return ({
            name: path.basename(file),
            url: path.join(dir, file),
        })
    })
}

const [images500x500, imagesBase] = await Promise.all([
    listFiles("500x500"),
    listFiles("base"),
])

const images = [...images500x500, imagesBase]
await fs.writeFile(outputJsonPath, JSON.stringify(images))
