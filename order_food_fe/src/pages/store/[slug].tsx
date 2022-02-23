import React, { useState } from 'react'
import {
  CheckCircleOutlined,
  DollarOutlined,
  LeftOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { Row, Col, List, Typography, Menu, Input, Avatar, Button, Modal, Spin } from 'antd'
import Layout from '../../components/Layout'
import storeStyle from './Store.module.css'
import { withApollo } from '../../utils/withApollo'
import { useRouter } from 'next/router'
import { Product, useStoreQuery } from '../../generated/graphql'
import { checkExist } from '../../utils/checkExist'
import { isAuth } from '../../utils/isAuth'
import { CheckOutModal } from '../../components/CheckOutModal'
import { CartItem } from '../../shared/interfaces'
import { Element, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

const Store: React.FC = ({}) => {
  const [categoryList, setCategoryList] = useState([''])
  const [filterInput, setFilterInput] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false)
  const [imgInfo, setImgInfo] = useState('')
  const router = useRouter()
  const slug_name = typeof router.query.slug == 'string' ? router.query.slug.toString() : '-1'

  const { data, error, loading } = useStoreQuery({
    skip: slug_name == '-1',
    variables: {
      slug: slug_name
    },
    notifyOnNetworkStatusChange: true
  })

  let initialCart: CartItem[] = []
  const [cart, setCart] = useState(initialCart)
  let [total, setTotal] = useState(0)

  if (loading) {
    return (
      <Layout>
        <div style={{height: '100vh'}}>
          <Spin style={{position: 'absolute', left: '50%', width: '100%', top: '50%'}} spinning={loading} size="large" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return <div>{error.message}</div>
  }

  if (!data?.store) {
    return (
      <Layout>
        <div>could not find store</div>
      </Layout>
    )
  }

  let filterData: Product[] = []
  let list = []
  if (!filterInput) {
    filterData = data.store.products
    let tmpArr = filterData.map((e) => e.category)
    list = [...new Set(tmpArr)]
  } else {
    data.store.products.forEach((e) => {
      if (e.name.toLowerCase().includes(filterInput.toLowerCase())) {
        filterData.push(e)
      }
    })

    let tmpArr = filterData.map((e) => e.category)
    list = [...new Set(tmpArr)]
  }

  const getDateSource = (category: Product['category']) => {
    let dataSource: Product[] = []
    if (data.store?.products) {
      if (!filterInput) {
        data.store.products.forEach((e) => {
          if (e.category == category) {
            dataSource.push(e)
          }
        })
      } else {
        data.store.products.forEach((e) => {
          if (e.category == category && e.name.toLowerCase().includes(filterInput.toLowerCase())) {
            dataSource.push(e)
          }
        })
      }
    }

    return dataSource
  }

  const addItemToCart = (item: CartItem | Product) => {
    let auth = isAuth()
    if (!auth) {
      router.replace('/login?next=' + router.asPath)
      return
    }
    let addedItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity + 1
    }

    let exist = checkExist(cart, addedItem)
    if (exist) {
      cart.forEach((e) => {
        if (e.id == addedItem.id) {
          e.quantity += 1
        }
      })
      total += addedItem.price
      setTotal(total)
      setCart((old) => [...old])
    } else {
      total += addedItem.price
      setTotal(total)
      setCart((old) => [...old, addedItem])
    }
  }

  const deleteItemCart = (item: CartItem) => {
    let auth = isAuth()
    if (!auth) {
      router.replace('/login?next=' + router.pathname)
      return
    }
    let deletedItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity + 1
    }

    let exist = checkExist(cart, deletedItem)
    if (exist) {
      cart.forEach((e, i) => {
        if (e.id == deletedItem.id) {
          e.quantity -= 1
          if (e.quantity == 0) {
            cart.splice(i, 1)
          }
        }
      })
      total -= deletedItem.price
      setTotal(total)
      setCart((old) => [...old])
    } else {
      total -= deletedItem.price
      setTotal(total)
      let deletedCart = cart.filter((e) => e.id != deletedItem.id)
      deletedCart.forEach((e, i) => {
        if (e.quantity == 0) {
          deletedCart.splice(i, 1)
        }
      })
      setCart(deletedCart)
    }
  }

  return (
    <Layout title="Store">
      <Spin spinning={loading} size="large">
        <div className={storeStyle['now-detail-restaurant']}>
          <div className={storeStyle['container']}>
            <div className={storeStyle['detail-restaurant-img']}>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${data.store.store?.avatar}`}
                alt={data.store.store?.name}
              />{' '}
            </div>
            <div className={storeStyle['detail-restaurant-info']}>
              <h1 className={storeStyle['name-restaurant']}>{data.store.store?.name}</h1>
              <div className={storeStyle['address-restaurant']}>{data.store.store?.address}</div>
              <div className={storeStyle['cost-restaurant']}>
                <DollarOutlined />
                &nbsp; 40,000 - 500,000
              </div>
              <div className={storeStyle['utility-restaurant']}>
                <div className={storeStyle['utility-item']}>
                  <div className={storeStyle['utility-title']}>Service Fee</div>
                  <div className={storeStyle['utility-content']}>
                    <span className={storeStyle['txt-red']}> 0.0% Service Fee </span>
                  </div>
                </div>
                <div className={storeStyle['utility-item']}>
                  <div className={storeStyle['utility-title']}>Sponsor by</div>
                  <div className={storeStyle['utility-content']}>
                    <span className={storeStyle['txt-red']}>Now</span>
                  </div>
                </div>
                <div className={storeStyle['utility-item']}>
                  <div className={storeStyle['utility-title']}>Time</div>
                  <div className={storeStyle['utility-content']}>~10-15 mins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '30px' }} className={storeStyle['container']}>
          <Row gutter={[16, 16]}>
            <Col className={storeStyle['food-column']} span={4}>
              <Menu style={{ border: 'none' }} mode="inline">
                {list.map((e, idx) => (
                  <Menu.Item
                    className={storeStyle['list-category']}
                    key={idx}
                    onClick={() => {
                      scroller.scrollTo(`${e}`, {
                        duration: 800,
                        delay: 0,
                        smooth: true,
                        offset: -100
                      })
                    }}
                  >
                    {e}
                  </Menu.Item>
                ))}
              </Menu>
            </Col>
            <Col className={storeStyle['food-column']} span={12}>
              <Input
                onChange={(e) => {
                  setFilterInput(e.target.value)
                }}
                style={{ marginBottom: '10px' }}
                size="large"
                placeholder="Search for food"
                prefix={<SearchOutlined />}
              />
              {list.length > 0 ? (
                list.map((e, idx) => (
                  <div key={idx}>
                    <Element name={e} className="element">
                      <Typography.Text style={{ textTransform: 'uppercase' }}>{e}</Typography.Text>
                    </Element>

                    <List
                      loading={loading}
                      itemLayout="horizontal"
                      dataSource={getDateSource(e)}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Typography.Text className={storeStyle['price']}>
                              {item.price}
                              <span className={storeStyle['price-span']}>đ</span>
                            </Typography.Text>,
                            <div
                              onClick={() => {
                                addItemToCart(item)
                              }}
                              className={storeStyle['btn-adding']}
                            >
                              +
                            </div>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                shape="square"
                                size={64}
                                style={{ cursor: 'pointer' }}
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${item.imgUrl}`}
                                onClick={() => {
                                  setIsModalVisible(true)
                                  setImgInfo(`${process.env.NEXT_PUBLIC_API_URL}/${item.imgUrl}`)
                                }}
                              />
                            }
                            title={
                              <a
                                onClick={() => {
                                  addItemToCart(item)
                                }}
                                style={{ fontWeight: 'bold' }}
                              >
                                {item.name}
                              </a>
                            }
                            description={item.description}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ))
              ) : (
                <div className={storeStyle['menu-no-data']}>
                  <img
                    src="https://www.now.vn/app/assets/img/no-results.png?7aafd0b598221e54f8ef4a4bd1b38297"
                    alt=""
                  />
                  <div>
                    <div className={storeStyle['no-data-text']}>No data available</div>
                  </div>
                </div>
              )}
            </Col>
            <Col className={storeStyle['food-column-3']} span={6}>
              <Row style={{ padding: '7px 10px' }}>
                <Col flex={1}>
                  <Typography.Text style={{ padding: '4px', background: '#ffe58f' }}>
                    {cart.length} serves
                  </Typography.Text>
                </Col>
                <Col flex={0}>
                  <Button
                    onClick={() => {
                      setCart([])
                      setTotal(0)
                    }}
                    size="small"
                    danger
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
              <div className={storeStyle['bill-row']}>
                <Row>
                  <Col flex={1}>Serve(s)</Col>
                  <Col flex={0}>{cart.length}</Col>
                </Row>
              </div>
              <div className={storeStyle['order-card-groups']}>
                {cart.map((e) => (
                  <div key={e.id} className={storeStyle['order-card-item']}>
                    <div className={storeStyle['clearfix']}>
                      <div
                        onClick={() => {
                          addItemToCart(e)
                        }}
                        className={storeStyle['btn-adding-bill']}
                      >
                        +
                      </div>
                      <span className={storeStyle['number-oder']}>{e.quantity}</span>
                      <div
                        onClick={() => {
                          deleteItemCart(e)
                        }}
                        className={storeStyle['btn-minus-bill']}
                      >
                        -
                      </div>
                      <span className={storeStyle['name-order']}>{e.name}</span>
                      <span className={storeStyle['price-order']}>{e.price * e.quantity}đ</span>
                    </div>
                    {/* <div className={storeStyle['note-order']}>
                  <input type="text" id="txtNote" placeholder="Thêm ghi chú..." value="" />
                  <span className={storeStyle['price-order']}>30,000đ</span>
                </div> */}
                  </div>
                ))}
                <div className={storeStyle['row-bill-restaurant']}>
                  <div className={storeStyle['row']}>
                    <div className={storeStyle['col']}>Total</div>
                    <div className={storeStyle['col-auto']}>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0288d1' }}>
                        {total}
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
              <Row>
                <Button
                  style={{
                    background: '#cf2127',
                    border: '#cf2127',
                    color: '#fff',
                    margin: '12px 10px 15px'
                  }}
                  block
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setCheckOutModalVisible(true)
                  }}
                  disabled={cart.length == 0}
                >
                  Check Out
                </Button>
              </Row>
            </Col>
          </Row>
        </div>
        <Modal
          centered
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          bodyStyle={{ padding: 0 }}
          footer={null}
        >
          <img className={storeStyle['img-info']} src={imgInfo} alt={imgInfo} />
        </Modal>
        <CheckOutModal
          visible={checkOutModalVisible}
          order={cart}
          total={total}
          storeId={data.store.store.id}
          storeInfo={data.store.store}
          onCancel={() => setCheckOutModalVisible(false)}
        />
      </Spin>
    </Layout>
  )
}

export default withApollo({ ssr: true })(Store)
