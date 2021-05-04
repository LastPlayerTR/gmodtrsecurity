import React from "react"
import styles from "../styles/Home.module.css"

const Success: React.FC = () => {
     return <div className={styles.hero}>
          <div className="alert alert-success" role="alert">
               Hesapların başarıyla bağalandı! Discord'a devam edebilirsin!
          </div>
     </div>
}

export default Success