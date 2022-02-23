import { isAuth } from './../utils/isAuth'
import argon2 from 'argon2'
import { Resolver, Query, Mutation, Arg, Field, ObjectType, Ctx, UseMiddleware } from 'type-graphql'
import { GraphQLUpload, FileUpload } from 'graphql-upload'
import { createWriteStream } from 'fs'
import { MyContext } from './../types'
import { Customer } from './../entities/Customer'
import { Delivery } from './../entities/Delivery'
import { Store } from './../entities/Store'
import { EmailPasswordInput } from './EmailPasswordInput'
import { validRegister } from './../utils/validateRegister'
import { Order } from './../entities/Order'
import { StateInput } from '../utils/stateTable'
import OrderReposistory from '../reposistories/OrderReposistory'
import { getConnection } from 'typeorm'
import { createAccessToken, createRefreshToken } from './../utils/auth'

const moment = require('moment')
const sqlString = require('sqlstring')

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class CustomerResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => Customer, { nullable: true })
  customer?: Customer

  @Field(() => String, { nullable: true })
  accessToken?: string
}
@ObjectType()
class Profile extends Customer {
  @Field(() => String, { nullable: true })
  slug_name?: string
}

@ObjectType()
class HistoryOrder extends Order {
  @Field()
  store_name: string
  @Field()
  store_address: string
  @Field({ nullable: true })
  delivery_name?: string
}

@ObjectType()
class PaginatedOrdersHistory {
  @Field(() => [HistoryOrder])
  ordersHistory: HistoryOrder[]
  @Field()
  total: number
}

@Resolver()
export class CustomerResolver {
  @Mutation(() => CustomerResponse)
  async registerCustomer(
    @Arg('options') options: EmailPasswordInput,
    @Arg('avatar', () => GraphQLUpload) { createReadStream, filename }: FileUpload
  ): Promise<CustomerResponse> {
    let customer
    const errors = validRegister(options)
    if (errors) {
      return { errors }
    }

    let checkCustomerExists = await Customer.findOne({ email: options.email })
    if (checkCustomerExists) {
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
            customer = await Customer.create({
              ...options,
              password: pass,
              avatarUrl: `/images/${filename}`
            }).save()
            return resolve({ customer })
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

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    return `Your user id is ${payload?.id}`
  }

  @Query(() => Profile)
  @UseMiddleware(isAuth)
  async getProfile(@Ctx() { payload }: MyContext) {
    let user
    switch (payload?.role) {
      case 'customer':
        user = await Customer.findOne(payload?.id)
        break
      case 'delivery':
        user = await Delivery.findOne(payload?.id)
        break
      case 'store':
        user = await Store.findOne(payload?.id)
        user = { avatarUrl: user?.avatar, slug_name: user?.slug_name, ...user }
        break
      default:
        break
    }

    return user
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async updateProfile(
    @Arg('name') name: string,
    @Arg('phone') phone: string,
    @Arg('gender') gender: string,
    @Ctx() { payload }: MyContext
  ) {
    try {
      switch (payload?.role) {
        case 'customer':
          await Customer.update({ id: payload?.id }, { name, phone, gender })
          break
        case 'delivery':
          await Delivery.update({ id: payload?.id }, { name, phone, gender })
          break
        case 'store':
          await Store.update({ id: payload?.id }, { name, phone })
          break
        default:
          break
      }
    } catch (error) {
      console.log(error)
      return false
    }
    return true
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addProfilePicture(
    @Arg('picture', () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
    @Ctx() { payload }: MyContext
  ): Promise<boolean> {
    let path = __dirname.split('/')
    path.pop()
    let newPath = path.join('/')
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(newPath + `/images/${filename}`))
        .on('finish', async () => {
          switch (payload?.role) {
            case 'customer':
              await Customer.update({ id: payload?.id }, { avatarUrl: `/images/${filename}` })
              break
            case 'delivery':
              await Delivery.update({ id: payload?.id }, { avatarUrl: `/images/${filename}` })
              break
            case 'store':
              await Store.update({ id: payload?.id }, { avatar: `/images/${filename}` })
              break
            default:
              break
          }
          resolve(true)
        })
        .on('error', (error) => {
          console.log(error)
          reject(false)
        })
    )
  }

  @Query(() => PaginatedOrdersHistory)
  @UseMiddleware(isAuth)
  async ordersHistory(
    @Arg('state') state: StateInput,
    @Ctx() { payload }: MyContext
  ): Promise<PaginatedOrdersHistory> {
    let sorting = state.sorting
    let column = sorting.column
    let sortOrder = sorting.direction
    let converSortOrder = sortOrder == 'ascend' ? 'asc' : 'desc'
    let paginator = state.paginator
    let pageSize = paginator.pageSize ? paginator.pageSize : 40
    let page = paginator.page
    let skip = pageSize * (page - 1)

    let searchFilter = ''
    let sortField = ''
    sortField = OrderReposistory.generateSortField(column, converSortOrder)

    //FILTER
    let filter = state.filter
    let from_date = filter.from_date
    let to_date = filter.to_date
    let order_status = filter.order_status
    searchFilter += ` AND ( o.createdAt BETWEEN '${moment(from_date, 'YYYY/MM/DD').format(
      'YYYY-MM-DD'
    )}' AND '${moment(to_date, 'YYYY/MM/DD').format(
      'YYYY-MM-DD'
    )}' ) AND o.order_status IN (${sqlString.escape(order_status)})`

    let querystr = `
        INNER JOIN store AS s ON o.storeId = s.id
        LEFT JOIN delivery AS d ON o.deliveryId = d.id
      `

    let queryStringFind = `
			SELECT
				        o.id,
                o.order_id,
                o.order_status,
                o.price,
                o.notes,
                o.address,
                o.createdAt,
                o.deliveryId,
                o.customerId,
                o.pickedAt,
                o.arrivedAt,
				s.name as store_name,
                s.address as store_address,
                d.name as delivery_name
			FROM \`order\` as o
			${querystr}
      WHERE o.customerId = ${payload?.id}${searchFilter}
			ORDER BY ${sortField}
			LIMIT ${pageSize} OFFSET ${skip}
		`

    let queryStringCount = `
			SELECT COUNT(*) as total
			FROM
                \`order\` as o
			${querystr}
      WHERE o.customerId = ${payload?.id}${searchFilter}
		`

    let ordersHistory = await getConnection().query(queryStringFind)
    ordersHistory.forEach((e: Order) => {
      e.createdAt = moment(e.createdAt).tz('Asia/Bangkok').format('MM/DD/YYYY hh:mm')
      e.pickedAt = e.pickedAt
        ? moment(e.pickedAt).tz('Asia/Bangkok').format('MM/DD/YYYY hh:mm')
        : ''
      e.arrivedAt = e.arrivedAt
        ? moment(e.arrivedAt).tz('Asia/Bangkok').format('MM/DD/YYYY hh:mm')
        : ''
    })

    let total = await getConnection().query(queryStringCount)

    return {
      ordersHistory,
      total: total[0].total
    }
  }

  @Mutation(() => CustomerResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<CustomerResponse> {
    const customer = await Customer.findOne({ where: { email } })
    if (!customer) {
      return {
        errors: [
          {
            field: 'email',
            message: 'Email not exist'
          }
        ]
      }
    }

    const valid = await argon2.verify(customer.password, password)
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

    let role = 'customer'
    res.cookie('jid', createRefreshToken(customer, role), {
      httpOnly: true
    })
    return {
      customer: customer,
      accessToken: createAccessToken(customer, role)
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updatePassword(
    @Arg('oldPassword') oldPassword: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { payload }: MyContext
  ): Promise<Boolean> {
    switch (payload?.role) {
      case 'customer':
        let customer = await Customer.findOne(payload?.id)
        const validCustomer = await argon2.verify(customer?.password!, oldPassword)
        if (!validCustomer) {
          return false
        }

        const newPassCustomer = await argon2.hash(newPassword)

        await Customer.update({ id: payload?.id }, { password: newPassCustomer })

        break
      case 'delivery':
        let delivery = await Delivery.findOne(payload?.id)
        const validDelivery = await argon2.verify(delivery?.password!, oldPassword)
        if (!validDelivery) {
          return false
        }

        const newPassDelivery = await argon2.hash(newPassword)

        await Delivery.update({ id: payload?.id }, { password: newPassDelivery })

        break
      case 'store':
        let store = await Store.findOne(payload?.id)
        const validStore = await argon2.verify(store?.password!, oldPassword)
        if (!validStore) {
          return false
        }

        const newPassStore = await argon2.hash(newPassword)

        await Store.update({ id: payload?.id }, { password: newPassStore })

        break
      default:
        break
    }

    return true
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    res.cookie('jid', '', {
      httpOnly: true
    })
    return true
  }
}
