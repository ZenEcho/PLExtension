/**
 * 本地存储key
 */
var uploadArea_status = 1;

chrome.storage.local.get(storagelocal, function (result) {
    result.ProgramConfiguration = result.ProgramConfiguration || {}
    let options_exe = result.ProgramConfiguration.options_exe
    let options_proxy_server_state = result.ProgramConfiguration.options_proxy_server_state
    let options_proxy_server = result.ProgramConfiguration.options_proxy_server
    //GitHub
    let options_token = result.ProgramConfiguration.options_token
    let options_owner = result.ProgramConfiguration.options_owner
    let options_repository = result.ProgramConfiguration.options_repository
    //对象存储
    let options_SecretId = result.ProgramConfiguration.options_SecretId
    let options_SecretKey = result.ProgramConfiguration.options_SecretKey
    let options_Bucket = result.ProgramConfiguration.options_Bucket
    let options_AppId = result.ProgramConfiguration.options_AppId
    let options_Endpoint = result.ProgramConfiguration.options_Endpoint
    let options_Region = result.ProgramConfiguration.options_Region
    let options_UploadPath = result.ProgramConfiguration.options_UploadPath
    let options_Custom_domain_name = result.ProgramConfiguration.options_Custom_domain_name

    let Animation_time; // 定义多少秒关闭iframe
    let iframe_mouseover = false // 定义iframe状态
    let GlobalUpload = result.FuncDomain.GlobalUpload //获取本地GlobalUpload值

    let uploadArea = document.createElement('PL-Extension'); //定义上传区域/侧边栏
    uploadArea.id = 'PL_uploadArea'; //给上传区域定义id
    uploadArea.setAttribute('title', '长按拖动');


    let PNGlogo = chrome.runtime.getURL("icons/yyl_512.png");
    let finger = chrome.runtime.getURL("icons/dh/t.png");
    document.body.appendChild(uploadArea);


    let popupUrl = chrome.runtime.getURL('popup.html');
    // 创建一个iframe元素
    let iframeBox = document.createElement('pl-iframebox');
    let iframe = document.createElement('iframe');
    iframe.className = 'PL-iframe'
    iframeBox.appendChild(iframe);
    document.body.appendChild(iframeBox);

    //自定义图标区域
    let uploadArea_width = result.uploadArea.uploadArea_width
    let uploadArea_height = result.uploadArea.uploadArea_height
    let uploadArea_Location = result.uploadArea.uploadArea_Location
    let uploadArea_opacity = result.uploadArea.uploadArea_opacity
    let uploadArea_auto_close_time = result.uploadArea.uploadArea_auto_close_time
    let uploadArea_Left_or_Right = result.uploadArea.uploadArea_Left_or_Right
    uploadArea.style.width = uploadArea_width + "px"
    uploadArea.style.height = uploadArea_height + "%"
    uploadArea.style.top = uploadArea_Location + "%"

    const maxZIndex = Math.pow(2, 31) - 1; //设置index
    uploadArea.style.zIndex = maxZIndex.toString();

    iframeBox.style.zIndex = maxZIndex.toString() - 1;
    iframe.style.zIndex = maxZIndex.toString();

    // 判断跨域开关
    if (options_proxy_server_state == 0) {
        options_proxy_server = ""
    }
    if (!options_proxy_server) {
        options_proxy_server = ""
    }
    if (options_exe == 'Tencent_COS') {
        //腾讯云cos拼接
        if (!options_Custom_domain_name) {
            options_Custom_domain_name = "https://" + options_Bucket + ".cos." + options_Region + ".myqcloud.com/"
        }
    }
    if (options_exe == 'Aliyun_OSS') {
        //阿里云oss拼接
        if (!options_Custom_domain_name) {
            options_Custom_domain_name = "https://" + options_Bucket + "." + options_Endpoint + "/"
        }
    }
    if (options_exe == 'AWS_S3') {
        //AWS S3区域拼接
        if (!options_Endpoint) {
            options_Endpoint = "https://s3." + options_Region + ".amazonaws.com/"
        }
        //AWS S3拼接
        if (!options_Custom_domain_name) {
            options_Custom_domain_name = "https://s3." + options_Region + ".amazonaws.com/" + options_Bucket + "/"
        }
    }
    /**
       * 实现获取侧边栏的位置信息
       */
    let PNGsidebarRect = uploadArea.getBoundingClientRect();
    window.addEventListener('resize', function () {
        uploadArea.style.display = "block"
        PNGsidebarRect = uploadArea.getBoundingClientRect();
    });
    /**
     * 实现左右侧边栏
     */
    let isDragging = false;
    let startY, startTop;
    let isPreventingClick = false;
    let isMouseOverSidebar = false;
    switch (uploadArea_Left_or_Right) {
        case "Left":
            uploadArea.style.borderRadius = "0px 10px 10px 0px"
            uploadArea.style.left = "-" + (uploadArea_width + 10) + "px"
            uploadArea.style.transition = "left 0.3s ease-in-out"
            iframe.style.left = "-900px"
            iframe.style.transition = "left 0.3s ease-in-out"
            break;
        case "Right":
            uploadArea.style.borderRadius = "10px 0px 0px 10px"
            uploadArea.style.right = "-" + (uploadArea_width + 10) + "px"
            uploadArea.style.transition = "right 0.3s ease-in-out"
            iframe.style.right = "-900px"
            iframe.style.transition = "right 0.3s ease-in-out"
            break;
    }
    let delayTimeout;
    // 鼠标按下事件监听
    uploadArea.addEventListener('mousedown', (e) => {
        delayTimeout = setTimeout(() => {
            isDragging = true;
            isPreventingClick = false;
            startY = e.clientY;
            startTop = uploadArea.offsetTop;
            uploadArea.classList.remove('box-shadow-Blink');
            uploadArea.classList.add('box-shadow-Blink');
        }, 500);
    });

    // 鼠标松开事件监听
    document.addEventListener('mouseup', (e) => {
        clearTimeout(delayTimeout);
        isDragging = false;
        if (isPreventingClick) {
            uploadArea.style.display = "block"
            PNGsidebarRect = uploadArea.getBoundingClientRect();
            uploadArea.classList.remove('box-shadow-Blink');
            setTimeout(() => { isPreventingClick = false }, 100)
        }
    });

    // 鼠标移动事件监听
    document.addEventListener('mousemove', (e) => {
        let x = e.clientX;
        let y = e.clientY;
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (isDragging) {
            const deltaY = y - startY;
            const newTop = startTop + deltaY;
            // 限制上传区域不超出父元素的边界
            if (newTop >= 0 && newTop + uploadArea.clientHeight <= uploadArea.parentElement.clientHeight) {
                uploadArea.style.top = newTop + 'px';
                if (uploadArea_Left_or_Right === 'Left') {
                    uploadArea.style.left = '0';
                } else {
                    uploadArea.style.right = '0';
                }
                isPreventingClick = true;

            }
            return;
        }

        const isLeft = uploadArea_Left_or_Right === 'Left';
        const isRight = uploadArea_Left_or_Right === 'Right';

        if (isRight && document.body.scrollHeight > window.innerHeight) {
            w -= window.innerWidth - document.body.clientWidth;
            h -= window.innerHeight - document.body.clientHeight;
        }

        const isXWithinSidebar =
            (isLeft && x < PNGsidebarRect.width) ||
            (isRight && x > w - PNGsidebarRect.width);

        if (isXWithinSidebar && y > PNGsidebarRect.top && y < PNGsidebarRect.top + PNGsidebarRect.height) {
            uploadArea.style[isLeft ? 'left' : 'right'] = '0';
            isMouseOverSidebar = true;
        } else {
            isMouseOverSidebar = false;
        }

        if (!isMouseOverSidebar) {
            uploadArea.style[isLeft ? 'left' : 'right'] = `-` + (uploadArea_width + 10) + `px`;
        }
    });

    /**
     * 实现根据侧边栏宽度切换logo
     */
    uploadArea.style.background = "url(" + PNGlogo + ")no-repeat center rgba(60,64,67," + uploadArea_opacity + ")";
    uploadArea.style.backgroundSize = "contain"

    // ####################################################
    // #拖拽上传
    // ####################################################
    document.addEventListener("dragover", (event) => {
        //拖拽过程
        let uploadAreaRect = uploadArea.getBoundingClientRect();
        let uploadAreaX = event.clientX - uploadAreaRect.left;
        let uploadAreaY = event.clientY - uploadAreaRect.top;
        if (uploadAreaX >= 0 && uploadAreaX <= uploadAreaRect.width && uploadAreaY >= 0 && uploadAreaY <= uploadAreaRect.height || event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (event.target.tagName === "IMG" || event.dataTransfer.types.includes("Files")) {
            if (GlobalUpload == "on") {
                event.target.setAttribute("data-PLExtension", "true");
                uploadArea.classList.remove('box-shadow-Blink');
                uploadArea.classList.add('box-shadow-Blink');
                // 判断拖拽点是否在上传区域内
                if (uploadArea_Left_or_Right == "Left") {
                    uploadArea.style.left = "0";
                } else {
                    uploadArea.style.right = "0";
                }
            }
        }
    });
    document.addEventListener("dragend", (event) => {
        let uploadAreaRect = uploadArea.getBoundingClientRect();
        let uploadAreaX = event.clientX - uploadAreaRect.left;
        let uploadAreaY = event.clientY - uploadAreaRect.top;
        if (uploadAreaX >= 0 && uploadAreaX <= uploadAreaRect.width && uploadAreaY >= 0 && uploadAreaY <= uploadAreaRect.height) {
            event.preventDefault();
            event.stopPropagation();
        }
        uploadArea.classList.remove('box-shadow-Blink');
    });
    document.addEventListener('drop', function (event) {
        if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            event.stopPropagation();
            uploadArea.classList.remove('box-shadow-Blink');
        }
    });
    switch (GlobalUpload) {
        case 'on':
            uploadArea.addEventListener("drop", (event) => {
                event.preventDefault();
                event.stopPropagation();
                content_scripts_CheckUploadModel(event, Simulated_upload)
                uploadArea.classList.remove('box-shadow-Blink');
            });// 拖拽到元素
            break;
        case 'off':
            uploadArea_status = uploadArea_status - 1
            break;
    }
    uploadArea.addEventListener('click', function () {
        if (isPreventingClick) { return; }
        iframeShow()
    });
    iframeBox.addEventListener('click', function () {
        iframeHide()
    });
    function iframeShow() {
        if (GlobalUpload == "on") {
            iframeBox.classList.add('PL-IframeBox');
            let iframesrc = iframe.src
            if (!iframesrc) {
                iframe.src = popupUrl
                iframe.onload = function () {
                    iframe.contentWindow.focus();
                };
            }
            switch (uploadArea_Left_or_Right) {
                case "Left":
                    iframe.style.left = "1px"
                    break;
                case "Right":
                    iframe.style.right = "1px"
                    break;
            }
            iframe.contentWindow.focus();
            iframe_mouseover = true
            uploadArea.style.display = "none"
        }

    }
    function iframeHide() {
        iframeBox.classList.remove('PL-IframeBox');
        clearTimeout(Animation_time);
        //如果iframe_mouseover是打开状态
        if (iframe_mouseover == true) {
            iframe_mouseover = false
            switch (uploadArea_Left_or_Right) {
                case "Left":
                    iframe.style.left = "-900px"
                    break;
                case "Right":
                    iframe.style.right = "-900px"
                    break;
            }
            uploadArea.style.display = "block"
        }
    }
    // 添加鼠标移出iframe的事件监听器
    iframe.addEventListener('mouseout', function () {
        iframe_mouseover = true //只要移出iframe就改为打开状态
        Animation_time = setTimeout(function () {
            iframeHide()
        }, uploadArea_auto_close_time * 1000);
    });
    // 添加鼠标移入iframe的事件监听器
    iframe.addEventListener('mouseover', function () {
        // 清除之前设置的定时器
        clearTimeout(Animation_time);

    });
    if (uploadArea_status == 0) {
        uploadArea.remove();
        iframe.remove();
        let element = document.querySelector(".insertContentIntoEditorPrompt");
        if (element) {
            element.remove();
        }
    }
    chrome.storage.local.get(["FuncDomain"], function (result) {
        if (result.FuncDomain.AutoInsert == "on") {
            insertContentIntoEditorState()
        }
    })
    /**
     * 收到消息的动作
     */
    chrome.runtime.onMessage.addListener(function (request) {
        const contextMenus = [
            request.UserDiy_contextMenus,
            request.Tencent_COS_contextMenus,
            request.Aliyun_OSS_contextMenus,
            request.AWS_S3_contextMenus,
            request.GitHubUP_contextMenus,
            request.fiftyEight_contextMenus
        ];
        for (const menu of contextMenus) {
            if (menu) {
                content_scripts_HandleUploadWithMode(menu.url, menu.Metho, Simulated_upload);
            }
        }
        if (request.AutoInsert_message) {
            let AutoInsert_message_content = request.AutoInsert_message
            AutoInsertFun(AutoInsert_message_content, 0)
        }
        if (request.Demonstration_middleware) {
            if (request.Demonstration_middleware == "Drag_upload_0") {
                confetti({
                    particleCount: 200,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },

                });
                confetti({
                    particleCount: 200,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },

                });
                Drag_upload_animations()
            }
            if (request.Demonstration_middleware == "Right_click_0") {
                Right_click_menu_animations()
                chrome.runtime.sendMessage({ Demonstration_middleware: "Right_click_1" });
            }
            if (request.Demonstration_middleware == "Right_click_100") {
                End_presentation()
                setTimeout(() => {
                    chrome.runtime.sendMessage({ Demonstration_middleware: "demonstrate_end" });
                }, 2600)
            }
            if (request.Demonstration_middleware == "closeIntro") {
                Simulated_upload = false;  //模拟上传关闭
                let sectionDom = document.getElementById("section2")
                let h1Element = sectionDom.querySelector("h1");
                h1Element.style.width = "40rem"
                h1Element.setAttribute("data-text", "功能展示,准备👌了吗");
                h1Element.innerText = "功能展示,准备"

                try {
                    sectionDom.querySelector(".Functional_animation").remove()
                    sectionDom.querySelector("img").remove()
                } catch (error) {
                }
            }
        }
        //进度条
        if (request.Progress_bar) {
            let status = request.Progress_bar.status
            const type = status == "2" ? "success" : status == "1" ? "warning" : status == "0" ? "error" : "info";
            const title = status == "2" ? "上传成功" : status == "1" ? "上传中..." : status == "0" ? "上传失败" : "上传失败";
            const duration = status == "2" ? 15 : 0;
            const saved = status == "2" ? false : status == "1" ? true : false;

            PLNotification({
                title: title,
                type: type,
                content: request.Progress_bar.filename,
                duration: duration,
                saved: saved,
            });
        }
        //自动复制消息中转
        if (request.AutoCopy) {
            window.postMessage({ type: 'AutoCopy', data: request.AutoCopy }, '*');
        }
    });

    // ####################################################
    // #功能演示
    // ####################################################
    let Simulated_upload = false//模拟上传
    window.addEventListener('message', function (event) {
        if (event.data.type === 'Detect_installation_status') {
            uploadArea.classList.remove('box-shadow-Blink');
            uploadArea.classList.add('box-shadow-Blink');
            if (uploadArea_Left_or_Right == "Left") {
                uploadArea.style.left = "0";
            } else {
                uploadArea.style.right = "0";
            }
            // // 收到盘络扩展网站传来的信息
            // let Function_Start_button = document.getElementById("Function_Start_button")
            // Function_Start_button.innerText = "Let's go"
            // Function_Start_button.classList.add("Function_Start_button");
            // Function_Start_button.addEventListener('click', (e) => {
            //     setTimeout(() => {
            //         chrome.runtime.sendMessage({ Functional_Demonstration: "点击上传演示" });
            //     }, 800); // 延迟1秒执行
            // })
        }
        if (event.data.type === 'Extension') {
            let extensionInfo = {
                name: chrome.i18n.getMessage("app_name"),
                projectName: chrome.runtime.getManifest().name,
                version: chrome.runtime.getManifest().version
            };
            window.postMessage({ type: 'ExtensionResponse', data: extensionInfo }, event.origin);
        }
        if (event.data.type === 'loadExternalConfig' && event.data.data !== null) {
            let data = event.data.data
            storExeButtons(data).then(result => {
                PLNotification({
                    title: "导入成功",
                    type: "success",
                    content: "外部数据导入成功,使用时请刷新一次页面以便扩展完成初始化",
                    duration: 10,
                });
                chrome.storage.sync.get("BedConfig").then(result => {
                    let BedConfig = result.BedConfig || [];
                    if (!BedConfig.some(existingData => isSameData(existingData.data, data.data))) {
                        data.index = 1000 + BedConfig.length + 1
                        BedConfig.push(data);
                        chrome.storage.sync.set({ "BedConfig": BedConfig });
                    }
                }).catch((error) => {
                    PLNotification({
                        title: "导入失败",
                        type: "error",
                        content: "外部数据导入失败,详细报错请打开,开发者控制台(F12)查看",
                        duration: 15,
                    });
                    console.log(error);
                });
            })


        }
        if (event.data.type === 'insertContentIntoEditorPrompt_Click' && event.data.data === true) {
            iframeShow()
        }
    });
    function isSameData(data1, data2) {
        const excludedProps = ['ConfigName'];
        for (const key of Object.keys(data2)) {
            if (!excludedProps.includes(key) && data1[key] !== data2[key]) {
                return false;
            }
        }
        return true;
    }

    function Drag_upload_animations() {
        iframeHide()
        let sectionDom = document.getElementById("section2")
        if (!sectionDom.querySelector(".Functional_animation")) {
            sectionDom.insertAdjacentHTML("beforeend", `
            <img style="width: 128px;" src="${PNGlogo}" alt="">
            <div class="Functional_animation">
                <div class="animation_finger"></div>
                <span>拖拽图片上传</span>
            </div>`);
        }
        let Functional_animation = document.getElementsByClassName("Functional_animation")
        let animation_finger = document.getElementsByClassName("animation_finger")

        let h1Element = sectionDom.querySelector("h1");
        h1Element.style.width = "28rem"
        h1Element.setAttribute("data-text", "拖拽上传演示...");
        h1Element.innerText = "拖拽上传演示"

        let spanElement = Functional_animation[0].querySelector("span");
        spanElement.textContent = "拖拽图片上传";
        animation_finger[0].style.backgroundImage = `url(` + finger + `)`
        Functional_animation[0].style.left = "0%";
        setTimeout(() => {
            Functional_animation[0].style.left = "95%";
        }, 2600)
        Simulated_upload = true;  //模拟上传开启
    }
    function Right_click_menu_animations() {
        iframeHide()
        let sectionDom = document.getElementById("section2")
        if (!sectionDom.querySelector(".Functional_animation")) {
            sectionDom.insertAdjacentHTML("beforeend", `
            <img style="width: 128px;" src="${PNGlogo}" alt="">
            <div class="Functional_animation">
                <div class="animation_finger"></div>
                <span>拖拽图片上传</span>
            </div>`);
        }

        let Functional_animation = document.getElementsByClassName("Functional_animation")
        let animation_finger = document.getElementsByClassName("animation_finger")

        let h1Element = sectionDom.querySelector("h1");
        h1Element.style.width = "28rem"
        h1Element.setAttribute("data-text", "右键上传演示...");
        h1Element.innerText = "右键上传演示"

        Functional_animation[0].style.left = "0%";
        let spanElement = Functional_animation[0].querySelector("span");
        spanElement.textContent = "右键盘络上传";
        animation_finger[0].style.backgroundImage = `url(` + finger + `)`
        Functional_animation[0].style.left = "0%";

    }
    function End_presentation() {
        alert("本次演示到此结束,更多内容请关注盘络官网")
        let end = Date.now() + (3 * 1000);
        let colors = ['#ff0000', '#ff7f00'];
        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
        let sectionDom = document.getElementById("section2")
        let h1Element = sectionDom.querySelector("h1");
        h1Element.style.width = "28rem"
        h1Element.setAttribute("data-text", "演示完毕了...");
        h1Element.innerText = "演示完毕了"
        try {
            sectionDom.querySelector(".Functional_animation").remove()
            sectionDom.querySelector("img").remove()
        } catch (error) {
        }
    }

})


const dataWithFunctions = {
    "lsky": {
        "url": "/user/tokens",
        "element": "#token-create",
        "function": function () {
            let pathname = localStorage.getItem(getCurrentDomain())
            if (pathname !== "true") {
                PLNotification({
                    title: `发现：` + chrome.i18n.getMessage("app_name") + `可配置图床`,
                    type: "警告",
                    content: `点击【创建 Token】按钮，在【创建成功】页点击【添加到` + chrome.i18n.getMessage("app_name") + `】按钮，可加载到` + chrome.i18n.getMessage("app_name") + `扩展。`,
                    duration: 0,
                    button: [
                        {
                            text: "添加到" + chrome.i18n.getMessage("app_name"),
                            style: "padding: 2px;width: 100%;border: none;border-radius: 10px;margin-bottom: 5px;",
                            init: function () {
                                this.addEventListener("click", function () {
                                    try {
                                        let token = document.querySelector("#token-create-success p:nth-child(2)").textContent;
                                        let data = {
                                            "data": {
                                                "options_album_id": "",
                                                "options_exe": "Lsky",
                                                "options_host": getCurrentDomain(),
                                                "options_permission_select": "0",
                                                "options_source_select": "2",
                                                "options_token": "Bearer " + token
                                            },
                                            "ConfigName": getCurrentDomain() + chrome.i18n.getMessage("Config")
                                        }
                                        window.postMessage({ type: 'loadExternalConfig', data: data }, "*");
                                        this.disabled = true
                                    } catch (error) {
                                        alert("获取 Token 失败，请点击【创建 Token】按钮创建Token")
                                        // 延迟1秒
                                        setTimeout(function () {
                                            PLNotification({
                                                title: `权限调用询问`,
                                                type: "警告",
                                                content: `是否允许【` + chrome.i18n.getMessage("app_name") + "】调用本站的 cookie,用于一键获取token？<br>注意：本次调用将涉及您的隐私,如果您不同意调用请无视。",
                                                duration: 0,
                                                button: [
                                                    {
                                                        text: "允许并获取token",
                                                        style: "padding: 2px;width: 100%;border: none;border-radius: 10px;",
                                                        init: function () {
                                                            let button = this
                                                            this.addEventListener("click", function () {
                                                                chrome.runtime.onMessage.addListener(function (request) {
                                                                    if (request.XSRF_TOKEN) {
                                                                        let data = {
                                                                            "name": chrome.i18n.getMessage("app_name"),
                                                                            "abilities": [
                                                                                "user:profile", "image:tokens", "image:upload",
                                                                                "image:list", "image:delete", "album:list",
                                                                                "album:delete", "strategy:list"
                                                                            ]
                                                                        };
                                                                        fetch(window.location.origin + "/user/tokens", {
                                                                            "headers": {
                                                                                "accept": "application/json, text/plain, */*",
                                                                                "content-type": "application/json",
                                                                                "x-xsrf-token": request.XSRF_TOKEN
                                                                            },

                                                                            "body": JSON.stringify(data),
                                                                            "method": "POST",
                                                                        })
                                                                            .then(response => response.json())
                                                                            .then((data) => {
                                                                                if (data.data) {
                                                                                    let config = {
                                                                                        "data": {
                                                                                            "options_album_id": "",
                                                                                            "options_exe": "Lsky",
                                                                                            "options_host": getCurrentDomain(),
                                                                                            "options_permission_select": "0",
                                                                                            "options_source_select": "2",
                                                                                            "options_token": "Bearer " + data.data.token
                                                                                        },
                                                                                        "ConfigName": getCurrentDomain() + chrome.i18n.getMessage("Config")
                                                                                    }
                                                                                    window.postMessage({ type: 'loadExternalConfig', data: config }, "*");
                                                                                    button.disabled = true
                                                                                } else {
                                                                                    console.log(data);
                                                                                    PLNotification({
                                                                                        title: "添加失败",
                                                                                        type: "error",
                                                                                        content: "详细报错请打开,开发者控制台(F12)查看",
                                                                                        duration: 15,
                                                                                    });
                                                                                }

                                                                            })
                                                                            .catch((error) => {
                                                                                console.error('Error:', error)
                                                                                PLNotification({
                                                                                    title: "添加失败",
                                                                                    type: "error",
                                                                                    content: "详细报错请打开,开发者控制台(F12)查看",
                                                                                    duration: 15,
                                                                                });
                                                                            });
                                                                    }
                                                                });
                                                                chrome.runtime.sendMessage({ getXsrfToken: 'getXsrfToken', url: window.location.href });

                                                            });

                                                        }
                                                    }
                                                ]
                                            });
                                        }, 1000)
                                    }
                                });
                            }
                        },
                        {
                            text: "本站不再提示",
                            style: "padding: 2px;width: 100%;border: none;border-radius: 10px;",
                            init: function (close) {
                                this.addEventListener("click", function () {
                                    localStorage.setItem(getCurrentDomain(), "true");
                                    close();
                                });
                            }
                        }
                    ]
                });
            }

        }
    },
    "lskyOpen": {
        "url": "/dashboard",
        "element": "#capacity-progress",
        "function": function () {
            function checkContentInFirstDiv(element) {
                // 获取当前元素的父元素
                let parent = element.parentElement;

                // 在父元素中查找第一个 div
                let firstDiv = parent.querySelector('div');
                if (firstDiv) {
                    return firstDiv.textContent.includes('仪表盘') && firstDiv.textContent.includes('上传图片') && firstDiv.textContent.includes('画廊') && firstDiv.textContent.includes('接口');
                }

                return false;
            }
            let isLsky = checkContentInFirstDiv(document.querySelector("#capacity-progress"))
            if (isLsky) {
                let pathname = localStorage.getItem(getCurrentDomain())
                if (pathname !== "true") {
                    PLNotification({
                        title: `发现：` + chrome.i18n.getMessage("app_name") + `可配置图床`,
                        type: "警告",
                        content: `
                        <div style=" margin: 0 0 10px 0; ">
                            <label for="email">邮箱:</label>
                            <input type="text" id="email" name="email" style=" height: 30px; ">
                        </div>
                        <div style=" margin: 0 0 10px 0; ">
                            <label for="password">密码:</label>
                            <input type="password" id="password" name="password" style=" height: 30px; ">
                        </div>
                        填入邮箱和密码后，点击【添加到` + chrome.i18n.getMessage("app_name") + `】按钮，可一键配置扩展`,
                        duration: 0,
                        button: [
                            {
                                text: "添加到" + chrome.i18n.getMessage("app_name"),
                                style: "padding: 2px;width: 100%;border: none;border-radius: 10px;margin-bottom: 5px;",
                                init: function () {
                                    let button = this
                                    this.addEventListener("click", function () {
                                        let email = document.querySelector(".notification-content #email").value
                                        let password = document.querySelector(".notification-content #password").value
                                        let Body = new FormData();
                                        Body.append("email", email);
                                        Body.append("password", password);
                                        fetch(window.location.origin + "/api/v1/tokens", {
                                            "headers": {
                                                "Accept": "application/json",
                                            },
                                            "body": Body,
                                            "method": "POST",
                                        }).then(response => response.json())
                                            .then((data) => {
                                                console.log(data);
                                                if (data.data) {
                                                    let config = {
                                                        "data": {
                                                            "options_album_id": "",
                                                            "options_exe": "Lsky",
                                                            "options_host": getCurrentDomain(),
                                                            "options_permission_select": "0",
                                                            "options_source_select": "1",
                                                            "options_token": "Bearer " + data.data.token
                                                        },
                                                        "ConfigName": getCurrentDomain() + chrome.i18n.getMessage("Config")
                                                    }
                                                    window.postMessage({ type: 'loadExternalConfig', data: config }, "*");
                                                    button.disabled = true
                                                } else {
                                                    console.log(data);
                                                    PLNotification({
                                                        title: "添加失败",
                                                        type: "error",
                                                        content: "详细报错请打开,开发者控制台(F12)查看",
                                                        duration: 15,
                                                    });
                                                }

                                            })
                                            .catch((error) => {
                                                console.error('Error:', error)
                                                PLNotification({
                                                    title: "添加失败",
                                                    type: "error",
                                                    content: "详细报错请打开,开发者控制台(F12)查看",
                                                    duration: 15,
                                                });
                                            });




                                    });
                                }
                            },
                            {
                                text: "本站不再提示",
                                style: "padding: 2px;width: 100%;border: none;border-radius: 10px;",
                                init: function (close) {
                                    this.addEventListener("click", function () {
                                        localStorage.setItem(getCurrentDomain(), "true");
                                        close();
                                    });
                                }
                            }
                        ]
                    });
                }
            }


        }
    },
    "EasyImage": {
        "url": "/admin/admin.inc.php",
        "element": "#myDataGrid", // 假设这是一个类选择器
        "function": function () {
            let pathname = localStorage.getItem(getCurrentDomain())
            if (pathname !== "true") {
                PLNotification({
                    title: "发现：简单图床",
                    type: "success",
                    content: `在【API 设置】页刷新,可加载【添加到` + chrome.i18n.getMessage("app_name") + `】按钮。<br>或者点击【一键创建token】按钮,创建token.`,
                    duration: 0,
                    button: [
                        {
                            text: "一键创建token",
                            style: "padding: 2px;width: 100%;border: none;border-radius: 10px;margin-bottom: 5px;",
                            init: function () {
                                let button = this
                                this.addEventListener("click", function () {
                                    let data = new URLSearchParams();
                                    let token = crypto.randomUUID().replace(/-/g, '');
                                    data.append("add_token", token);
                                    data.append("add_token_expired", "1000");
                                    data.append("add_token_id", Date.now());
                                    fetch(window.location.href, {
                                        "headers": {
                                            "accept": "application/json, text/plain, */*",
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        body: data,
                                        method: "POST",
                                    })
                                        .then(response => {
                                            if (response.status === 200) {
                                                let data = {
                                                    "data": {
                                                        "options_exe": "EasyImages",
                                                        "options_host": getCurrentDomain(),
                                                        "options_token": token
                                                    },
                                                    "ConfigName": getCurrentDomain() + chrome.i18n.getMessage("Config")
                                                }
                                                window.postMessage({ type: 'loadExternalConfig', data: data }, "*");
                                                button.disabled = true;
                                            }
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            PLNotification({
                                                title: "一键创建token请求失败",
                                                type: "error",
                                                content: "详细报错请打开,开发者控制台(F12)查看",
                                                duration: 15,
                                            });
                                        });

                                });
                            }
                        },
                        {
                            text: "本站不再提示",
                            style: "padding: 2px;width: 100%;border: none;border-radius: 10px;",
                            init: function (close) {
                                this.addEventListener("click", function () {
                                    localStorage.setItem(getCurrentDomain(), "true");
                                    close();
                                });
                            }
                        }
                    ]
                });
            }

            if (document.querySelector('#myDataGrid')) {
                // 在 #myDataGrid 中查找所有符合条件的 <a> 标签
                const links = myDataGrid.querySelectorAll('a[href*="admin.inc.php?delDir"]');
                // 为每个找到的 <a> 标签添加一个新元素
                links.forEach((link, index) => {
                    const newElement = document.createElement('div');
                    newElement.textContent = '添加到' + chrome.i18n.getMessage("app_name");
                    newElement.classList = "btn btn-mini btn-primary"
                    link.parentNode.insertBefore(newElement, link.nextSibling);
                    newElement.addEventListener('click', function () {
                        let token = this.parentNode.parentNode.querySelector('div input').value
                        let data = {
                            "data": {
                                "options_exe": "EasyImages",
                                "options_host": getCurrentDomain(),
                                "options_token": token
                            },
                            "ConfigName": getCurrentDomain() + chrome.i18n.getMessage("Config")
                        }
                        window.postMessage({ type: 'loadExternalConfig', data: data }, "*");
                    });
                    link.remove()
                });
            }
        }
    },
    "Chevereto": {
        "url": "/settings/api",
        "element": `meta[name="generator"][content^="Chevereto"]`, // 假设这是一个类选择器
        "function": function () {
            let pathname = localStorage.getItem(getCurrentDomain())
            if (pathname !== "true") {
                PLNotification({
                    title: "发现：Chevereto图床",
                    type: "警告",
                    content: `点击【重新生成密钥】按钮，创建成功后点击【添加到` + chrome.i18n.getMessage("app_name") + `】按钮，可加载【添加到` + chrome.i18n.getMessage("app_name") + `】按钮。`,
                    duration: 0,
                    button: [
                        {
                            text: "添加到" + chrome.i18n.getMessage("app_name"),
                            style: "padding: 2px;width: 100%;border: none;border-radius: 10px;margin-bottom: 5px;",
                            init: function () {
                                this.addEventListener("click", function () {
                                    try {
                                        let token = document.querySelector("#api_v1_key").value;
                                        let data = {
                                            "data": {
                                                "options_UploadPath": "",
                                                "options_album_id": "",
                                                "options_exe": "Chevereto",
                                                "options_expiration_select": "NODEL",
                                                "options_host": getCurrentDomain(),
                                                "options_nsfw_select": "0",
                                                "options_token": token
                                            },
                                            "ConfigName": getCurrentDomain() + chrome.i18n.getMessage("Config")
                                        }
                                        window.postMessage({ type: 'loadExternalConfig', data: data }, "*");
                                        this.disabled = true
                                    } catch (error) {
                                        alert("获取 Token 失败，请点击【重新生成密钥】按钮")
                                    }
                                });
                            }
                        },
                        {
                            text: "本站不再提示",
                            style: "padding: 2px;width: 100%;border: none;border-radius: 10px;",
                            init: function (close) {
                                this.addEventListener("click", function () {
                                    localStorage.setItem(getCurrentDomain(), "true");
                                    close();
                                });
                            }
                        }
                    ]
                });
            }
        }
    }
};

// 检查当前页面的函数
function checkAndExecute() {
    const currentPath = window.location.pathname;

    for (const key in dataWithFunctions) {
        if (dataWithFunctions.hasOwnProperty(key)) {
            const info = dataWithFunctions[key];
            if (currentPath === info.url && document.querySelector(info.element) !== null) {
                info.function();
                return;
            }
        }
    }
}
function getCurrentDomain() {
    return window.location.hostname;
}
setTimeout(checkAndExecute, 500);



const runtimeSendMessage = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage)
    ? chrome.runtime.sendMessage.bind(chrome.runtime) // 绑定 chrome.runtime
    : (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage)
        ? browser.runtime.sendMessage.bind(browser.runtime) // 绑定 browser.runtime
        : null;
let isError = 0
// 扩展刷新页面错误的检测
function checkForInvalidatedContext() {
    if (!runtimeSendMessage) {
        console.warn('消息发送API不可用');
        return;
    }
    try {
        runtimeSendMessage({});
    } catch (error) {
        if (error.message.includes("Extension context invalidated.")) {
            if (isError === 0) {
                if (confirm(`检测到扩展被重启，是否重新加载当前页？`)) {
                    window.location.reload();
                }
            }
            if (isError === 20) { // 一分钟后
                if (confirm(`1分钟已过去,页面仍未重启,是否重新加载当前页？`)) {
                    window.location.reload();
                }
            }
            if (isError === 60) { // 三分钟后
                if (confirm(`3分钟已过去,为了更好的体验,请刷新一下吧。`)) {
                    window.location.reload();
                }
            }
            if (isError === 200) { // 十分钟后
                if (confirm(`10分钟已过去,最后一次提示了,不刷新扩展功能会受到限制的！`)) {
                    window.location.reload();
                }
            }
            isError++
        }
    }
}

// 定期执行检查
setInterval(checkForInvalidatedContext, 3000);

