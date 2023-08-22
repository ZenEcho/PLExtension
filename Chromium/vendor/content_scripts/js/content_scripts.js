/**
 * 本地存储key
 */
var uploadArea_status = 1;

chrome.storage.local.get(storagelocal, function (result) {
    let imageUrl
    options_exe = result.options_exe
    options_proxy_server_state = result.options_proxy_server_state
    options_proxy_server = result.options_proxy_server
    //GitHub
    options_token = result.options_token
    options_owner = result.options_owner
    options_repository = result.options_repository
    //对象存储
    options_SecretId = result.options_SecretId
    options_SecretKey = result.options_SecretKey
    options_Bucket = result.options_Bucket
    options_AppId = result.options_AppId
    options_Endpoint = result.options_Endpoint
    options_Region = result.options_Region
    options_UploadPath = result.options_UploadPath
    options_Custom_domain_name = result.options_Custom_domain_name

    let Animation_time; // 定义多少秒关闭iframe
    let iframe_mouseover = false // 定义iframe状态
    GlobalUpload = result.GlobalUpload //获取本地GlobalUpload值

    let uploadArea = document.createElement('PLExtension'); //定义上传区域/侧边栏
    uploadArea.id = 'uploadArea'; //给上传区域定义id


    let uploadAreaTips = document.createElement('PLExtension-tips'); //定义上传区域的提示
    uploadAreaTips.className = 'uploadAreaTips';
    uploadAreaTips.id = "uploadAreaTips"
    let PNGlogo16 = chrome.runtime.getURL("icons/logo16.png");
    let PNGlogo32 = chrome.runtime.getURL("icons/logo32.png");
    let PNGlogo64 = chrome.runtime.getURL("icons/logo64.png");
    let PNGlogo128 = chrome.runtime.getURL("icons/logo128.png");
    let finger = chrome.runtime.getURL("icons/dh/t.png");
    document.body.appendChild(uploadArea);
    document.body.appendChild(uploadAreaTips);

    let popupUrl = chrome.runtime.getURL('popup.html');
    // 创建一个iframe元素
    let iframe = document.createElement('iframe');
    iframe.className = 'PNGiframe'
    document.body.appendChild(iframe);

    //自定义图标区域
    edit_uploadArea_width = result.edit_uploadArea_width
    edit_uploadArea_height = result.edit_uploadArea_height
    edit_uploadArea_Location = result.edit_uploadArea_Location
    edit_uploadArea_opacity = result.edit_uploadArea_opacity
    edit_uploadArea_auto_close_time = result.edit_uploadArea_auto_close_time
    edit_uploadArea_Left_or_Right = result.edit_uploadArea_Left_or_Right
    uploadArea.style.width = edit_uploadArea_width + "px"
    uploadArea.style.height = edit_uploadArea_height + "%"
    uploadArea.style.top = edit_uploadArea_Location + "%"

    const maxZIndex = Math.pow(2, 31) - 1; //设置index
    uploadArea.style.zIndex = maxZIndex.toString();
    uploadAreaTips.style.zIndex = maxZIndex.toString();
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
    switch (edit_uploadArea_Left_or_Right) {
        case "Left":
            uploadArea.style.borderRadius = "0px 10px 10px 0px"
            uploadArea.style.left = "-" + edit_uploadArea_width + "px"
            uploadArea.style.transition = "left 0.3s ease-in-out"
            iframe.style.left = "-800px"
            iframe.style.transition = "left 0.3s ease-in-out"
            document.addEventListener("mousemove", function (event) {
                // 获取鼠标在页面上的位置
                let x = event.clientX;
                let y = event.clientY;
                // 获取页面宽度和高度
                let w = window.innerWidth;
                let h = window.innerHeight;
                // 如果鼠标在侧边栏范围内，显示侧边栏
                if (x < PNGsidebarRect.width && y > PNGsidebarRect.top && y < PNGsidebarRect.top + PNGsidebarRect.height) {
                    uploadArea.style.left = "0";
                } else {
                    uploadArea.style.left = "-" + edit_uploadArea_width + "px"
                }
            });

            break;
        case "Right":
            uploadArea.style.borderRadius = "10px 0px 0px 10px"
            uploadArea.style.right = "-" + edit_uploadArea_width + "px"
            uploadArea.style.transition = "right 0.3s ease-in-out"
            iframe.style.right = "-800px"
            iframe.style.transition = "right 0.3s ease-in-out"
            document.addEventListener("mousemove", function (event) {
                // 获取鼠标在页面上的位置
                let x = event.clientX;
                let y = event.clientY;
                // 获取页面宽度和高度，包括滚动条宽度
                let w = window.innerWidth;
                let h = window.innerHeight;
                // 如果页面有滚动条，则需要将宽度和高度减去滚动条宽度
                if (document.body.scrollHeight > window.innerHeight) {
                    w -= window.innerWidth - document.body.clientWidth;
                    h -= window.innerHeight - document.body.clientHeight;
                }
                // 如果鼠标在侧边栏范围内，显示侧边栏
                if (x > w - PNGsidebarRect.width && y > PNGsidebarRect.top && y < PNGsidebarRect.top + PNGsidebarRect.height
                ) {
                    uploadArea.style.right = "0";
                } else {
                    uploadArea.style.right = "-" + edit_uploadArea_width + "px";
                }
            });
            break;
    }

    /**
     * 实现根据侧边栏宽度切换logo
     */
    if (edit_uploadArea_width < 32) {//小于
        uploadArea.style.background = "url(" + PNGlogo16 + ")no-repeat center rgba(60,64,67," + edit_uploadArea_opacity + ")";
    } else if (edit_uploadArea_width < 64) {
        uploadArea.style.background = "url(" + PNGlogo32 + ")no-repeat center rgba(60,64,67," + edit_uploadArea_opacity + ")";
    } else if (edit_uploadArea_width > 64) {//大于
        uploadArea.style.background = "url(" + PNGlogo64 + ")no-repeat center rgba(60,64,67," + edit_uploadArea_opacity + ")";
    }
    /**
     * 实现全局上传模式
     */
    document.addEventListener("dragstart", document_dragstart);//拖拽过程
    document.addEventListener("dragover", document_uploadArea_dragover);//拖拽过程
    uploadAreaTips.addEventListener("drop", uploadAreaTips_drop_Cancel);//拖拽到元素
    switch (GlobalUpload) {
        case 'GlobalUpload_Default':
            uploadArea.addEventListener("drop", uploadArea_drop_Default);// 拖拽到元素
            break;
        case 'GlobalUpload_off':
            uploadArea_status = uploadArea_status - 1
            break;
    }

    /**
     * 点击文档执行关闭操作
     */
    document.addEventListener('click', function (event) {
        // 检查 uploadArea 元素是否已被点击
        /**
         * 实现点击侧边栏弹出框架
         */
        if (event.target.closest('#uploadArea') || event.target.closest('.insertContentIntoEditorPrompt') || event.target.closest('.Function_Start_button')) {
            //点击元素打开
            iframeShow()
        } else {
            iframeHide()
        }

    });
    function iframeShow() {
        let iframesrc = iframe.src
        if (!iframesrc) {
            iframe.src = popupUrl
        }
        switch (edit_uploadArea_Left_or_Right) {
            case "Left":
                iframe.style.left = "1px"
                break;
            case "Right":
                iframe.style.right = "1px"
                break;
        }
        iframe_mouseover = true
        uploadArea.style.display = "none"
    }
    function iframeHide() {
        uploadAreaTips.style.bottom = "-100px";
        uploadAreaTips.innerText = '';
        clearTimeout(Animation_time);
        //如果iframe_mouseover是打开状态
        if (iframe_mouseover == true) {
            iframe_mouseover = false
            switch (edit_uploadArea_Left_or_Right) {
                case "Left":
                    iframe.style.left = "-800px"
                    break;
                case "Right":
                    iframe.style.right = "-800px"
                    break;
            }
            uploadArea.style.display = "block"
        }
    }
    /**
     * 拖拽结束的事件
     */
    document.addEventListener("dragend", function (event) {
        uploadAreaTips.style.bottom = "-100px";
        uploadAreaTips.innerText = '';
    });
    // 添加鼠标移出iframe的事件监听器
    iframe.addEventListener('mouseout', function () {
        iframe_mouseover = true //只要移出iframe就改为打开状态
        Animation_time = setTimeout(function () {
            switch (edit_uploadArea_Left_or_Right) {
                case "Left":
                    iframe.style.left = "-800px"
                    break;
                case "Right":
                    iframe.style.right = "-800px"
                    break;
            }
            iframe_mouseover = false
            uploadArea.style.display = "block"
        }, edit_uploadArea_auto_close_time * 1000);
    });
    // 添加鼠标移入iframe的事件监听器
    iframe.addEventListener('mouseover', function () {
        // 清除之前设置的定时器
        clearTimeout(Animation_time);

    });
    if (uploadArea_status == 0) {
        uploadArea.remove();
        iframe.remove();
        uploadAreaTips.remove();
        document.getElementsByClassName("insertContentIntoEditorPrompt").remove()
    }
    // ------------------------------------------------------------------------------------
    // ↓↓↓***全局上传***↓↓↓
    // ↓↓↓***全局上传***↓↓↓
    // ↓↓↓***全局上传***↓↓↓
    // ------------------------------------------------------------------------------------
    function document_dragstart(event) {
        switch (GlobalUpload) {
            case 'GlobalUpload_Default':
                uploadAreaTips.innerText = '默认模式:移到此取消上传';
                break;
            case 'GlobalUpload_off':
                break;
        }
    }
    /**
     * 拖拽到文档的过程
     */
    function document_uploadArea_dragover(event) {
        //拖动过程
        let uploadAreaRect = uploadArea.getBoundingClientRect();
        let uploadAreaX = event.clientX - uploadAreaRect.left;
        let uploadAreaY = event.clientY - uploadAreaRect.top;

        let uploadAreaTipsRect = uploadAreaTips.getBoundingClientRect();
        let uploadAreaTipsX = event.clientX - uploadAreaTipsRect.left;
        let uploadAreaTipsY = event.clientY - uploadAreaTipsRect.top;
        if (GlobalUpload == "GlobalUpload_Default") {
            // 判断拖拽点是否在上传区域内
            if (uploadAreaX >= 0 && uploadAreaX <= uploadAreaRect.width && uploadAreaY >= 0 && uploadAreaY <= uploadAreaRect.height) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (uploadAreaTipsX >= 0 && uploadAreaTipsX <= uploadAreaTipsRect.width && uploadAreaTipsY >= 0 && uploadAreaTipsY <= uploadAreaTipsRect.height) {
                event.preventDefault();
                event.stopPropagation();
            }
            uploadAreaTips.style.bottom = "10px";
            if (edit_uploadArea_Left_or_Right == "Left") {
                uploadArea.style.left = "0";
            } else {
                uploadArea.style.right = "0";
            }
        }
    }
    /**
     *  拖拽到uploadAreaTips就取消上传
     */
    function uploadAreaTips_drop_Cancel(event) {
        event.preventDefault();
        event.stopPropagation();

        let uploadAreaTipsRect = uploadAreaTips.getBoundingClientRect();
        let uploadAreaTipsX = event.clientX - uploadAreaTipsRect.left;
        let uploadAreaTipsY = event.clientY - uploadAreaTipsRect.top;
        if (uploadAreaTipsX >= 0 && uploadAreaTipsX <= uploadAreaTipsRect.width && uploadAreaTipsY >= 0 && uploadAreaTipsY <= uploadAreaTipsRect.height) {
            console.log("取消上传")
            uploadAreaTips.style.bottom = "-100px";
            uploadAreaTips.innerText = '';
            return;
        }
    }

    /**
     *  普通模式拖拽到uploadArea就上传uploadAreaFunction(event)
     */
    function uploadArea_drop_Default(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!event.target.closest('#uploadAreaTips')) {
            content_scripts_CheckUploadModel(event, Simulated_upload)
        }
        uploadAreaTips.style.bottom = "-100px";
        uploadAreaTips.innerText = '';
    }
    chrome.storage.local.get(["AutoInsert"], function (result) {
        if (result.AutoInsert == "AutoInsert_on") {
            insertContentIntoEditorState()
        }
    })

    /**
     * 收到消息的动作
     */
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.Tencent_COS_contextMenus) {
            let imgUrl = request.Tencent_COS_contextMenus
            content_scripts_HandleUploadWithMode(imgUrl, "Rightupload", Simulated_upload)
        }
        if (request.Aliyun_OSS_contextMenus) {
            let imgUrl = request.Aliyun_OSS_contextMenus
            content_scripts_HandleUploadWithMode(imgUrl, "Rightupload", Simulated_upload)
        }
        if (request.AWS_S3_contextMenus) {
            let imgUrl = request.AWS_S3_contextMenus
            content_scripts_HandleUploadWithMode(imgUrl, "Rightupload", Simulated_upload)
        }
        if (request.GitHubUP_contextMenus) {
            let imgUrl = request.GitHubUP_contextMenus
            content_scripts_HandleUploadWithMode(imgUrl.url, imgUrl.Metho, Simulated_upload)
        }
        if (request.AutoInsert_message) {
            let AutoInsert_message_content = request.AutoInsert_message
            AutoInsertFun(AutoInsert_message_content)
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
            StatusProgressBar(request.Progress_bar.filename, request.Progress_bar.status, request.Progress_bar.IsCurrentTabId)
        }
        //自动复制消息中转
        if (request.AutoCopy) {
            window.postMessage({ type: 'AutoCopy', data: request.AutoCopy }, '*');
        }
    });
    let Simulated_upload = false//模拟上传
    window.addEventListener('message', function (event) {
        if (event.data.type === 'Detect_installation_status') {
            // 收到盘络扩展网站传来的信息
            let Function_Start_button = document.getElementById("Function_Start_button")
            Function_Start_button.innerText = "Let's go"
            Function_Start_button.classList.add("Function_Start_button");
            Function_Start_button.addEventListener('click', (e) => {
                setTimeout(() => {
                    chrome.runtime.sendMessage({ Functional_Demonstration: "点击上传演示" });
                }, 800); // 延迟1秒执行
            })

        }

    });

    function Drag_upload_animations() {
        iframeHide()
        let sectionDom = document.getElementById("section2")
        if (!sectionDom.querySelector(".Functional_animation")) {
            sectionDom.insertAdjacentHTML("beforeend", `
            <img style="width: 128px;" src="${PNGlogo128}" alt="">
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
            <img style="width: 128px;" src="${PNGlogo128}" alt="">
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

let progressBars = []; // 保存创建的进度条元素
function ProgressBar() {
    let progressBar = document.createElement('div');
    progressBar.className = 'PLprogress';
    if (!document.getElementsByClassName("PLprogress").length) {
        document.body.appendChild(progressBar);
    }
}
ProgressBar()

function removeProgressBar(filename) {
    const index = progressBars.findIndex(item => item.filename === filename);
    if (index !== -1) {
        const progressBar = progressBars[index].element;
        progressBar.remove();
        progressBars.splice(index, 1);
    }
}
function StatusProgressBar(filename, Status, IsID) {
    ProgressBar()
    if (Status == 1) {
        if (progressBars.length >= 6) { //限制数量
            const oldestFilename = progressBars[0].filename;
            removeProgressBar(oldestFilename);
        }

        let progressBox = document.createElement('div');
        progressBox.className = 'PLprogress-box';
        progressBox.innerHTML = `
            <div>${filename}</div>
            <div class="PL-loading"></div>
            <button class="progressBoxRemove" data-filename="${filename}">X</button>
        `;
        progressBox.querySelector('.progressBoxRemove').addEventListener('click', function (event) {
            const filename = event.target.dataset.filename; // 获取按钮的data属性值
            removeProgressBar(filename);
        });
        progressBars.push({ filename, element: progressBox });
        document.getElementsByClassName("PLprogress")[0].appendChild(progressBox);
    }

    if (Status == 2 || Status == 0) {
        let countdownInterval; // 用于存储倒计时的 setInterval 返回值
        let remainingTime = 10000; // 初始倒计时时间，单位是毫秒

        const successHTML = ` 
        <div>` + filename + `</div><svg t="1692415044921" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4316" width="48" height="48"><path d="M511.950005 512.049995m-447.956254 0a447.956254 447.956254 0 1 0 895.912508 0 447.956254 447.956254 0 1 0-895.912508 0Z" fill="#20B759" p-id="4317"></path><path d="M458.95518 649.636559L289.271751 479.95313c-11.698858-11.698858-30.697002-11.698858-42.39586 0s-11.698858 30.697002 0 42.395859l169.683429 169.68343c11.698858 11.698858 30.697002 11.698858 42.39586 0 11.798848-11.598867 11.798848-30.597012 0-42.39586z" fill="#FFFFFF" p-id="4318"></path><path d="M777.62406 332.267552c-11.698858-11.698858-30.697002-11.698858-42.39586 0L424.158578 643.437164c-11.698858 11.698858-11.698858 30.697002 0 42.39586s30.697002 11.698858 42.39586 0l311.069622-311.069622c11.798848-11.798848 11.798848-30.796992 0-42.49585z" fill="#FFFFFF" p-id="4319"></path></svg>
        <button class="progressBoxRemove" data-filename="`+ filename + `">X</button>
        <span style=" position: absolute; left: 5px; bottom: 0; "></span>`
        const errorHTML = `<div>` + filename + `</div>
        <svg t="1692431664801" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1808" width="48" height="48"><path d="M512.8 512m-423 0a423 423 0 1 0 846 0 423 423 0 1 0-846 0Z" fill="#FF7575" p-id="1809"></path><path d="M481.3 590.7c5.3 15.8 15.8 26.2 31.5 26.2 15.8 0 26.2-10.5 31.5-26.2l21-288.7c0-31.5-26.2-52.5-52.5-52.5-31.5 0-52.5 26.2-52.5 57.8l21 283.4z m31.5 78.8c-31.5 0-52.5 21-52.5 52.5s21 52.5 52.5 52.5 52.5-21 52.5-52.5-21-52.5-52.5-52.5z m0 0" fill="#FFFFFF" p-id="1810"></path></svg>
        <button class="progressBoxRemove" data-filename="`+ filename + `">X</button>
        <span style=" position: absolute; left: 5px; bottom: 0; "></span>`
        const index = progressBars.findIndex(item => item.filename === filename);
        if (index !== -1) {
            const progressBar = progressBars[index].element;
            if (Status == 2) { //成功
                progressBar.innerHTML = successHTML
                progressBar.style.background = "#33CC66"
            }
            if (Status == 0) { //失败
                progressBar.innerHTML = errorHTML
                progressBar.style.background = "#cc0000"
            }
            progressBar.querySelector('.progressBoxRemove').addEventListener('click', function (event) {
                progressBar.remove();
            });
            document.addEventListener('visibilitychange', handleVisibilityChange(progressBar));
        } else {
            if (progressBars.length >= 6) { //限制数量
                const oldestFilename = progressBars[0].filename;
                removeProgressBar(oldestFilename);
            }

            let progressBar = document.createElement('div');
            progressBar.className = 'PLprogress-box';
            if (Status == 2) { //成功
                progressBar.innerHTML = successHTML;
                progressBar.style.background = "#33CC66"
            }
            if (Status == 0) { //成功
                progressBar.innerHTML = errorHTML;
                progressBar.style.background = "#cc0000"
            }
            progressBar.querySelector('.progressBoxRemove').addEventListener('click', function (event) {
                progressBar.remove();
                progressBars.splice(index, 1);

            });
            progressBars.push({ filename, element: progressBar });
            document.getElementsByClassName("PLprogress")[0].appendChild(progressBar);
            document.addEventListener('visibilitychange', handleVisibilityChange(progressBar));
        }


        function startCountdown(progressBar) {
            const timeSpan = progressBar.querySelector('span'); // 获取 <span> 元素
            countdownInterval = setInterval(function () {
                timeSpan.textContent = remainingTime / 1000;
                if (remainingTime <= 0) {
                    progressBar.remove();
                    progressBars.splice(index, 1);
                    clearInterval(countdownInterval);
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                } else {
                    remainingTime -= 1000; // 减去一秒
                }
            }, 1000);
        }

        function stopCountdown() {
            clearInterval(countdownInterval);
        }
        function handleVisibilityChange(progressBar) {
            if (document.visibilityState === 'visible') {
                startCountdown(progressBar);
            } else {
                stopCountdown();
            }
        }
    }

}

let StickerOptional;
function EmoticonBox() {
    let EmoticonBox = document.createElement('div');
    EmoticonBox.className = 'PL-EmoticonBox';
    if (!document.getElementsByClassName("PL-EmoticonBox").length) {
        EmoticonBox.innerHTML = `
        <div class="StickerBox">
            <div class="StickerBoxhead">
            </div>
            <div class="StickerBoxContent">
                <div class="PL-loading"></div>
            </div>
            <span class="StickerBoxRemove">X</span>
            <span class="StickerBoxLeftBut">👈</span>
            <div class="StickerBoxLeft">
                <p><input type="checkbox" id="StickerOptional">自选插入格式</p>
                <select name="HTML" id="StickerCodeSelect">
                    <option value="URL">URL</option>
                    <option value="HTML">HTML</option>
                    <option value="BBCode">BBCode</option>
                    <option value="Markdown">Markdown</option>
                    <option value="MD with link">MD with link</option>
                </select>
            </div>
            <div class="StickerBoxright">
                <img src="" id="PL-EmotionPreview">
            </div>
        </div>
        `
        document.body.appendChild(EmoticonBox);

        chrome.storage.local.get(['StickerOptional'], function (result) {
            document.getElementById("StickerOptional").checked = result.StickerOptional
            StickerOptional = result.StickerOptional
        });
        document.getElementById("StickerOptional").addEventListener('click', function (event) {
            const isChecked = event.target.checked;
            if (isChecked) {
                chrome.storage.local.set({ 'StickerOptional': 1 });

            } else {
                // 存储为0
                chrome.storage.local.set({ 'StickerOptional': 0 });
            }
            StickerOptional = isChecked
        });

        chrome.storage.local.get(['StickerCodeSelect'], function (result) {
            const selectedValue = result.StickerCodeSelect;
            const StickerCodeSelect = document.getElementById("StickerCodeSelect");
            if (selectedValue) {
                StickerCodeSelect.value = selectedValue;
            }
        });
        document.getElementById("StickerCodeSelect").addEventListener('change', function (event) {
            const selectedValue = this.value
            chrome.storage.local.set({ "StickerCodeSelect": selectedValue });
        });
        let StickerBoxLeftBut = 0
        document.querySelector(".StickerBoxLeftBut").addEventListener('click', function (event) {
            if (StickerBoxLeftBut == 0) {
                this.innerText = '👉'
                document.querySelector(".StickerBoxLeft").style.display = 'flex';
                StickerBoxLeftBut = 1
            } else {
                this.innerText = '👈'
                document.querySelector(".StickerBoxLeft").style.display = 'none';
                StickerBoxLeftBut = 0
            }

        });


        // 添加拖动逻辑
        let isDragging = false;
        let offsetX, offsetY;

        EmoticonBox.querySelector('.StickerBoxhead').addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);

        function startDrag(event) {
            isDragging = true;
            offsetX = event.clientX - EmoticonBox.offsetLeft;
            offsetY = event.clientY - EmoticonBox.offsetTop;
        }

        function drag(event) {
            if (isDragging) {
                const x = event.clientX - offsetX;
                const y = event.clientY - offsetY;
                EmoticonBox.style.left = x + 'px';
                EmoticonBox.style.top = y + 'px';
            }
        }

        function stopDrag() {
            isDragging = false;
        }
    }
}
EmoticonBox()

setTimeout(() => {
    const insertContentPrompt = document.querySelector('.insertContentIntoEditorPrompt');
    const emoticonBox = document.querySelector('.PL-EmoticonBox');
    let timerShow;
    let timerHide;
    let getStickerStatus = false;
    if (!insertContentPrompt) {
        return;
    }
    insertContentPrompt.addEventListener('mouseenter', () => {
        clearTimeout(timerHide); // 鼠标进入时清除隐藏的定时器
        timerShow = setTimeout(() => {
            showEmoticonBox();
        }, 800);
    });
    insertContentPrompt.addEventListener('mouseleave', () => {
        clearTimeout(timerShow); // 鼠标离开时清除显示的定时器
        timerHide = setTimeout(() => {
            hideEmoticonBox();
        }, 1000); // 一秒后隐藏
    });

    emoticonBox.addEventListener('mouseenter', () => {
        clearTimeout(timerHide); // 鼠标进入 emoticonBox 时清除隐藏的定时器
    });

    emoticonBox.addEventListener('mouseleave', () => {
        timerHide = setTimeout(() => {
            hideEmoticonBox();
        }, 2000); // 一秒后隐藏
    });

    function showEmoticonBox() {
        clearTimeout(timerHide);
        const promptRect = insertContentPrompt.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset; //滚动条位置
        const scrollX = window.scrollX || window.pageXOffset; //滚动条位置

        const emoticonBoxWidth = 420  //表情盒子的宽度
        const emoticonBoxHeight = 200  //表情盒子的高度

        const viewportWidth = window.innerWidth;// 获取视口的可见宽
        const viewportHeight = window.innerHeight;// 获取视口的可见高度

        const spaceBelow = (scrollY + viewportHeight) - (scrollY + promptRect.bottom)

        const LeftRightPositions = scrollX + promptRect.left
        if (LeftRightPositions >= emoticonBoxWidth) {
            emoticonBox.style.left = `${promptRect.right - emoticonBoxWidth + 12}px`;

        } else {
            emoticonBox.style.left = `${promptRect.left}px`;
        }

        if (spaceBelow >= emoticonBoxHeight) {
            // 下方空间足够，显示在下方
            emoticonBox.style.top = `${promptRect.bottom + scrollY + 10}px`;
        } else {
            emoticonBox.style.top = `${promptRect.top + scrollY - emoticonBoxHeight - 10}px`;
        }

        emoticonBox.style.display = 'block';
        if (getStickerStatus == false) {
            getSticker()
        }
    }
    // 隐藏表情框
    function hideEmoticonBox() {
        emoticonBox.style.display = 'none';
    }
    document.querySelector(".StickerBox .StickerBoxRemove").addEventListener('click', function (event) {
        hideEmoticonBox()
    })

    function getSticker() {
        chrome.storage.local.get(["StickerURL"], function (result) {
            fetch('https://cors-anywhere.pnglog.com/' + result.StickerURL)
                .then(response => {
                    return response.json(); // 解析JSON数据
                })
                .then(data => {
                    const StickerBoxhead = document.querySelector('.StickerBoxhead'); // 获取贴纸标题元素
                    const StickerBoxContent = document.querySelector('.StickerBoxContent'); // 获取贴纸内容元素


                    function updateSelectedStatus(selectedIndex) {
                        const selectedItems = document.querySelectorAll('.StickerBoxheadtem');
                        selectedItems.forEach((item, index) => {
                            item.style.color = index === selectedIndex ? "red" : "#fff";
                        });
                    }

                    StickerBoxhead.innerHTML = '';
                    data.sticker.forEach(function (sticker, index) {
                        const StickerBoxheadtem = document.createElement('div');
                        StickerBoxheadtem.className = 'StickerBoxheadtem';
                        StickerBoxheadtem.textContent = sticker.StickerTitle;
                        StickerBoxhead.appendChild(StickerBoxheadtem);
                        StickerBoxheadtem.addEventListener('click', function (event) {
                            updateSelectedStatus(index);
                            StickerDataItem(index);
                        })
                    })
                    function StickerDataItem(index) {
                        StickerBoxContent.innerHTML = '';
                        if (data.sticker[index].StickerData.length == 0) {
                            StickerBoxContent.innerHTML = '数据为空';
                            return;
                        }
                        const EmotionPreview = document.getElementById('PL-EmotionPreview')
                        data.sticker[index].StickerData.forEach(sticker => {
                            const StickerBoxContentitem = document.createElement('div');

                            StickerBoxContentitem.className = 'StickerBoxContentitem';

                            const img = document.createElement('img');
                            img.src = sticker.StickerURL;
                            img.alt = sticker.StickerName;
                            img.title = sticker.StickerName;
                            img.loading = "lazy";
                            img.addEventListener('click', function (event) {
                                if (StickerOptional == 1) {
                                    chrome.storage.local.get(['StickerCodeSelect'], function (result) {
                                        const selectedValue = result.StickerCodeSelect;
                                        let url;
                                        switch (selectedValue) {
                                            case 'URL':
                                                url = sticker.StickerURL
                                                break;
                                            case 'HTML':
                                                url = '<img src="' + sticker.StickerURL + '" alt="" title="' + sticker.StickerName + '" >'
                                                break;
                                            case 'BBCode':
                                                url = '[img]' + sticker.StickerURL + '[/img]'
                                                break;
                                            case 'Markdown':
                                                url = '![' + sticker.StickerName + '](' + sticker.StickerURL + ')'
                                                break;
                                            case 'MD with link':
                                                url = '[![' + sticker.StickerName + '](' + sticker.StickerURL + ')](' + sticker.StickerURL + ')'
                                                break;
                                        }
                                        // document.execCommand('insertText', false, url);
                                        AutoInsertFun(url, 1)
                                        // window.postMessage({ type: 'StickerOptional', data: url }, '*');
                                    });

                                    return
                                }
                                AutoInsertFun(sticker.StickerURL, 0)
                            })
                            img.addEventListener('mouseover', function () {
                                EmotionPreview.src = this.src;

                            });
                            StickerBoxContentitem.appendChild(img);
                            StickerBoxContent.appendChild(StickerBoxContentitem);
                        });
                    }

                    updateSelectedStatus(0);
                    StickerDataItem(0);
                    getStickerStatus = true
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        })

    }

}, 1000);
