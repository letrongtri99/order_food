import { getAccessToken } from '../shared/accessToken'

export const isAuth = () => {
    const data = getAccessToken()
    return data
};