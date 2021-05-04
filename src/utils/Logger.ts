import chalk from "chalk";

const getDate = (x = new Date()) => `[${x.getHours()}:${x.getMinutes()}:${x.getSeconds()}]`

export default class Logger {
     static info(msg: string) {
          console.log(chalk.blue(`${getDate()} [INFO] ${msg}`))
     }

     static warn(msg: string) {
          console.log(chalk.yellow(`${getDate()} [WARN] ${msg}`))
     }

     static success(msg: string) {
          console.log(chalk.green(`${getDate()} [SUCCESS] ${msg}`))
     }
}