export function objectMap(input, mapper) {
    const output = {};
    for (const [key, value] of Object.entries(input))
        output[key] = mapper(value, key);
    return output;
}
//# sourceMappingURL=object-map.js.map