import { Product } from './../entities/Product'
import { Store } from './../entities/Store'
import {
  Arg,
  Ctx,
  Field,
  // FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver
  // Root,
  // UseMiddleware,
} from 'type-graphql'
import { GraphQLUpload, FileUpload } from 'graphql-upload'
import { createWriteStream } from 'fs'
import { getConnection, Like } from 'typeorm'
import { MyContext } from '../types'
import argon2 from 'argon2'
const sqlString = require('sqlstring')
const slug = require('slug')
import StoreReposistory from '../reposistories/StoreReposistory'
import { StateInput } from '../utils/stateTable'
import { validRegister } from './../utils/validateRegister'
import { EmailPasswordInput } from './EmailPasswordInput'
import { createAccessToken, createRefreshToken } from './../utils/auth'

@ObjectType()
class FieldErrorStore {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class StoreResponse {
  @Field(() => [FieldErrorStore], { nullable: true })
  errors?: FieldErrorStore[]

  @Field(() => Store, { nullable: true })
  store?: Store

  @Field(() => String, { nullable: true })
  accessToken?: string

  @Field(() => String, { nullable: true })
  slug?: string
}

@InputType()
class StoreInput {
  @Field()
  name: string
  @Field()
  slug_name?: string
}

@ObjectType()
class PaginatedStores {
  @Field(() => [Store])
  stores: Store[]
  @Field()
  total: number
}

@ObjectType()
class StoreAndProduct {
  @Field(() => Store)
  store?: Store
  @Field(() => [Product])
  products: Product[]
}

@Resolver(Store)
export class StoreResolver {
  @Mutation(() => Store)
  async createStore(@Arg('input') input: StoreInput, @Ctx() { }: MyContext): Promise<Store> {
    input.slug_name = slug(input.name)
    return Store.create(input).save()
  }

  @Mutation(() => StoreResponse)
  async registerStore(
    @Arg('options') options: EmailPasswordInput,
    @Arg('avatar', () => GraphQLUpload) { createReadStream, filename }: FileUpload
  ): Promise<StoreResponse> {
    let store
    const errors = validRegister(options)
    if (errors) {
      return { errors }
    }

    let checkStoreExists = await Store.findOne({ email: options.email })
    if (checkStoreExists) {
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
            store = await Store.create({
              ...options,
              password: pass,
              promotion: 'freeship',
              slug_name: slug(options.name),
              avatar: `/images/${filename}`
            }).save()
            return resolve({ store })
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

  @Query(() => PaginatedStores)
  async stores(@Arg('state') state: StateInput): Promise<PaginatedStores> {
    let sorting = state.sorting
    let column = sorting.column
    let sortOrder = sorting.direction
    let paginator = state.paginator
    let pageSize = paginator.pageSize ? paginator.pageSize : 40
    let page = paginator.page
    let skip = pageSize * (page - 1)

    // Search
    let searchTerm = state.searchTerm
    let sqlSearchTerm = sqlString.escape('%' + searchTerm + '%')

    let searchFilter = ''
    let sortField = ''
    sortField = StoreReposistory.generateSortField(column, sortOrder)

    searchFilter =
      searchTerm != ''
        ? `
            AND s.name LIKE  ${sqlSearchTerm}
			OR s.address LIKE ${sqlSearchTerm}
			`
        : ''

    // Filter
    let filter = state.filter
    let categoryFilter = filter.category || null
    let districtFilter = filter.district || null

    if (categoryFilter && categoryFilter.length > 0) {
      searchFilter += ` AND cs.name IN (${sqlString.escape(categoryFilter)}) `
    }

    if (districtFilter && districtFilter.length > 0) {
      searchFilter += ` AND s.district IN (${sqlString.escape(districtFilter)}) `
    }

    let querystr = `
            INNER JOIN category_store as cs
			ON cs.id = s.categoryId
			WHERE s.is_active <> 0
			${searchFilter}`

    let queryStringFind = `
			SELECT
				cs.name as category,
                s.id,
				s.name,
                s.address,
                s.district,
                s.phone,
                s.longtitude,
                s.latitude,
                s.promotion,
                s.avatar,
                s.slug_name
			FROM
				store as s
			${querystr}
			ORDER BY ${sortField}
			LIMIT ${pageSize} OFFSET ${skip}
		`

    let queryStringCount = `
			SELECT COUNT(*) as total
			FROM
                store as s
			${querystr}
		`

    let stores = await getConnection().query(queryStringFind)
    let total = await getConnection().query(queryStringCount)

    return {
      stores,
      total: total[0].total
    }
  }

  @Query(() => [Store])
  async searchStores(
    @Arg('searchTerm', () => String) searchTerm: string
  ): Promise<Store[] | undefined> {
    if (!searchTerm) return []
    let stores = await Store.find({
      where: [
        { address: Like(`%${searchTerm}%`) },
        { name: Like(`%${searchTerm}%`) },
        { district: Like(`%${searchTerm}%`) }
      ],
      order: {
        name: 'ASC',
        createdAt: 'DESC'
      },
      take: 5
    })

    return stores
  }

  @Query(() => StoreAndProduct, { nullable: true })
  async store(@Arg('slug', () => String) slug_name: string): Promise<StoreAndProduct> {
    const store = await Store.findOne({ slug_name })
    const products = await getConnection()
      .getRepository(Product)
      .createQueryBuilder('p')
      .where('p.storeId = :id ', { id: store?.id })
      .andWhere('p.isDeleted = 0')
      .getMany()

    return {
      store,
      products
    }
  }

  @Mutation(() => Store, { nullable: true })
  async updateStore(
    @Arg('id', () => Int) id: number,
    @Arg('input') input: StoreInput
  ): Promise<Store | null> {
    const store = await Store.update({ id }, { ...input }).then((response) => response.raw[0])
    return store
  }

  @Mutation(() => Boolean)
  async deleteStore(@Arg('id', () => Int) id: number): Promise<boolean> {
    // not cascade way
    const store = await Store.findOne(id)
    if (!store) {
      throw new Error('no Store')
    }

    await Store.update({ id }, { isDeleted: 1 })
    return true
  }

  @Query(() => PaginatedStores)
  async specialStores(@Arg('state') state: StateInput): Promise<PaginatedStores> {
    let sorting = state.sorting
    let column = sorting.column
    let sortOrder = sorting.direction
    let paginator = state.paginator
    let pageSize = paginator.pageSize ? paginator.pageSize : 40
    let page = paginator.page
    let skip = pageSize * (page - 1)

    // Search
    let searchTerm = state.searchTerm
    let sqlSearchTerm = sqlString.escape('%' + searchTerm + '%')

    let searchFilter = ''
    let sortField = ''
    sortField = StoreReposistory.generateSortField(column, sortOrder)

    searchFilter =
      searchTerm != ''
        ? `
            AND s.name LIKE  ${sqlSearchTerm}
			OR s.address LIKE ${sqlSearchTerm}
			`
        : ''

    // Filter
    let filter = state.filter
    let categoryFilter = filter.category || null
    let districtFilter = filter.district || null

    if (categoryFilter && categoryFilter.length > 0) {
      searchFilter += ` AND cs.name IN (${sqlString.escape(categoryFilter)}) `
    }

    if (districtFilter && districtFilter.length > 0) {
      searchFilter += ` AND s.district IN (${sqlString.escape(districtFilter)}) `
    }

    let querystr = `
            INNER JOIN category_store as cs
			ON cs.id = s.categoryId
			WHERE s.is_active <> 0
			${searchFilter}`

    let queryStringFind = `
			SELECT
				cs.name as category,
                s.id,
				s.name,
                s.address,
                s.district,
                s.phone,
                s.longtitude,
                s.latitude,
                s.promotion,
                s.avatar,
                s.slug_name
			FROM
				store as s
			${querystr}
			ORDER BY ${sortField}
			LIMIT ${pageSize} OFFSET ${skip}
		`

    let queryStringCount = `
			SELECT COUNT(*) as total
			FROM
                store as s
			${querystr}
		`

    let stores = await getConnection().query(queryStringFind)
    let total = await getConnection().query(queryStringCount)

    return {
      stores,
      total: total[0].total
    }
  }

  @Mutation(() => StoreResponse)
  async loginStore(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<StoreResponse> {
    const store = await Store.findOne({ where: { email } })
    if (!store) {
      return {
        errors: [
          {
            field: 'email',
            message: 'Email not exist'
          }
        ]
      }
    }

    const valid = await argon2.verify(store.password, password)
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

    let role = 'store'
    res.cookie('jid', createRefreshToken(store, role), {
      httpOnly: true
    })
    return {
      store,
      accessToken: createAccessToken(store, role),
      slug: store.slug_name
    }
  }
}
