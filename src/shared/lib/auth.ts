const TOKEN_KEY = "seesaw_token";

/**
 * TEMP auth check. Replace with a real session source (cookie/context/query)
 * once auth is implemented. For now it just looks for a token in localStorage.
 */
export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}
