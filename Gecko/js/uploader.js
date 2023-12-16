function custom_replaceDate(inputString, file) {
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    let currentDay = currentDate.getDate().toString().padStart(2, '0');
    let currentTimestampMs = currentDate.getTime();
    let currentTimestamp = Math.floor(currentTimestampMs / 1000);
    let replacements = {
        '$date$': `${currentYear}年${currentMonth}月${currentDay}日`,
        '$date-yyyy$': currentYear,
        '$date-mm$': currentMonth,
        '$date-dd$': currentDay,
        '$date-time$': currentTimestampMs,
        '$date-Time$': currentTimestamp,
        '$fileName$': file.name,
        '$fileSize$': file.size,
        '$fileType$': file.type,
    };
    let replacedString = inputString;

    // 此正则表达式在循环之外创建
    const regex = new RegExp(Object.keys(replacements).map(escapeRegExp).join('|'), 'g');
    if (typeof replacedString == 'object' && file.name) {
        let OObj = []
        if (ProgramConfigurations.custom_Base64Upload) {
            OObj.push(file.dataURL) //返回b64
            return OObj[0];
        }
        OObj.push(file)
        return OObj[0];
    }
    if (typeof replacedString === 'string') {
        if (replacedString.includes('$file$')) {
            if (ProgramConfigurations.custom_Base64Upload) {
                return file.dataURL;
            }
            return file;
        }
        replacedString = replacedString.replace(regex, (match) => replacements[match]);
    }
    return replacedString;
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function custom_replaceDateInObject(obj, file) {
    let content = {};
    if (typeof obj === 'object') {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                content[key] = custom_replaceDate(obj[key], file);
            } else if (typeof obj[key] === 'object') {
                content[key] = custom_replaceDateInObject(obj[key], file);
            }
        }
    }
    return content;
}

/**
 * 扩展popup页上传函数
 */
function popup_Uploader() {
    let delay;
    let delayUpload; // 声明 delayUpload 变量
    switch (ProgramConfigurations.options_exe) {
        // 自定义上传属性
        case 'Lsky':
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/v1/upload";
            uploader.options.headers = { "Authorization": ProgramConfigurations.options_token };
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.tif,.bmp,.ico,.psd,.webp';
            uploader.on("sending", function (file, xhr, formData) {
                if (ProgramConfigurations.options_source_select) {
                    formData.append("strategy_id", ProgramConfigurations.options_source_select);

                }
                if (ProgramConfigurations.options_album_id) {
                    formData.append("album_id", ProgramConfigurations.options_album_id);
                }
                formData.append("permission", ProgramConfigurations.options_permission_select);
            })
            break;
        case 'EasyImages':
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/index.php";
            uploader.options.paramName = 'image';
            uploader.options.acceptedFiles = 'image/*';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("token", ProgramConfigurations.options_token);
            })
            break;
        case 'ImgURL':
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/v2/upload";
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = 'image/*';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("token", ProgramConfigurations.options_token);
                formData.append("uid", ProgramConfigurations.options_uid);
            })
            break;
        case 'SM_MS':
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/v2/upload";
            uploader.options.headers = { "Authorization": ProgramConfigurations.options_token };
            uploader.options.paramName = 'smfile';
            uploader.options.acceptedFiles = 'image/*';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("token", ProgramConfigurations.options_token);
            })
            break;
        case 'Chevereto':
            let Temporary_URL = ""
            if (ProgramConfigurations.options_expiration_select != "NODEL") {
                Temporary_URL += "&expiration=" + ProgramConfigurations.options_expiration_select
            }
            if (ProgramConfigurations.options_album_id) {
                Temporary_URL += "&album_id=" + ProgramConfigurations.options_album_id
            }
            if (ProgramConfigurations.options_nsfw_select) {
                Temporary_URL += "&nsfw=" + ProgramConfigurations.options_nsfw_select
            }
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/1/upload/?key=" + ProgramConfigurations.options_token + Temporary_URL;
            uploader.options.headers = { "Authorization": ProgramConfigurations.options_token };
            uploader.options.paramName = 'source';
            uploader.options.acceptedFiles = 'image/*';
            break;
        case 'Hellohao':
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/uploadbytoken/";
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = 'image/*';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("token", ProgramConfigurations.options_token);
                formData.append("source", ProgramConfigurations.options_source);
            })
            break;
        case 'Imgur':
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/3/upload";
            uploader.options.headers = { "Authorization": 'Client-ID ' + ProgramConfigurations.options_token };
            console.log(uploader.options.headers);
            console.log(ProgramConfigurations.options_token);
            if (ProgramConfigurations.options_imgur_post_mode) {
                uploader.options.acceptedFiles = ".mp4,.webm,.x-matroska,.quicktime,.x-flv,.x-msvideo,.x-ms-wmv,.mpeg"
            } else {
                uploader.options.acceptedFiles = 'image/*';
            }
            uploader.options.paramName = ProgramConfigurations.options_imgur_post_mode ? "video" : "image";
            break;
        case 'UserDiy':
            uploader.options.maxFilesize = 5000
            uploader.options.acceptedFiles = ""
            uploader.options.autoProcessQueue = false
            delayUpload = async function (file) {
                if (file.size > uploader.options.maxFilesize * 1024 * 1024) {
                    return;
                }
                if (ProgramConfigurations.custom_Base64Upload) {
                    const reader = new FileReader();
                    reader.onload = function () {
                        file.dataURL = ProgramConfigurations.custom_Base64UploadRemovePrefix ? btoa(reader.result) : reader.result;
                        completeReplaceOperations(file);
                    };

                    if (ProgramConfigurations.custom_Base64UploadRemovePrefix) {
                        reader.readAsBinaryString(file);
                    } else {
                        reader.readAsDataURL(file);
                    }
                } else {
                    completeReplaceOperations(file);
                }
                function completeReplaceOperations(file) {
                    let _apihost = custom_replaceDate(ProgramConfigurations.options_apihost, file);
                    let _Headers = custom_replaceDateInObject(ProgramConfigurations.options_Headers, file);
                    let _Body = custom_replaceDateInObject(ProgramConfigurations.options_Body, file);
                    let Body;
                    if (ProgramConfigurations.custom_BodyUpload == true) {
                        Body = {};
                        if (ProgramConfigurations.custom_BodyStringify == true) {
                            Body = JSON.stringify(_Body)
                        } else {
                            Body = _Body
                        }
                    } else {
                        Body = new FormData();
                        if (ProgramConfigurations.custom_Base64Upload == true) {
                            Body.append(ProgramConfigurations.options_parameter, file.dataURL);
                        } else {
                            Body.append(ProgramConfigurations.options_parameter, file)
                        }
                        if (_Body.length > 0) {
                            for (let key in _Body) {
                                Body.append(key, _Body[key])
                            }
                        }

                    }
                    $.ajax({
                        url: ProgramConfigurations.options_proxy_server + _apihost,
                        type: ProgramConfigurations.requestMethod,
                        headers: _Headers,
                        processData: false,  // 不对数据进行处理
                        contentType: false,  // 不设置内容类型
                        xhr: function () {
                            const xhr = new window.XMLHttpRequest();
                            xhr.upload.addEventListener("progress", function (evt) {
                                if (evt.lengthComputable) {
                                    const percentComplete = Math.floor((evt.loaded / evt.total) * 100);
                                    file.upload.progress = percentComplete;
                                    file.status = Dropzone.UPLOADING;
                                    uploader.emit("uploadprogress", file, percentComplete, 100);
                                }
                            }, false);

                            return xhr;
                        },
                        data: Body,
                        success: function (response) {
                            uploader.emit("success", file, response);
                            uploader.emit("complete", file, response);
                        },
                        error: function (xhr, status, error) {
                            if (xhr) {
                                uploader.emit("error", file, xhr);
                                return;
                            }
                        }
                    });
                }
            }
            uploader.on("addedfile", function (file) {
                delayUpload(file);
            });
            break;
        case 'Tencent_COS':
            // 初始化 COS 对象
            try {
                let getAuthorization = function (options, callback) {
                    let authorization = COS.getAuthorization({
                        SecretId: ProgramConfigurations.options_SecretId,
                        SecretKey: ProgramConfigurations.options_SecretKey,
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
            if (!ProgramConfigurations.options_Custom_domain_name) {
                ProgramConfigurations.options_Custom_domain_name = "https://" + ProgramConfigurations.options_Bucket + ".cos." + ProgramConfigurations.options_Region + ".myqcloud.com/"
            }
            uploader.options.autoProcessQueue = false
            uploader.options.acceptedFiles = ""
            uploader.options.maxFilesize = 5000 //文件大小
            delayUpload = async function (file) {
                if (file.size > uploader.options.maxFilesize * 1024 * 1024) {
                    return;
                }
                let date = new Date();
                let filename =
                    ProgramConfigurations.options_UploadPath +
                    date.getFullYear() +
                    "/" +
                    (date.getMonth() + 1) +
                    "/" +
                    date.getDate() +
                    "/" +
                    file.name;

                await cos.uploadFile({
                    Bucket: ProgramConfigurations.options_Bucket,
                    Region: ProgramConfigurations.options_Region,
                    Key: filename,
                    Body: file,
                    onProgress: function (progressData) {
                        const progress = Math.round((progressData.loaded / progressData.total) * 100);
                        file.upload.progress = progress;
                        file.status = Dropzone.UPLOADING;
                        uploader.emit("uploadprogress", file, progress, 100);
                    }
                }, function (err, data) {
                    if (data) {
                        file.status = Dropzone.SUCCESS
                        uploader.emit("success", file, "上传完成");
                        uploader.emit("complete", file);
                    }
                    if (err) {
                        toastItem({
                            toast_content: chrome.i18n.getMessage("Upload_prompt4")
                        })
                        console.error(err);
                    }
                });
            }
            // 监听文件添加事件
            uploader.on("addedfile", function (file) {
                delayUpload(file);
                $(".dz-remove").remove()
            });
            break;
        case 'Aliyun_OSS':
            try {
                var oss = new OSS({
                    accessKeyId: ProgramConfigurations.options_SecretId,
                    accessKeySecret: ProgramConfigurations.options_SecretKey,
                    bucket: ProgramConfigurations.options_Bucket,
                    endpoint: ProgramConfigurations.options_Endpoint,
                    region: ProgramConfigurations.options_Region,
                    secure: true //强制https
                });
            } catch (error) {
                toastItem({
                    toast_content: error
                });
            }
            //阿里云oss拼接
            if (!ProgramConfigurations.options_Custom_domain_name) {
                ProgramConfigurations.options_Custom_domain_name = "https://" + ProgramConfigurations.options_Bucket + "." + ProgramConfigurations.options_Endpoint + "/"
            }
            uploader.options.paramName = "file";
            uploader.options.autoProcessQueue = false
            uploader.options.acceptedFiles = ""
            uploader.options.maxFilesize = 5000
            delayUpload = async function (file) {
                if (file.size > uploader.options.maxFilesize * 1024 * 1024) {
                    return;
                }
                let date = new Date();
                let filename = ProgramConfigurations.options_UploadPath + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "/" + file.name;
                const progressCallback = (progress) => {
                    const percentage = Math.floor(progress * 100);
                    file.upload.progress = percentage;
                    file.status = Dropzone.UPLOADING;
                    uploader.emit("uploadprogress", file, percentage, 100);
                };

                try {
                    await oss.multipartUpload(filename, file, { progress: progressCallback });
                    file.status = Dropzone.SUCCESS;
                    uploader.emit("success", file, "上传完成");
                    uploader.emit("complete", file);
                } catch (error) {
                    toastItem({
                        toast_content: chrome.i18n.getMessage("Upload_prompt4"),
                    });
                    console.error(error);
                    return;
                }
            }
            // 监听文件添加事件
            uploader.on("addedfile", function (file) {
                delayUpload(file);
                $(".dz-remove").remove()
            });
            break;
        case 'AWS_S3':
            //AWS S3区域拼接
            if (!ProgramConfigurations.options_Endpoint) {
                ProgramConfigurations.options_Endpoint = "https://s3." + ProgramConfigurations.options_Region + ".amazonaws.com/"
            }
            //AWS S3拼接
            if (!ProgramConfigurations.options_Custom_domain_name) {
                ProgramConfigurations.options_Custom_domain_name = "https://s3." + ProgramConfigurations.options_Region + ".amazonaws.com/" + ProgramConfigurations.options_Bucket + "/"
            }
            try {
                AWS.config.update({
                    accessKeyId: ProgramConfigurations.options_SecretId,
                    secretAccessKey: ProgramConfigurations.options_SecretKey,
                    region: ProgramConfigurations.options_Region,
                    endpoint: ProgramConfigurations.options_Endpoint,
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
            delayUpload = async function (file) {
                if (file.size > uploader.options.maxFilesize * 1024 * 1024) {
                    return;
                }

                let date = new Date();
                let filename =
                    ProgramConfigurations.options_UploadPath +
                    date.getFullYear() +
                    "/" +
                    (date.getMonth() + 1) +
                    "/" +
                    date.getDate() +
                    "/" +
                    file.name;

                let params;
                if (ProgramConfigurations.options_Endpoint.includes('amazonaws.com')) {
                    params = {
                        Bucket: ProgramConfigurations.options_Bucket,
                        Key: filename,
                        Body: file,
                        ACL: 'public-read',
                        ContentType: file.type,
                        Expires: 120,
                    };
                } else {
                    params = {
                        Bucket: ProgramConfigurations.options_Bucket,
                        Key: filename,
                        Body: file,
                        Expires: 120
                    };
                }
                await s3.upload(params, (err, data) => {
                    if (err) {
                        toastItem({
                            toast_content: chrome.i18n.getMessage("Upload_prompt4")
                        })
                        console.error(err);
                        return;
                    }
                    if (data) {
                        file.status = Dropzone.SUCCESS
                        uploader.emit("success", file, "上传完成");
                        uploader.emit("complete", file);
                    }
                }).on('httpUploadProgress', function (progress) {
                    const percentage = Math.floor((progress.loaded / progress.total) * 100);
                    file.upload.progress = percentage;
                    file.status = Dropzone.UPLOADING;
                    uploader.emit("uploadprogress", file, percentage, 100);
                });
            }
            // 监听文件添加事件
            uploader.on("addedfile", function (file) {
                delayUpload(file);
                $(".dz-remove").remove()
            });
            break;
        case 'GitHubUP':
            uploader.options.autoProcessQueue = false
            uploader.options.acceptedFiles = ""
            uploader.options.maxFilesize = 5000
            delay = measurePingDelay("https://github.com/");
            delayUpload = async function (file, index) {
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
                    fetch(ProgramConfigurations.options_proxy_server + `https://api.github.com/repos/` + ProgramConfigurations.options_owner + `/` + ProgramConfigurations.options_repository + `/contents/` + ProgramConfigurations.options_UploadPath + currentFile.name, {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + ProgramConfigurations.options_token,
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
                    try {
                        fetch("https://cors-anywhere.pnglog.com/" + `https://api.github.com/repos/` + ProgramConfigurations.options_owner + `/` + ProgramConfigurations.options_repository + `/contents/` + ProgramConfigurations.options_UploadPath + currentFile.name, {
                            method: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + ProgramConfigurations.options_token,
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
                            toast_content: chrome.i18n.getMessage("Upload_prompt4")
                        })
                    }
                }
                async function Upload_method() {
                    const fileReader = new FileReader();
                    fileReader.onloadend = function () {
                        data.content = btoa(fileReader.result)
                        // 发送上传请求
                        $.ajax({
                            url: ProgramConfigurations.options_proxy_server + `https://api.github.com/repos/` + ProgramConfigurations.options_owner + `/` + ProgramConfigurations.options_repository + `/contents/` + ProgramConfigurations.options_UploadPath + currentFile.name,
                            type: 'PUT',
                            headers: {
                                'Authorization': 'Bearer ' + ProgramConfigurations.options_token,
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
            break;
        case 'Telegra_ph':
            uploader.options.maxFilesize = 5
            if (ProgramConfigurations.options_Custom_domain_name) {
                uploader.options.url = ProgramConfigurations.options_proxy_server + ProgramConfigurations.options_Custom_domain_name + "/upload";
            } else {
                uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/upload";
            }
            uploader.options.headers = { "Accept": "application/json" };
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.tif,.bmp,.ico,.psd,.webp';
            break;
        case 'imgdd':
            uploader.options.maxFilesize = 5
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/v1/upload";
            uploader.options.headers = { "Accept": "application/json" };
            uploader.options.paramName = 'image';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.bmp,.webp';
            break;
        case 'fiftyEight':
            uploader.options.autoProcessQueue = false
            uploader.options.maxFilesize = 5
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://upload.58cdn.com.cn/json";
            uploader.options.headers = { "Accept": "application/json" };
            delayUpload = async function (file) {
                if (file.size > uploader.options.maxFilesize * 1024 * 1024) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (event) {
                    file.dataURL = event.target.result;
                    // 发送数据到服务器
                    let dataToSend = {
                        "Pic-Size": "0*0",
                        "Pic-Encoding": "base64",
                        "Pic-Path": "/nowater/webim/big/",
                        "Pic-Data": file.dataURL.split(",")[1], // 获取Base64编码部分
                    };
                    // 执行上传逻辑
                    $.ajax({
                        url: "https://upload.58cdn.com.cn/json",
                        type: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        xhr: function () {
                            const xhr = new window.XMLHttpRequest();
                            xhr.upload.addEventListener("progress", function (evt) {
                                if (evt.lengthComputable) {
                                    const percentComplete = Math.floor((evt.loaded / evt.total) * 100);
                                    file.upload.progress = percentComplete;
                                    file.status = Dropzone.UPLOADING;
                                    uploader.emit("uploadprogress", file, percentComplete, 100);
                                }
                            }, false);
                            return xhr;
                        },
                        data: JSON.stringify(dataToSend),
                        success: function (result) {
                            if (result) {
                                file.status = Dropzone.SUCCESS;
                                uploader.emit("success", file, result);
                                uploader.emit("complete", file, result);
                            } else {
                                uploader.emit("error", file, "上传失败,可能是达到了上限");
                            }
                        },
                        error: function (xhr, status, error) {
                            if (xhr) {
                                uploader.emit("error", file, xhr);
                                return;
                            }
                        }
                    });
                };
                reader.readAsDataURL(file);

            }
            // 监听文件添加事件
            uploader.on("addedfile", function (file) {
                delayUpload(file);
                $(".dz-remove").remove()
            });
            break;
        case 'BilibliBed':
            // uploader.options.url = ProgramConfigurations.options_proxy_server + "http://127.0.0.1:3000/Bed.Bilibli";
            // uploader.options.headers = {
            //     "biz": "new_dyn",
            //     "category": "daily",
            //     "csrf": options_CSRF,
            //     "SESSDATA": ProgramConfigurations.options_token
            // };
            // uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.bmp,.ico,.webp';

            // uploader.options.url = "https://api.bilibili.com/x/dynamic/feed/draw/upload_bfs";
            // uploader.options.paramName = 'file_up';
            // uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.bmp,.ico,.webp';
            // uploader.on("sending", function (file, xhr, formData) {
            //     formData.append("biz", "new_dyn");
            //     formData.append("category", "category");
            // })
            break;
        case 'BaiJiaHaoBed':
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://baijiahao.baidu.com/pcui/picture/upload";
            uploader.options.paramName = 'media';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.bmp,.ico,.webp';
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("type", "image");
            })
            break;
        case 'freebufBed':
            uploader.options.url = ProgramConfigurations.options_proxy_server + "https://www.freebuf.com/fapi/frontend/upload/image";
            uploader.options.paramName = 'file';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.bmp,.ico,.webp';
            uploader.options.headers = {
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://www.freebuf.com/write",
                "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
            };
            break;
        case 'toutiaoBed':
            const randomAid = Math.floor(Math.random() * 24) + 1;
            let url = `https://i.snssdk.com/feedback/image/v1/upload/?appkey=toutiao_web-web&aid=` + randomAid + `&app_name=toutiao_web`
            uploader.options.url = ProgramConfigurations.options_proxy_server + url;
            uploader.options.paramName = 'image';
            uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.bmp,.ico,.webp';
            uploader.options.headers = {
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://helpdesk.bytedance.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.31"
            };
            uploader.on("sending", function (file, xhr, formData) {
                formData.append("app_id", randomAid);
            })
            break;
        case 'toutiaoBed2':
            // uploader.options.url = ProgramConfigurations.options_proxy_server + "https://mp.toutiao.com/spice/image?upload_source=20020002&aid=1231&device_platform=web";
            // uploader.options.paramName = 'image';
            // uploader.options.acceptedFiles = '.jpeg,.jpg,.png,.gif,.bmp,.ico,.webp';
            // uploader.options.headers = {
            //     "Accept": "application/json, text/plain, */*",
            // }
            break;
    }
}

/**
 * 
 * @param {*} event 
 * @param {*} Simulated_upload 
 * @param {*} EditPasteUpload 
 * @returns 
 * 页面注入js 上传函数
 */
function content_scripts_CheckUploadModel(event, Simulated_upload, EditPasteUpload) {
    if (Simulated_upload == true) {
        let confirm_input = confirm(chrome.i18n.getMessage("Function_demonstration_12"))
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
    if (EditPasteUpload == true) {
        filesUP(event)
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
            console.log('提取到img标签的src属性:', src);
            chrome.runtime.sendMessage({ Drag_Upload: src });
            doc = null; //释放资源

        }
    } else if (event.dataTransfer.types.includes('Files')) {
        // 拖拽的是本地资源（文件）
        let files = event.dataTransfer.files;
        if (files.length > 0) {
            filesUP(files)
        }

    }
    function filesUP(files) {
        chrome.storage.local.get(["ProgramConfiguration"], function (result) {
            ProgramConfigurations = result.ProgramConfiguration
            if (ProgramConfigurations.options_exe === "Tencent_COS" || ProgramConfigurations.options_exe === 'Aliyun_OSS' || ProgramConfigurations.options_exe === 'AWS_S3' || ProgramConfigurations.options_exe === 'GitHubUP' || ProgramConfigurations.options_exe === 'fiftyEight' || ProgramConfigurations.options_exe === 'UserDiy') {
                function processFile(fileIndex) {
                    if (fileIndex < files.length) {
                        let file = files[fileIndex];
                        if (ProgramConfigurations.options_exe == 'GitHubUP' || ProgramConfigurations.options_exe === 'fiftyEight') {
                            // 需要转码的
                            let reader = new FileReader();
                            reader.onload = function () {
                                content_scripts_HandleUploadWithMode({ btoa: btoa(reader.result), file: file }, "GlobalUpload", () => {
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
                        console.log("文件推送成功");
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
                            console.log("base64转码推送成功")
                        }
                        // 读取当前文件的内容
                        reader.readAsBinaryString(file);

                    })(files[i]);
                }
            }
        })
    }
}
/**
 * 
 * @param {string} imgUrl 
 * @param {string} MethodName 模式
 * @param {function} callback 回调
 * @param {Boole} Simulated_upload 模拟上传 
 * @ 函数用作处理特殊的上传方式
 */
function content_scripts_HandleUploadWithMode(imgUrl, MethodName, callback, Simulated_upload) {
    chrome.storage.local.get(null, function (result) {
        if (result.ProgramConfiguration) {
            const programConfig = result.ProgramConfiguration || {};
            for (const key in ProgramConfigurations) {
                if (programConfig.hasOwnProperty(key)) {
                    ProgramConfigurations[key] = programConfig[key];
                }
            }
        }
        // 初始化新安装时的判断跨域开关
        if (ProgramConfigurations.options_proxy_server_state == 0) {
            ProgramConfigurations.options_proxy_server = ""
        }
        if (!ProgramConfigurations.options_proxy_server) {
            ProgramConfigurations.options_proxy_server = ""
        }
        if (Simulated_upload == true) {
            Right_click_menu_animations()
            return;
        }
        if (typeof callback !== 'function') {
            callback = function () { };
        }
        if (MethodName == "GlobalUpload") {
            //处理拖拽上传的方法
            const uploadFunctions = {
                UserDiy: custom_uploadFile,
                Tencent_COS: Cos_uploadFile,
                Aliyun_OSS: Oos_uploadFile,
                AWS_S3: S3_uploadFile,
                GitHubUP: GitHub_uploadFile,
                fiftyEight: fiftyEight_uploadFile
            };
            if (ProgramConfigurations.options_exe in uploadFunctions) {
                uploadFunctions[ProgramConfigurations.options_exe](imgUrl);
            };
        }
        if (MethodName == "Drag_Upload" || MethodName == "Right_Upload") {
            (async () => {
                try {
                    const res = await fetch(ProgramConfigurations.options_proxy_server + imgUrl);
                    const blob = await res.blob();
                    blobUP(blob, imgUrl)
                } catch (error) {
                    console.log("获取失败，再次尝试...");
                    try {
                        const res = await fetch("https://cors-anywhere.pnglog.com/" + imgUrl);
                        const blob = await res.blob();
                        blobUP(blob, imgUrl)
                    } catch (error) {
                        chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt4") });
                        console.log(error);
                        return;
                    }
                }
            })()
            function blobUP(blob, imgUrl) {
                if (ProgramConfigurations.options_exe == "UserDiy") {
                    custom_uploadFile(blob, imgUrl)
                }
                if (ProgramConfigurations.options_exe == "Tencent_COS") {
                    Cos_uploadFile(blob, imgUrl)
                }
                if (ProgramConfigurations.options_exe == "Aliyun_OSS") {
                    Oos_uploadFile(blob, imgUrl)
                }
                if (ProgramConfigurations.options_exe == "AWS_S3") {
                    S3_uploadFile(blob, imgUrl)
                }
                if (ProgramConfigurations.options_exe == "GitHubUP") {
                    let reader = new FileReader();
                    reader.onload = function () {
                        GitHub_uploadFile(btoa(reader.result), blob, imgUrl);
                    };
                    reader.readAsBinaryString(blob, null, imgUrl);
                }
                if (ProgramConfigurations.options_exe == "fiftyEight") {
                    let reader = new FileReader();
                    reader.onload = function () {
                        fiftyEight_uploadFile(btoa(reader.result), blob, imgUrl);
                    };
                    reader.readAsBinaryString(blob, null, imgUrl);
                }
            }
        }

        function custom_uploadFile(blob, imgUrl) {
            if (ProgramConfigurations.custom_KeywordReplacement) {
                ProgramConfigurations.Keyword_replacement1 = ProgramConfigurations.Keyword_replacement1.split(',')
                ProgramConfigurations.Keyword_replacement2 = ProgramConfigurations.Keyword_replacement2.split(',')
                if (ProgramConfigurations.Keyword_replacement1.length != ProgramConfigurations.Keyword_replacement2.length) {
                    alert("关键词和替换词的数量不一致");
                    PLNotification({
                        title: chrome.i18n.getMessage("app_name") + "：",
                        type: "error",
                        content: `关键词和替换词的数量不一致!`,
                        duration: 0,
                        saved: true,
                    });
                    return;
                }
            }
            if (!ProgramConfigurations.options_Headers) {
                ProgramConfigurations.options_Headers = {}
            } else {
                try {
                    ProgramConfigurations.options_Headers = JSON.parse(ProgramConfigurations.options_Headers);
                } catch (error) {
                    alert(chrome.i18n.getMessage("Headers_error"));
                    PLNotification({
                        title: chrome.i18n.getMessage("app_name") + "：",
                        type: "error",
                        content: chrome.i18n.getMessage("Headers_error"),
                        duration: 0,
                        saved: true,
                    });
                    return;
                }
            }
            if (!ProgramConfigurations.options_Body) {
                ProgramConfigurations.options_Body = {}
            } else {
                try {
                    ProgramConfigurations.options_Body = JSON.parse(ProgramConfigurations.options_Body);
                } catch (error) {
                    console.log(error);
                    alert(chrome.i18n.getMessage("Body_error"));
                    PLNotification({
                        title: chrome.i18n.getMessage("app_name") + "：",
                        type: "error",
                        content: chrome.i18n.getMessage("Body_error"),
                        duration: 0,
                        saved: true,
                    });
                    return;
                }
            }
            let date = new Date();
            const imageExtension = getImageFileExtension(imgUrl, blob)
            let UrlImgNema = ProgramConfigurations.options_exe + `_` + MethodName + `_` + (Math.floor(date.getTime() / 1000)) + "." + imageExtension;
            let filename = UrlImgNema;
            chrome.runtime.sendMessage({ "Progress_bar": { "filename": filename, "status": 1 } });
            let file = new File([blob], UrlImgNema, { type: 'image/' + imageExtension });
            if (ProgramConfigurations.custom_Base64Upload) {
                const reader = new FileReader();
                reader.onload = function () {
                    file.dataURL = ProgramConfigurations.custom_Base64UploadRemovePrefix ? btoa(reader.result) : reader.result;
                    completeReplaceOperations(file);
                };

                if (ProgramConfigurations.custom_Base64UploadRemovePrefix) {
                    reader.readAsBinaryString(file);
                } else {
                    reader.readAsDataURL(file);
                }
            } else {
                completeReplaceOperations(file);
            }
            function completeReplaceOperations(file) {
                let _apihost = custom_replaceDate(ProgramConfigurations.options_apihost, file);
                let _Headers = custom_replaceDateInObject(ProgramConfigurations.options_Headers, file);
                let _Body = custom_replaceDateInObject(ProgramConfigurations.options_Body, file);
                let Body = {};
                if (ProgramConfigurations.custom_BodyUpload == true) {
                    if (ProgramConfigurations.custom_BodyStringify == true) {
                        Body = JSON.stringify(_Body)
                    } else {
                        Body = _Body
                    }
                } else {
                    Body = new FormData()
                    if (ProgramConfigurations.custom_Base64Upload == true) {
                        Body.append(ProgramConfigurations.options_parameter, file.dataURL);
                    } else {
                        Body.append(ProgramConfigurations.options_parameter, file)
                    }
                    if (_Body.length > 0) {
                        for (let key in _Body) {
                            Body.append(key, _Body[key])
                        }
                    }
                }
                fetch(ProgramConfigurations.options_proxy_server + _apihost, {
                    method: ProgramConfigurations.requestMethod,
                    headers: _Headers,
                    body: Body,
                })
                    .then(response => response.json())
                    .then(data => {
                        callback(data, null);
                        console.log(data);
                        let options_return_success_value = data;
                        if (ProgramConfigurations.options_return_success !== 'null') {
                            ProgramConfigurations.options_return_success.split('.').forEach(function (prop) {
                                if (options_return_success_value) {
                                    options_return_success_value = options_return_success_value[prop];
                                }
                            });
                        }
                        if (ProgramConfigurations.custom_ReturnPrefix) {
                            options_return_success_value = ProgramConfigurations.custom_ReturnPrefix + options_return_success_value
                        }
                        if (ProgramConfigurations.custom_ReturnAppend) {
                            options_return_success_value += ProgramConfigurations.custom_ReturnAppend
                        }
                        if (ProgramConfigurations.custom_KeywordReplacement) {
                            options_return_success_value = replaceKeywordsInText(options_return_success_value, ProgramConfigurations.Keyword_replacement1, ProgramConfigurations.Keyword_replacement2)
                        }
                        imageUrl = options_return_success_value

                        chrome.storage.local.get(["FuncDomain"], function (result) {
                            if (result.FuncDomain.AutoCopy == "on") {
                                window.postMessage({ type: 'AutoCopy', data: imageUrl }, '*');
                            }
                        });
                        ProgramConfigurations.options_host = _apihost
                        LocalStorage({
                            "file": {
                                "name": UrlImgNema,
                                "file": file,
                            },
                            "url": imageUrl,
                            "MethodName": MethodName,
                            "uploadDomainName": _apihost
                        })
                    }).catch(error => {
                        console.log(error)
                        callback(null, new Error(chrome.i18n.getMessage("Upload_prompt3")));
                        chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt4") });
                        chrome.runtime.sendMessage({ "Progress_bar": { "filename": UrlImgNema, "status": 0 } });
                        return;
                    })
            }
        }
        function Cos_uploadFile(blob, imgUrl) {
            // 初始化 COS 对象
            try {
                let getAuthorization = function (options, callback) {
                    let authorization = COS.getAuthorization({
                        SecretId: ProgramConfigurations.options_SecretId,
                        SecretKey: ProgramConfigurations.options_SecretKey,
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
            if (!ProgramConfigurations.options_Custom_domain_name) {
                ProgramConfigurations.options_Custom_domain_name = "https://" + ProgramConfigurations.options_Bucket + ".cos." + ProgramConfigurations.options_Region + ".myqcloud.com/"
            }
            let date = new Date();
            let getMonth = date.getMonth() + 1 //月
            const imageExtension = getImageFileExtension(imgUrl, blob)
            let UrlImgNema = ProgramConfigurations.options_exe + `_` + MethodName + `_` + (Math.floor(date.getTime() / 1000)) + "." + imageExtension;
            let filename = ProgramConfigurations.options_UploadPath + date.getFullYear() + "/" + getMonth + "/" + date.getDate() + "/" + UrlImgNema;
            chrome.runtime.sendMessage({ "Progress_bar": { "filename": filename, "status": 1 } });
            const file = new File([blob], UrlImgNema, { type: 'image/' + imageExtension });//将获取到的图片数据(blob)导入到file中
            cos.uploadFile({
                Bucket: ProgramConfigurations.options_Bucket,
                Region: ProgramConfigurations.options_Region,
                Key: filename,
                Body: file,
            }, async function (err, data) {
                if (data) {
                    callback(data, null);
                    imageUrl = ProgramConfigurations.options_Custom_domain_name + filename
                    ProgramConfigurations.options_host = ProgramConfigurations.options_Bucket
                    chrome.storage.local.get(["FuncDomain"], function (result) {
                        if (result.FuncDomain.AutoCopy == "on") {
                            window.postMessage({ type: 'AutoCopy', data: imageUrl }, '*');
                        }
                    });
                    LocalStorage({
                        "file": {
                            "name": filename,
                            "file": file,
                        },
                        "url": imageUrl,
                        "MethodName": MethodName,
                    })
                }
                if (err) {
                    console.error(err);
                    callback(null, new Error(chrome.i18n.getMessage("Upload_prompt3")));
                    chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt4") });
                    chrome.runtime.sendMessage({ "Progress_bar": { "filename": filename, "status": 0 } });
                }
            });
        }
        function Oos_uploadFile(blob, imgUrl) {
            try {
                var oss = new OSS({
                    accessKeyId: ProgramConfigurations.options_SecretId,
                    accessKeySecret: ProgramConfigurations.options_SecretKey,
                    bucket: ProgramConfigurations.options_Bucket,
                    endpoint: ProgramConfigurations.options_Endpoint,
                    region: ProgramConfigurations.options_Region,
                    secure: true //强制https
                });
            } catch (error) {
                toastItem({
                    toast_content: error
                });
            }
            //阿里云oss拼接
            if (!ProgramConfigurations.options_Custom_domain_name) {
                ProgramConfigurations.options_Custom_domain_name = "https://" + ProgramConfigurations.options_Bucket + "." + ProgramConfigurations.options_Endpoint + "/"
            }

            let date = new Date();
            let getMonth = date.getMonth() + 1 //月
            const imageExtension = getImageFileExtension(imgUrl, blob)
            let UrlImgNema = ProgramConfigurations.options_exe + `_` + MethodName + `_` + (Math.floor(date.getTime() / 1000)) + "." + imageExtension;
            let filename = ProgramConfigurations.options_UploadPath + date.getFullYear() + "/" + getMonth + "/" + date.getDate() + "/" + UrlImgNema;
            chrome.runtime.sendMessage({ "Progress_bar": { "filename": filename, "status": 1 } });
            const file = new File([blob], UrlImgNema, { type: 'image/' + imageExtension });//将获取到的图片数据(blob)导入到file中
            oss.put(filename, file, {
                headers: {
                    'Content-Type': 'image/png'
                }
            }).then((result) => {
                callback(result, null);
                imageUrl = ProgramConfigurations.options_Custom_domain_name + filename
                ProgramConfigurations.options_host = ProgramConfigurations.options_Endpoint
                chrome.storage.local.get(["FuncDomain"], function (result) {
                    if (result.FuncDomain.AutoCopy == "on") {
                        window.postMessage({ type: 'AutoCopy', data: imageUrl }, '*');
                    }
                });
                LocalStorage({
                    "file": {
                        "name": filename,
                        "file": file,
                    },
                    "url": imageUrl,
                    "MethodName": MethodName,
                })
            }).catch((err) => {
                console.error(err);
                callback(null, new Error(chrome.i18n.getMessage("Upload_prompt3")));
                chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt4") });
                chrome.runtime.sendMessage({ "Progress_bar": { "filename": filename, "status": 0 } });
            });
        }
        function S3_uploadFile(blob, imgUrl) {
            //AWS S3区域拼接
            if (!ProgramConfigurations.options_Endpoint) {
                ProgramConfigurations.options_Endpoint = "https://s3." + ProgramConfigurations.options_Region + ".amazonaws.com/"
            }
            //AWS S3拼接
            if (!ProgramConfigurations.options_Custom_domain_name) {
                ProgramConfigurations.options_Custom_domain_name = "https://s3." + ProgramConfigurations.options_Region + ".amazonaws.com/" + ProgramConfigurations.options_Bucket + "/"
            }
            try {
                AWS.config.update({
                    accessKeyId: ProgramConfigurations.options_SecretId,
                    secretAccessKey: ProgramConfigurations.options_SecretKey,
                    region: ProgramConfigurations.options_Region,
                    endpoint: ProgramConfigurations.options_Endpoint,
                    signatureVersion: 'v4'
                });
                var s3 = new AWS.S3();
            } catch (error) {
                toastItem({
                    toast_content: error
                });
            }
            let date = new Date();
            let getMonth = date.getMonth() + 1 //月
            const imageExtension = getImageFileExtension(imgUrl, blob)
            let UrlImgNema = ProgramConfigurations.options_exe + `_` + MethodName + `_` + (Math.floor(date.getTime() / 1000)) + "." + imageExtension;
            let filename = ProgramConfigurations.options_UploadPath + date.getFullYear() + "/" + getMonth + "/" + date.getDate() + "/" + UrlImgNema;
            chrome.runtime.sendMessage({ "Progress_bar": { "filename": filename, "status": 1 } });
            const file = new File([blob], UrlImgNema, { type: 'image/' + imageExtension });//将获取到的图片数据(blob)导入到file中
            let params;
            if (ProgramConfigurations.options_Endpoint.includes('amazonaws.com')) {
                params = {
                    Bucket: ProgramConfigurations.options_Bucket,
                    Key: filename,
                    Body: file,
                    ACL: 'public-read',
                    ContentType: file.type,
                    Expires: 120,
                };
            } else {
                params = {
                    Bucket: ProgramConfigurations.options_Bucket,
                    Key: filename,
                    Body: file,
                    Expires: 120
                };
            }
            s3.upload(params, function (err, data) {
                if (err) {
                    callback(null, new Error(chrome.i18n.getMessage("Upload_prompt3")));
                    console.error(err);
                    chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt4") });
                    chrome.runtime.sendMessage({ "Progress_bar": { "filename": filename, "status": 0 } });
                    return;
                }
                callback(data, null);
                imageUrl = ProgramConfigurations.options_Custom_domain_name + filename;
                ProgramConfigurations.options_host = ProgramConfigurations.options_Endpoint;
                chrome.storage.local.get(["FuncDomain"], function (result) {
                    if (result.FuncDomain.AutoCopy == "on") {
                        window.postMessage({ type: 'AutoCopy', data: imageUrl }, '*');
                    }
                });
                LocalStorage({
                    "file": {
                        "name": filename,
                        "file": file,
                    },
                    "url": imageUrl,
                    "MethodName": MethodName,
                })
            })

        }
        function GitHub_uploadFile(btoa, files, imgUrl) {
            const file = files || btoa.file

            const blob = btoa.btoa
            let date = new Date();
            const imageExtension = getImageFileExtension(imgUrl, file)
            let UrlImgNema = ProgramConfigurations.options_exe + `_` + MethodName + `_` + (Math.floor(date.getTime() / 1000)) + "." + imageExtension;
            chrome.runtime.sendMessage({ "Progress_bar": { "filename": UrlImgNema, "status": 1 } });
            // 查询是否冲突
            let data = { message: 'UploadDate:' + date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日" + date.getHours() + "时" + date.getMinutes() + "分" + date.getSeconds() + "秒" }
            data.content = blob
            function fetchContent(url) {
                return fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + ProgramConfigurations.options_token,
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

            fetchContent(ProgramConfigurations.options_proxy_server + `https://api.github.com/repos/` + ProgramConfigurations.options_owner + `/` + ProgramConfigurations.options_repository + `/contents/` + ProgramConfigurations.options_UploadPath + UrlImgNema)
                .catch(() => {
                    return fetchContent("https://cors-anywhere.pnglog.com/" + `https://api.github.com/repos/` + ProgramConfigurations.options_owner + `/` + ProgramConfigurations.options_repository + `/contents/` + ProgramConfigurations.options_UploadPath + UrlImgNema);
                })
                .catch(error => {
                    console.log(error);
                    chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt4") });
                    chrome.runtime.sendMessage({ "Progress_bar": { "filename": UrlImgNema, "status": 0 } });
                });

            function Upload_method() {
                fetch(ProgramConfigurations.options_proxy_server + `https://api.github.com/repos/` + ProgramConfigurations.options_owner + `/` + ProgramConfigurations.options_repository + `/contents/` + ProgramConfigurations.options_UploadPath + UrlImgNema, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer ' + ProgramConfigurations.options_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                })
                    .then(response => response.json())
                    .then(res => {
                        console.log(res)
                        callback(res, null);
                        imageUrl = `https://raw.githubusercontent.com/` + ProgramConfigurations.options_owner + `/` + ProgramConfigurations.options_repository + `/main/` + ProgramConfigurations.options_UploadPath + UrlImgNema
                        chrome.storage.local.get(["FuncDomain"], function (result) {
                            if (result.FuncDomain.AutoCopy == "on") {
                                window.postMessage({ type: 'AutoCopy', data: imageUrl }, '*');
                            }
                        });
                        LocalStorage({
                            "file": {
                                "name": UrlImgNema,
                                "file": file,
                            },
                            "url": imageUrl,
                            "MethodName": MethodName,
                        })
                    }).catch(error => {
                        console.log(error)
                        callback(null, new Error(chrome.i18n.getMessage("Upload_prompt3")));
                        chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt4") });
                        chrome.runtime.sendMessage({ "Progress_bar": { "filename": UrlImgNema, "status": 0 } });
                        return;
                    })
            }

        }
        function fiftyEight_uploadFile(btoa, files, imgUrl) {
            const file = files || btoa.file
            const blob = btoa.btoa

            let date = new Date();
            const imageExtension = getImageFileExtension(imgUrl, file)
            let UrlImgNema = ProgramConfigurations.options_exe + `_` + MethodName + `_` + (Math.floor(date.getTime() / 1000)) + "." + imageExtension;
            chrome.runtime.sendMessage({ "Progress_bar": { "filename": UrlImgNema, "status": 1 } });
            let dataToSend = {
                "Pic-Size": "0*0",
                "Pic-Encoding": "base64",
                "Pic-Path": "/nowater/webim/big/",
                "Pic-Data": blob, // 获取Base64编码部分
            };
            fetch(ProgramConfigurations.options_proxy_server + `https://upload.58cdn.com.cn/json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend),
            })
                .then(response => response.text())
                .then(res => {
                    if (res && res.indexOf("n_v2") > -1) {
                        UrlImgNema = res
                        let index = parseInt(Math.random() * 8) + 1;
                        imageUrl = "https://pic" + index + ".58cdn.com.cn/nowater/webim/big/" + res;
                        callback(res, null);
                        chrome.storage.local.get(["FuncDomain"], function (result) {
                            if (result.FuncDomain.AutoCopy == "on") {
                                window.postMessage({ type: 'AutoCopy', data: imageUrl }, '*');
                            }
                        });
                        LocalStorage({
                            "file": {
                                "name": UrlImgNema,
                                "file": file,
                            },
                            "url": imageUrl,
                            "MethodName": MethodName,
                        })
                    }
                }).catch(error => {
                    console.log(error)
                    callback(null, new Error(chrome.i18n.getMessage("Upload_prompt3")));
                    chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt4") });
                    chrome.runtime.sendMessage({ "Progress_bar": { "filename": UrlImgNema, "status": 0 } });
                    return;
                })
        }
    })
}
/**
 * 
 * @param {string} imgUrl 
 * @param {file} file 文件
 * @returns 返回处理后的后缀
 * @ 用作识别url后缀或file.type的后缀并返回他们
 */
function getImageFileExtension(imgUrl, file) {
    let extension;
    const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'apng', 'jng'];
    if (imgUrl) {
        const urlParts = imgUrl.split(".");
        if (urlParts.length > 1) {
            const fileType = urlParts.pop().toLowerCase();
            const extensions = fileType.split(";");
            const candidateExtension = extensions[0].split("/").pop();
            if (validExtensions.includes(candidateExtension)) {
                extension = candidateExtension;
                console.log("url:", extension);
            }
        }
    }
    if (!validExtensions.includes(extension) && file.type) {
        const fileTypeParts = file.type.split("/");
        if (fileTypeParts.length > 1) {
            extension = fileTypeParts.pop().toLowerCase();
            console.log("file:", extension);
        }
    } else {
        return "png"
    }

    return extension;
}

/**
 * @param {string} filename 文件名字 
 * @param {url} imageUrl 上传成功后的url
 * {
        "file": {
          "fileName": null,
          "file": file,
        },
        "url": url,
        "MethodName": "normal",
        "uploadDomainName": ProgramConfigurations.options_host
      }
 */
function LocalStorage(data) {

    let pluginPopup = chrome.runtime.getURL("popup.html");
    let currentURL = window.location.href;

    return new Promise((resolveC, rejectC) => {
        let filename = data.file.name || data.file.file.name;
        let imageUrl = data.url
        let MethodName = data.MethodName || "normal";
        let uploadDomainName = data.uploadDomainName || ProgramConfigurations.options_host;
        if (pluginPopup != currentURL) {
            chrome.runtime.sendMessage({ "Progress_bar": { "filename": filename, "status": 2 } });
        }
        chrome.storage.local.get('UploadLog', function (result) {
            UploadLog = result.UploadLog || [];
            if (!Array.isArray(UploadLog)) {
                UploadLog = [];
            }
            let d = new Date();
            let UploadLogData = {
                key: crypto.randomUUID(),
                url: imageUrl,
                uploadExe: ProgramConfigurations.options_exe + "-" + MethodName,
                upload_domain_name: uploadDomainName,
                original_file_name: filename,
                file_size: data.file.file.size,
                img_file_size: "宽:不支持,高:不支持",
                uploadTime: d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + d.getMinutes() + "分" + d.getSeconds() + "秒"
            }
            if (typeof UploadLog !== 'object') {
                UploadLog = JSON.parse(UploadLog);
            }
            UploadLog.push(UploadLogData);
            chrome.storage.local.set({ 'UploadLog': UploadLog }, function () {
                if (window.location.href.startsWith('http')) {
                    chrome.runtime.sendMessage({ Loudspeaker: chrome.i18n.getMessage("Upload_prompt2") });
                    AutoInsertFun(imageUrl, false)
                }
                resolveC(true);
            })
        });
    });
}
