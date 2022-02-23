import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Layout,
  Menu,
  Pagination,
  Row,
  Spin,
  Tooltip,
  Typography,
  notification
} from 'antd'
import Meta from 'antd/lib/card/Meta'
import React, { useEffect, useState } from 'react'
import Template from '../../components/Layout'
import { withApollo } from '../../utils/withApollo'
import { useRouter } from 'next/router'
import {
  CustomerOrder,
  FilterInput,
  Order,
  SortingInput,
  UpdateOrderDeliveryMutation,
  useOrdersQuery,
  useUpdateOrderDeliveryMutation,
  useGetProfileQuery
} from '../../generated/graphql'
import deliveryStyle from './Delivery.module.css'
import { Table, Tag, Space } from 'antd'
import { ConsoleSqlOutlined, DownOutlined } from '@ant-design/icons'
import { GraphQLError } from 'graphql'
import { ApolloCache } from '@apollo/client'
import { isAuth } from '../../utils/isAuth'

import { io } from 'socket.io-client'
import { getAccessToken } from '../../shared/accessToken'

const { Header, Content, Footer } = Layout
const { Column, ColumnGroup } = Table

// interface DeliveryProps {}
interface Sorter extends SortingInput {
  field: string
  order: string
}

const Delivery = ({}) => {
  const router = useRouter()
  const socket = io(process.env.NEXT_PUBLIC_API_URL)

  socket.on('new order', (arg) => {
    refetch()
  })

  const [updateStatus] = useUpdateOrderDeliveryMutation()
  const meQuery = useGetProfileQuery()

  const columns = [
    {
      title: 'Order ID',
      key: 'order_id',
      dataIndex: 'order_id',
      sorter: true
    },
    {
      title: 'Status',
      key: 'order_status',
      dataIndex: 'order_status',
      filters: [
        { text: 'Pending', value: 0 },
        { text: 'Shipping', value: 1 },
        { text: 'Shipped', value: 2 },
        { text: 'Canceled', value: 3 }
      ],
      render: (tag: CustomerOrder['order_status']) => {
        let color = tag == 1 ? 'geekblue' : tag == 3 ? 'volcano' : 'green'
        return (
          <Tag color={color} key={tag}>
            {tag}
          </Tag>
        )
      }
    },
    {
      title: 'Store Name',
      key: 'store_name',
      dataIndex: 'store_name'
    },
    {
      title: 'Store Address',
      key: 'store_address',
      dataIndex: 'store_address',
      ellipsis: {
        showTitle: false
      },
      render: (address: CustomerOrder['store_address']) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      )
    },
    {
      title: 'Customer Name',
      key: 'customer_name',
      dataIndex: 'customer_name'
    },
    {
      title: 'Customer Adress',
      key: 'customer_address',
      dataIndex: 'customer_address',
      ellipsis: {
        showTitle: false
      },
      render: (address: CustomerOrder['customer_address']) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      )
    },
    {
      title: 'Customer Phone Number',
      key: 'customer_phone',
      dataIndex: 'customer_phone'
    },
    {
      title: 'Time',
      key: 'time',
      dataIndex: 'createdAt',
      sorter: true,
      render: (time: CustomerOrder['createdAt']) => <p>{time}</p>
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: '',
      render: (record: CustomerOrder) => {
        if (record.order_status == 2) {
          return <p>This order has shipped</p>
        } else if (record.order_status == 3) {
          return <p>This order has been cancel</p>
        } else {
          return (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="0"
                    onClick={async () => {
                      if (
                        record.deliveryId != null &&
                        meQuery.data?.getProfile.id != record.deliveryId
                      ) {
                        notification['warning']({
                          message: 'Error!',
                          description: `You have no right to update other's order`
                        })
                        return false
                      }
                      const { errors } = await updateStatus({
                        variables: { id: record.id, status: 1 }
                      })
                      if (errors) {
                        console.log(errors)
                      }
                      refetch()
                    }}
                  >
                    Shipping
                  </Menu.Item>
                  <Menu.Item
                    key="1"
                    onClick={async () => {
                      if (
                        record.deliveryId != null &&
                        meQuery.data?.getProfile.id != record.deliveryId
                      ) {
                        notification['warning']({
                          message: 'Error!',
                          description: `You have no right to update other's order`
                        })
                        return false
                      }
                      const { errors } = await updateStatus({
                        variables: { id: record.id, status: 2 }
                      })
                      if (errors) {
                        console.log(errors)
                      }
                      refetch()
                    }}
                  >
                    Shipped
                  </Menu.Item>
                  <Menu.Item
                    key="3"
                    onClick={async () => {
                      if (
                        record.deliveryId != null &&
                        meQuery.data?.getProfile.id != record.deliveryId
                      ) {
                        notification['warning']({
                          message: 'Error!',
                          description: `You have no right to update other's order`
                        })
                        return false
                      }
                      const { errors } = await updateStatus({
                        variables: { id: record.id, status: 3 }
                      })
                      if (errors) {
                        console.log(errors)
                      }
                      refetch()
                    }}
                  >
                    Canceled
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                Update Status Order <DownOutlined />
              </a>
            </Dropdown>
          )
        }
      }
    }
  ]
  const categoryParams: any = []
  if (router.query.category) categoryParams.push(router.query.category)

  // PAGINATION
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3
  })

  // FILTER
  const DEFAULT_FILTER: FilterInput = {
    category: categoryParams,
    district: []
  }
  const [filterValue, setFilterValue] = useState(DEFAULT_FILTER)

  // SORTING
  const DEFAULT_SORTING: SortingInput = {}

  // SEARCH
  let DEFAULT_SEARCHTERM: any = ''

  if (router.query.search) {
    DEFAULT_SEARCHTERM = router.query.search
  }

  const { data, error, loading, fetchMore, refetch } = useOrdersQuery({
    variables: {
      state: {
        filter: filterValue,
        paginator: {
          page: pagination.current,
          pageSize: pagination.pageSize
        },
        sorting: DEFAULT_SORTING,
        searchTerm: DEFAULT_SEARCHTERM
      }
    },
    notifyOnNetworkStatusChange: true
  })

  return (
    <Template>
      <Spin spinning={loading} size="large">
        <Layout className="layout">
          <Content style={{ padding: '0 50px' }}>
            <Table
              columns={columns}
              dataSource={data?.orders.orders}
              rowKey={(record) => record.id}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: data?.orders.total
              }}
              loading={loading}
              onChange={(pagination, filters, sorter: Sorter) => {
                if (pagination && pagination.current && pagination.pageSize) {
                  setPagination({
                    current: pagination.current,
                    pageSize: pagination.pageSize
                  })
                }

                fetchMore({
                  variables: {
                    state: {
                      filter: filters,
                      paginator: {
                        page: pagination.current,
                        pageSize: pagination.pageSize
                      },
                      sorting:
                        sorter && sorter.field
                          ? {
                              column: sorter.field,
                              direction: sorter.order
                            }
                          : DEFAULT_SORTING,
                      searchTerm: DEFAULT_SEARCHTERM
                    }
                  }
                })
              }}
              expandable={{
                expandedRowRender: (record) => {
                  let order_detail = JSON.parse(record.order_detail)
                  return (
                    <div className={deliveryStyle['order-card-groups']}>
                      <div className={deliveryStyle['order-list']}>
                        {order_detail.map((e: any) => (
                          <div key={e.id}>
                            <div className={deliveryStyle['order-item']}>
                              <span className={deliveryStyle['order-item-number']}>
                                {e.quantity}
                              </span>
                              <div className={deliveryStyle['order-item-info']}>
                                <div className={deliveryStyle['order-item-name']}>
                                  <span className={deliveryStyle['txt-bold']}>{e.name}&nbsp;</span>
                                </div>
                              </div>
                              <div className={deliveryStyle['order-item-price']}>
                                {e.price}
                                <span className={deliveryStyle['format-price']}>đ</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={deliveryStyle['row-bill-restaurant']}>
                        <div className={deliveryStyle['row']}>
                          <div className={deliveryStyle['col']}>Shipping Fee</div>
                          <div className={deliveryStyle['col-auto']}>
                            &nbsp;{record.shipping_fee}
                            <span className={deliveryStyle['format-price']}>đ</span>
                          </div>
                        </div>
                        <div className={deliveryStyle['row']}>
                          <div className={deliveryStyle['col']}>Total</div>
                          <div className={deliveryStyle['col-auto']}>
                            <span
                              style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0288d1' }}
                            >
                              {record.price + record.shipping_fee}
                              <span
                                style={{
                                  fontWeight: 400,
                                  position: 'relative',
                                  top: '-9px',
                                  fontSize: '10px',
                                  right: '0'
                                }}
                              >
                                đ
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                  //   return (
                  // <p style={{ margin: 0 }}>{record.order_detail}</p>)
                },
                rowExpandable: (record) => record.order_detail != ''
              }}
            />
          </Content>
        </Layout>
      </Spin>
    </Template>
  )
}

export default withApollo({ ssr: true })(Delivery)
