export function randomId() {
    let id = "";
    for (let i = 0; i < 8; i++) {
        id += randomSample(hex);
    }
    return id;
}
function randomSample(space) {
    const index = Math.floor(Math.random() * space.length);
    return space[index];
}
const hex = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
];
//# sourceMappingURL=random-id.js.map