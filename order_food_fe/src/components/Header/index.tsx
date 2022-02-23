import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Layout,
  Menu,
  Breadcrumb,
  Popover,
  Button,
  Avatar,
  Dropdown,
  Spin,
  notification
} from 'antd'
import { ArrowDownOutlined, UserOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { withApollo } from '../../utils/withApollo'
import { useLogoutMutation, useGetProfileQuery } from '../../generated/graphql'
import { setAccessToken, getAccessToken } from '../../shared/accessToken'
import styles from './header.module.css'
import { io } from 'socket.io-client'

const { Header, Content, Footer } = Layout

const content = (
  <div className={styles['place-item']}>
    <p>
      <div>TP. HCM</div> <span>51874 địa điểm</span>
    </p>
    <p>
      <div>Hà Nội</div> <span>60000 địa điểm</span>
    </p>
  </div>
)

const NavBar = () => {
  const socket = io(process.env.NEXT_PUBLIC_API_URL)

  const router = useRouter()
  const [logout, { client }] = useLogoutMutation()

  const { data, loading, error } = useGetProfileQuery()

  useEffect(() => {
    if (!loading) {
      socket.on('status order', (arg) => {
        if (data?.getProfile.id === arg.customerId && localStorage.getItem('role') === 'customer') {
          notification['info']({
            message: `Order ${arg.orderId}`,
            description: arg.message
          })
        }
      })

      socket.on('miss order', (arg) => {
        if (data?.getProfile.id == arg.customerId && localStorage.getItem('role') === 'customer') {
          notification['warning']({
            message: `Order ${arg.orderId}`,
            description: arg.message
          })
        }
      })
    }
  }, [loading])

  const back = async () => {
    try {
      await logout()
      setAccessToken('')
      switch (localStorage.getItem('role')) {
        case 'customer':
          router.push('/home')
          break
        default:
          router.push('/login')
      }
      localStorage.removeItem('role')
      localStorage.removeItem('slug')
    } catch (e) {
      console.log(e)
    }
  }

  const menu = (
    <Menu>
      {localStorage.getItem('role') === 'customer' && (
        <Menu.Item key="1">
          <Link href="/order-history">
            <a rel="noopener noreferrer">Order History</a>
          </Link>
        </Menu.Item>
      )}
      <Menu.Item key="2">
        <Link href="/user-management/profile">
          <a rel="noopener noreferrer">Update User Information</a>
        </Link>
      </Menu.Item>
      <Menu.Item key="3">
        <a target="_blank" rel="noopener noreferrer" onClick={back}>
          Log Out
        </a>
      </Menu.Item>
    </Menu>
  )
  return (
    <Header className={styles['header']}>
      <div>
        <img className={styles['header__icon']} src="/logo_corporation.png" alt="me" />
      </div>

      <Menu theme="light" mode="horizontal" defaultSelectedKeys={['1']}>
        {localStorage.getItem('role') === 'delivery' ? (
          <Menu.Item key="1">
            <Link href="/delivery">Order Management</Link>
          </Menu.Item>
        ) : localStorage.getItem('role') === 'customer' ? (
          <Menu.Item key="1">
            <Link href="/home">Food</Link>
          </Menu.Item>
        ) : localStorage.getItem('role') === 'store' ? (
          <Menu.Item key="1">
            <Link href={'/store-management/' + data?.getProfile.slug_name}>Store Management</Link>
          </Menu.Item>
        ) : (
          <Menu.Item key="1">
            <Link href="/home">Food</Link>
          </Menu.Item>
        )}
      </Menu>
      <div>
        {getAccessToken() ? (
          <div>
            {loading ? (
              <Spin className={styles['header__spin']} />
            ) : (
              <div>
                <span className={styles['header__profile']}>{data && data.getProfile.name}</span>
                <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                  <Avatar
                    className={styles['avatar-account']}
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.getProfile.avatarUrl}`}
                    icon={!data.getProfile.avatarUrl && <UserOutlined />}
                    size="large"
                  />
                </Dropdown>
              </div>
            )}
          </div>
        ) : (
          <Button type="primary" size="large" className={styles['header__login']}>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </Header>
  )
}

export default withApollo({ ssr: true })(NavBar)
