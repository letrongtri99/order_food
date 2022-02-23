import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { Upload, Button, message } from 'antd'
import React, { useState, useEffect } from 'react'
import { withApollo } from '../utils/withApollo'
import { useGetProfileQuery } from '../generated/graphql'
import ImgCrop from 'antd-img-crop'

interface UploadAvatarProps {
  handleChangeAvatar: (avatar: any) => void
}

const UploadAvatar: React.FC<UploadAvatarProps> = ({ handleChangeAvatar }) => {
  const [loadingAvatar, setLoadingAvatar] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const { data, loading, error } = useGetProfileQuery({
    fetchPolicy: 'network-only'
  })

  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!')
    }
    return isJpgOrPng && isLt2M
  }

  const getBase64 = (img: any, callback: any) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      callback(reader.result)
    })
    reader.readAsDataURL(img)
  }

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoadingAvatar(true)
      return
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, async (imageUrl: string) => {
        setImageUrl(imageUrl)
        setLoadingAvatar(false)
        handleChangeAvatar(info.file.originFileObj)
      })
    }
  }

  const uploadButton = (
    <div>
      {loadingAvatar ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  useEffect(() => {
    if (!loading && data?.getProfile.avatarUrl) {
      setImageUrl(`${process.env.NEXT_PUBLIC_API_URL}/${data.getProfile.avatarUrl}`)
    }
  }, [loading])

  return (
    <ImgCrop aspect={1.6}>
      <Upload
        // style={{ width: '115px', height: '115px', borderRadius: '50%' }}
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
      </Upload>
    </ImgCrop>
  )
}

export default withApollo({ ssr: true })(UploadAvatar)
