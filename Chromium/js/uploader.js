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