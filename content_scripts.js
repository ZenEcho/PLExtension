/**
 * 本地存储key
 */
let storagelocal = [
    "options_exe",
    "options_proxy_server",
    "options_proxy_server_state",
    "Circle_dragUpload",
    "GlobalUpload",
    "edit_uploadArea_width",
    "edit_uploadArea_height",
    "edit_uploadArea_Location",
    "edit_uploadArea_opacity",
    "edit_uploadArea_auto_close_time",
    "edit_uploadArea_Left_or_Right",
    //对象存储
    "options_SecretId",
    "options_SecretKey",
    "options_Bucket",
    "options_AppId",
    "options_Endpoint",
    "options_Region",
    "options_UploadPath",
    "options_Custom_domain_name",
]
var uploadArea_status = 2;

chrome.storage.local.get(storagelocal, function (result) {
    var imageUrl
    var options_exe = result.options_exe
    var options_proxy_server_state = result.options_proxy_server_state
    var options_proxy_server = result.options_proxy_server

    //对象存储
    var options_SecretId = result.options_SecretId
    var options_SecretKey = result.options_SecretKey
    var options_Bucket = result.options_Bucket
    var options_AppId = result.options_AppId
    var options_Endpoint = result.options_Endpoint
    var options_Region = result.options_Region
    var options_UploadPath = result.options_UploadPath
    var options_Custom_domain_name = result.options_Custom_domain_name

    let Animation_time; // 定义多少秒关闭iframe
    let iframe_mouseover = false // 定义iframe状态
    var Circle_dragUpload = result.Circle_dragUpload //获取本地Circle_dragUpload值
    var GlobalUpload = result.GlobalUpload //获取本地GlobalUpload值

    var uploadPrompt = document.createElement('div');// 定义手势提示
    uploadPrompt.id = "PNG_upload_prompt";// 给提示div添加id
    let Circle_DragUp = false // 定义手势是否完成
    var startX, startY, lastX, lastY, direction;


    var uploadArea = document.createElement('div'); //定义上传区域/侧边栏
    uploadArea.id = 'uploadArea'; //给上传区域定义id


    var uploadAreaTips = document.createElement('div'); //定义上传区域的提示
    uploadAreaTips.className = 'uploadAreaTips';
    uploadAreaTips.id = "uploadAreaTips"
    var PNGlogo16 = chrome.runtime.getURL("icons/logo16.png");
    var PNGlogo32 = chrome.runtime.getURL("icons/logo32.png");
    var PNGlogo64 = chrome.runtime.getURL("icons/logo64.png");
    document.body.appendChild(uploadArea);
    document.body.appendChild(uploadAreaTips);

    var popupUrl = chrome.runtime.getURL('popup.html');
    // 创建一个iframe元素
    var iframe = document.createElement('iframe');
    iframe.className = 'PNGiframe'
    document.body.appendChild(iframe);

    //自定义图标区域
    var edit_uploadArea_width = result.edit_uploadArea_width
    var edit_uploadArea_height = result.edit_uploadArea_height
    var edit_uploadArea_Location = result.edit_uploadArea_Location
    var edit_uploadArea_opacity = result.edit_uploadArea_opacity
    var edit_uploadArea_auto_close_time = result.edit_uploadArea_auto_close_time
    var edit_uploadArea_Left_or_Right = result.edit_uploadArea_Left_or_Right
    uploadArea.style.width = edit_uploadArea_width + "px"
    uploadArea.style.height = edit_uploadArea_height + "%"
    uploadArea.style.top = edit_uploadArea_Location + "%"

    const maxZIndex = Math.pow(2, 31) - 1; //设置index
    uploadArea.style.zIndex = maxZIndex.toString();
    uploadPrompt.style.zIndex = maxZIndex.toString();
    uploadAreaTips.style.zIndex = maxZIndex.toString();
    iframe.style.zIndex = maxZIndex.toString();

    // 判断跨域开关
    if (options_proxy_server_state == 0) {
        options_proxy_server = ""
    }


    if (options_exe == 'Tencent_COS') {
        try {
            let getAuthorization = function (options, callback) {
                let authorization = COS.getAuthorization({
                    SecretId: options_SecretId,
                    SecretKey: options_SecretKey,
                    Method: options.Method,
                    Pathname: options.Pathname,
                    Query: options.Query,
                    Headers: options.Headers,
                    Expires: 900,
                });
                callback({ Authorization: authorization });
            };
            var cos = new COS({
                getAuthorization: getAuthorization,
                UploadCheckContentMd5: true,
            });
        } catch (error) {
            console.error(error)
            chrome.runtime.sendMessage({ Loudspeaker: error.toString() });
        }

        //腾讯云cos拼接
        if (!options_Custom_domain_name) {
            options_Custom_domain_name = "https://" + options_Bucket + ".cos." + options_Region + ".myqcloud.com/"
        }
    }
    if (options_exe == 'Aliyun_OSS') {
        try {
            var oss = new OSS({
                accessKeyId: options_SecretId,
                accessKeySecret: options_SecretKey,
                bucket: options_Bucket,
                endpoint: options_Endpoint,
                region: options_Region
            });
        } catch (error) {
            console.error(error)
            chrome.runtime.sendMessage({ Loudspeaker: error.toString() });
        }
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
        try {
            AWS.config.update({
                accessKeyId: options_SecretId,
                secretAccessKey: options_SecretKey,
                region: options_Region,
                endpoint: options_Endpoint,
                signatureVersion: 'v4'
            });
            var s3 = new AWS.S3();
        } catch (error) {
            console.error(error)
            chrome.runtime.sendMessage({ Loudspeaker: error.toString() });
        }
    }
    /**
     * 实现获取侧边栏的位置信息
     */
    var PNGsidebarRect = uploadArea.getBoundingClientRect();
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
     * 实现手势模式
     */
    switch (Circle_dragUpload) {
        case 'Circle_dragUpload_Default':
            DragImg();
            break;
        case 'Circle_dragUpload_Power':
            DragImg();
            break;
        case 'Circle_dragUpload_off':
            uploadArea_status = uploadArea_status - 1
            break;
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
        case 'GlobalUpload_Power':
            document.addEventListener("drop", uploadArea_drop_Power); // 拖拽到文档
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
        if (event.target.closest('#uploadArea') || event.target.closest('.insertContentIntoEditorPrompt')) {
            //点击元素打开
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
        } else {
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

    });
    /**
     * 拖拽结束的事件
     */
    document.addEventListener("dragend", function (event) {
        uploadAreaTips.style.bottom = "-100px";
        uploadAreaTips.innerText = '';
        /**
        * 判断是否成功拖拽到提示框里
        */
        if (Circle_dragUpload != "Circle_dragUpload_off") {
            if (uploadPrompt && isMouseInElement(event.clientX, event.clientY, uploadPrompt)) {
                if (Circle_DragUp === true) {
                    let imgUrl = event.target.src;
                    console.log("拖拽url:" + imgUrl);
                    if (options_exe == "Tencent_COS" || options_exe == "Aliyun_OSS" || options_exe == "AWS_S3") {
                        uploadFile(imgUrl, "Circle_dragUpload")
                    } else {
                        chrome.runtime.sendMessage({ Circle_dragUpload: imgUrl });
                    }

                }

            } else {
                uploadPrompt.remove();
                Circle_DragUp = false
                console.log("取消上传");
                return;
            }
            uploadPrompt.remove();
            Circle_DragUp = false
        }
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
    // ↓↓↓***画圆拖拽***↓↓↓
    // ↓↓↓***画圆拖拽***↓↓↓
    // ↓↓↓***画圆拖拽***↓↓↓
    // ------------------------------------------------------------------------------------

    /**
     * 画圆开始初始化拖拽数据
     */
    function handleDragStart(event) {
        if (event.target.tagName === 'IMG') {
            // 拖动开始
            startX = event.clientX;
            startY = event.clientY;
            lastX = startX;
            lastY = startY;
            direction = null;
        }

    }
    /**
     * 拖拽的过程逻辑，判断手势是否成功
     */
    function handleDrag(event) {
        if (event.target.tagName === 'IMG') {
            // 拖动过程中
            let currentX = event.clientX;
            let currentY = event.clientY;

            let diffX = currentX - lastX;
            let diffY = currentY - lastY;
            if (direction === null && Circle_DragUp == false) {
                if (diffY > 2 && diffX > 4) {
                    direction = "down";

                }
            } else if (direction === "down") {
                if (diffY < -2 && diffX < -4) {
                    direction = null
                    uploadPrompt.innerText = '手势识别成功,移到此上传,松开取消';
                    document.body.appendChild(uploadPrompt);
                    Circle_DragUp = true
                    return;
                }
            }
            lastX = currentX;
            lastY = currentY;
        }

    }

    /**
     * 设置提示框的范围
     */
    function isMouseInElement(mouseX, mouseY, element) {
        // 判断鼠标位置是否在元素内
        let rect = element.getBoundingClientRect();
        return mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;
    }
    /**
     * 初始化载入函数逻辑
     */
    function DragImg() {
        document.addEventListener("dragstart", handleDragStart);
        document.addEventListener("drag", handleDrag);
    }


    // ------------------------------------------------------------------------------------
    // ↓↓↓***全局上传***↓↓↓
    // ↓↓↓***全局上传***↓↓↓
    // ↓↓↓***全局上传***↓↓↓
    // ------------------------------------------------------------------------------------

    function document_dragstart(event) {
        switch (GlobalUpload) {
            case 'GlobalUpload_Default':
                uploadAreaTips.innerText = '默认模式:不支持在线资源获取,移到此取消上传';
                break;
            case 'GlobalUpload_Power':
                uploadAreaTips.innerText = '增强模式:不支持在线资源获取,移到此取消上传';
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
        switch (GlobalUpload) {
            case 'GlobalUpload_Default':
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
                switch (edit_uploadArea_Left_or_Right) {
                    case "Left":
                        uploadArea.style.left = "0";
                        break;
                    case "Right":
                        uploadArea.style.right = "0";
                        break;
                }
                break;
            case 'GlobalUpload_Power':
                event.preventDefault();
                event.stopPropagation();
                uploadAreaTips.style.bottom = "10px";
                switch (edit_uploadArea_Left_or_Right) {
                    case "Left":
                        uploadArea.style.left = "-" + edit_uploadArea_width + "px"
                        break;
                    case "Right":
                        uploadArea.style.right = "-" + edit_uploadArea_width + "px"
                        break;
                }
                break;
            case 'GlobalUpload_off':
                break;
        }
        if (Circle_DragUp == true) {
            uploadAreaTips.style.bottom = "-100px";
            uploadAreaTips.innerText = '';
            switch (edit_uploadArea_Left_or_Right) {
                case "Left":
                    uploadArea.style.left = "-" + edit_uploadArea_width + "px"
                    break;
                case "Right":
                    uploadArea.style.right = "-" + edit_uploadArea_width + "px"
                    break;
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
            uploadAreaFunction(event)
        }
        uploadAreaTips.style.bottom = "-100px";
        uploadAreaTips.innerText = '';
    }
    /**
     * 增强模式拖拽到文档就上传uploadAreaFunction(event)
     */
    function uploadArea_drop_Power(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!event.target.closest('#uploadAreaTips')) {
            uploadAreaFunction(event)
        }
        uploadAreaTips.style.bottom = "-100px";
        uploadAreaTips.innerText = '';
    }

    /**
     * 上传逻辑
     */
    function uploadAreaFunction(event) {
        let files = event.dataTransfer.files;
        if (files.length > 0) {
            let base64Strings = [];
            for (let i = 0; i < files.length; i++) {
                if (options_exe == "Tencent_COS" || options_exe == 'Aliyun_OSS' || options_exe == 'AWS_S3') {
                    uploadFile(files[i], "GlobalUpload")
                } else {
                    (function (file) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            // 将二进制数据编码为base64字符串并存储在数组中
                            base64Strings.push(btoa(reader.result));
                            if (base64Strings.length == files.length) {
                                chrome.runtime.sendMessage({ GlobalUpload: base64Strings });
                            }
                        }
                        // 读取当前文件的内容
                        reader.readAsBinaryString(file);
                    })(files[i]);
                }
                console.log("全局上传执行成功")
            }
        }
    }

    // ------------------------------------------------------------------------------------
    // ↓↓↓***其他逻辑***↓↓↓
    // ↓↓↓***其他逻辑***↓↓↓
    // ↓↓↓***其他逻辑***↓↓↓
    // ------------------------------------------------------------------------------------

    /**
     * 编辑器的初始识别和状态
     */
    function insertContentIntoEditorState() {
        let pageText = document.body.innerText;
        let item = document.createElement('div');
        item.className = "insertContentIntoEditorPrompt"
        item.innerText = "😍盘络"
        //Discuz
        if (pageText.toLowerCase().includes("discuz") || pageText.toLowerCase().includes("论坛") == true) {
            let DiscuzReply = document.getElementById("fastpostmessage")
            let Discuz_ReplyAdvanced = document.getElementById("e_textarea")

            if (DiscuzReply) {
                let fastpostsubmit = document.getElementById("fastpostsubmit")
                fastpostsubmit.parentNode.appendChild(item)
            }
            if (Discuz_ReplyAdvanced) {

                Discuz_ReplyAdvanced.parentNode.parentNode.appendChild(item)
            }

        }

        //v2exReply
        if (pageText.toLowerCase().includes("v2ex")) {
            let reply_content_Advanced = document.getElementById("topic_content")
            if (pageText.toLowerCase().includes("主题创建指南")) {
                if (reply_content_Advanced) {
                    reply_content_Advanced.parentNode.appendChild(item)
                }
            }
        }

        //nodeseek
        if (pageText.toLowerCase().includes("nodeseek")) {
            let nodeseek = document.getElementById("markdown-input")
            if (nodeseek) {
                nodeseek.parentNode.parentNode.appendChild(item)
            }
        }

        //Xiuno
        if (pageText.toLowerCase().includes("xiuno")) {
            if (pageText.toLowerCase().includes("粗体") || pageText.toLowerCase().includes("回帖")) {
                let Xiuno = document.getElementById("message")
                if (Xiuno) {
                    Xiuno.parentNode.parentNode.appendChild(item)
                }
            }
            if (pageText.toLowerCase().includes("回复") || pageText.toLowerCase().includes("楼主")) {
                item.innerText = "😭盘络"
            }


        }
        //hostevaluate
        if (pageText.toLowerCase().includes("hostevaluate")) {
            let new_topic = document.getElementById("new_topic")
            if (new_topic) {
                new_topic.parentNode.appendChild(item)
            }
        }
        //typecho
        if (pageText.toLowerCase().includes("typecho")) {
            let Typecho = document.getElementById("btn-submit")
            if (Typecho) {
                Typecho.parentNode.appendChild(item)
            }
        }

        //CodeMirror Editor
        let editorElement = document.querySelector(".CodeMirror");
        if (editorElement) {
            editorElement.parentNode.appendChild(item)

        }
        //Gutenberg Editor
        let Gutenberg = document.getElementById("wpbody-content")
        if (Gutenberg) {
            let wpfooter = document.getElementsByClassName("interface-interface-skeleton__footer")
            if (wpfooter.length) {
                wpfooter[wpfooter.length - 1].appendChild(item)
            }

        }
        function master_processCSS(file) {
            var link = document.createElement('link');
            link.href = chrome.runtime.getURL(file);
            link.rel = 'stylesheet';
            (document.head || document.documentElement).appendChild(link);
        }
        master_processCSS('master_process.css');

        function addJs(file) {
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL(file);
            script.onload = function () {
                this.remove();
            };
            (document.head || document.documentElement).appendChild(script);
        }
        addJs('master_process.js');
    }
    chrome.storage.local.get(["AutoInsert"], function (result) {
        if (result.AutoInsert == "AutoInsert_on") {
            insertContentIntoEditorState()
        }
    })
    /**
     * @param {url} AutoInsert_message_content 上传成功后返回的url
     */
    function AutoInsertFun(AutoInsert_message_content) {
        chrome.storage.local.get(["AutoInsert"], function (result) {
            if (result.AutoInsert == "AutoInsert_on") {
                let Find_Editor = false
                let pageText = document.body.innerText;
                let scripts = document.querySelectorAll('script');
                //Discuz
                if (pageText.toLowerCase().includes("discuz")) {
                    let Discuz = document.getElementById("fastpostmessage")
                    let Discuz_Interactive_reply = document.getElementById("postmessage")
                    let Discuz_Advanced = document.getElementById("e_textarea")
                    let Discuz_Advanced_iframe = Discuz_Advanced.parentNode.querySelector("iframe")
                    if (Discuz_Interactive_reply) {
                        if (Find_Editor == true) { return; }
                        //如果是回复楼层
                        let originalContent = Discuz_Interactive_reply.value;
                        Discuz_Interactive_reply.value = originalContent + "\n" + '[img]' + AutoInsert_message_content + '[/img]'
                        Find_Editor = true
                    } else if (Discuz) {
                        if (Find_Editor == true) { return; }
                        //如果是回复楼主
                        let originalContent = Discuz.value;
                        Discuz.value = originalContent + "\n" + '[img]' + AutoInsert_message_content + '[/img]'
                        Find_Editor = true
                    }
                    if (Discuz_Advanced) {
                        if (Find_Editor == true) { return; }
                        if (Discuz_Advanced_iframe) {
                            let bodyElement = Discuz_Advanced_iframe.contentDocument.body
                            let img = document.createElement('img')
                            img.src = AutoInsert_message_content
                            bodyElement.appendChild(img)
                            Find_Editor = true
                        } else {
                            let originalContent = Discuz_Advanced.value;
                            Discuz_Advanced.value = originalContent + "\n" + '[img]' + AutoInsert_message_content + '[/img]';
                            Find_Editor = true
                        }
                    }

                }
                //v2exReply
                if (pageText.toLowerCase().includes("v2ex")) {
                    if (pageText.toLowerCase().includes("主题创建指南")) {
                        let reply_content_Advanced = document.getElementById("topic_content")
                        if (reply_content_Advanced) {
                            if (Find_Editor == true) { return; }
                            let originalContent = reply_content_Advanced.value;
                            reply_content_Advanced.value = originalContent + "\n" + '![' + "请输入内容来激活本次插入" + '](' + AutoInsert_message_content + ')'
                            Find_Editor = true
                        }
                    }

                }
                //nodeseek
                if (pageText.toLowerCase().includes("nodeseek")) {
                    let nodeseek = document.getElementById("markdown-input")
                    if (nodeseek) {
                        if (Find_Editor == true) { return; }
                        let originalContent = nodeseek.value;
                        nodeseek.value = originalContent + "\n" + '![' + "请输入内容来激活本次插入" + '](' + AutoInsert_message_content + ')'
                        Find_Editor = true
                    }

                }
                //hostevaluate
                if (pageText.toLowerCase().includes("hostevaluate")) {
                    let hostevaluate = document.getElementsByClassName("write-container")
                    if (hostevaluate.length) {
                        if (Find_Editor == true) { return; }
                        let write = hostevaluate[hostevaluate.length - 1].querySelector(".write")
                        let originalContent = write.value;
                        write.value = originalContent + "\n" + '![' + "请输入内容来激活本次插入" + '](' + AutoInsert_message_content + ')'
                        Find_Editor = true
                    }
                }
                //Typecho
                if (pageText.toLowerCase().includes("typecho")) {
                    let text = document.getElementById("text")
                    if (text) {
                        if (Find_Editor == true) { return; }
                        let originalContent = text.value;
                        text.value = originalContent + "\n" + '![' + "请输入内容来激活本次插入" + '](' + AutoInsert_message_content + ')'
                        Find_Editor = true
                    }
                }
                //CodeMirror
                let CodeMirror = document.querySelector(".CodeMirror");
                if (CodeMirror) {
                    if (Find_Editor == true) { return; }
                    window.postMessage({ type: 'CodeMirror', data: '![' + "描述" + '](' + AutoInsert_message_content + ')' }, '*');
                    Find_Editor = true
                }
                //Gutenberg Editor
                let Gutenberg = document.getElementById("wpbody-content")
                if (Gutenberg) {
                    if (Find_Editor == true) { return; }
                    window.postMessage({ type: 'Gutenberg', data: AutoInsert_message_content }, '*');
                    Find_Editor = true
                }

                scripts.forEach(function (script) {
                    if (Find_Editor == true) { return; }
                    let src = script.getAttribute('src');
                    //TinyMCE 5/6 Editor
                    if (src && src.includes('tinymce')) {
                        window.postMessage({ type: 'TinyMCE', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                        Find_Editor = true
                        return;
                    }
                    //wangeditor
                    if (src && src.includes('wangeditor')) {
                        window.postMessage({ type: 'wangeditor', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                        Find_Editor = true
                        return;
                    }
                    //ckeditor4
                    if (src && src.includes('ckeditor4')) {
                        window.postMessage({ type: 'ckeditor4', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                        Find_Editor = true
                        return;
                    }
                    //ckeditor5
                    if (src && src.includes('ckeditor5')) {
                        window.postMessage({ type: 'ckeditor5', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                        Find_Editor = true
                        return;
                    }
                });

            }
        })
    }
    // let test_script = document.querySelectorAll('script');
    // test_script.forEach(function (script) {
    //     let src = script.getAttribute('src');
    //     //TinyMCE Editor
    //     if (src && src.includes('tinymce')) {
    //         console.log("tinymce")
    //         return;
    //     }

    // });
    /**
     * 收到消息的动作
     */
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.Tencent_COS_contextMenus) {
            let imgUrl = request.Tencent_COS_contextMenus
            uploadFile(imgUrl, "Rightupload")
        }
        if (request.Aliyun_OSS_contextMenus) {
            let imgUrl = request.Aliyun_OSS_contextMenus
            uploadFile(imgUrl, "Rightupload")
        }
        if (request.AWS_S3_contextMenus) {
            let imgUrl = request.AWS_S3_contextMenus
            uploadFile(imgUrl, "Rightupload")
        }

        if (request.AutoInsert_message) {
            let AutoInsert_message_content = request.AutoInsert_message
            AutoInsertFun(AutoInsert_message_content)
        }
    });

    /**
     * @param {url} imgUrl 获取到的图片信息
     * @param {*} MethodName 上传模式名称
     */
    function uploadFile(imgUrl, MethodName) {
        if (MethodName == "GlobalUpload") {
            if (options_exe == "Tencent_COS") {
                Cos_uploadFile(imgUrl)
            }
            if (options_exe == "Aliyun_OSS") {
                Oos_uploadFile(imgUrl)
            }
            if (options_exe == "AWS_S3") {
                S3_uploadFile(imgUrl)
            }
        }
        if (MethodName == "Circle_dragUpload" || MethodName == "Rightupload") {
            fetch(options_proxy_server + imgUrl)
                .then(res => {
                    return res.blob()
                })
                .then(blob => {
                    if (options_exe == "Tencent_COS") {
                        Cos_uploadFile(blob)
                    }
                    if (options_exe == "Aliyun_OSS") {
                        Oos_uploadFile(blob)
                    }
                    if (options_exe == "AWS_S3") {
                        S3_uploadFile(blob)
                    }

                })
                .catch(error => {
                    console.log("获取失败，再次尝试...")
                    fetch("https://cors-anywhere.pnglog.com/" + imgUrl)
                        .then(res => {
                            return res.blob()
                        })
                        .then(blob => {
                            if (options_exe == "Tencent_COS") {
                                Cos_uploadFile(blob)
                            }
                            if (options_exe == "Aliyun_OSS") {
                                Oos_uploadFile(blob)
                            }
                            if (options_exe == "AWS_S3") {
                                S3_uploadFile(blob)
                            }
                        })
                        .catch(error => {
                            chrome.runtime.sendMessage({ Loudspeaker: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除" });
                            console.log(error)
                            return;
                        })
                })
        }

        function Cos_uploadFile(blob) {
            let date = new Date();
            let getMonth = date.getMonth() + 1 //月
            let UrlImgNema = options_exe + `_` + MethodName + `_` + date.getTime() + '.png'
            let filename = options_UploadPath + date.getFullYear() + "/" + getMonth + "/" + date.getDate() + "/" + UrlImgNema;
            const file = new File([blob], UrlImgNema, { type: 'image/png' });//将获取到的图片数据(blob)导入到file中
            cos.uploadFile({
                Bucket: options_Bucket,
                Region: options_Region,
                Key: filename,
                Body: file,
            }, function (err, data) {
                if (data) {
                    imageUrl = options_Custom_domain_name + filename
                    options_host = options_Bucket
                    LocalStorage(filename, imageUrl)
                }
                if (err) {
                    console.error(err);
                    chrome.runtime.sendMessage({ Loudspeaker: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除" });
                }
            });
        }
        function Oos_uploadFile(blob) {
            let date = new Date();
            let getMonth = date.getMonth() + 1 //月
            let UrlImgNema = options_exe + `_` + MethodName + `_` + date.getTime() + '.png'
            let filename = options_UploadPath + date.getFullYear() + "/" + getMonth + "/" + date.getDate() + "/" + UrlImgNema;
            const file = new File([blob], UrlImgNema, { type: 'image/png' });//将获取到的图片数据(blob)导入到file中
            oss.put(filename, file, {
                headers: {
                    'Content-Type': 'image/png'
                }
            }).then((result) => {
                imageUrl = options_Custom_domain_name + filename
                options_host = options_Endpoint
                LocalStorage(filename, imageUrl)
            }).catch((err) => {
                console.error(err);
                chrome.runtime.sendMessage({ Loudspeaker: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除" });
            });
        }
        function S3_uploadFile(blob) {
            let date = new Date();
            let getMonth = date.getMonth() + 1 //月
            let UrlImgNema = options_exe + `_` + MethodName + `_` + date.getTime() + '.png'
            let filename = options_UploadPath + date.getFullYear() + "/" + getMonth + "/" + date.getDate() + "/" + UrlImgNema;
            const file = new File([blob], UrlImgNema, { type: 'image/png' });//将获取到的图片数据(blob)导入到file中
            let params;
            if (options_Endpoint.includes('amazonaws.com')) {
                params = {
                    Bucket: options_Bucket,
                    Key: filename,
                    Body: file,
                    ACL: 'public-read',
                    ContentType: file.type,
                    Expires: 120,
                };
            } else {
                params = {
                    Bucket: options_Bucket,
                    Key: filename,
                    Body: file,
                    Expires: 120
                };
            }
            s3.upload(params, function (err, date) {
                if (err) {
                    console.error(err);
                    chrome.runtime.sendMessage({ Loudspeaker: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除" });
                    return;
                }
                imageUrl = options_Custom_domain_name + filename
                options_host = options_Endpoint
                LocalStorage(filename, imageUrl)
            })
        }
    }

    /**
     * @param {string} filename 文件名字 
     * @param {url} imageUrl 上传成功后的url
     */
    function LocalStorage(filename, imageUrl) {
        chrome.storage.local.get('UploadLog', function (result) {
            let UploadLog = result.UploadLog || [];
            if (!Array.isArray(UploadLog)) {
                UploadLog = [];
            }
            function generateRandomKey() {
                return new Promise(resolve => {
                    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
                    let key = '';
                    for (let i = 0; i < 6; i++) {
                        key += characters.charAt(Math.floor(Math.random() * characters.length));
                    }
                    // 确保不会重复
                    while (UploadLog.some(log => log.id === key)) {
                        key = '';
                        for (let i = 0; i < 6; i++) {
                            key += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                    }
                    resolve(key);
                });
            }
            let d = new Date();
            generateRandomKey().then(key => {
                let UploadLogData = {
                    key: key,
                    url: imageUrl,
                    uploadExe: options_exe,
                    upload_domain_name: options_host,
                    original_file_name: filename,
                    img_file_size: "宽:不支持,高:不支持",
                    uploadTime: d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + d.getMinutes() + "分" + d.getSeconds() + "秒"
                }
                if (typeof UploadLog !== 'object') {
                    UploadLog = JSON.parse(UploadLog);
                }
                UploadLog.push(UploadLogData);
                chrome.storage.local.set({ 'UploadLog': UploadLog })
                chrome.storage.local.set({ 'UploadLog': UploadLog }, function () {
                    chrome.runtime.sendMessage({ Loudspeaker: "图片上传成功，前往上传日志页面即可查看" });
                    AutoInsertFun(imageUrl)
                })
            });
        });
    }
})