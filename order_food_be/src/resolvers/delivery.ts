import argon2 from 'argon2'
import { Resolver, Mutation, Arg, Field, ObjectType, Ctx } from 'type-graphql'
import { GraphQLUpload, FileUpload } from 'graphql-upload'
import { createWriteStream } from 'fs'
import { MyContext } from './../types'
import { Delivery } from './../entities/Delivery'
import { EmailPasswordInput } from './EmailPasswordInput'
import { validRegister } from './../utils/validateRegister'
import { createAccessToken, createRefreshToken } from './../utils/auth'

@ObjectType()
class FieldErrorDelivery {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class DeliveryResponse {
  @Field(() => [FieldErrorDelivery], { nullable: true })
  errors?: FieldErrorDelivery[]

  @Field(() => Delivery, { nullable: true })
  delivery?: Delivery

  @Field(() => String, { nullable: true })
  accessToken?: string
}

@Resolver()
export class DeliveryResolver {
  @Mutation(() => DeliveryResponse)
  async registerDelivery(
    @Arg('options') options: EmailPasswordInput,
    @Arg('avatar', () => GraphQLUpload) { createReadStream, filename }: FileUpload
  ): Promise<DeliveryResponse> {
    let delivery
    const errors = validRegister(options)
    if (errors) {
      return { errors }
    }

    let checkDeliveryExists = await Delivery.findOne({ email: options.email })
    if (checkDeliveryExists) {
      return {
        errors: [
          {
            field: 'Email',
            message: 'Email has already been used. Please change another email!'
          }
        ]
      }
    }

    let path = __dirname.split('/')
    path.pop()
    let newPath = path.join('/')

    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(newPath + `/images/${filename}`))
        .on('finish', async () => {
          try {
            const pass = await argon2.hash(options.password)
            delivery = await Delivery.create({
              ...options,
              password: pass,
              avatarUrl: `/images/${filename}`
            }).save()
            return resolve({ delivery })
          } catch (error) {
            console.log(error.message)
            return resolve({
              errors: [
                {
                  field: 'Unknown',
                  message: 'Value must be written in English! Please check again'
                }
              ]
            })
          }
        })
    )
  }

  @Mutation(() => DeliveryResponse)
  async loginDelivery(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<DeliveryResponse> {
    const delivery = await Delivery.findOne({ where: { email } })
    if (!delivery) {
      return {
        errors: [
          {
            field: 'email',
            message: 'Email not exist'
          }
        ]
      }
    }

    const valid = await argon2.verify(delivery.password, password)
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password is wrong'
          }
        ]
      }
    }

    let role = 'delivery'
    res.cookie('jid', createRefreshToken(delivery, role), {
      httpOnly: true
    })
    return {
      delivery,
      accessToken: createAccessToken(delivery, role)
    }
  }
}
