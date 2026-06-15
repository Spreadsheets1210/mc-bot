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
            console.log('[+] Đã Đăng Ký')
            fs.writeFileSync('./config.json', JSON.stringify(config, null, 4))
        }, 2000)
    } else {
        setTimeout(() => {
            bot.chat(`/dn ${config.botPassword}`)
            console.log('[+] Đã Gửi Lệnh Đăng Nhập')
        }, 2000)
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
    console.log('Đã Spawn')

    // Chờ đăng nhập xong rồi mới mở menu
    setTimeout(() => {
        // Bước 1: Chọn ô số 5 (0-indexed nên là 4)
        bot.setQuickBarSlot(4)
        console.log('[+] Đã chọn ô số 5')

        // Bước 2: Chuột phải để mở menu
        setTimeout(() => {
            bot.activateItem()
            console.log('[+] Đã chuột phải')
        }, 500)

    }, 3500) // Chờ 3.5s sau spawn để đăng nhập xong
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
        console.log(`[+] Cửa sổ mở: ${window.title}`)

    // In ra tất cả slot để biết cần bấm vào slot nào
    window.slots.forEach((slot, index) => {
        if (slot) {
            console.log(`Slot ${index}: ${slot.name} x${slot.count}`)
        }
    })

    // Chờ rồi bấm vào slot cần thiết
    setTimeout(() => {
        bot.clickWindow(24, 0, 0) // ← đổi số 24 thành slot đúng
        console.log('[+] Đã bấm vào menu')
    }, 1000)
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
