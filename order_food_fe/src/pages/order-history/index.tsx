import React, { useState } from 'react'
import { Layout, Table, Tag, Space, Row, Col, DatePicker, Button, Select } from 'antd'
import Link from 'next/link'
import Template from '../../components/Layout'
import {
  HistoryOrder,
  FilterInput,
  Order,
  SortingInput,
  useOrdersHistoryQuery,
  CustomerOrder
} from '../../generated/graphql'
import { withApollo } from '../../utils/withApollo'
import moment from 'moment'
import orderHistoryStyle from './order-history.module.css'
import { ProgressModal } from '../../components/ProgressModal'

const { Content } = Layout
const { Option } = Select
const { RangePicker } = DatePicker

const DEFAULT_ORDER: Order = {
  address: '',
  createdAt: '',
  customerId: undefined || -1,
  id: undefined || -1,
  latitude: undefined || -1,
  longtitude: undefined || -1,
  notes: '',
  order_detail: '',
  order_id: '',
  order_status: undefined || -1,
  price: undefined || -1,
  shipping_fee: undefined || -1,
  storeId: undefined || -1,
  updatedAt: '',
  arrivedAt: '',
  pickedAt: '',
  deliveryId: undefined
}

const OrderHistory = () => {
  const [orderInfo, setOrderInfo] = useState(DEFAULT_ORDER)

  const dateFormat = 'YYYY/MM/DD'
  const columns = [
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id'
    },
    {
      title: 'Order Code',
      key: 'order_id',
      dataIndex: 'order_id'
    },
    {
      title: 'Time Order',
      key: 'createdAt',
      dataIndex: 'createdAt'
    },
    {
      title: 'Address',
      key: 'store_address',
      render: (record: CustomerOrder) => {
        return (
          <div>
            <b>{record.store_name}</b>
            <div>{record.store_address}</div>
          </div>
        )
      }
    },
    {
      title: 'Delivery Name',
      key: 'delivery_name',
      dataIndex: 'delivery_name'
    },
    {
      title: 'Amount fee',
      key: 'price',
      render: (record: CustomerOrder) => {
        return <span>{record.price}đ</span>
      }
    },
    {
      title: 'Status',
      key: 'order_status',
      dataIndex: 'order_status',
      render: (status: HistoryOrder['order_status']) => {
        let color =
          status === 1 ? 'geekblue' : status === 0 ? 'volcano' : status === 2 ? 'green' : 'brown'
        let text =
          status === 1
            ? 'Shipping'
            : status === 0
            ? 'Pending'
            : status === 2
            ? 'Shipped'
            : 'Canceled'
        return (
          <Tag color={color} key={status}>
            {text}
          </Tag>
        )
      }
    },
    {
      title: 'Details',
      key: 'details',
      dataIndex: '',
      render: (record: Order) => {
        return (
          <>
            <Button
              type="primary"
              onClick={() => {
                setCheckOutModalVisible(true)
                setOrderInfo(record)
              }}
            >
              Open Modal
            </Button>
            <ProgressModal
              visible={checkOutModalVisible}
              order={orderInfo}
              onCancel={() => {
                setCheckOutModalVisible(false)
                setOrderInfo(DEFAULT_ORDER)
              }}
            ></ProgressModal>
          </>
        )
      }
    }
  ]

  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false)
  const [fromTime, setFromTime] = useState(moment(new Date()).format(dateFormat))
  const [toTime, setToTime] = useState(moment(new Date(+new Date() + 86400000)).format(dateFormat))
  const [statusOrder, setStatusOrder] = useState([0, 1, 2, 3])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5
  })

  const DEFAULT_FILTER: FilterInput = {
    from_date: fromTime,
    to_date: toTime,
    order_status: statusOrder
  }
  const [filterValue, setFilterValue] = useState(DEFAULT_FILTER)

  const DEFAULT_SORTING: SortingInput = {
    column: 'createdAt',
    direction: 'descend'
  }

  const { data, error, loading, fetchMore, refetch } = useOrdersHistoryQuery({
    variables: {
      state: {
        filter: filterValue,
        paginator: {
          page: pagination.current,
          pageSize: pagination.pageSize
        },
        sorting: DEFAULT_SORTING
      }
    },
    notifyOnNetworkStatusChange: true
  })

  const handleChangeFromDate = (dateFrom: any, dateFromString: string) => {
    setFromTime(dateFromString)
  }

  const handleChangeEndDate = (dateEnd: any, dateEndString: string) => {
    setToTime(dateEndString)
  }

  const handleChangeOrderStatus = (currentStatus: any) => {
    if (currentStatus === 'all') {
      setStatusOrder([0, 1, 2, 3])
    } else {
      setStatusOrder([Number(currentStatus)])
    }
  }

  const reSearch = () => {
    setFilterValue({
      from_date: fromTime,
      to_date: toTime,
      order_status: statusOrder
    })

    fetchMore({
      variables: {
        state: {
          filter: filterValue,
          paginator: {
            page: pagination.current,
            pageSize: pagination.pageSize
          },
          sorting: DEFAULT_SORTING
        }
      }
    })
  }

  return (
    <Template title="Order History">
      <Layout>
        <Content className={orderHistoryStyle['table-history-content']}>
          <h1 className="center">Orders history</h1>
          <Row gutter={26} className={orderHistoryStyle['table-history-search']}>
            <Col className="gutter-row" span={6}>
              <div>
                Status{' '}
                <Select
                  defaultValue="all"
                  className={orderHistoryStyle['select-order-status']}
                  onChange={handleChangeOrderStatus}
                >
                  <Option value="all">All</Option>
                  <Option value="0">Pending</Option>
                  <Option value="1">Shipping</Option>
                  <Option value="2">Shipped</Option>
                  <Option value="3">Canceled</Option>
                </Select>
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <div>
                From date{' '}
                <DatePicker
                  defaultValue={moment(fromTime, dateFormat)}
                  format={dateFormat}
                  onChange={handleChangeFromDate}
                />
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <div>
                To date{' '}
                <DatePicker
                  defaultValue={moment(toTime, dateFormat)}
                  format={dateFormat}
                  onChange={handleChangeEndDate}
                />
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <Button type="primary" onClick={reSearch}>
                Search
              </Button>
            </Col>
          </Row>
          <Table
            className={orderHistoryStyle['table-history-modified']}
            columns={columns}
            dataSource={data?.ordersHistory.ordersHistory}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: data?.ordersHistory.total
            }}
            loading={loading}
            onChange={(pagination) => {
              if (pagination && pagination.current && pagination.pageSize) {
                setPagination({
                  current: pagination.current,
                  pageSize: pagination.pageSize
                })
              }

              fetchMore({
                variables: {
                  state: {
                    filter: filterValue,
                    paginator: {
                      page: pagination.current,
                      pageSize: pagination.pageSize
                    },
                    sorting: DEFAULT_SORTING
                  }
                }
              })
            }}
            rowKey={(record) => record.id}
          />
        </Content>
      </Layout>
    </Template>
  )
}

export default withApollo({ ssr: true })(OrderHistory)
