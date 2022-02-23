import React, { useEffect, useState, useMemo } from 'react'
import {
  Input,
  Modal,
  Row,
  Col,
  Typography,
  Space,
  Collapse,
  Form,
  Select,
  Button,
  InputNumber,
  Upload,
  notification,
  message,
  Image
} from 'antd'
import {
  HeatMapOutlined,
  PushpinOutlined,
  SearchOutlined,
  RightOutlined,
  UploadOutlined,
  PlusOutlined
} from '@ant-design/icons'
import {
  Product,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateImgProductMutation
} from '../../generated/graphql'
import { withApollo } from '../../utils/withApollo'
import ImgCrop from 'antd-img-crop'

const { Link } = Typography
const { Panel } = Collapse

interface EditProductProps {
  visible: boolean
  edit: boolean
  productInfo: Product
  refetch: () => void
  onCancel: () => void
}

function getBase64(img: any, callback: any) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

const onPreview = async (file: any) => {
  let src = file.url
  if (!src) {
    src = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file.originFileObj)
      reader.onload = () => resolve(reader.result)
    })
  }
  const image = new Image()
  image.src = src
  const imgWindow = window.open(src)
  imgWindow?.document.write(image.outerHTML)
}

const EditProductModal: React.FC<EditProductProps> = ({
  visible,
  edit,
  productInfo,
  onCancel,
  refetch
}) => {
  const [form] = Form.useForm()

  const [fileImg, setFileImg] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmit, setIsSubmit] = useState(false)

  const [createProduct] = useCreateProductMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [updateImgProduct] = useUpdateImgProductMutation()

  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!')
    }
    return isJpgOrPng && isLt2M ? true : Upload.LIST_IGNORE
  }

  const handleChangeImgProduct = (info: any) => {
    form.setFieldsValue({
      imgUrl: info
    })
    if (info.file.status === 'done') {
      setFileImg(info.file.originFileObj)

      getBase64(info.file.originFileObj, (imageUrl: any) => setImageUrl(imageUrl))
    }
  }

  const handleUpdateProfile = async (formValue: Product) => {
    setIsSubmit(true)
    if (edit) {
      if (fileImg !== null) {
        await updateImgProduct({
          variables: {
            id: productInfo.id,
            imgUrl: fileImg
          }
        })
      }
      const { errors } = await updateProduct({
        variables: {
          id: productInfo.id,
          input: {
            name: formValue.name,
            category: formValue.category,
            description: formValue.description,
            price: formValue.price
          }
        }
      })
      if (errors) {
        notification['error']({
          message: 'Error!',
          description: `Update product error!`
        })
      }
      notification['success']({
        message: 'Thank You!',
        description: `You have updadted the product.`
      })
    } else {
      const { errors } = await createProduct({
        variables: {
          input: {
            name: formValue.name,
            category: formValue.category,
            description: formValue.description,
            price: formValue.price
          },
          imgUrl: fileImg
        }
      })
      if (errors) {
        notification['error']({
          message: 'Error!',
          description: `Create product error!`
        })
      }
      notification['success']({
        message: 'Thank You!',
        description: `You have created a new product.`
      })
    }
    form.resetFields()
    setIsSubmit(false)
    setFileImg(null)
    onCancel()
    refetch()
  }

  useEffect(() => {
    form.setFieldsValue(productInfo)
    if (productInfo.imgUrl) {
      setImageUrl(`${process.env.NEXT_PUBLIC_API_URL}/${productInfo.imgUrl}`)
    }
  }, [productInfo])

  // useEffect(() => {
  //   if (!loading && data?.getProfile.avatarUrl) {
  //     setImageUrl(`${process.env.NEXT_PUBLIC_API_URL}/${data.getProfile.avatarUrl}`)
  //   }
  // }, [loading])

  const newProductTemplate = (
    <>
      <Modal
        title="Create New Product"
        visible={visible}
        onCancel={onCancel}
        footer={false}
        width={800}
      >
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          name="basic"
          labelAlign="left"
          size="large"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required!' }]}
          >
            <Input placeholder="Please enter your product's name..." />
          </Form.Item>
          <Form.Item
            name="category"
            label="Categroy"
            rules={[{ required: true, message: 'Categroy is required!' }]}
          >
            <Input placeholder="Please enter the category. Example: Burger, Pizza, Rice,..." />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input placeholder="Optional, just a look about your product" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Price is required!' }]}
          >
            <InputNumber min={0} max={100000000} />
          </Form.Item>
          <Form.Item
            name="imgUrl"
            label="Upload Image"
            rules={[{ required: true, message: 'Product image is required!' }]}
          >
            <ImgCrop>
              <Upload
                name="logo"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={beforeUpload}
                className="avatar-uploader"
                onChange={handleChangeImgProduct}
              >
                {imageUrl ? (
                  <img
                    src={
                      imageUrl ||
                      'https://lh3.googleusercontent.com/proxy/OdfBgwqWy7-MmhudqO6wi8zotW7-wzpFkTuE08FNLsEfaRXGVYsewOT5-gywVoB_zKphFBckN1ffTrLdBQ'
                    }
                    alt="avatar"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </ImgCrop>
          </Form.Item>
          <Form.Item>
            <Button disabled={isSubmit} style={{ float: 'right' }} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )

  const editProductTemplate = (
    <>
      <Modal
        title="Edit Your Product"
        visible={visible}
        onCancel={onCancel}
        footer={false}
        width={800}
      >
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          name="basic"
          labelAlign="left"
          size="large"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required!' }]}
            initialValue={productInfo.name}
          >
            <Input placeholder="Please enter your product's name..." />
          </Form.Item>
          <Form.Item
            name="category"
            label="Categroy"
            rules={[{ required: true, message: 'Categroy is required!' }]}
            initialValue={productInfo.category}
          >
            <Input placeholder="Please enter the category. Example: Burger, Pizza, Rice,..." />
          </Form.Item>
          <Form.Item name="description" label="Description" initialValue={productInfo.description}>
            <Input placeholder="Optional, just a look about your product" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Price is required!' }]}
            initialValue={productInfo.price}
          >
            <InputNumber min={0} max={100000000} />
          </Form.Item>
          <Form.Item name="imgUrl" label="Upload Image">
            <ImgCrop>
              <Upload
                name="logo"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={beforeUpload}
                className="avatar-uploader"
                onChange={handleChangeImgProduct}
              >
                {imageUrl ? (
                  <img
                    src={
                      imageUrl ||
                      'https://lh3.googleusercontent.com/proxy/OdfBgwqWy7-MmhudqO6wi8zotW7-wzpFkTuE08FNLsEfaRXGVYsewOT5-gywVoB_zKphFBckN1ffTrLdBQ'
                    }
                    alt="avatar"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </ImgCrop>
          </Form.Item>
          <Form.Item>
            <Button disabled={isSubmit} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )

  return edit ? editProductTemplate : newProductTemplate
}

export default withApollo({ ssr: true })(EditProductModal)
