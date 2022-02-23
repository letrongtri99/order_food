import React from 'react'
import { Row, Col, Card, Divider, Typography, Button, Spin, Tooltip } from 'antd'
import { ReloadOutlined, TagOutlined } from '@ant-design/icons'
import { useSpecialStoresQuery } from '../../generated/graphql'
import { withApollo } from '../../utils/withApollo'
import { useRouter } from 'next/router'

const { Meta } = Card
const { Text } = Typography

const SpecialPromotion = () => {
  const router = useRouter()

  const { data, error, loading, fetchMore, variables } = useSpecialStoresQuery({
    variables: {
      state: {
        filter: {},
        paginator: {
          page: 1,
          pageSize: 9
        },
        sorting: {},
        searchTerm: ''
      }
    },
    notifyOnNetworkStatusChange: true
  })

  return (
    <>
      {data ? (
        <div>
          <Row gutter={[16, 16]}>
            {data?.specialStores.stores.map((e) => (
              <Col key={e.id} span={8}>
                <Tooltip title={e.name}>
                  <Card
                    onClick={() => {
                      router.push(`store/${e.slug_name}`)
                    }}
                    loading={loading}
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
                </Tooltip>
              </Col>
            ))}
          </Row>
          <Row style={{ marginTop: '20px' }} align="middle" justify="center">
            <Button
              type="link"
              onClick={() => {
                router.push('list-food')
              }}
            >
              See All <ReloadOutlined />{' '}
            </Button>
          </Row>
        </div>
      ) : (
        <Spin spinning={loading} />
      )}
    </>
  )
}

export default withApollo({ ssr: true })(SpecialPromotion)
