import { Order } from './../entities/Order';
import { getConnection } from 'typeorm'
import io from '../socket'

let OrderReposistory = {
  generateSortField: (column: string, sortOrder: string): string => {
    let sortField: string
    switch (column) {
      case 'order_id':
        sortField = `o.order_id ${sortOrder}`
        break
      case 'price':
        sortField = `o.price ${sortOrder}`
        break
      case 'createdAt':
        sortField = `o.createdAt ${sortOrder}`
        break
      default:
        sortField = `o.createdAt desc`
    }
    return sortField
  },

  getExpiredOrder: async () => {
    let queryString = `SELECT
        * 
        FROM
        \`order\` 
        WHERE
        createdAt < DATE_SUB(NOW(), INTERVAL 3 MINUTE)
        AND order_status = 0`

    let orders = await getConnection().query(queryString)
    if (orders) {
      orders.forEach((e: Order) => {
        io.emit('miss order', {
          customerId: e.customerId,
          orderId: e.order_id,
          message: 'Sorry. No shipper available at the moment. Please wait for a few minutes then re-order. Thanks for your patience.'
        })
        return Order.update({ id: e.id }, { order_status: 3 })
      })
    }
  },

  generateStatusMessage: (status: number | undefined) => {
    let message: string
    switch (status) {
      case 1:
        message = `Your order is on the way. Please wait a moment...`
        break
      case 2:
        message = `Your order has arrived. Thanks for your waiting, hope to see you later.`
        break
      case 3:
        message = `Your order has been canceled.`
        break
      default:
        message = `Sorry there are no deliverers at the moment. Please come back later.`
    }
    return message
  }
}

export default OrderReposistory
