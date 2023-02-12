import React from 'react'
import '../styles/globals.css'
import App from "next/app"
import Head from 'next/head'

export default class extends App {
     render() {
          return <>
               <Head>
                    <meta name="viewport" content="width=device-width,initial-scale=1" />

                    <title>Garry's Mod Türkiye</title>

                    <meta content="Gmod TR Hesap Doğrulama Sistemi" property="og:title" />
                    <meta content="Sunucu'ya erişim kazanabilmek için hesabını doğrulman lazım. Hesabını doğrulamak için Discord ile giriş yapman lazım." property="og:description" />
                    <meta content="Gmod TR" property="og:site_name" />
                    <meta content="https://gmodtrsecurity.herokuapp.com/assets/icon.png" property='og:image' />
                    <meta name="theme-color" content="#0082ff"></meta>

                    <link rel="shortcut icon" href="/assets/icon.png" type="image/png" />
                    
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossOrigin="anonymous"></link>
               </Head>
               <this.props.Component {...this.props.pageProps}></this.props.Component>
          </>
     }
}