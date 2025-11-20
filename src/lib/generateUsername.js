export function generateUsername(name) {
  const base = name.replace(/\s+/g, "").toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digits
  return `${base}${randomNum}`;
}
