export function formatName(name: string) {
    const firstLetter = name.charAt(0).toUpperCase();
    if (name.indexOf(" ") === -1) {
        return firstLetter + name.slice(1);
    }
    return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
