function popup_Uploader() {
    switch (options_exe) {
        // 自定义上传属性
        case 'Lsky':
            uploader.options.url = options_proxy_server + "https://" + options_host + "/api/v1/upload";
            uploader.options.headers = { "Authorization": options_token };
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.tif,.bmp,.ico,.psd,.webp';
            uploader.on("sending", function (file, xhr, formData) {
                if (options_source_select) {
                    formData.append("strategy_id", options_source_select);

                }
                if (options_album_id) {
                    formData.append("album_id", options_album_id);
                }
                formData.append("permission", options_permission_select);
            })
            break;
        case 'EasyImages':
            uploader.options.url = options_proxy_server + "https://" + options_host + "/api/index.php";
            uploader.options.paramName = 'image';
            uploader.options.acceptedFiles = 'image/*';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("token", options_token);
            })
            break;
        case 'ImgURL':
            uploader.options.url = options_proxy_server + "https://" + options_host + "/api/v2/upload";
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = 'image/*';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("token", options_token);
                formData.append("uid", options_uid);
            })
            break;
        case 'SM_MS':
            uploader.options.url = options_proxy_server + "https://" + options_host + "/api/v2/upload";
            uploader.options.headers = { "Authorization": options_token };
            uploader.options.paramName = 'smfile';
            uploader.options.acceptedFiles = 'image/*';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("token", options_token);
            })
            break;
        case 'Chevereto':
            let Temporary_URL = ""
            if (options_expiration_select != "NODEL") {
                Temporary_URL += "&expiration=" + options_expiration_select
            }
            if (options_album_id) {
                Temporary_URL += "&album_id=" + options_album_id
            }
            if (options_nsfw_select) {
                Temporary_URL += "&nsfw=" + options_nsfw_select
            }
            uploader.options.url = options_proxy_server + "https://" + options_host + "/api/1/upload/?key=" + options_token + Temporary_URL;
            uploader.options.headers = { "Authorization": options_token };
            uploader.options.paramName = 'source';
            uploader.options.acceptedFiles = 'image/*';
            break;
        case 'Hellohao':
            uploader.options.url = options_proxy_server + "https://" + options_host + "/api/uploadbytoken/";
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = 'image/*';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("token", options_token);
                formData.append("source", options_source);
            })
            break;
        case 'Imgur':
            uploader.options.url = options_proxy_server + "https://" + options_host + "/3/upload";
            uploader.options.headers = { "Authorization": 'Client-ID ' + options_token };
            if (options_imgur_post_mode == "video") {
                uploader.options.acceptedFiles = ".mp4,.webm,.x-matroska,.quicktime,.x-flv,.x-msvideo,.x-ms-wmv,.mpeg"
            } else {
                uploader.options.acceptedFiles = 'image/*';
            }
            uploader.options.paramName = options_imgur_post_mode;
            break;
        case 'UserDiy':
            uploader.options.url = options_proxy_server + options_apihost;
            uploader.options.paramName = options_parameter;
            uploader.options.headers = options_Headers
            uploader.on("sending", function (file, xhr, formData) {
                for (let key in options_Body) {
                    formData.append(key, options_Body[key]);
                }
            })
            break;
        case 'Tencent_COS':
            // 初始化 COS 对象
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
                    protocol: 'https:' // 强制使用 HTTPS 协议
                });
            } catch (error) {
                toastItem({
                    toast_content: error
                });
            }
            //腾讯云cos拼接
            if (!options_Custom_domain_name) {
                options_Custom_domain_name = "https://" + options_Bucket + ".cos." + options_Region + ".myqcloud.com/"
            }
            uploader.options.autoProcessQueue = false
            uploader.options.acceptedFiles = ""
            uploader.options.maxFilesize = 5000 //文件大小
            measurePingDelay((error, ping) => {
                if (error) {
                    toastItem({
                        toast_content: error
                    });
                    return;
                } else {
                    let delay
                    if (ping > 300) { //大于
                        delay = Math.floor(ping / 2); // 设置延迟时间，单位为毫秒
                    } else if (ping < 150) { //小于
                        delay = 150
                    } else {
                        delay = ping
                    }
                    async function delayUpload(file, index) {
                        if (index >= file.length) {
                            // 所有文件上传完成
                            return;
                        }
                        const currentFile = file[index];
                        if (currentFile.size > uploader.options.maxFilesize * 1024 * 1024) {
                            // 跳过文件大小超过限制的文件
                            await delayUpload(file, index + 1);
                            return;
                        }

                        let date = new Date();
                        let filename =
                            options_UploadPath +
                            date.getFullYear() +
                            "/" +
                            (date.getMonth() + 1) +
                            "/" +
                            date.getDate() +
                            "/" +
                            currentFile.name;

                        await cos.uploadFile({
                            Bucket: options_Bucket,
                            Region: options_Region,
                            Key: filename,
                            Body: currentFile,
                            onProgress: function (progressData) {
                                const progress = Math.round((progressData.loaded / progressData.total) * 100);
                                currentFile.upload.progress = progress;
                                currentFile.status = Dropzone.UPLOADING;
                                uploader.emit("uploadprogress", currentFile, progress, 100);
                            }
                        }, function (err, data) {
                            if (data) {
                                currentFile.status = Dropzone.SUCCESS
                                uploader.emit("success", currentFile, "上传完成");
                                uploader.emit("complete", currentFile);
                            }
                            if (err) {
                                toastItem({
                                    toast_content: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                                })
                                console.error(err);
                            }
                        });

                        // 延迟一段时间后上传下一个文件
                        await new Promise((resolve) => setTimeout(resolve, delay)); // 设置延迟时间（单位：毫秒）
                        await delayUpload(file, index + 1);
                    }
                    // 监听文件添加事件
                    uploader.on("addedfiles", function (files) {
                        // 调用延迟上传函数开始上传
                        delayUpload(files, 0);
                        $(".dz-remove").remove()
                    });
                }
            }, options_Custom_domain_name)


            break;
        case 'Aliyun_OSS':
            try {
                var oss = new OSS({
                    accessKeyId: options_SecretId,
                    accessKeySecret: options_SecretKey,
                    bucket: options_Bucket,
                    endpoint: options_Endpoint,
                    region: options_Region,
                    secure: true //强制https
                });
            } catch (error) {
                toastItem({
                    toast_content: error
                });
            }
            //阿里云oss拼接
            if (!options_Custom_domain_name) {
                options_Custom_domain_name = "https://" + options_Bucket + "." + options_Endpoint + "/"
            }
            uploader.options.paramName = "file";
            uploader.options.autoProcessQueue = false
            uploader.options.acceptedFiles = ""
            uploader.options.maxFilesize = 5000
            measurePingDelay((error, ping) => {
                if (error) {
                    toastItem({
                        toast_content: error
                    });
                    return;
                } else {
                    let delay
                    if (ping > 300) { //大于
                        delay = Math.floor(ping / 2); // 设置延迟时间，单位为毫秒
                    } else if (ping < 150) { //小于
                        delay = 150
                    } else {
                        delay = ping
                    }
                    // 定义延迟上传函数
                    async function delayUpload(file, index) {
                        if (index >= file.length) {
                            // 所有文件上传完成
                            return;
                        }
                        const currentFile = file[index];
                        if (currentFile.size > uploader.options.maxFilesize * 1024 * 1024) {
                            // 跳过文件大小超过限制的文件
                            await delayUpload(file, index + 1);
                            return;
                        }

                        let date = new Date();
                        let filename =
                            options_UploadPath +
                            date.getFullYear() +
                            "/" +
                            (date.getMonth() + 1) +
                            "/" +
                            date.getDate() +
                            "/" +
                            currentFile.name;

                        const progressCallback = (progress) => {
                            const percentage = Math.floor(progress * 100);
                            currentFile.upload.progress = percentage;
                            currentFile.status = Dropzone.UPLOADING;
                            uploader.emit("uploadprogress", currentFile, percentage, 100);
                        };

                        try {
                            await oss.multipartUpload(filename, currentFile, { progress: progressCallback });
                            currentFile.status = Dropzone.SUCCESS;
                            uploader.emit("success", currentFile, "上传完成");
                            uploader.emit("complete", currentFile);
                        } catch (error) {
                            toastItem({
                                toast_content: "上传失败，请打开DevTools查看报错并根据常见问题进行报错排除",
                            });
                            console.error(error);
                            return;
                        }

                        // 延迟一段时间后上传下一个文件
                        await new Promise((resolve) => setTimeout(resolve, delay)); // 设置延迟时间（单位：毫秒）
                        await delayUpload(file, index + 1);
                    }
                    // 监听文件添加事件
                    uploader.on("addedfiles", function (files) {
                        // 调用延迟上传函数开始上传
                        delayUpload(files, 0);
                        $(".dz-remove").remove()
                    });
                }
            }, options_Custom_domain_name)


            break;
        case 'AWS_S3':
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
                toastItem({
                    toast_content: error
                });
            }
            uploader.options.autoProcessQueue = false
            uploader.options.acceptedFiles = ""
            uploader.options.maxFilesize = 5000
            measurePingDelay((error, ping) => {
                if (error) {
                    toastItem({
                        toast_content: error
                    });
                    return;
                } else {
                    let delay
                    if (ping > 300) { //大于
                        delay = Math.floor(ping / 2); // 设置延迟时间，单位为毫秒
                    } else if (ping < 150) { //小于
                        delay = 150
                    } else {
                        delay = ping
                    }
                    async function delayUpload(file, index) {
                        if (index >= file.length) {
                            // 所有文件上传完成
                            return;
                        }
                        const currentFile = file[index];
                        if (currentFile.size > uploader.options.maxFilesize * 1024 * 1024) {
                            // 跳过文件大小超过限制的文件
                            await delayUpload(file, index + 1);
                            return;
                        }

                        let date = new Date();
                        let filename =
                            options_UploadPath +
                            date.getFullYear() +
                            "/" +
                            (date.getMonth() + 1) +
                            "/" +
                            date.getDate() +
                            "/" +
                            currentFile.name;

                        let params;
                        if (options_Endpoint.includes('amazonaws.com')) {
                            params = {
                                Bucket: options_Bucket,
                                Key: filename,
                                Body: currentFile,
                                ACL: 'public-read',
                                ContentType: currentFile.type,
                                Expires: 120,
                            };
                        } else {
                            params = {
                                Bucket: options_Bucket,
                                Key: filename,
                                Body: currentFile,
                                Expires: 120
                            };
                        }
                        await s3.upload(params, (err, data) => {
                            if (err) {
                                toastItem({
                                    toast_content: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                                })
                                console.error(err);
                                return;
                            }
                            if (data) {
                                currentFile.status = Dropzone.SUCCESS
                                uploader.emit("success", currentFile, "上传完成");
                                uploader.emit("complete", currentFile);
                            }
                        }).on('httpUploadProgress', function (progress) {
                            const percentage = Math.floor((progress.loaded / progress.total) * 100);
                            currentFile.upload.progress = percentage;
                            currentFile.status = Dropzone.UPLOADING;
                            uploader.emit("uploadprogress", currentFile, percentage, 100);
                        });

                        // 延迟一段时间后上传下一个文件
                        await new Promise((resolve) => setTimeout(resolve, delay)); // 设置延迟时间（单位：毫秒）
                        await delayUpload(file, index + 1);
                    }

                    // 监听文件添加事件
                    uploader.on("addedfiles", function (files) {
                        // 调用延迟上传函数开始上传
                        delayUpload(files, 0);
                        $(".dz-remove").remove()
                    });



                }
            }, options_Custom_domain_name)

            break;
        case 'GitHubUP':
            uploader.options.autoProcessQueue = false
            uploader.options.acceptedFiles = ""
            uploader.options.maxFilesize = 5000
            measurePingDelay(function (error, ping) {
                if (error) {
                    toastItem({
                        toast_content: error
                    });
                    return;
                } else {
                    let delay
                    if (ping > 300) { //大于
                        delay = Math.floor(ping / 2); // 设置延迟时间，单位为毫秒
                    } else if (ping < 150) { //小于
                        delay = 150
                    } else {
                        delay = ping
                    }
                    async function delayUpload(file, index) {
                        if (index >= file.length) {
                            // 所有文件上传完成
                            return;
                        }
                        const currentFile = file[index];
                        if (currentFile.size > uploader.options.maxFilesize * 1024 * 1024) {
                            // 跳过文件大小超过限制的文件
                            await delayUpload(file, index + 1);
                            return;
                        }

                        let date = new Date();
                        let data = { message: 'UploadDate:' + date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日" + date.getHours() + "时" + date.getMinutes() + "分" + date.getSeconds() + "秒" }
                        // 查询是否冲突
                        try {
                            fetch(options_proxy_server + `https://api.github.com/repos/` + options_owner + `/` + options_repository + `/contents/` + options_UploadPath + currentFile.name, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Bearer ' + options_token,
                                    'Content-Type': 'application/json'
                                },
                            })
                                .then(response => response.json())
                                .then(res => {
                                    if (res.sha) {
                                        data.sha = res.sha
                                    }
                                    Upload_method()
                                })
                        } catch (error) {
                            console.log("第二次尝试...")
                            try {
                                fetch("https://cors-anywhere.pnglog.com/" + `https://api.github.com/repos/` + options_owner + `/` + options_repository + `/contents/` + options_UploadPath + currentFile.name, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': 'Bearer ' + options_token,
                                        'Content-Type': 'application/json'
                                    },
                                })
                                    .then(response => response.json())
                                    .then(res => {
                                        if (res.sha) {
                                            data.sha = res.sha
                                        }
                                        Upload_method()
                                    })
                            } catch (error) {
                                console.log(error)
                                toastItem({
                                    toast_content: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                                })
                            }
                        }
                        async function Upload_method() {
                            const fileReader = new FileReader();
                            fileReader.onloadend = function () {
                                data.content = btoa(fileReader.result)
                                // 发送上传请求
                                $.ajax({
                                    url: options_proxy_server + `https://api.github.com/repos/` + options_owner + `/` + options_repository + `/contents/` + options_UploadPath + currentFile.name,
                                    type: 'PUT',
                                    headers: {
                                        'Authorization': 'Bearer ' + options_token,
                                        'Content-Type': 'application/json'
                                    },
                                    xhr: function () {
                                        const xhr = new window.XMLHttpRequest();
                                        xhr.upload.addEventListener("progress", function (evt) {
                                            if (evt.lengthComputable) {
                                                const percentComplete = Math.floor((evt.loaded / evt.total) * 100);
                                                currentFile.upload.progress = percentComplete;
                                                currentFile.status = Dropzone.UPLOADING;
                                                uploader.emit("uploadprogress", currentFile, percentComplete, 100);
                                            }
                                        }, false);
                                        return xhr;
                                    },
                                    data: JSON.stringify(data),
                                    success: function (response) {
                                        currentFile.status = Dropzone.SUCCESS;
                                        uploader.emit("success", currentFile, "上传完成");
                                        uploader.emit("complete", currentFile);
                                    },
                                    error: function (xhr, status, error) {
                                        if (xhr) {
                                            uploader.emit("error", currentFile, xhr);
                                            return;
                                        }
                                    }
                                });

                            };
                            fileReader.readAsBinaryString(currentFile);
                            // 延迟一段时间后上传下一个文件
                            await new Promise((resolve) => setTimeout(resolve, delay)); // 设置延迟时间（单位：毫秒）
                            await delayUpload(file, index + 1);
                        }
                    }
                    // 监听文件添加事件
                    uploader.on("addedfiles", function (files) {
                        // 调用延迟上传函数开始上传
                        delayUpload(files, 0);
                        $(".dz-remove").remove()
                    });

                }
            }, 'https://github.com');
            break;
        case 'Telegra_ph':
            uploader.options.maxFilesize = 5
            if (options_Custom_domain_name) {
                uploader.options.url = options_proxy_server + options_Custom_domain_name + "/upload";
            } else {
                uploader.options.url = options_proxy_server + "https://" + options_host + "/upload";
            }
            uploader.options.headers = { "Accept": "application/json" };
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.tif,.bmp,.ico,.psd,.webp';
            break;
        case 'imgdd':
            uploader.options.maxFilesize = 5
            uploader.options.url = options_proxy_server + "https://" + options_host + "/api/v1/upload";
            uploader.options.headers = { "Accept": "application/json" };
            uploader.options.paramName = 'image';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.bmp,.webp';
            break;
    }
}

// content_scripts
function content_scripts_CheckUploadModel(event, Simulated_upload) {
    if (Simulated_upload == true) {
        let confirm_input = confirm("真棒👍,你已经学会“拖拽上传”啦!,我们开启下一节“右键上传”的演示吧")
        Simulated_upload = false //恢复上传
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
        if (confirm_input == true) {
            chrome.runtime.sendMessage({ Demonstration_middleware: "Drag_upload_100" });
        } else {
            iframeShow()
            chrome.runtime.sendMessage({ Demonstration_middleware: "closeIntro" });
        }
        return;
    }
    if (event.dataTransfer.types.includes('text/uri-list')) {
        // 拖拽的是网络资源（URL）
        let htmlData = event.dataTransfer.getData('text/html');
        // 解析HTML数据为DOM树
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlData, 'text/html');
        // 在DOM树中查找img标签并获取src属性
        let imgTags = doc.getElementsByTagName('img');
        if (imgTags.length > 0) {
            let src = imgTags[0].getAttribute('src');
            console.log('提取到的img标签的src属性:', src);
            chrome.runtime.sendMessage({ Drag_Upload: src });
            doc = null; // 删除DOM树，释放资源

        }
    } else if (event.dataTransfer.types.includes('Files')) {
        // 拖拽的是本地资源（文件）
        let files = event.dataTransfer.files;
        if (files.length > 0) {
            if (options_exe === "Tencent_COS" || options_exe === 'Aliyun_OSS' || options_exe === 'AWS_S3' || options_exe === 'GitHubUP') {
                function processFile(fileIndex) {
                    if (fileIndex < files.length) {
                        let file = files[fileIndex];
                        if (options_exe == 'GitHubUP') {
                            let reader = new FileReader();
                            reader.onload = function () {
                                content_scripts_HandleUploadWithMode(btoa(reader.result), "GlobalUpload", () => {
                                    setTimeout(function () {
                                        processFile(fileIndex + 1);
                                    }, 150);
                                }, Simulated_upload);
                            };
                            reader.readAsBinaryString(file);
                        } else {
                            //Tencent_COS,Aliyun_OSS,AWS_S3
                            content_scripts_HandleUploadWithMode(file, "GlobalUpload", () => {
                                setTimeout(function () {
                                    processFile(fileIndex + 1);
                                }, 150);
                            }, Simulated_upload);
                        }

                        console.log("全局上传执行成功");
                    }
                }
                processFile(0)
            } else {
                let base64Strings = [];
                for (let i = 0; i < files.length; i++) {
                    (function (file) {
                        let reader = new FileReader();
                        reader.onload = function () {
                            // 将二进制数据编码为base64字符串并存储在数组中
                            base64Strings.push(btoa(reader.result));
                            if (base64Strings.length == files.length) {
                                chrome.runtime.sendMessage({ GlobalUpload: base64Strings });
                            }
                            console.log("全局上传执行成功")
                        }
                        // 读取当前文件的内容
                        reader.readAsBinaryString(file);

                    })(files[i]);
                }
            }
        }
    }
}
/**
 * @param {url} imgUrl 获取到的图片信息
 * @param {*} MethodName 上传模式名称
 */
function content_scripts_HandleUploadWithMode(imgUrl, MethodName, callback, Simulated_upload) {
    if (Simulated_upload == true) {
        Right_click_menu_animations()
        return;
    }
    if (typeof callback !== 'function') {
        callback = function () { };
    }
    if (MethodName == "GlobalUpload") {
        const uploadFunctions = {
            Tencent_COS: Cos_uploadFile,
            Aliyun_OSS: Oos_uploadFile,
            AWS_S3: S3_uploadFile,
            GitHubUP: GitHub_uploadFile
        };
        if (options_exe in uploadFunctions) {
            uploadFunctions[options_exe](imgUrl);
        };
    }
    if (MethodName == "Drag_Upload" || MethodName == "Rightupload") {
        (async () => {
            try {
                const res = await fetch(options_proxy_server + imgUrl);
                const blob = await res.blob();
                blobUP(blob)
            } catch (error) {
                console.log("获取失败，再次尝试...");
                try {
                    const res = await fetch("https://cors-anywhere.pnglog.com/" + imgUrl);
                    const blob = await res.blob();
                    blobUP(blob)
                } catch (error) {
                    chrome.runtime.sendMessage({ Loudspeaker: "上传失败，请打开 DevTools 查看报错并根据常见问题进行报错排除" });
                    console.log(error);
                    return;
                }
            }
        })()
        function blobUP(blob) {
            if (options_exe == "Tencent_COS") {
                Cos_uploadFile(blob)
            }
            if (options_exe == "Aliyun_OSS") {
                Oos_uploadFile(blob)
            }
            if (options_exe == "AWS_S3") {
                S3_uploadFile(blob)
            }
            if (options_exe == "GitHubUP") {
                let reader = new FileReader();
                reader.onload = function () {
                    GitHub_uploadFile(btoa(reader.result), blob);
                };
                reader.readAsBinaryString(blob);
            }
        }
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
                callback(data, null);
                imageUrl = options_Custom_domain_name + filename
                options_host = options_Bucket
                LocalStorage(filename, imageUrl, file)
            }
            if (err) {
                console.error(err);
                callback(null, new Error('上传失败,请检查错误报告!'));
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
            callback(result, null);
            imageUrl = options_Custom_domain_name + filename
            options_host = options_Endpoint
            LocalStorage(filename, imageUrl, file)
        }).catch((err) => {
            console.error(err);
            callback(null, new Error('上传失败,请检查错误报告!'));
            chrome.runtime.sendMessage({ Loudspeaker: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除" });
        });
    }
    function S3_uploadFile(blob,) {
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
        s3.upload(params, function (err, data) {
            if (err) {
                callback(null, new Error('上传失败,请检查错误报告!'));
                console.error(err);
                chrome.runtime.sendMessage({ Loudspeaker: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除" });
                return;
            }
            callback(data, null);
            imageUrl = options_Custom_domain_name + filename;
            options_host = options_Endpoint;
            LocalStorage(filename, imageUrl, file);
        })

    }
    function GitHub_uploadFile(blob, file) {
        let date = new Date();
        let UrlImgNema = options_exe + `_` + MethodName + `_` + date.getTime() + '.png'
        // 查询是否冲突
        let data = { message: 'UploadDate:' + date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日" + date.getHours() + "时" + date.getMinutes() + "分" + date.getSeconds() + "秒" }
        data.content = blob
        function fetchContent(url) {
            return fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + options_token,
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(res => {
                    if (res.sha) {
                        data.sha = res.sha;
                    }
                    Upload_method();
                });
        }

        fetchContent(options_proxy_server + `https://api.github.com/repos/` + options_owner + `/` + options_repository + `/contents/` + options_UploadPath + UrlImgNema)
            .catch(() => {
                return fetchContent("https://cors-anywhere.pnglog.com/" + `https://api.github.com/repos/` + options_owner + `/` + options_repository + `/contents/` + options_UploadPath + UrlImgNema);
            })
            .catch(error => {
                console.log(error);
                chrome.runtime.sendMessage({ Loudspeaker: "上传失败，请打开DevTools查看报错并根据常见问题进行报错排除" });
            });

        function Upload_method() {
            fetch(options_proxy_server + `https://api.github.com/repos/` + options_owner + `/` + options_repository + `/contents/` + options_UploadPath + UrlImgNema, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + options_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            })
                .then(response => response.json())
                .then(res => {
                    console.log(res)
                    callback(res, null);
                    options_host = "GitHub.com"
                    imageUrl = `https://raw.githubusercontent.com/` + options_owner + `/` + options_repository + `/main/` + options_UploadPath + UrlImgNema
                    LocalStorage(UrlImgNema, imageUrl, file)
                }).catch(error => {
                    console.log(error)
                    callback(null, new Error('上传失败,请检查错误报告!'));
                    chrome.runtime.sendMessage({ Loudspeaker: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除" });
                    return;
                })
        }

    }
}

/**
 * @param {string} filename 文件名字 
 * @param {url} imageUrl 上传成功后的url
 */
function LocalStorage(filename, imageUrl, file) {
    if (!filename) {
        filename = file.name
    }
    chrome.storage.local.get('UploadLog', function (result) {
        UploadLog = result.UploadLog || [];
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
                file_size: file.size,
                img_file_size: "宽:不支持,高:不支持",
                uploadTime: d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + d.getMinutes() + "分" + d.getSeconds() + "秒"
            }
            if (typeof UploadLog !== 'object') {
                UploadLog = JSON.parse(UploadLog);
            }
            UploadLog.push(UploadLogData);
            chrome.storage.local.set({ 'UploadLog': UploadLog }, function () {
                if (window.location.href.startsWith('http')) {
                    chrome.runtime.sendMessage({ Loudspeaker: "图片上传成功，前往上传日志页面即可查看" });
                    AutoInsertFun(imageUrl)
                }
            })
        });
    });
}


