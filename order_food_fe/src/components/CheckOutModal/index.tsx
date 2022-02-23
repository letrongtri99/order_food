import React, { useEffect, useState } from 'react'
import {
  Input,
  Modal,
  Row,
  Col,
  Typography,
  Space,
  Collapse,
  Divider,
  notification,
  Avatar,
  Tooltip
} from 'antd'
import checkoutStyle from './CheckOutModal.module.css'
import { CartItem } from '../../shared/interfaces'
import { Store, useCreateOrderMutation, useGetProfileQuery } from '../../generated/graphql'
import { isAuth } from '../../utils/isAuth'
import { useRouter } from 'next/router'
// import GoogleMapReact from 'google-map-react'
import { HomeTwoTone, InfoCircleOutlined, UserOutlined } from '@ant-design/icons'
import {
  GoogleMap,
  LoadScript,
  Marker,
  DistanceMatrixService,
  Autocomplete
} from '@react-google-maps/api'
interface CheckOutModalProps {
  visible: boolean
  order: CartItem[]
  total: number
  storeId: number
  storeInfo: Store
  onCancel: () => void
}

// interface Marker {
//   type: string
//   lat: number
//   lng: number
// }

// const Marker: React.FC<Marker> = ({ type, lat, lng }) => {
//   return type == 'customer' ? (
//     <Avatar size="small" icon={<UserOutlined />} />
//   ) : (
//     <Avatar size="small" icon={<HomeTwoTone />} />
//   )
// }

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  visible,
  order,
  total,
  storeId,
  storeInfo,
  onCancel
}) => {
  const router = useRouter()
  const [shippingFee, setShippingFee] = useState(0)
  const [distance, setDistance] = useState('0 km')
  const [distanceInt, setDistanceInt] = useState(0)
  useEffect(() => {
    // 1000vnd/km
    let fee = distanceInt < 3000 ? 0 : Math.floor(distanceInt / 1000) * 1000
    setShippingFee(fee)
  }, [distanceInt])
  const [duration, setDuration] = useState('')
  const meQuery = useGetProfileQuery()
  const [createOrder] = useCreateOrderMutation()
  if (visible) {
    let auth = isAuth()
    if (!auth) {
      router.push('/login?next=' + router.asPath)
    }
  }

  if (meQuery.data) {
    let marker = {
      lat: meQuery.data.getProfile.latitude
        ? (meQuery.data.getProfile.latitude + storeInfo.latitude) / 2
        : storeInfo.latitude,
      lng: meQuery.data.getProfile.longtitude
        ? (meQuery.data.getProfile.longtitude + storeInfo.longtitude) / 2
        : storeInfo.longtitude
    }

    return (
      <Modal
        title="Confirm Your Order"
        visible={visible}
        onCancel={onCancel}
        width={800}
        footer={[
          <div className={checkoutStyle['modal-footer']}>
            <div
              onClick={() => {
                const {} = createOrder({
                  variables: { input: { order, total, shippingFee, storeId } }
                })
                onCancel()
                notification['success']({
                  message: 'Thank You!',
                  description: `Your order has been confirmed! Please wait for our deliverer to pick up your order.`
                })
              }}
              className={checkoutStyle['submit-order']}
            >
              Confirm <i className={checkoutStyle['fas fa-arrow-right']}></i>
              <span className={checkoutStyle['total-price']}>
                <div>
                  {total + shippingFee}
                  <span style={{ position: 'relative', fontSize: '10px', top: '-7px', right: '0' }}>
                    đ
                  </span>
                </div>
              </span>
            </div>
          </div>
        ]}
      >
        <Row gutter={[16, 24]}>
          <Col span={10}>
            <div className={checkoutStyle['map-order']}>
              {/* <LoadScript
                googleMapsApiKey="AIzaSyBmwgoI4CD8N7Co637C8x4xOcWm_rDY39g"
                libraries={['places']}
              > */}
              {/* <LoadScript googleMapsApiKey="AIzaSyB-QUXW4SlGSdhqSlMYo79doJPzoM0ErmE"> */}
              <LoadScript googleMapsApiKey="AIzaSyC9lpGIfsxD7rTwAkH_q33RWbb6ssHLgHo">
                {/* <Autocomplete>
                  <input
                    type="text"
                    placeholder="Customized your placeholder"
                    style={{
                      boxSizing: `border-box`,
                      border: `1px solid transparent`,
                      width: `240px`,
                      height: `32px`,
                      padding: `0 12px`,
                      borderRadius: `3px`,
                      boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                      fontSize: `14px`,
                      outline: `none`,
                      textOverflow: `ellipses`,
                      left: '50%'
                    }}
                  />
                </Autocomplete> */}
                <DistanceMatrixService
                  options={{
                    destinations: [
                      {
                        lat: meQuery.data.getProfile.latitude,
                        lng: meQuery.data.getProfile.longtitude
                      }
                    ],
                    origins: [{ lat: storeInfo.latitude, lng: storeInfo.longtitude }],
                    travelMode: 'DRIVING'
                  }}
                  callback={(response, status) => {
                    console.log('RESONSE: ', response)
                    if (status == 'OK') {
                      setDistance(response.rows[0].elements[0].distance.text)
                      setDistanceInt(response.rows[0].elements[0].distance.value)
                    }
                  }}
                />
                <GoogleMap
                  mapContainerStyle={{
                    width: '100%',
                    height: '100%'
                  }}
                  center={{
                    lat: marker.lat,
                    lng: marker.lng
                  }}
                  zoom={11}
                >
                  <Marker
                    position={{
                      lat: storeInfo.latitude,
                      lng: storeInfo.longtitude
                    }}
                  />
                  <Marker
                    position={{
                      lat: meQuery.data.getProfile.latitude,
                      lng: meQuery.data.getProfile.longtitude
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
            <div className={checkoutStyle['direction-content']}>
              <div className={checkoutStyle['direction-info']}>
                <div className={checkoutStyle['direction-from']}>
                  <div className={checkoutStyle['direction-name']}>{storeInfo.name}</div>
                  <div className={checkoutStyle['direction-address']}>{storeInfo.address}</div>
                </div>
                <div className={checkoutStyle['direction-to']}>
                  <div>
                    <div className={checkoutStyle['direction-name']}>
                      <span>{meQuery.data.getProfile.name}</span>
                      <span> - {meQuery.data.getProfile.phone}</span>
                    </div>
                    <div className={checkoutStyle['direction-address']}>
                      <span> {meQuery.data.getProfile.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={14}>
            <p className={checkoutStyle['title-popup-order']}>Order Detail</p>
            <div className={checkoutStyle['order-list']}>
              {order.map((e) => (
                <div key={e.id}>
                  <div className={checkoutStyle['order-item']}>
                    <span className={checkoutStyle['order-item-number']}>{e.quantity}</span>
                    <div className={checkoutStyle['order-item-info']}>
                      <div className={checkoutStyle['order-item-name']}>
                        <span className={checkoutStyle['txt-bold']}>{e.name}&nbsp;</span>
                      </div>
                    </div>
                    <div className={checkoutStyle['order-item-price']}>
                      {e.price}
                      <span className={checkoutStyle['format-price']}>đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={checkoutStyle['info-order']}>
              <div className={checkoutStyle['row']}>
                <div className={checkoutStyle['col']}>
                  Total <span className={checkoutStyle['txt-bold']}>{order.length}</span>{' '}
                  {order.length > 1 ? 'serves' : 'serve'}
                </div>
                <div style={{ fontWeight: 'bold' }} className={checkoutStyle['col-auto']}>
                  {total}
                  <span className={checkoutStyle['format-price']}>đ</span>
                </div>
              </div>
              <div className={checkoutStyle['row']}>
                <div className={checkoutStyle['col']}>
                  Shipping Fee: <span className={checkoutStyle['txt-red']}>{distance}</span>
                  <span className={checkoutStyle['show-fee-min']}>
                    &nbsp;{' '}
                    <Tooltip title="Freeship under 5km. Over 5km, 1000vnd/km">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                </div>
                <div className={checkoutStyle['col-auto']}>
                  &nbsp;{shippingFee}
                  <span className={checkoutStyle['format-price']}>đ</span>
                </div>
              </div>
              <div className={checkoutStyle['row']}>
                <div className={checkoutStyle['col']}>
                  <span>Total</span>
                </div>
                <div className={checkoutStyle['col-auto']}>
                  {total + shippingFee}
                  <span className={checkoutStyle['format-price']}>đ</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Modal>
    )
  } else {
    return <div></div>
  }
}
