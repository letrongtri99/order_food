import { EmailPasswordInput } from './../resolvers/EmailPasswordInput'

const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const validRegister = (options: EmailPasswordInput) => {
  if (!regexEmail.test(options.email.toLowerCase())) {
    return [
      {
        field: 'email',
        message: 'invalid email'
      }
    ]
  }
  return null
}
