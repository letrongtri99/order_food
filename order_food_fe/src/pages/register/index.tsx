import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Form, Input, Button, Select, message, Tabs } from 'antd'
import UploadAvatar from '../../components/UploadAvatar'
import Layout from '../../components/Layout'
import {
  useRegisterCustomerMutation,
  useRegisterDeliveryMutation,
  useRegisterStoreMutation
} from '../../generated/graphql'
import { withApollo } from '../../utils/withApollo'
import styles from './register.module.css'
import {
  GoogleMap,
  LoadScript,
  Marker,
  DistanceMatrixService,
  Autocomplete
} from '@react-google-maps/api'

const { Option } = Select
const { TabPane } = Tabs

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
}

const maps = [
  { district: 'bd', lat: 21.038042023865643, lng: 105.83606908168107 },
  { district: 'cg', lat: 21.04261472877447, lng: 105.7984661227376 },
  { district: 'dd', lat: 21.016228914165445, lng: 105.82172440992322 },
  { district: 'hd', lat: 20.95899964175659, lng: 105.76503011341003 },
  { district: 'hbt', lat: 21.00801520271103, lng: 105.8575487961273 },
  { district: 'hk', lat: 21.02926846076937, lng: 105.8535485394187 },
  { district: 'hm', lat: 20.977576873664873, lng: 105.85793762226764 },
  { district: 'lb', lat: 21.040741927837356, lng: 105.89081521804896 },
  { district: 'th', lat: 21.074156072947797, lng: 105.82142031820862 },
  { district: 'tx', lat: 20.994471176876154, lng: 105.81155718585295 }
]

const Register = () => {
  const router = useRouter()
  const [file, setFile] = useState()
  const [roleRegister, setRoleRegister] = useState('customer')
  const [registerCustomer] = useRegisterCustomerMutation()
  const [registerDelivery] = useRegisterDeliveryMutation()
  const [registerStore] = useRegisterStoreMutation()

  const onFinish = async (values: any) => {
    if (!file) {
      message.error('You must upload your avatar!')
    } else {
      let responseRegister
      let lat = 0
      let lng = 0
      delete values['confirm']

      if (values.district) {
        let index = maps.findIndex((e) => e.district === values.district)
        if (index > -1) {
          lat = maps[index].lat
          lng = maps[index].lng
        }
      }
      const newSubmitValues = {
        longtitude: lng,
        latitude: lat,
        ...values
      }

      switch (roleRegister) {
        case 'customer':
          responseRegister = await registerCustomer({
            variables: { options: newSubmitValues, avatar: file }
          })
          break
        case 'delivery':
          responseRegister = await registerDelivery({
            variables: { options: newSubmitValues, avatar: file }
          })
          break
        case 'store':
          delete newSubmitValues['gender']
          newSubmitValues['categoryId'] = Number(newSubmitValues['categoryId'])
          responseRegister = await registerStore({
            variables: { options: newSubmitValues, avatar: file }
          })
          break
        default:
          break
      }

      if (
        responseRegister.data.registerCustomer?.errors ||
        responseRegister.data.registerDelivery?.errors ||
        responseRegister.data.registerStore?.errors
      ) {
        switch (roleRegister) {
          case 'customer':
            message.error(responseRegister.data.registerCustomer.errors[0].message)
            break
          case 'delivery':
            message.error(responseRegister.data.registerDelivery.errors[0].message)
            break
          case 'store':
            message.error(responseRegister.data.registerStore.errors[0].message)
            break
          default:
            break
        }
      } else {
        message.success('Register successfully')
        router.push('/login')
      }
    }
  }

  const handleChangeAvatar = (avatar: any) => {
    setFile(avatar)
  }

  const changeRole = (key) => {
    switch (key) {
      case '1':
        setRoleRegister('customer')
        break
      case '2':
        setRoleRegister('delivery')
        break
      case '3':
        setRoleRegister('store')
        break
      default:
        break
    }
  }

  const renderFormRegister = () => {
    return (
      <Form
        name="register"
        onFinish={onFinish}
        size="large"
        scrollToFirstError
        className={styles['register-form']}
        initialValues={{ gender: 'male', categoryId: '1', district: 'hk' }}
        {...formItemLayout}
      >
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!'
            },
            {
              required: true,
              message: 'Please input your E-mail!'
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: 'Please input your password!'
            }
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!'
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'))
              }
            })
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          tooltip="What do you want others to call you?"
          rules={[{ required: true, message: 'Please input your name!', whitespace: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true, message: 'Please input your phone number!' }]}
        >
          <Input />
        </Form.Item>
        {roleRegister !== 'store' && (
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: 'Please select gender!' }]}
          >
            <Select placeholder="Select your gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        )}

        {roleRegister === 'store' && (
          <div>
            <Form.Item
              name="categoryId"
              label="Category"
              rules={[{ required: true, message: 'Please select category!' }]}
            >
              <Select placeholder="Select your category">
                <Option value="1">Food</Option>
                <Option value="2">Drink</Option>
                <Option value="3">Fastfood</Option>
              </Select>
            </Form.Item>
          </div>
        )}
        {(roleRegister === 'store' || roleRegister === 'customer') && (
          <div>
            <Form.Item
              name="district"
              label="District"
              rules={[{ required: true, message: 'Please select district!' }]}
            >
              <Select placeholder="Select your district">
                <Option value="bd">Ba Dinh</Option>
                <Option value="cg">Cau Giay</Option>
                <Option value="dd">Dong Da</Option>
                <Option value="hd">Ha Dong</Option>
                <Option value="hbt">Hai Ba Trung</Option>
                <Option value="hk">Hoan Kiem</Option>
                <Option value="hm">Hoang Mai</Option>
                <Option value="lb">Long Bien</Option>
                <Option value="th">Tay Ho</Option>
                <Option value="tx">Thanh Xuan</Option>
              </Select>
            </Form.Item>
          </div>
        )}

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please input your address!' }]}
        >
          {/* <LoadScript
            googleMapsApiKey="AIzaSyBmwgoI4CD8N7Co637C8x4xOcWm_rDY39g"
            libraries={['places']}
          > */}
          {/* <Autocomplete> */}
          <Input />
          {/* </Autocomplete> */}
          {/* </LoadScript> */}
        </Form.Item>
        <Form.Item label="Avatar">
          <UploadAvatar handleChangeAvatar={handleChangeAvatar} />
        </Form.Item>
        <Form.Item className={styles['register-submit']}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
    )
  }
  return (
    <Layout title="Register">
      <div className={styles.register}>
        <h1 className="center">Register</h1>
        <Tabs
          defaultActiveKey="1"
          centered
          className={styles['register-tab']}
          onChange={changeRole}
        >
          <TabPane tab="Customer" key="1">
            {renderFormRegister()}
          </TabPane>
          <TabPane tab="Delivery" key="2">
            {renderFormRegister()}
          </TabPane>
          <TabPane tab="Store" key="3">
            {renderFormRegister()}
          </TabPane>
        </Tabs>
      </div>
    </Layout>
  )
}

export default withApollo({ ssr: true })(Register)
