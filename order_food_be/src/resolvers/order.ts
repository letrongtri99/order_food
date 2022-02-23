import { isAuth } from './../utils/isAuth'
import { Order } from './../entities/Order'
import {
  Arg,
  Ctx,
  Int,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { Customer } from './../entities/Customer'
import { MyContext } from '../types'
import { getConnection } from 'typeorm'
const moment = require('moment')
const sqlString = require('sqlstring')
// const slug = require('slug')
import { StateInput } from '../utils/stateTable'
import OrderReposistory from '../reposistories/OrderReposistory'
import io from '../socket'

@InputType()
class CartItem {
  @Field()
  id: number
  @Field()
  name: string
  @Field()
  quantity: number
  @Field()
  price: number
}

@InputType()
class OrderInput {
  @Field(() => [CartItem])
  order: CartItem[]
  @Field()
  total: number
  @Field()
  shippingFee: number
  @Field()
  storeId: number
}

@ObjectType()
class PaginatedOrders {
  @Field(() => [CustomerOrder])
  orders: CustomerOrder[]
  @Field()
  total: number
}
@ObjectType()
class CustomerOrder extends Order {
  @Field()
  store_name: string
  @Field()
  store_address: string
  @Field()
  store_phone: string
  @Field()
  customer_phone: string
  @Field()
  customer_name: string
  @Field()
  customer_address: string
  @Field()
  customer_gender: string
}
@Resolver(Order)
export class OrderResolver {
  @Mutation(() => Order)
  @UseMiddleware(isAuth)
  async createOrder(
    @Arg('input') input: OrderInput,
    @Ctx() { payload }: MyContext
  ): Promise<Order | null> {
    if (payload) {
      const customer = await Customer.findOne(payload.id)

      let order_id = `${moment(new Date()).format('YYYYMMDD')}${Math.random()
        .toString(36)
        .substr(2, 5)}`
      let orderInfo = {
        order_id,
        latitude: customer ? customer.latitude : 0,
        longtitude: customer ? customer.longtitude : 0,
        address: customer ? customer.address : '',
        order_detail: JSON.stringify(input.order),
        storeId: input.storeId,
        price: input.total,
        shipping_fee: input.shippingFee,
        customerId: payload.id
      }

      io.sockets.emit('new order', 'you have a new order');
      return Order.create(orderInfo).save()
    }
    return null
  }

  @Query(() => PaginatedOrders)
  async orders(@Arg('state') state: StateInput): Promise<PaginatedOrders> {
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
    sortField = OrderReposistory.generateSortField(column, converSortOrder)

    // searchFilter = searchTerm != '' ? `
    //     AND s.name LIKE  ${sqlSearchTerm}
    // 	OR s.address LIKE ${sqlSearchTerm}
    // 	`
    //     : ''

    // Filter
    let filter = state.filter
    let order_status = filter.order_status || null
    if (order_status && order_status.length > 0) {
      searchFilter += ` AND o.order_status IN (${sqlString.escape(order_status)})`
    }

    let querystr = `
        INNER JOIN store AS s ON o.storeId = s.id
        INNER JOIN customer AS c ON o.customerId = c.id
			${searchFilter}`

    let queryStringFind = `
			SELECT
				o.id,
                o.order_id,
                o.order_status,
                o.price,
                o.notes,
                o.createdAt,
                o.order_detail,
                o.address,
                o.shipping_fee,
                o.deliveryId,
                o.customerId,
				s.name as store_name,
                s.address as store_address,
                s.district as store_district,
                s.phone as store_phone,
                c.phone as customer_phone,
                c.name as customer_name,
                c.address as customer_address,
                c.gender as customer_gender
			FROM
				\`order\` as o
			${querystr}
			ORDER BY ${sortField}
			LIMIT ${pageSize} OFFSET ${skip}
		`

    let queryStringCount = `
			SELECT COUNT(*) as total
			FROM
                \`order\` as o
			${querystr}
		`

    let orders = await getConnection().query(queryStringFind)
    orders.forEach((e: Order) => {
      e.createdAt = moment(e.createdAt).tz('Asia/Bangkok').format('MM/DD/YYYY h:mm:ss a')
    })
    let total = await getConnection().query(queryStringCount)

    return {
      orders,
      total: total[0].total
    }
  }

  @Mutation(() => Order, { nullable: true })
  @UseMiddleware(isAuth)
  async updateOrderDelivery(
    @Arg('id', () => Int) id: number,
    @Arg('status', () => Int) status: Order['order_status'],
    @Ctx() { payload }: MyContext
  ): Promise<Order | null> {
    const order = status === 1 ? await Order.update(
      { id },
      { order_status: status, deliveryId: payload?.id, pickedAt: moment(new Date()).format('YYYY-MM-DD hh:mm:ss') }
    ).then((response) => response.raw[0]) : (status === 2) ? await Order.update(
      { id },
      { order_status: status, deliveryId: payload?.id, arrivedAt: moment(new Date()).format('YYYY-MM-DD hh:mm:ss') }
    ).then((response) => response.raw[0]) : await Order.update(
      { id },
      { order_status: status, deliveryId: payload?.id }
    ).then((response) => response.raw[0])

    const orderDetail = await Order.findOne({ id })

    let message = OrderReposistory.generateStatusMessage(orderDetail?.order_status)

    io.sockets.emit('status order', {
      customerId: orderDetail?.customerId,
      orderId: orderDetail?.order_id,
      message
    });

    return order
  }
}
