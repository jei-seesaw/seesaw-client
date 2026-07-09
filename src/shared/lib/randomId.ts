/**
 * RFC4122 v4 UUID를 생성한다.
 *
 * `crypto.randomUUID`는 보안 컨텍스트(HTTPS/localhost)에서만 제공되므로,
 * LAN IP나 http로 접속한 경우엔 존재하지 않는다. 이럴 땐 `crypto.getRandomValues`
 * 기반 fallback을 사용하고, 그마저 없으면 Math.random으로 최종 대체한다.
 */
export function randomId(): string {
  const c = globalThis.crypto;

  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }

  if (c && typeof c.getRandomValues === "function") {
    const bytes = c.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
