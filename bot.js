const mineflayer = require("mineflayer")
const readline = require("readline")
const config = require('./config.json')
const fs = require('fs')
const http = require('http')  // ← THÊM

// Giữ bot sống trên Render
http.createServer((req, res) => res.end('Bot running!')).listen(process.env.PORT || 3000)  // ← THÊM

// ... phần còn lại giữ nguyên
let bot_args = {
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    respawn: config.respawn
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})




let reconnect = true

let reconnecting = false


let afkInterval = null
let wAfkInterval = null





function start_bot() {
    const bot = mineflayer.createBot(bot_args)

    bot.on('login', () => {
        console.log('Logged in')


        if (config.registered == false) {
            setTimeout(() => {
                bot.chat(`/dk ${config.botPassword}`)
                config.registered = true
                console.log('[+] Đả Đăng Ký')

                fs.writeFileSync('./config.json', JSON.stringify(config, null, 4))
            }, 2000);
        } else {
            setTimeout(() => {
                bot.chat(`/dn ${config.botPassword}`)
                console.log('[+] Đả Gửi Lệnh Đăng Nhập')
            }, 2000);
        }
    })


    bot.on('death', () => {
        console.log('im dead')

        let delay = Math.floor(Math.random() * 10000)

        console.log(`Respawning in ${delay}...`)
        setTimeout(() => {
            bot.respawn()
        }, delay);
    })



    bot.on('spawn', () => {
        console.log("Đăng Nhập Thành Công")
    })


    bot.on('chat', (username, message) => {

        // if (message == 'hello') {
        //     bot.chat('hello from bot')
        // } else if (message == 'go forward' && username == 'logiteck_0') {
        //     bot.setControlState('forward', true)
        // } else if (message == 'stop') {
        //     bot.clearControlStates()
        // } else if (message == 'jump') {
        //     bot.setControlState('jump', true)
        // }

    })


    bot.on('messagestr', (messagePosition, message) => {
        console.log(`[${message}] ${messagePosition}`)
    })


    // cmd handler
    rl.removeAllListeners('line')
    rl.on('line', (line) => {

        if (line == 'menu') {
            bot.chat('/menu')
        } else if (line.includes('tpa')) {
            bot.chat(`/tpa ${config.ownerUsername}`)
        } else if (line == 'afk') {
            clearInterval(afkInterval)

            afkInterval = setInterval(() => {
                bot.setControlState('jump', true)

                setTimeout(() => {
                    bot.setControlState('jump', false)
                }, 200);
            }, 5000);
        } else if (line == 'wafk') {
            clearInterval(wAfkInterval)
            let yaw = 0;

            wAfkInterval = setInterval(() => {
                yaw += 0.5; 
                bot.look(yaw, -Math.PI / 2, true); 
            }, 500);
        } else if (line == 'stop') {
            clearInterval(wAfkInterval)
            clearInterval(afkInterval)
        } else if (line == 'exit') {
            reconnecting = false
            bot.quit()
        }
    })

    bot.on('windowOpen', (window) => {
        let windowTitle = window.title

        // try {
        //     if (typeof windowTitle === 'string') {
        //         const parsed = JSON.parse(windowTitle)
        //         windowTitle = parsed.text || windowTitle
        //     }
        // } catch(error) {
        //     console.log('[!] Something Went Wrong At Line 118')
        // }

        // // Ép về string an toàn
        // const titleString = String(windowTitle || '')
        
        // console.log(`[OPENNED] Title: ${titleString}`)
        // console.log(windowTitle)
        // console.log(window.slots)

        setTimeout(() => {
            bot.clickWindow(24, 0, 0)
            console.log('[+] Đang Vào KingSMP')
        }, 2653);
        
        // if (titleString.toLowerCase().includes('menu')) {
        //     console.log("Found Menu")

        //     setTimeout(() => {
        //         bot.clickWindow(25, 0, 0)
        //         console.log('[+] Clicked To KingSMP')
        //     }, 2653);
        // }
    })

    // bot.on('windowClose', () => {
    //     console.log('Window Closed')
    // })


    bot.on('end', () => {
        if (reconnecting) return

        reconnecting = true
        console.log('Disconnected')
        console.log('[+] Kết Nối Lại Sau 5s')

        setTimeout(() => {
            reconnecting = false
            start_bot()
        }, 5000)
    })
}

start_bot()
