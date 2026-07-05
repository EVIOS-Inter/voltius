// Windows-Explorer duplicate naming: "name" -> "name - Copy" -> "name - Copy (2)".
export function copyNameCandidate(name: string, isDir: boolean, n: number): string {
  if (n <= 0) return name;
  const suffix = n === 1 ? " - Copy" : ` - Copy (${n})`;
  const dot = isDir ? -1 : name.lastIndexOf(".");
  if (dot <= 0) return name + suffix;               // no ext, or leading-dot name
  return name.slice(0, dot) + suffix + name.slice(dot);
}
