import { DownOutlined, TagOutlined } from '@ant-design/icons'
import { FilterInput, useStoresQuery } from '../../generated/graphql'
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Menu,
  Pagination,
  Row,
  Spin,
  Typography
} from 'antd'
import Meta from 'antd/lib/card/Meta'
import React, { useEffect, useState } from 'react'
import Template from '../../components/Layout'
import listFoodStyle from './ListFood.module.css'
import { withApollo } from '../../utils/withApollo'
import { useRouter } from 'next/router'
const { Text } = Typography

interface ListFoodProps {}

const ListFood: React.FC<ListFoodProps> = ({}) => {
  const router = useRouter()
  const categoryParams: any = []
  if (router.query.category) categoryParams.push(router.query.category)

  // PAGINATION
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 40
  })

  // FILTER
  const DEFAULT_FILTER: FilterInput = {
    category: categoryParams,
    district: []
  }
  const [filterValue, setFilterValue] = useState(DEFAULT_FILTER)

  // SORTING
  const DEFAULT_SORTING = {}

  // SEARCH
  let DEFAULT_SEARCHTERM: any = ''

  if (router.query.search) {
    DEFAULT_SEARCHTERM = router.query.search
  }

  useEffect(() => {
    fetchMore({
      variables: {
        filter: filterValue
      }
    })
  }, [filterValue])

  useEffect(() => {
    fetchMore({
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
      }
    })
  }, [pagination])

  const { data, error, loading, fetchMore, variables } = useStoresQuery({
    fetchPolicy: 'no-cache',
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

  if (!loading && !data) {
    return (
      <div>
        <div>you got query failed for some reason</div>
        <div>{error?.message}</div>
      </div>
    )
  }

  const [districtVisible, setDistrictVisible] = useState(false)
  const [categoryVisible, setCategoryVisible] = useState(false)
  const handleDistrictVisibleChange = (flag: any) => {
    setDistrictVisible(flag)
  }

  const handleCategoryVisibleChange = (flag: any) => {
    setCategoryVisible(flag)
  }

  const district = (
    <Menu onClick={() => setDistrictVisible(true)}>
      <Menu.Item>
        <Checkbox.Group
          value={filterValue.district ? filterValue.district : []}
          onChange={(checkedValue) => {
            setFilterValue({
              category: filterValue.category,
              district: checkedValue
            })
          }}
          options={[
            { label: 'Ba Dinh', value: 'bd' },
            { label: 'Cau Giay', value: 'cg' },
            { label: 'Dong Da', value: 'dd' },
            { label: 'Ha Dong', value: 'hd' },
            { label: 'Hai Ba Trung', value: 'hbt' },
            { label: 'Hoan Kiem', value: 'hk' },
            { label: 'Hoang Mai', value: 'hm' },
            { label: 'Long Bien', value: 'lb' },
            { label: 'Tay Ho', value: 'th' },
            { label: 'Thanh Xuan', value: 'tx' }
          ]}
        />
      </Menu.Item>
    </Menu>
  )

  const category = (
    <Menu>
      <Menu.Item>
        <Checkbox.Group
          value={filterValue.category ? filterValue.category : []}
          onChange={(checkedValue) => {
            setFilterValue({
              category: checkedValue,
              district: filterValue.district
            })
          }}
          options={[
            { label: 'Food', value: 'food' },
            { label: 'Drink', value: 'drink' },
            { label: 'Fast Food', value: 'fastfood' }
          ]}
        />
      </Menu.Item>
    </Menu>
  )

  const filter = (
    <Menu>
      <Menu.Item key="0">Most Ordered</Menu.Item>
      <Menu.Item key="1">Nearest</Menu.Item>
      <Menu.Item key="3">3rd menu item</Menu.Item>
    </Menu>
  )
  return (
    <Template title="List Store">
      <Spin spinning={loading} size="large">
        <div className={listFoodStyle['container']}>
          <Row style={{ marginTop: '20px' }}>
            <Col flex={4}>
              <Dropdown
                overlay={district}
                trigger={['click']}
                visible={districtVisible}
                onVisibleChange={handleDistrictVisibleChange}
              >
                <Button style={{ border: 'none', background: '#f2f2f2' }}>
                  DISTRICT <DownOutlined />
                </Button>
              </Dropdown>
              <Dropdown
                overlay={category}
                trigger={['click']}
                visible={categoryVisible}
                onVisibleChange={handleCategoryVisibleChange}
              >
                <Button style={{ border: 'none', background: '#f2f2f2' }}>
                  CATEGORY <DownOutlined />
                </Button>
              </Dropdown>
            </Col>
          </Row>
          <Divider style={{ borderTop: '1px solid #d7d7d7', margin: '10px 0 20px' }} />

          <div className={listFoodStyle['now-list-restaurant']}>
            <div className={listFoodStyle['list-restaurant']}>
              <Row gutter={[16, 24]}>
                {data?.stores.stores.map((e) => (
                  <Col key={e.id} className="gutter-row" span={6}>
                    <Card
                      onClick={() => {
                        router.push(`store/${e.slug_name}`)
                      }}
                      style={{ borderRadius: '8px' }}
                      hoverable
                      cover={
                        <img alt={e.name} src={`${process.env.NEXT_PUBLIC_API_URL}/${e.avatar}`} />
                      }
                    >
                      <Meta title={e.name} description={e.address} />
                      <Divider style={{ margin: '8px 0' }} />
                      <TagOutlined style={{ color: 'red' }} />
                      <Text
                        style={{
                          color: 'blue',
                          fontWeight: 'bold',
                          marginLeft: '4px',
                          fontSize: '11px'
                        }}
                      >
                        {e.promotion}
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
            <Row style={{ marginTop: '20px' }} align="middle" justify="center">
              <Pagination
                defaultCurrent={pagination.current}
                total={data?.stores.total}
                defaultPageSize={pagination.pageSize}
                onChange={(current) => {
                  setPagination({
                    current,
                    pageSize: pagination.pageSize
                  })
                }}
              />
            </Row>
          </div>
        </div>
      </Spin>
    </Template>
  )
}

export default withApollo({ ssr: true })(ListFood)
