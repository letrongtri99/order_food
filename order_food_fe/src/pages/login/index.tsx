import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, Tabs, Alert } from 'antd'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  UserOutlined,
  LockOutlined,
  GooglePlusOutlined,
  FacebookOutlined,
  PhoneOutlined
} from '@ant-design/icons'
import { withApollo } from '../../utils/withApollo'
import Layout from '../../components/Layout'
import {
  useLoginMutation,
  useByeQuery,
  useLoginDeliveryMutation,
  useLoginStoreMutation
} from '../../generated/graphql'
import { setAccessToken } from '../../shared/accessToken'
import styles from './login.module.css'

const { TabPane } = Tabs

const login = () => {
  const router = useRouter()
  const [login, { client }] = useLoginMutation()
  const [loginDelivery] = useLoginDeliveryMutation()
  const [loginStore] = useLoginStoreMutation()
  const [roleLogin, setRoleLogin] = useState('customer')
  const [error, setError] = useState('')
  const onFinish = async (values: any) => {
    let response
    switch (roleLogin) {
      case 'customer':
        response = await login({
          variables: values
        })
        break
      case 'delivery':
        response = await loginDelivery({
          variables: values
        })
        break
      case 'store':
        response = await loginStore({
          variables: values
        })
        break
      default:
        break
    }
    if (response && response.data) {
      if (
        response.data.login?.errors ||
        response.data.loginDelivery?.errors ||
        response.data.loginStore?.errors
      ) {
        switch (roleLogin) {
          case 'customer':
            setError(response.data.login.errors[0].message)
            break
          case 'delivery':
            setError(response.data.loginDelivery.errors[0].message)
            break
          case 'store':
            setError(response.data.loginStore.errors[0].message)
            break
          default:
            break
        }
      } else {
        let valueToken
        switch (roleLogin) {
          case 'customer':
            localStorage.setItem('role', 'customer')
            valueToken = response.data.login.accessToken
            break
          case 'delivery':
            localStorage.setItem('role', 'delivery')
            valueToken = response.data.loginDelivery.accessToken
            break
          case 'store':
            localStorage.setItem('role', 'store')
            localStorage.setItem('slug', response.data.loginStore.slug)
            valueToken = response.data.loginStore.accessToken
            break
          default:
            break
        }
        setAccessToken(valueToken)
        if (typeof router.query.next === 'string') {
          router.push(router.query.next)
        } else {
          // worked
          if (roleLogin === 'delivery') {
            router.push(`/delivery`)
          } else if (roleLogin === 'store') {
            router.push(`/store-management/${response.data.loginStore.slug}`)
          } else {
            router.push('/home')
          }
          await client!.resetStore()
        }
      }
    }
  }

  const changeRole = (key) => {
    switch (key) {
      case '1':
        setRoleLogin('customer')
        break
      case '2':
        setRoleLogin('delivery')
        break
      case '3':
        setRoleLogin('store')
        break
      default:
        break
    }
  }

  const hideError = () => {
    setError('')
  }

  const renderForm = () => {
    return (
      <Form name="basic" initialValues={{ remember: true }} onFinish={onFinish} size="large">
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your username or email!' }]}
          className={styles.login__username}
        >
          <Input
            onChange={hideError}
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username or email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
          className={styles.login__username}
        >
          <Input.Password
            onChange={hideError}
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Password"
          />
        </Form.Item>

        {error && (
          <Alert className={styles['warning-form-login']} message={error} type="error" showIcon />
        )}

        <Link href="/register">
          <Form.Item className={styles.login__remember}>
            <a className={styles.login__forgot}>No account ? Register now!</a>
          </Form.Item>
        </Link>

        <Form.Item className={styles.button__container}>
          <Button type="primary" htmlType="submit" className={styles.button__submit}>
            LOGIN
          </Button>
        </Form.Item>
      </Form>
    )
  }

  return (
    <Layout title="Login">
      <div className={styles.login}>
        <Tabs defaultActiveKey="1" centered className={styles.login__tab} onChange={changeRole}>
          <TabPane tab="Customer" key="1">
            {renderForm()}
          </TabPane>
          <TabPane tab="Shipper" key="2">
            {renderForm()}
          </TabPane>
          <TabPane tab="Store" key="3">
            {renderForm()}
          </TabPane>
        </Tabs>
      </div>
    </Layout>
  )
}

export default withApollo({ ssr: true })(login)
