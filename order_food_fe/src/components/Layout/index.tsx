import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import NavBar from '../Header'
import Footer from '../Footer'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is our final project' }: Props) => (
  <div>
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/icon_logo.jpg" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <NavBar />
    <div style={{ paddingTop: '66px' }}>{children}</div>

    <Footer />
  </div>
)

export default Layout
