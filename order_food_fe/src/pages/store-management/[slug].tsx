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
  notification,
  Avatar,
  Modal
} from 'antd'
import Meta from 'antd/lib/card/Meta'
import React, { useEffect, useState } from 'react'
import Template from '../../components/Layout'
import { withApollo } from '../../utils/withApollo'
import { useRouter } from 'next/router'
import {
  FilterInput,
  Product,
  SortingInput,
  useListProductsQuery,
  useProductMutation,
  useStoreQuery,
  useDeleteProductMutation
} from '../../generated/graphql'
import { Table, Tag, Space } from 'antd'
import EditProductModal from '../../components/EditProductModal'
import { DeleteFilled, EditFilled, ExclamationCircleOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Column, ColumnGroup } = Table

// interface DeliveryProps {}
interface Sorter extends SortingInput {
  field: string
  order: string
}

const DEFAULT_PRODUCT: Product = {
  id: -1,
  name: '',
  category: '',
  price: 0,
  imgUrl: '',
  description: '',
  createdAt: '',
  updatedAt: '',
  isDeleted: 0
}

const StoreManagement = ({}) => {
  const router = useRouter()
  const [getProduct] = useProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const slug_name = typeof router.query.slug == 'string' ? router.query.slug.toString() : '-1'
  const [productInfo, setProductInfo] = useState(DEFAULT_PRODUCT)

  const storeQuery = useStoreQuery({
    skip: slug_name == '-1',
    variables: {
      slug: slug_name
    },
    notifyOnNetworkStatusChange: true
  })

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editProductVisible, setEditProductVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  // const [productId, setProductId] = useState(-1)
  const [imgInfo, setImgInfo] = useState('')

  const columns = [
    {
      title: 'Name',
      dataIndex: '',
      key: 'name',
      ellipsis: {
        showTitle: false
      },
      render: (record: Product) => (
        <div>
          <Avatar
            shape="square"
            size={64}
            style={{ cursor: 'pointer', marginRight: '10px' }}
            onClick={() => {
              setIsModalVisible(true)
              setImgInfo(`${process.env.NEXT_PUBLIC_API_URL}/${record.imgUrl}`)
            }}
            src={`${process.env.NEXT_PUBLIC_API_URL}/${record.imgUrl}`}
          />
          {record.name}
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price'
    },
    // {
    //   title: 'Sold',
    //   dataIndex: 'sold',
    //   key: 'sold'
    // },
    // {
    //   title: 'Quantity',
    //   dataIndex: 'quantity',
    //   key: 'quantity'
    // },
    {
      title: 'Action',
      dataIndex: '',
      render: (_: any, record: Product) => {
        return (
          <Space direction="horizontal">
            <Button
              type="primary"
              shape="circle"
              icon={<EditFilled />}
              size="middle"
              onClick={async () => {
                const product = await getProduct({
                  variables: {
                    id: record.id
                  }
                })
                if (product.data?.product) {
                  setProductInfo(product.data?.product)
                }
                setIsEdit(true)
                setEditProductVisible(true)
              }}
            />
            <Button
              danger
              shape="circle"
              icon={<DeleteFilled />}
              size="middle"
              onClick={() => {
                Modal.confirm({
                  title: 'Do you want to delete this product?',
                  icon: <ExclamationCircleOutlined />,
                  okText: 'Confirm',
                  cancelText: 'Cancel',
                  onOk: async () => {
                    const product = await deleteProduct({
                      variables: {
                        id: record.id
                      }
                    })
                    refetch()
                  }
                  // onCancel: () => {
                  //   alert('CANCEL')
                  // }
                })
              }}
            />
          </Space>
        )
      }
    }
  ]

  // PAGINATION
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })

  // FILTER
  const DEFAULT_FILTER: FilterInput = {}
  const [filterValue, setFilterValue] = useState(DEFAULT_FILTER)

  // SORTING
  const DEFAULT_SORTING: SortingInput = {}

  // SEARCH
  let DEFAULT_SEARCHTERM: any = ''

  if (router.query.search) {
    DEFAULT_SEARCHTERM = router.query.search
  }

  const { data, error, loading, fetchMore, refetch } = useListProductsQuery({
    skip: storeQuery.data == undefined,
    variables: {
      state: {
        filter: filterValue,
        paginator: {
          page: pagination.current,
          pageSize: pagination.pageSize
        },
        sorting: DEFAULT_SORTING,
        searchTerm: DEFAULT_SEARCHTERM
      },
      storeId: storeQuery.data?.store?.store ? storeQuery.data.store.store.id : 0
    },
    notifyOnNetworkStatusChange: true
  })

  return (
    <Template title="Store Management">
      <Spin spinning={loading} size="large">
        <Layout className="layout">
          <Content style={{ padding: '0 50px', marginTop: '30px' }}>
            <Button
              onClick={() => {
                setEditProductVisible(true)
              }}
              type="primary"
              style={{ marginBottom: 16, float: 'right' }}
            >
              Add new product
            </Button>
            <Table
              columns={columns}
              dataSource={data?.listProducts.products}
              rowKey={(record) => record.id}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: data?.listProducts.total
              }}
              loading={loading}
              onChange={(pagination, filters, sorter: Sorter) => {
                if (pagination && pagination.current && pagination.pageSize) {
                  setPagination({
                    current: pagination.current,
                    pageSize: pagination.pageSize
                  })
                }

                if (sorter && sorter.column) {
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
            />
          </Content>
          <Modal
            centered
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            bodyStyle={{ padding: 0 }}
            footer={null}
          >
            <img
              style={{
                maxWidth: '100%',
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '530px'
              }}
              src={imgInfo}
              alt={imgInfo}
            />
          </Modal>
          <EditProductModal
            edit={isEdit}
            productInfo={productInfo}
            visible={editProductVisible}
            onCancel={() => {
              setEditProductVisible(false)
              setProductInfo(DEFAULT_PRODUCT)
              // setProductId(-1)
              setIsEdit(false)
            }}
            refetch={() => {
              refetch()
            }}
          />
        </Layout>
      </Spin>
    </Template>
  )
}

export default withApollo({ ssr: true })(StoreManagement)
