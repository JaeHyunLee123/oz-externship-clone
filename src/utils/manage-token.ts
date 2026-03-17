export function getAccessToken() {
  return 'ajdfhsnbskgfln;mbdlvjsnkfsgl'
}

export function setAccessToken(token: string) {
  localStorage.setItem('access_token', token)
}

export function clearAccessToken() {
  localStorage.removeItem('access_token')
}
