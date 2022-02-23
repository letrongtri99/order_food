import { Button, Col, Divider, Form, Input, Row, Select, Spin, message } from 'antd'
import React, { useState } from 'react'
import { withApollo } from '../../../utils/withApollo'
import UserManagement from '../../../components/UserManagement'
import UploadAvatar from '../../../components/UploadAvatar'
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddProfilePictureMutation,
  useUpdatePasswordMutation
} from '../../../generated/graphql'
import profileStyle from './Profile.module.css'

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 }
}

const Profile: React.FC = ({}) => {
  const currentRole = localStorage.getItem('role')
  const [file, setFile] = useState()
  const [isChangePassword, setIsChangePassword] = useState(false)
  const [updateProfile] = useUpdateProfileMutation()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [addProfilePicture] = useAddProfilePictureMutation()
  const [updatePasswordMutation, responseUpdate] = useUpdatePasswordMutation()
  const { data, loading, error, refetch, client } = useGetProfileQuery({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only'
  })

  const handleUpdateProfile = async (valuesProfile: any) => {
    const { email, password, old_password, new_password, ...newValuesProfile } = valuesProfile
    if (currentRole === 'store') {
      await updateProfile({
        variables: {
          gender: 'male',
          ...newValuesProfile
        }
      })
    } else {
      await updateProfile({
        variables: newValuesProfile
      })
    }
    await client.resetStore()
  }

  const handleChangeAvatar = (avatar: any) => {
    setFile(avatar)
  }

  const updateAvatar = async () => {
    await addProfilePicture({
      variables: {
        picture: file
      }
    })
    await client!.resetStore()
  }

  const handleChangePassword = (type: string, value: string) => {
    if (type === 'oldPassword') {
      setOldPassword(value)
    } else {
      setNewPassword(value)
    }
  }

  const handleUpdateNewPassword = async () => {
    let res = await updatePasswordMutation({
      variables: {
        oldPassword,
        newPassword
      }
    })

    if (res.data.updatePassword) {
      message.success('Changed password successfully')
      setIsChangePassword(false)
    } else {
      message.success('Old password is wrong')
    }
  }

  return (
    <UserManagement>
      <div className={profileStyle['header-user-profile']}>User Information</div>
      <div>
        <div className={profileStyle['user-profile-update']}>
          <div className={profileStyle['title-user']}>Upload Avatar</div>
          <Row>
            <Col flex={1}>
              <UploadAvatar handleChangeAvatar={handleChangeAvatar} />
            </Col>
            <Col flex={4}>
              <i>Chấp nhận GIF, JPEG, PNG, BMP với kích thước tối đa 2.0 MB</i>
              <br></br>
              {file && (
                <Button
                  onClick={updateAvatar}
                  className={profileStyle['update-btn']}
                  type="primary"
                >
                  Update
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </div>
      <Divider style={{ margin: '0' }} />
      <div>
        <div className={profileStyle['user-profile-update']}>
          <div className={profileStyle['title-user']}>Update Information</div>
          <div style={{ position: 'relative' }}>
            {loading ? (
              <Spin style={{ position: 'absolute' }} />
            ) : (
              <Form {...layout} name="basic" labelAlign="left" onFinish={handleUpdateProfile}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Name is required!' }]}
                  initialValue={data && data.getProfile.name}
                >
                  <Input placeholder="Name..." />
                </Form.Item>
                {currentRole !== 'store' && (
                  <Form.Item
                    name="gender"
                    label="Gender"
                    rules={[{ required: true, message: 'Gender is required!' }]}
                    initialValue={data && data.getProfile.gender}
                    className={profileStyle['gender-profile-update']}
                  >
                    <Select>
                      <Select.Option value="male">Male</Select.Option>
                      <Select.Option value="female">Female</Select.Option>
                      <Select.Option value="other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                )}

                <Form.Item
                  name="email"
                  label="Email"
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
                  hasFeedback
                  initialValue={data && data.getProfile.email}
                >
                  <Input placeholder="Email..." disabled={true} />
                </Form.Item>
                {!isChangePassword ? (
                  <Form.Item name="password" label="Password">
                    <div className={profileStyle['password']}>
                      <Input
                        value={'********'}
                        disabled={true}
                        className={profileStyle['password-input']}
                      />
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsChangePassword(true)
                        }}
                      >
                        Change Password
                      </Button>
                    </div>
                  </Form.Item>
                ) : (
                  <div>
                    <Form.Item name="old_password" label="Old Password">
                      <Input.Password
                        value={oldPassword}
                        onChange={(e) => {
                          handleChangePassword('oldPassword', e.target.value)
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="new_password" label="New Password">
                      <Input.Password
                        value={newPassword}
                        onChange={(e) => {
                          handleChangePassword('newPassword', e.target.value)
                        }}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      style={{ marginBottom: '10px' }}
                      onClick={handleUpdateNewPassword}
                    >
                      Save New Password
                    </Button>
                  </div>
                )}
                <Form.Item
                  name="phone"
                  label="Phone Number.."
                  rules={[{ required: true, message: 'Phone number is required!' }]}
                  initialValue={data && data.getProfile.phone}
                >
                  <Input placeholder="Phone Number..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            )}
          </div>
        </div>
      </div>
    </UserManagement>
  )
}

export default withApollo({ ssr: true })(Profile)
