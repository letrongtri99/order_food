import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Row, Col, Button } from 'antd'
import { GooglePlusOutlined, FacebookOutlined, InstagramOutlined } from '@ant-design/icons'
import styles from './footer.module.css'

const Footer = () => {
  return (
    <Row className={styles['footer__container']}>
      <Col span={8}>
        <strong>The best system order food online</strong>
      </Col>
      <Col span={8}>
        <div className="center">
          <img className={styles['footer__icon']} src="/logo_corporation.png" alt="me" />
          <p className={styles['footer__company']}>© 2021 Quoc - Tri Corporation</p>
          <Row className={styles['footer__social']}>
            <Col span={8}>
              <Button
                className={`${styles['footer__button--circle']} ${styles['footer__button--fb']}`}
                shape="circle"
                icon={<FacebookOutlined />}
              />
            </Col>
            <Col span={8}>
              <Button
                className={`${styles['footer__button--circle']} ${styles['footer__button--google']}`}
                shape="circle"
                icon={<GooglePlusOutlined />}
              />
            </Col>
            <Col span={8}>
              <Button
                className={`${styles['footer__button--circle']} ${styles['footer__button--instagram']}`}
                shape="circle"
                icon={<InstagramOutlined />}
              />
            </Col>
          </Row>
        </div>
      </Col>
      <Col span={8} className="right">
        <strong>City Address</strong>
        <div>Joint Stock Company TriQuoc</div>
        <div>No 1 Dai Co Viet Road, Hai Ba Trung District, Ha Noi</div>
        <div>Phone: 0123456789</div>
        <div>
          Email: <span className={styles['footer__email']}>tri_quoc@software.vn</span>
        </div>
        <div>
          <img
            width="250"
            src="https://www.now.vn/app/assets/img/gov_seals.jpg?c3d95a3d6c29919ae2c73a4a646841de"
          />
        </div>
      </Col>
    </Row>
  )
}

export default Footer
