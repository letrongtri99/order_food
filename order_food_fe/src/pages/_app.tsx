import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { setAccessToken } from '../shared/accessToken'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import '../../styles/globals.css'

const antIcon = <LoadingOutlined style={{ fontSize: 64 }} spin />

function MyApp({ Component, pageProps }: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh_token`, {
      method: 'POST',
      credentials: 'include'
    })
      .then((res) => {
        return res.json()
      })
      .then(async (data) => {
        const { accessToken } = data
        if (
          accessToken !== '' &&
          (router.pathname.startsWith('/login') || router.pathname.startsWith('/register'))
        ) {
          router.push('/home')
          router.events.on('routeChangeComplete', () => {
            localStorage.setItem('role', data.role)
            setAccessToken(accessToken)
            setLoading(false)
          })
        } else {
          localStorage.setItem('role', data.role)
          setAccessToken(accessToken)

          const conditionRole = [
            router.pathname === '/delivery' && localStorage.getItem('role') !== 'delivery',
            router.pathname.startsWith('/store-management') &&
              localStorage.getItem('role') !== 'store',
            router.pathname === '/order-history' && localStorage.getItem('role') !== 'customer',
            router.pathname === '/user-management' && accessToken === '',
            router.pathname === '/' && accessToken === '',
            router.pathname === '/' && localStorage.getItem('role') === 'customer'
          ]

          if (
            (router.pathname === '/home' ||
              router.pathname === '/' ||
              router.pathname.startsWith('/store-management') ||
              router.pathname === '/order-history') &&
            localStorage.getItem('role') === 'delivery'
          ) {
            await router.replace('/delivery')
            setLoading(false)
          } else if (
            (router.pathname === '/home' ||
              router.pathname === '/' ||
              router.pathname === '/delivery' ||
              router.pathname === '/order-history') &&
            localStorage.getItem('role') === 'store'
          ) {
            await router.replace(`/store-management/${localStorage.getItem('slug')}`)
            setLoading(false)
          } else if (conditionRole.includes(true)) {
            await router.replace('/home')
            setLoading(false)
          } else {
            setLoading(false)
          }
        }
      })
  }, [])

  if (loading) {
    return (
      <div style={{ height: '100vh' }}>
        <Spin className="body-loading" indicator={antIcon} />
      </div>
    )
  }
  return <Component {...pageProps} />
}

export default MyApp
