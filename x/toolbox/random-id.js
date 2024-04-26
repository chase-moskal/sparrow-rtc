export function randomId(size = 8) {
    const palette = [..."0123456789abcdef"];
    const paletteLength = palette.length;
    let id = "";
    for (let i = 0; i < size; i += 1) {
        const paletteIndex = Math.floor(Math.random() * paletteLength);
        id += palette[paletteIndex];
    }
    return id;
}
//# sourceMappingURL=random-id.js.map