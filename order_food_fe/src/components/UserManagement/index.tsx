import React, { ReactNode } from 'react'
import { Col, Layout, Menu, Row } from 'antd'
import Link from 'next/link'
import Template from '../Layout'
import userManagementStyle from './UserManagement.module.css'

const { Content, Sider } = Layout

interface UserManagementProps {
  children: ReactNode
}

const UserManagement: React.FC<UserManagementProps> = ({ children }) => {
  return (
    <Template title="Profile Update">
      <div className={userManagementStyle['container']}>
        <Layout>
          <Sider className={userManagementStyle['sider']} theme="light">
            <Menu style={{ border: 'none' }} mode="vertical">
              <Menu.Item>
                <Link href="/user-management/profile">Update Profile</Link>
              </Menu.Item>
              {/* <Menu.Item>
                <Link href="/user-management/order-information">Order Information</Link>
              </Menu.Item> */}
            </Menu>
          </Sider>
          <Content className={userManagementStyle['content']}>{children}</Content>
        </Layout>
      </div>
    </Template>
  )
}

export default UserManagement
