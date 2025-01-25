
// refs: https://stackoverflow.com/questions/194846/is-there-hash-code-function-accepting-any-object-type
function hashCode(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        const code = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

(async () => {
    const { "500x500": images500x500, "base": imagesBase } = await fetch("./images.json")
        .then(r => r.json())
    globalThis.images500x500 = images500x500
    globalThis.images500x500 = imagesBase

    // Generate on random button click

    const randomButton = document.getElementById("random")
    randomButton.addEventListener("click", () => {
        const randomName = document.getElementById("random-name")
        const randomImage = document.getElementById("random-image")
        const randomMarkdown = document.getElementById("random-markdown")
        const selectedImage = images500x500[Math.floor(Math.random() * images500x500.length)]
        console.log(selectedImage)
        randomName.innerText = selectedImage.name
        randomImage.src = selectedImage.url
        randomImage.alt = selectedImage.name
        randomMarkdown.value = `<img src="https://tbsten.github.io/lgtm/${selectedImage.url}" width="100" alt="${selectedImage.name}"/>`
    })
    randomButton.click()

    // set LGTMs table content

    const tbody = document.getElementById("lgtms-tbody")
    images500x500.map((image) => {
        console.log(image)
        const tr = document.createElement("tr")
        tr.innerHTML = `
    <td><a href="${image.url}">${image.name}</a></td>
    <td>
        <a href="${image.url}">
            <img src="https://tbsten.github.io/lgtm/${image.url}" alt="${image.name}" width="150" />
        </a>
    </td>
    <td>
        <textarea id="markdown-${hashCode(image.name)}"></textarea>
    </td>
    `
        tbody.appendChild(tr)
        const markdown = document.getElementById(`markdown-${hashCode(image.name)}`)
        markdown.value = `<img src="https://tbsten.github.io/lgtm/${image.url}" width="100" name="${image.name}">`
    })

})()

