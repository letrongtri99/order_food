import React, { useState } from 'react'
import { Input, Modal, Row, Col, Typography, Space, Collapse, Steps } from 'antd'
import {
  HeatMapOutlined,
  PushpinOutlined,
  SearchOutlined,
  RightOutlined,
  FileDoneOutlined,
  ForwardOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'
import { Order } from '../../generated/graphql'

const { Link } = Typography
const { Panel } = Collapse

interface ProgressModalProps {
  visible: boolean
  order: Order
  onCancel: () => void
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ visible, order, onCancel }) => {
  const getCurrent = () => {
    let current = 0
    if (order.pickedAt && order.arrivedAt) {
      current = 2
    }
    if (order.pickedAt && !order.arrivedAt) {
      current = 1
    }

    return current
  }

  return (
    <>
      <Modal
        width={800}
        title="Progress of order"
        visible={visible}
        onCancel={onCancel}
        footer={false}
      >
        <Steps size="small" current={getCurrent()}>
          {order.order_status === 3 ? (
            <Steps.Step status="error" title="Canceled" description="Order has been canceled" />
          ) : (
            <>
              <Steps.Step
                title="Order has been confirmed"
                description={order.createdAt}
                icon={<ShoppingCartOutlined />}
              />
              <Steps.Step
                title="Picked and On the way"
                description={order.pickedAt}
                icon={<ForwardOutlined />}
              />
              <Steps.Step
                title="Arrived Successfully"
                description={order.arrivedAt}
                icon={<FileDoneOutlined />}
              />
            </>
          )}
        </Steps>
      </Modal>
    </>
  )
}
