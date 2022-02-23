import { StateInput } from './../utils/stateTable'
import { Product } from './../entities/Product'
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
  Resolver,
  UseMiddleware
  // Root,
  // UseMiddleware,
} from 'type-graphql'
// import { getConnection } from "typeorm";
import { GraphQLUpload, FileUpload } from 'graphql-upload'
import { createWriteStream } from 'fs'
import { MyContext } from '../types'
import { getConnection } from 'typeorm'
import ProductReposistory from '../reposistories/ProductReposistory'
import { isAuth } from '../utils/isAuth'
import { Store } from '../entities/Store'

@InputType()
class ProductInput {
  @Field({ nullable: true })
  name?: string
  @Field({ nullable: true })
  description?: string
  @Field({ nullable: true })
  category?: string
  @Field({ nullable: true })
  price?: number
}

@ObjectType()
class PaginatedProducts {
  @Field(() => [Product])
  products: Product[]
  @Field()
  total: number
}
@Resolver(Product)
export class ProductResolver {
  @Mutation(() => Product)
  @UseMiddleware(isAuth)
  async createProduct(
    @Arg('input') input: ProductInput,
    @Arg('imgUrl', () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
    @Ctx() { payload }: MyContext,
  ): Promise<Product> {
    let path = __dirname.split('/')
    path.pop()
    let newPath = path.join('/')

    let writeImg = await createReadStream().pipe(createWriteStream(newPath + `/images/${filename}`))
    const store = await Store.findOne({ id: payload?.id })
    const product = new Product()
    if (store) {
      product.store = store
      product.name = input.name || ''
      product.category = input.category || ''
      product.imgUrl = `/images/${filename}`
      product.price = input.price || 0
      product.description = input.description || ''
      product.sale = "NO PROMOTION"
      return Product.save(product)
    }

    return product


  }

  @Query(() => [Product])
  async products(@Arg('storeId', () => Int) storeId: number): Promise<Product[]> {
    const products = await getConnection()
      .getRepository(Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.store', 'store')
      .where('product.store = :storeId', { storeId })
      .getMany()

    return products
  }

  @Mutation(() => Product)
  product(@Arg('id', () => Int) id: number): Promise<Product | undefined> {
    return Product.findOne(id)
  }

  @Mutation(() => Product, { nullable: true })
  async updateProduct(
    @Arg('id', () => Int) id: number,
    @Arg('input') input: ProductInput
  ): Promise<Product | null> {
    const product = await Product.update({ id }, { ...input }).then((response) => response.raw[0])
    return product
  }

  @Mutation(() => Boolean)
  async updateImgProduct(
    @Arg('id', () => Int) id: number,
    @Arg('imgUrl', () => GraphQLUpload)
    { createReadStream, filename }: FileUpload
  ): Promise<boolean> {
    console.log(filename)
    let path = __dirname.split('/')
    path.pop()
    let newPath = path.join('/')

    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(newPath + `/images/${filename}`))
        .on('finish', async () => {
          const product = await Product.update({ id }, { imgUrl: `/images/${filename}` }).then(
            (response) => response.raw[0]
          )
          return resolve(true)
        })
    )
  }

  @Mutation(() => Boolean)
  async deleteProduct(@Arg('id', () => Int) id: number): Promise<boolean> {
    // not cascade way
    const product = await Product.findOne(id)
    if (!product) {
      throw new Error('no product')
    }
    // if (post.creatorId !== req.session.userId) {
    //   throw new Error("not authorized");
    // }

    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });

    await Product.update({ id }, { isDeleted: 1 })
    return true
  }

  @Query(() => PaginatedProducts)
  async listProducts(
    @Arg('storeId', () => Int) storeId: number,
    @Arg('state') state: StateInput
  ): Promise<PaginatedProducts> {
    let sorting = state.sorting
    let column = sorting.column
    let sortOrder = sorting.direction
    let converSortOrder = sortOrder == 'ascend' ? 'asc' : 'desc'
    let paginator = state.paginator
    let pageSize = paginator.pageSize ? paginator.pageSize : 40
    let page = paginator.page
    let skip = pageSize * (page - 1)

    // Search

    let searchFilter = ''
    let sortField = ''
    sortField = ProductReposistory.generateSortField(column, converSortOrder)

    // searchFilter = searchTerm != '' ? `
    //     AND s.name LIKE  ${sqlSearchTerm}
    // 	OR s.address LIKE ${sqlSearchTerm}
    // 	`
    //     : ''

    // Filter
    // let filter = state.filter

    // let querystr = `
    //     INNER JOIN store AS s ON o.storeId = s.id
    //     INNER JOIN customer AS c ON o.customerId = c.id
    //         ${searchFilter}`
    let querystr = `
                WHERE p.storeId = ${storeId}
                AND p.isDeleted = 0
                ${searchFilter}`

    let queryStringFind = `
                SELECT
                    *
                FROM
                    \`product\` as p
                ${querystr}
                ORDER BY ${sortField}
                LIMIT ${pageSize} OFFSET ${skip}
            `

    let queryStringCount = `
                SELECT COUNT(*) as total
                FROM
                    \`product\` as p
                ${querystr}
            `

    let products = await getConnection().query(queryStringFind)
    let total = await getConnection().query(queryStringCount)

    return {
      products,
      total: total[0].total
    }
  }
}
