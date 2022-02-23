let accessToken = ''

export const setAccessToken = (key: string) => {
  accessToken = key
}

export const getAccessToken = () => {
  return accessToken
}
