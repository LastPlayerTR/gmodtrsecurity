import React from "react"
import styles from "../styles/Home.module.css"
import { NextPageContext } from "next"

export function getServerSideProps(context: NextPageContext) {
     const data: any = {}

     if (context.query.discord_id) {
          data.discord = {
               id: context.query.discord_id,
               username: context.query.discord_name,
               discriminator: context.query.discord_disc,
               //@ts-ignore
               avatar: `https://cdn.discordapp.com/avatars/${context.query.discord_id}/${context.query.discord_avatar ? context.query.discord_avatar : (context.query.discord_disc % 2)}.png`
          }
     }

     if (context.query.steam_name) {
          data.steam = {
               name: context.query.steam_name,
               avatar: context.query.steam_avatar
          }
     }

     return { props: { data } }
}

const Home: React.FC<{ data: { discord?: { id: string, username: string, discriminator: string, avatar: string }, steam: any } }> = ({ data }) => {
     return <div className={styles.hero}>
          <div className={styles.mainContainer}>
               <div className={styles.socialHolder}>
                    <img className={styles.avatar} src={data.discord?.avatar || "/assets/discord.png"} alt="" />
                    <h2>{data.discord ? `${data.discord.username}#${data.discord.discriminator}` : "Discord hesabı bağlı değil"}</h2>
               </div>
               <h1 className={styles.plus}>+</h1>
               <div className={styles.socialHolder}>
                    <img className={styles.avatar} src={data.steam?.avatar || "/assets/steam.png"} alt="" />
                    <h2>{data.steam ? data.steam.name : "Steam hesabı bağlı değil"}</h2>
               </div>
          </div>
          <div className={styles.btnList}>
               {!data.discord && <button onClick={() => open("/auth/discord/callback", "_self")} className={["btn", styles.discordbtn].join(" ")}>Discord'a bağlan</button>}
               {!data.steam && <button onClick={() => open("/auth/steam/callback", "_self")} className={["btn", styles.steambtn].join(" ")}>Steam'e bağlan</button>}
               {data.steam && data.discord && <button onClick={() => open("/link", "_self")} className="btn btn-success">Hesapları bağla</button>}
          </div>
     </div>
}

export default Home