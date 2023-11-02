const maxNotifications = 8; // 最大允许的通知数量
const notifications = [];
/**
 * 
 * @param {object} config 
 * @returns 
 * 创建通知函数
 */
function PLNotification(config) {
    const defaultConfig = {
        type: 'info',  // 默认类型为信息通知
        title: '盘络上传:', // 默认标题为通知
        content: 'No Data',   // 默认内容为空
        duration: 10,   // 默认持续时间为10秒
        css: "",// content的行内样式
        overwrite: true, // 默认重复内容覆盖
        saved: false, //存储通知,刷新页面也会通知
    };
    // 合并配置项
    config = { ...defaultConfig, ...config };
    if (notifications.length >= maxNotifications) {
        // 如果通知数量达到最大值，删除最早的通知
        const oldestNotification = notifications.shift();
        closeNotification(oldestNotification, config);
    }

    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = "notification-container"
        container.className = "notification-container"
        document.body.appendChild(container);
    }
    const successIcon = `<svg t="1698570611098" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1018" width="200" height="200"><path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#52C41A" p-id="1019"></path><path d="M178.614857 557.860571a42.496 42.496 0 0 1 60.123429-60.050285l85.942857 87.625143a42.496 42.496 0 0 1-60.050286 60.123428L178.614857 557.860571z m561.005714-250.148571a42.496 42.496 0 1 1 65.097143 54.637714L394.459429 725.577143a42.496 42.496 0 0 1-65.097143-54.637714l410.112-363.373715z" fill="#FFFFFF" p-id="1020"></path></svg>`
    const warningIcon = `<svg t="1698570630797" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1173" width="200" height="200"><path d="M492.763429 0C220.745143 0 0 218.477714 0 487.643429c0 269.165714 220.745143 487.570286 492.763429 487.570285 272.018286 0 492.763429-218.404571 492.763428-487.570285S764.781714 0 492.763429 0z m-49.298286 682.642286c0-26.916571 21.869714-48.713143 48.786286-48.713143h1.024a48.786286 48.786286 0 0 1 0 97.499428H492.251429a48.786286 48.786286 0 0 1-48.786286-48.786285z m0-195.510857V293.083429a49.298286 49.298286 0 1 1 98.523428 0V487.131429a49.298286 49.298286 0 1 1-98.523428 0z" fill="#FAAD14" p-id="1174"></path></svg>`
    const errorIcon = `<svg t="1698570641215" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1327" width="200" height="200"><path d="M512 0a512 512 0 0 0-512 512 512 512 0 0 0 512 512 512 512 0 0 0 512-512 512 512 0 0 0-512-512z" fill="#FD6B6D" p-id="1328"></path><path d="M513.755429 565.540571L359.277714 720.018286a39.058286 39.058286 0 0 1-55.296-0.073143 39.277714 39.277714 0 0 1 0.073143-55.442286l154.331429-154.331428-155.062857-155.136a36.571429 36.571429 0 0 1 51.712-51.785143l365.714285 365.714285a36.571429 36.571429 0 1 1-51.785143 51.785143L513.755429 565.540571z m157.549714-262.582857a35.254857 35.254857 0 1 1 49.737143 49.737143l-106.057143 108.982857a35.254857 35.254857 0 1 1-49.883429-49.810285l106.203429-108.982858z" fill="#FFFFFF" p-id="1329"></path></svg>`
    const infoIcon = `<svg t="1698570649880" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1482" width="200" height="200"><path d="M512 0a512 512 0 0 0-512 512 512 512 0 0 0 512 512 512 512 0 0 0 512-512 512 512 0 0 0-512-512z" fill="#05CFA4" p-id="1483"></path><path d="M541.769143 393.142857a50.322286 50.322286 0 1 1 0-100.571428 50.322286 50.322286 0 0 1 0 100.571428zM369.810286 542.061714c-24.502857 20.333714 67.437714-95.085714 100.352-115.565714 32.914286-20.406857 91.209143-4.973714 83.163428 42.276571-8.045714 47.323429-59.172571 220.013714-70.802285 261.12-11.702857 41.106286 71.68-38.107429 88.137142-48.128 16.457143-9.947429-62.902857 93.184-100.498285 114.907429-37.595429 21.723429-93.769143-7.68-82.651429-47.030857 11.190857-39.424 52.662857-186.514286 69.632-244.882286 16.969143-58.441143-62.902857 16.969143-87.332571 37.302857z" fill="#FFFFFF" p-id="1484"></path></svg>`
    const Icon = config.type === "success" ? successIcon : config.type === "warning" ? warningIcon : config.type === "error" ? errorIcon : infoIcon;
    const existingNotification = notifications.find(item => item.content === config.content);
    if (existingNotification && config.overwrite == true) {
        existingNotification.element.className = `notification ${config.type}`;
        existingNotification.element.querySelector(".icon").innerHTML = Icon;
        existingNotification.element.querySelector(".title").innerHTML = config.title;
        updateCountdown(config, existingNotification.element);
        updateNotificationInStorage(config, () => {
            console.log('通知已更新');
        });
        return;
    }

    //如果没有重复的就执行以下
    const notification = document.createElement('div');
    const maxZIndex = Math.pow(2, 31) - 1; // 设置 z-index
    container.style.zIndex = maxZIndex.toString();
    notification.className = `notification ${config.type}`;
    notification.innerHTML = `
    <div class="notification-title">
        <span class="icon">${Icon}</span>
        <span class="title">${config.title}</span>  
    </div>
    <hr>
    <div class="notification-content" style="${config.css}" >${config.content}</div>`;
    const closeButton = document.createElement('button');
    closeButton.innerHTML = 'X';
    notification.appendChild(closeButton);
    closeButton.addEventListener('click', () => {
        closeNotification(notification, config);
    });
    updateCountdown(config, notification)
    notifications.push({
        type: config.type,
        content: config.content,
        duration: config.duration,
        element: notification
    });
    if (config.saved) {
        saveNotificationToStorage(config);
    }
    container.appendChild(notification);
}
// 更新倒计时
let handleMouseEnter;
let handleMouseLeave;
let handleVisibilityChange;
/**
 * 
 * @param {object} config 
 * @param {element} notification 
 * @returns 
 * 通知元素的时间相关
 */
function updateCountdown(config, notification) {
    if (config.duration < 1) { return; }
    let timer; // 用于存储倒计时计时器
    let progressBar = document.createElement('div');
    progressBar.className = "progress-bar";
    notification.appendChild(progressBar); // 插入进度条
    progressBar.style.animation = `PLprogress ${config.duration}s linear`;

    let remainingTime = config.duration;
    const updateRemainingTime = () => {
        progressBar.textContent = `${remainingTime}`;
    };
    timer = setInterval(() => {
        remainingTime--;
        updateRemainingTime();
    }, 1000);
    function handleAnimationEnd() {
        progressBar.removeEventListener('animationend', handleAnimationEnd);
        progressBar.remove();
        closeNotification(notification, config);
    }
    handleVisibilityChange = () => {
        if (document.hidden) {
            // 页面不可见，停止倒计时和动画
            clearInterval(timer);
            progressBar.style.animationPlayState = 'paused';
        } else {
            // 页面重新可见，恢复倒计时和动画
            timer = setInterval(() => {
                remainingTime--;
                updateRemainingTime();
            }, 1000);
            progressBar.style.animationPlayState = 'running';
        }
    };
    handleMouseEnter = () => {
        // 鼠标悬停时停止倒计时和动画
        clearInterval(timer);
        progressBar.style.animationPlayState = 'paused';
    };
    handleMouseLeave = () => {
        // 鼠标离开时恢复倒计时和动画
        timer = setInterval(() => {
            remainingTime--;
            updateRemainingTime();
        }, 1000);

        progressBar.style.animationPlayState = 'running';
    };
    progressBar.addEventListener('animationend', handleAnimationEnd); //动画化结束
    document.addEventListener('visibilitychange', handleVisibilityChange); //窗口可见
    notification.addEventListener('mouseenter', handleMouseEnter);
    notification.addEventListener('mouseleave', handleMouseLeave);
}
/**
 * @param {element} notification 
 * @param {object} config 
 * 关闭通知元素
 */
function closeNotification(notification, config) {
    removeNotificationFromStorage(config);
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        notification.remove();
        const index = notifications.findIndex(item => item.content === config.content);
        if (index !== -1) {
            notifications.splice(index, 1);
        }
        notification.removeEventListener('mouseenter', handleMouseEnter);
        notification.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, 300);
}

/**
 * @param {*} callback 
 * 从浏览器的 storage 获取保存的通知
 */
function getSavedNotifications(callback) {
    const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null;
    if (!storageAPI) { return console.error('存储API不受支持'); }
    storageAPI.local.get({ 'PLSavedNotifications': [] }, (data) => {
        const savedNotifications = data.PLSavedNotifications || [];
        callback(savedNotifications);
    });
}
/**
 * @param {object} config 
 * 保存通知到浏览器的 storage
 */
function saveNotificationToStorage(config) {
    const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null;
    if (!storageAPI) { return console.error('存储API不受支持'); }
    delete config.saved
    getSavedNotifications((savedNotifications) => {
        savedNotifications.push(config);
        if (savedNotifications.length > maxNotifications) {
            savedNotifications.shift();
        }
        storageAPI.local.set({ 'PLSavedNotifications': savedNotifications });
    });
}
/**
 * 
 * @param {object} config 
 * 从浏览器的 storage 移除通知 
 */
function removeNotificationFromStorage(config) {
    const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null;
    if (!storageAPI) { return console.error('存储API不受支持'); }
    getSavedNotifications((savedNotifications) => {
        const updatedNotifications = savedNotifications.filter(
            (item) => item.content !== config.content
        );
        storageAPI.local.set({ 'PLSavedNotifications': updatedNotifications });
    });
}
/**
 * 
 * @param {object} updatedNotification 
 * @param {*} callback 
 * 更新浏览器的 storage 中的通知
 */
function updateNotificationInStorage(updatedNotification, callback) {
    const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null;
    if (!storageAPI) { return console.error('存储API不受支持'); }
    getSavedNotifications((savedNotifications) => {
        const updatedNotifications = savedNotifications.map((notification) => {
            if (notification.content === updatedNotification.content) {
                return updatedNotification;
            }
            return notification;
        });

        storageAPI.local.set({ 'PLSavedNotifications': updatedNotifications }, () => {
            if (typeof callback === 'function') {
                callback();
            }
        });
    });
}
// 在页面加载时检索并显示已保存的通知
(function () {
    getSavedNotifications((savedNotifications) => {
        for (const notification of savedNotifications) {
            PLNotification(notification);
        }
    });
})();

chrome.runtime.onMessage.addListener(function (request) {
    if (request.PLNotificationJS) { PLNotification(request.PLNotificationJS) }
});

window.addEventListener('message', function (event) {
    if (event.data.type === 'PLNotification') { PLNotification(event.data.data) }
});
