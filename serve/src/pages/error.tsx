import React from "react"
import styles from "../styles/Home.module.css"
import { NextPageContext } from "next"

export function getServerSideProps(context: NextPageContext) {
     return { props: { data: context.query.text || "Bilinmeyen bir hata oluştu!" } }
}

const Home: React.FC<{ data: string }> = ({ data }) => {
     return <div className={styles.hero}>
          <h1>Hay Aksi!</h1>
          <div className="alert alert-danger" role="alert">
               {data}
          </div>
     </div>
}

export default Home