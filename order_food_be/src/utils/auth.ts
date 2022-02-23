import { Delivery } from './../entities/Delivery'
import { Customer } from './../entities/Customer'
import { Store } from './../entities/Store'
import { sign } from 'jsonwebtoken'

export const createAccessToken = (user: Customer | Delivery | Store, role: string) => {
  return sign({ id: user.id, role }, process.env.TOKEN_SECRET, {
    expiresIn: '1d'
  })
}

export const createRefreshToken = (user: Customer | Delivery | Store, role: string) => {
  return sign({ id: user.id, role }, process.env.TOKEN_SECRET, {
    expiresIn: '7d'
  })
}
