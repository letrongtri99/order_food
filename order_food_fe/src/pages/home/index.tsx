import React, { useEffect, useState } from 'react'
import { Row, Col, Input, Button, Typography, Space, Card, Select, Spin, Divider } from 'antd'
import { ArrowRightOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { ChoseAdressModal } from '../../components/ChooseAddressModal'
import SpecialPromotion from '../../components/SpecialPromotion'
import Layout from '../../components/Layout'
import { withApollo } from '../../utils/withApollo'
import homeStyle from './home.module.css'
import Link from 'next/link'
import { useSearchStoresQuery, useStoresQuery } from '../../generated/graphql'
import { Router, useRouter } from 'next/router'

const { Option } = Select
const { Title, Text } = Typography
const { Search } = Input

const Home = ({}) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const { data, loading, fetchMore, variables } = useSearchStoresQuery({
    variables: {
      searchTerm
    },
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    fetchMore({
      variables: {
        searchTerm
      }
    })
  }, [searchTerm])

  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <Layout title="Home">
      {/* <ChoseAdressModal visible={isModalVisible} onCancel={handleCancel} /> */}
      <div className={homeStyle['home-banner']}>
        <div className="container">
          <Row justify="center" align="middle">
            <Col span={6}>
              <Title className={homeStyle['home-banner-title']} level={2}>
                Looking for food ?
              </Title>
              <Select
                size="large"
                style={{ width: '100%' }}
                autoClearSearchValue={false}
                suffixIcon={<SearchOutlined />}
                showSearch
                showArrow={false}
                placeholder="Find store, food, address ..."
                optionFilterProp="children"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '4px 0' }} />
                    <div
                      className={homeStyle['footer-search']}
                      onClick={() => {
                        router.push(`list-food?search=${searchTerm}`)
                      }}
                    >
                      <SearchOutlined /> Search for{' '}
                      <span className={homeStyle['key-word']}>{searchTerm}</span>
                    </div>
                  </div>
                )}
                onSearch={(value: string) => {
                  setSearchTerm(value)
                }}
                // filterOption={(input, option) =>
                //   option?.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                // }
                filterOption={false}
                onSelect={(option) => {
                  router.push(`store/${option}`)
                }}
              >
                {data?.searchStores.map((store) => (
                  <Option key={store.id} value={store.slug_name}>
                    <div className={homeStyle['item-restaurant']}>
                      <div className={homeStyle['img-restaurant']}>
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/${store.avatar}`}
                          alt={store.name}
                          title={store.name}
                        />
                      </div>
                      <div className={homeStyle['info-restaurant']}>
                        <div className={homeStyle['name-res']}>{store.name}</div>
                        <div className={homeStyle['address-res']}>{store.address}</div>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
              <Row style={{ margin: '20px 0' }}>
                <Space size={'middle'} wrap>
                  <Link href="list-food">
                    <Button className={homeStyle['button-ghost']} ghost>
                      All
                    </Button>
                  </Link>
                  <Link href="list-food?category=food">
                    <Button className={homeStyle['button-ghost']} ghost>
                      Food
                    </Button>
                  </Link>
                  <Link href="list-food?category=drink">
                    <Button className={homeStyle['button-ghost']} ghost>
                      Drink
                    </Button>
                  </Link>
                  <Link href="list-food?category=fastfood">
                    <Button className={homeStyle['button-ghost']} ghost>
                      Fast Food
                    </Button>
                  </Link>
                </Space>
              </Row>
              <Row>
                <Text className={homeStyle['home-banner-text']} ellipsis={true}>
                  Our App is under construction, stay tune ...
                </Text>
              </Row>
            </Col>
            <Col style={{ marginLeft: '20px', marginTop: '40px' }} span={8}>
              {/* <div className={homeStyle['user-get-local']} onClick={showModal}>
                <Space>
                  <Text style={{ color: 'blue' }} strong={true}>
                    Food
                  </Text>
                  <ArrowRightOutlined />
                  <Text>Choose Address</Text>
                </Space>
              </div> */}
              <div className={homeStyle['special-order']}>
                <Space size="middle" direction="vertical">
                  <Row>
                    <Col flex={4}>
                      <Text style={{ fontSize: '16px' }} strong={true}>
                        Recently Opened
                      </Text>
                    </Col>
                  </Row>
                  <SpecialPromotion />
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Layout>
  )
}

export default withApollo({ ssr: true })(Home)
