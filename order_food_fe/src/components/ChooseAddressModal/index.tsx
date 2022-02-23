import React, { useState } from 'react'
import ChooseAddressModal from "./ChooseAddressModal.module.css";
import { Input, Modal, Row, Col, Typography, Space, Collapse } from 'antd';
import { HeatMapOutlined, PushpinOutlined, SearchOutlined, RightOutlined } from '@ant-design/icons';

const { Link } = Typography
const { Panel } = Collapse

interface ChoseAdressModalProps {
    visible: boolean,
    onCancel: () => void
}

export const ChoseAdressModal: React.FC<ChoseAdressModalProps> = ({ visible, onCancel }) => {
    const [isMapOpen, setMapOpen] = useState(false)
    const API_key = 'AIzaSyBmwgoI4CD8N7Co637C8x4xOcWm_rDY39g'
    return (
        <>
        
        <Modal title="Choose your address" visible={visible} onCancel={onCancel} footer={false} width={800}>
            <Input placeholder="Enter your address" size="large" prefix={<SearchOutlined />} suffix={<HeatMapOutlined />} />
            <Collapse ghost bordered={false} expandIconPosition='right'>
                <Panel showArrow={false} header="Look for your address" key="1">
                <div>
                
                </div>

                
                </Panel>
            </Collapse>
        </Modal>
        </>
    );
}