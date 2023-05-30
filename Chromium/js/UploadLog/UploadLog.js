$(document).ready(function () {
    chrome.storage.local.get(getSave, function (result) {
        // 获取程序以及状态
        var options_exe = result.options_exe
        var options_proxy_server = result.options_proxy_server
        var options_host = result.options_host
        var options_token = result.options_token
        var options_proxy_server_state = result.options_proxy_server_state
        var Browse_mode_switching_status = result.Browse_mode_switching_status
        var Copy_Selected_Mode = result.Copy_Selected_Mode

        //对象存储
        var options_SecretId = result.options_SecretId
        var options_SecretKey = result.options_SecretKey
        var options_Bucket = result.options_Bucket
        var options_AppId = result.options_AppId
        var options_Endpoint = result.options_Endpoint
        var options_Region = result.options_Region
        var options_UploadPath = result.options_UploadPath
        var options_Custom_domain_name = result.options_Custom_domain_name

        //GitHub
        var options_owner = result.options_owner
        var options_repository = result.options_repository

        var images
        var imageUrlkey = [] //必须在这里初始化
        var GitHubUP_file = []; //必须在这里初始化
        var $container
        var currentPage
        var itemsPerPage
        var totalPages

        const Image_acquisition_failed = `
        <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">亲亲</h4>
            <p>无法获取图床信息,详细信息请打开DevTools工具(F12)查看</p>
            <hr>
            <p class="mb-0"><a class="nav-link" href="options.html">看看是不是配置信息错误了</a></p>
        </div>`

        const No_picture_data = `
        <div class="alert alert-success" role="alert">
            <h4 class="alert-heading">亲亲</h4>
            <p>已经被榨干了!!!我获取不到数据了啦!</p>
            <hr>
            <p class="mb-0">再努努力吧!</p>
        </div>`
        // 判断浏览模式开关
        if (!Browse_mode_switching_status) {
            chrome.storage.local.set({ 'Browse_mode_switching_status': 0 })
            Browse_mode_switching_status = 0
        }
        if (Browse_mode_switching_status == 1) {
            // 开启
            $("#Browse_mode_switch_button").attr('data-bs-content', '现在加载的是图床服务器的图片噢!点一下就换成加载本地图片啦!')
            $("#Browse_mode_switch_button").html("切换到本地")
            $("#Browse_mode_switch_button").removeClass("btn-dark");
            $("#Browse_mode_switch_button").addClass('btn-danger');
        } else {
            $("#Browse_mode_switch_button").attr('data-bs-content', '现在加载的是本地图片噢!点一下就可以加载图床服务器上的图片了')
            $("#Browse_mode_switch_button").html("切换到图床")
            $("#Browse_mode_switch_button").removeClass("btn-danger")
            $("#Browse_mode_switch_button").addClass('btn-dark');
        }
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
        // 判断跨域开关
        if (options_proxy_server_state == 0) {
            options_proxy_server = ""
        }

        if (!options_proxy_server) {
            options_proxy_server = ""
        }
        // 判断复制模式
        if (!Copy_Selected_Mode) {
            chrome.storage.local.set({ 'Copy_Selected_Mode': "URL" })
            Copy_Selected_Mode = "URL"
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
        }
        if (options_exe == 'Aliyun_OSS') {
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
                toastItem({
                    toast_content: error
                });
            }
        }
        function GetPicture_Library() {
            if (Browse_mode_switching_status == 0) {
                //本地信息获取
                images = result.UploadLog || [];
                $("#DeleteALL").show()
                var keyCount = 0;
                $(document).keyup(function (event) {
                    if (event.ctrlKey) {
                        if (event.key === "c") {
                            keyCount = 1;
                        } else if (event.key === "v" && keyCount === 1) {
                            keyCount = 2;
                        } else if (event.key === "z" && keyCount === 2) {
                            keyCount = 0;
                            // 数据测试用
                            $("#Bottom_button").append(`<button type="button" class="btn btn-primary" id="logaaaaa">备份记录</button>
                <button type="button" class="btn btn-primary" id="logbbbbb">切换到备份记录</button>`)
                            var Back_up_pictures
                            $("#logaaaaa").click(function () {
                                Back_up_pictures = images
                                chrome.storage.local.set({ 'Back_up_pictures': JSON.stringify(Back_up_pictures) });
                                toastItem({
                                    toast_content: '备份成功!'
                                })
                            })
                            $("#logbbbbb").click(function () {
                                chrome.storage.local.get("Back_up_pictures", function (result) {
                                    images = result.Back_up_pictures
                                    if (typeof images !== 'object') {
                                        images = JSON.parse(images);
                                    }

                                    chrome.storage.local.set({ 'UploadLog': JSON.stringify(images) }, function () {
                                        toastItem({
                                            toast_content: '还原成功!即将刷新'
                                        })
                                        setTimeout(function () {
                                            window.location.reload();
                                        }, 2000)

                                    });

                                });
                            })
                            // 数据测试用
                        } else {
                            keyCount = 0
                        }
                    }
                });
                // if (options_exe == 'Tencent_COS' || options_exe == 'Aliyun_OSS' || options_exe == 'AWS_S3') {
                //     $(".PLdanger").html(`<div class="alert alert-danger" role="alert">已知问题：多文件上传时对象存储日志不记录问题——等待解决中...</div>`)
                // }
                if (typeof images !== 'object') {
                    images = JSON.parse(images);
                }
                if (!images.length) {
                    $("#container").html(No_picture_data);
                } else {
                    $container = $('#container');
                    currentPage = 1;
                    itemsPerPage = 10;
                    // 计算总页数
                    totalPages = Math.ceil(images.length / itemsPerPage);
                    $('.pagination').twbsPagination({
                        totalPages: totalPages,
                        visiblePages: 5,
                        onPageClick: function (event, page) {
                            currentPage = page;
                            localRenderImages();
                        },
                        first: '首页',
                        prev: null,
                        next: null,
                        last: "末页",

                    });
                    /**
                     * 渲染本地图片
                     */
                    function localRenderImages() {
                        $container.empty();
                        let startIndex = (currentPage - 1) * itemsPerPage;
                        let endIndex = startIndex + itemsPerPage;
                        let currentImages = images.slice(startIndex, endIndex);
                        currentImages.forEach(function (imageUrl, index) {
                            const fileExtension = imageUrl.url.toLowerCase().match(/\.[0-9a-z]+$/);
                            if (fileExtension && fileTypeMap.hasOwnProperty(fileExtension[0])) {
                                imageUrl.PLFileType = fileTypeMap[fileExtension[0]];
                            } else {
                                imageUrl.PLFileType = null;
                            }
                            if (/^https?:\/\/.+\..+$/.test(imageUrl.url)) {  // regex test to check if url is valid
                                imageUrl.url;
                            } else {
                                imageUrl.url = 'icons/err512.png';
                            }

                            let item = $(`
                                <div class="item shadow-lg bg-body-tertiary" key=`+ imageUrl.key + `>
                                
                                    <ul class="logurl" style="display: none">
                                        <li>上传程序: `+ imageUrl.uploadExe + `</li>
                                        <li>上传域名: `+ imageUrl.upload_domain_name + `</li>
                                        <li>`+ imageUrl.uploadTime + `</li>
                                    </ul>
                                    <div class="delete" style="display: none">
                                    <i class="bi bi-x-lg"></i>
                                    </div>
                                    <div class="copy" style="display: none">
                                    <i class="bi bi-clipboard-check"></i>
                                    </div>
                                    <div class="Image_Width_And_Height" style="display: none;">
                                        <span>`+ imageUrl.img_file_size + `</span>
                                    </div>
                                </div>`);

                            set_PLFileType(item, imageUrl, imageUrl.url, "512")
                            $container.append(item);

                            // 给删除按钮添加点击事件
                            item.find('.delete').one('click', function () {
                                chrome.storage.local.get("UploadLog", function (res) {
                                    images = res.UploadLog || [];
                                    if (typeof images !== 'object') {
                                        images = JSON.parse(images);
                                    }
                                    const index = images.findIndex(img => img.url === imageUrl.url);
                                    if (index !== -1) {
                                        images.splice(index, 1);
                                        item.remove()
                                        $container.masonry('reloadItems')
                                        $container.masonry();
                                        chrome.storage.local.set({ 'UploadLog': JSON.stringify(images) }, function () {
                                            // 从localStorage中删除图片URL
                                            toastItem({ toast_content: "删除成功" })
                                            if ($("#container .item").length < 1) {
                                                toastItem({
                                                    toast_content: "页面无数据,即将刷新"
                                                })
                                                setTimeout(function () {
                                                    window.location.reload();
                                                }, 3000);
                                            }
                                        })
                                    }
                                });
                            });

                            // 点击选中
                            item.find('.FileMedia').click(function () {
                                $(this).parent().toggleClass('gigante');
                            });

                            // 点击复制
                            item.find('.copy').click(function () {
                                let name = $('.logurl').find('li').eq(0).text();
                                let src = item.find(".FileMedia").attr("PLlink");
                                let url;
                                switch (Copy_Selected_Mode) {
                                    case 'URL':
                                        url = src
                                        break;
                                    case 'HTML':
                                        url = '&lt;img src="' + src + '" alt="' + name + '" title="' + name + '" /&gt;'
                                        break;
                                    case 'BBCode':
                                        url = '[img]' + src + '[/img]'
                                        break;
                                    case 'Markdown':
                                        url = '![' + name + '](' + src + ')'
                                        break;
                                    case 'MD with link':
                                        url = '[![' + name + '](' + src + ')](' + src + ')'
                                        break;
                                }
                                let $temp = $("<input>");
                                $("body").append($temp);
                                $temp.val(url).select();
                                document.execCommand("copy");
                                $temp.remove();
                                toastItem({
                                    toast_content: '链接复制成功!'
                                })

                            });

                            // 鼠标移入移出删除按钮的显示与隐藏
                            item.hover(function () {
                                $(this).find('.logurl').show();
                                $(this).find('.delete').show();
                                $(this).find('.copy').show();
                                $(this).find('.Image_Width_And_Height').show();
                                $container.masonry('layout');
                            }, function () {
                                $(this).find('.logurl').hide();
                                $(this).find('.delete').hide();
                                $(this).find('.copy').hide();
                                $(this).find('.Image_Width_And_Height').hide();
                                $container.masonry('layout');
                            });
                            switch (options_exe) {
                                case 'Tencent_COS':
                                case 'Aliyun_OSS':
                                case 'AWS_S3':
                                case 'GitHubUP':
                                    item.imagesLoaded().progress(function () {
                                        item.find('.Image_Width_And_Height').html("点击加载宽高;")
                                        // 获取宽高
                                        item.find('.Image_Width_And_Height').one('click', function () {
                                            item.find('.Image_Width_And_Height').html("加载中...")
                                            const img = item.find('.imgs');
                                            // 获取img元素的src属性
                                            const src = img.attr('src');
                                            let Width_And_Height = new Image();
                                            Width_And_Height.src = src
                                            Width_And_Height.onload = function () {
                                                let width = Width_And_Height.width;
                                                let height = Width_And_Height.height
                                                item.find('.Image_Width_And_Height').html("宽:" + width + ",高:" + height)
                                            }
                                        });
                                    });
                                    break;
                            }
                            $container.imagesLoaded().progress(function () {
                                $container.masonry({
                                    itemSelector: '.item',
                                    fitWidth: true,
                                    // horizontalOrder: true
                                });

                            });


                        });// currentImages.forEach
                        $container.masonry({});
                        $container.masonry('reloadItems')
                    }

                    $("#deleteUrl").click(function () {
                        // 清除本页记录
                        let delete_startIndex = (currentPage - 1) * itemsPerPage; // 开始下引=（当前页数-1） * 图片展示数量(10)
                        let Number_of_page_pictures = $("#container .item").length //获取当前页的图片数量
                        let delete_endIndex = delete_startIndex + Number_of_page_pictures; // 结束下引= 开始下引+当前页的图片数量

                        images.splice(delete_startIndex, delete_endIndex); //开始下引,删除数量
                        chrome.storage.local.set({ 'UploadLog': JSON.stringify(images) }, function () {
                            window.location.reload();
                        })
                    })
                    //全选
                    $("#Select_All").click(function () {
                        $("#container .item").toggleClass('gigante');
                    })
                    //取消选择
                    $("#Select_cancel").click(function () {
                        $("#container .item").removeClass("gigante")
                    })
                    //复制选中
                    $("#Copy_Selected").click(function () {
                        let selectedImgs = $(".gigante .FileMedia");
                        let selectedsrcName = $('.gigante .logurl').find('li').eq(0).text();
                        let imgSrcs = [];
                        selectedImgs.each(function () {
                            let link = $(this).attr("PLlink")
                            let links
                            switch (Copy_Selected_Mode) {
                                case 'URL':
                                    links = link
                                    break;
                                case 'HTML':
                                    links = '&lt;img src="' + link + '" alt="' + selectedsrcName + '" title="' + selectedsrcName + '" /&gt;'
                                    break;
                                case 'BBCode':
                                    links = '[img]' + link + '[/img]'
                                    break;
                                case 'Markdown':
                                    links = '![' + selectedsrcName + '](' + link + ')'
                                    break;
                                case 'MD with link':
                                    links = '[![' + selectedsrcName + '](' + link + ')](' + link + ')'
                                    break;
                            }
                            imgSrcs.push(links);
                        });
                        if (imgSrcs.length) {
                            let tempInput = $("<input>");
                            $("body").append(tempInput);
                            tempInput.val(imgSrcs.join(" ")).select();
                            document.execCommand("copy");
                            tempInput.remove();
                            toastItem({
                                toast_content: "复制成功"
                            })
                        }

                    })
                    //删除选中
                    $("#Delete_Selected").click(function () {
                        let selectedImgs = $(".gigante");
                        let imgKey = []
                        chrome.storage.local.get("UploadLog", function (res) {
                            images = res.UploadLog || [];
                            if (typeof images !== 'object') {
                                images = JSON.parse(images);
                            }
                            selectedImgs.each(function (i) {
                                let imgurl = $(this).find("img").attr("PLlink")
                                const index = images.findIndex(img => img.url === imgurl);
                                imgKey.push(index);
                                images.splice(imgKey[i], 1)
                                toastItem({
                                    toast_content: "删除成功"
                                })
                            });
                            chrome.storage.local.set({ 'UploadLog': JSON.stringify(images) }, function () {
                                selectedImgs.remove()
                                $container.masonry('reloadItems')
                                $container.masonry();
                                if ($("#container .item").length < 1) {
                                    toastItem({
                                        toast_content: "页面无数据,即将刷新"
                                    })
                                    setTimeout(function () {
                                        window.location.reload();
                                    }, 3000);
                                }
                            })


                        });
                    })
                }
            } else {
                $("#DeleteALL").hide()
                switch (options_exe) {
                    case 'Lsky':
                        $(".PLdanger").html(`<div class="alert alert-danger" role="alert">
                        注意：现在删除图片,服务器图片也会跟随删除
                      </div>`)
                        sendAjax(
                            options_proxy_server + "https://" + options_host + "/api/v1/images",
                            'GET',
                            null,
                            {
                                "Accept": "application/json",
                                "Authorization": options_token
                            },
                            function (res) {
                                //第一遍请求成功
                                images = res.data.data
                                if (!images.length) {
                                    $("#container").html(No_picture_data);
                                } else {
                                    $container = $('#container');
                                    // currentPage = res.data.current_page; // 当前第1页
                                    itemsPerPage = res.data.per_page; // 每页40张图片
                                    // 计算总页数
                                    totalPages = res.data.last_page;
                                    $('.pagination').twbsPagination({
                                        totalPages: totalPages,
                                        visiblePages: 5,
                                        onPageClick: function (event, page) {
                                            currentPage = page;
                                            sendAjax(
                                                options_proxy_server + "https://" + options_host + "/api/v1/images?page=" + page,
                                                'GET',
                                                null,
                                                {
                                                    "Accept": "application/json",
                                                    "Authorization": options_token
                                                },
                                                function (res) {
                                                    images = res.data.data
                                                    networkRenderImages();
                                                }
                                            )
                                        },
                                        first: '首页',
                                        prev: null,
                                        next: null,
                                        last: "末页",

                                    });
                                }
                            },
                            function (err) {
                                console.log(err)
                                toastItem({
                                    toast_content: "获取失败"
                                })
                                $("#container").html(Image_acquisition_failed);
                            }

                        )
                        break;
                    case 'SM_MS':
                        $(".PLdanger").html(`<div class="alert alert-danger" role="alert">
                    注意：现在删除图片,服务器图片也会跟随删除。sm.ms删除有延迟,会出现删除了还能加载的情况
                  </div><div class="alert alert-primary" role="alert">
                  注意：仅加载最新100张图片且查询和删除有延迟(因为sm.ms服务端设置的单页100张图,单页这么多图对配置要求过高,还会被误判为ddos攻击。)
                </div>`)
                        sendAjax(
                            options_proxy_server + "https://" + options_host + "/api/v2/upload_history?page=1",
                            'GET',
                            null,
                            {
                                "Authorization": options_token,
                                "Content-Type": "multipart/form-data"
                            },
                            function (res) {
                                images = res.data
                                if (!images.length) {
                                    $("#container").html(No_picture_data);
                                } else {
                                    $container = $('#container');
                                    currentPage = 1; // 当前第1页
                                    itemsPerPage = 20; // 每页20张图片
                                    totalPages = Math.ceil(images.length / itemsPerPage)// 计算总页数
                                    $('.pagination').twbsPagination({
                                        totalPages: totalPages,
                                        visiblePages: 5,
                                        onPageClick: function (event, page) {
                                            currentPage = page;
                                            networkRenderImages()
                                        },
                                        first: '首页',
                                        prev: null,
                                        next: null,
                                        last: "末页",

                                    });
                                }

                            },
                            function (err) {
                                console.log(err)
                                toastItem({
                                    toast_content: "获取失败"
                                })
                                $("#container").html(Image_acquisition_failed);
                            }
                        )
                        break;
                    case 'Hellohao':
                        $(".PLdanger").html(`<div class="alert alert-danger" role="alert">
                    注意：现在删除图片,服务器图片也会跟随删除
                  </div>`)
                        sendAjax(
                            options_proxy_server + "https://" + options_host + "/api/getimglist/",
                            'POST',
                            {
                                "token": options_token
                            },
                            null,
                            function (res) {
                                images = res.data.rows
                                if (!images.length) {
                                    $("#container").html(No_picture_data);
                                } else {
                                    $container = $('#container');
                                    currentPage = 1; // 当前第1页
                                    itemsPerPage = 20; // 每页20张图片
                                    totalPages = Math.ceil(res.data.total / itemsPerPage);// 计算总页数
                                    $('.pagination').twbsPagination({
                                        totalPages: totalPages,
                                        visiblePages: 5,
                                        onPageClick: function (event, page) {
                                            currentPage = page;
                                            sendAjax(
                                                options_proxy_server + "https://" + options_host + "/api/getimglist/?pageNum=" + page,
                                                'POST',
                                                {
                                                    "token": options_token
                                                },
                                                null,
                                                function (res) {
                                                    images = res.data.rows
                                                    networkRenderImages();
                                                }
                                            )
                                        },
                                        first: '首页',
                                        prev: null,
                                        next: null,
                                        last: "末页",

                                    });

                                }
                            },
                            function (err) {
                                console.log(err)
                                toastItem({
                                    toast_content: "获取失败"
                                })
                                $("#container").html(Image_acquisition_failed);
                            }
                        )
                        break;
                    case 'Tencent_COS':
                        $(".PLdanger").html(
                            `<div class="alert alert-danger" role="alert">注意：现在删除图片,服务器图片也会跟随删除</div>
                            <div class="alert alert-primary" role="alert">注意：腾讯云COS限制仅能加载最新1000张图片</div>`)

                        function getBucket(marker) {
                            cos.getBucket({
                                Bucket: options_Bucket,
                                Region: options_Region,
                                Prefix: options_UploadPath, // 列出某某开头文件
                                Marker: marker,
                                MaxKeys: 1000,
                            }, function (err, data) {
                                if (err) {
                                    console.log(err);
                                    $("#container").html(Image_acquisition_failed);
                                } else {
                                    images = data.Contents
                                    for (let i = images.length - 1; i >= 0; i--) {
                                        if (images[i].Key.endsWith('/')) {
                                            images.splice(i, 1);
                                        }
                                    }
                                    if (!images.length) {
                                        $("#container").html(No_picture_data);
                                    } else {
                                        $container = $('#container');
                                        currentPage = 1; // 当前第1页
                                        itemsPerPage = 20; // 每页20张图片
                                        totalPages = Math.ceil(images.length / itemsPerPage);// 计算总页数
                                        $('.pagination').twbsPagination({
                                            totalPages: totalPages,
                                            visiblePages: 5,
                                            onPageClick: function (event, page) {
                                                currentPage = page;
                                                networkRenderImages()
                                            },
                                            first: '首页',
                                            prev: null,
                                            next: null,
                                            last: "末页",

                                        });
                                    }
                                }
                            });
                        }
                        getBucket()
                        break;
                    case 'Aliyun_OSS':
                        $(".PLdanger").html(
                            `<div class="alert alert-danger" role="alert">注意：现在删除图片,服务器图片也会跟随删除</div>
                            <div class="alert alert-primary" role="alert">注意：阿里云OSS限制仅能加载最新1000张图片</div>`)
                        async function list() {
                            try {
                                const result = await oss.listV2({
                                    "max-keys": 1000,
                                    prefix: options_UploadPath
                                });
                                images = result.objects
                                if (!images.length) {
                                    $("#container").html(No_picture_data);
                                } else {
                                    $container = $('#container');
                                    currentPage = 1; // 当前第1页
                                    itemsPerPage = 10; // 每页20张图片
                                    totalPages = Math.ceil(images.length / itemsPerPage);// 计算总页数
                                    $('.pagination').twbsPagination({
                                        totalPages: totalPages,
                                        visiblePages: 5,
                                        onPageClick: function (event, page) {
                                            currentPage = page;
                                            networkRenderImages()

                                        },
                                        first: '首页',
                                        prev: null,
                                        next: null,
                                        last: "末页",

                                    });
                                }
                            } catch (error) {
                                console.log(error);
                                $("#container").html(Image_acquisition_failed);
                            }


                        }
                        list()
                        break;
                    case 'AWS_S3':
                        $(".PLdanger").html(
                            `<div class="alert alert-danger" role="alert">注意：现在删除图片,服务器图片也会跟随删除</div>
                            <div class="alert alert-primary" role="alert">注意：AWS S3限制仅能加载最新1000张图片</div>`)
                        const params = {
                            Bucket: options_Bucket,
                            Prefix: options_UploadPath,
                            MaxKeys: "1000",//最大1000个
                        };

                        s3.listObjects(params, function (err, data) {
                            if (err) {
                                console.log(err);
                                $("#container").html(Image_acquisition_failed);
                            } else {
                                images = data.Contents
                                images = data.Contents.filter(obj => !obj.Key.endsWith('/'));
                                if (!images.length) {
                                    $("#container").html(No_picture_data);
                                } else {
                                    $container = $('#container');
                                    currentPage = 1; // 当前第1页
                                    itemsPerPage = 20; // 每页20张图片
                                    totalPages = Math.ceil(images.length / itemsPerPage);// 计算总页数

                                    $('.pagination').twbsPagination({
                                        totalPages: totalPages,
                                        visiblePages: 5,
                                        onPageClick: function (event, page) {
                                            currentPage = page;
                                            networkRenderImages()
                                        },
                                        first: '首页',
                                        prev: null,
                                        next: null,
                                        last: "末页",

                                    });
                                }
                            }
                        });

                        break;
                    case 'GitHubUP':
                        $(".PLdanger").html(
                            `<div class="alert alert-danger" role="alert">注意：现在删除图片,服务器图片也会跟随删除</div>
                            <div class="alert alert-primary" role="alert">注意：GitHub限制仅能加载最新1000张图片,删除可能会有缓存</div>`)
                        sendAjax(
                            options_proxy_server + `https://api.github.com/repos/` + options_owner + `/` + options_repository + `/contents/` + options_UploadPath,
                            'GET',
                            null,
                            {
                                'Authorization': 'Bearer ' + options_token,
                                'Content-Type': 'application/json'
                            },
                            function (res) {
                                images = res
                                if (!images.length) {
                                    $("#container").html(No_picture_data);
                                } else {
                                    $container = $('#container');
                                    currentPage = 1; // 当前第1页
                                    itemsPerPage = 20; // 每页20张图片
                                    totalPages = Math.ceil(images.length / itemsPerPage);// 计算总页数
                                    $('.pagination').twbsPagination({
                                        totalPages: totalPages,
                                        visiblePages: 5,
                                        onPageClick: function (event, page) {
                                            currentPage = page;
                                            networkRenderImages()
                                        },
                                        first: '首页',
                                        prev: null,
                                        next: null,
                                        last: "末页",

                                    });
                                }

                            },
                            function (err) {
                                if (err.responseJSON.message = "Not Found") {
                                    $("#container").html(No_picture_data);
                                } else {
                                    console.log(err)
                                    toastItem({
                                        toast_content: "获取失败"
                                    })
                                    $("#container").html(Image_acquisition_failed);
                                }
                            }
                        )
                        break;
                    default:
                        $("#container").html('<div class="alert alert-danger" role="alert"><h4 class="alert-heading">亲亲</h4><p>真的很抱歉捏,这个图床不能获取图片噢!</p><hr><p class="mb-0"><a class="nav-link"href="options.html">换一个图床试一试吧</a></p></div>');
                        break;
                }

                /**
                 * 网络图片渲染
                 */
                async function networkRenderImages() {
                    $container.empty();
                    switch (options_exe) {
                        case 'SM_MS':
                        case 'Tencent_COS':
                        case 'Aliyun_OSS':
                        case 'AWS_S3':
                        case 'GitHubUP':
                            var startIndex = (currentPage - 1) * itemsPerPage;
                            var endIndex = startIndex + itemsPerPage;
                            break;
                        default:
                            var startIndex = 0;
                            var endIndex = itemsPerPage;
                            break;
                    }
                    let currentImages = images.slice(startIndex, endIndex);
                    currentImages.forEach(function (imageUrl, index) {
                        let Image_Width_And_Height
                        let item_divKey;
                        let item_divType = "null"
                        let item_imgUrl;
                        let item_liImgName;
                        let item_liImgSize;
                        let item_liImgDate;
                        switch (options_exe) {
                            case 'Lsky':
                                imageUrlkey.push(imageUrl.key);
                                item_divKey = imageUrl.key
                                item_imgUrl = imageUrl.links.url
                                item_liImgName = imageUrl.origin_name
                                item_liImgSize = imageUrl.size
                                item_liImgDate = imageUrl.date
                                Image_Width_And_Height = "宽:" + imageUrl.width + ",高:" + imageUrl.height
                                break;
                            case 'SM_MS':
                                imageUrlkey.push(imageUrl.hash); // 删除图片的服务器key值
                                item_divKey = imageUrl.hash
                                item_imgUrl = imageUrl.url
                                item_liImgName = imageUrl.filename
                                item_liImgSize = (imageUrl.size / 1024).toFixed(2)
                                item_liImgDate = imageUrl.created_at
                                Image_Width_And_Height = "宽:" + imageUrl.width + ",高:" + imageUrl.height
                                break;
                            case 'Hellohao':
                                imageUrlkey.push(imageUrl.delkey); // 删除图片的服务器key值
                                item_divKey = imageUrl.delkey
                                item_imgUrl = imageUrl.imgurl
                                item_liImgName = imageUrl.abnormal
                                item_liImgSize = (imageUrl.sizes / 1024).toFixed(2)
                                item_liImgDate = imageUrl.updatetime
                                Image_Width_And_Height = imageUrl.imgurl.match(/\/([^\/]+)\/?$/)[1]
                                break;
                            case 'Tencent_COS':
                                imageUrlkey.push(imageUrl.Key); // 删除图片的服务器key值
                                item_divKey = imageUrl.Key
                                item_imgUrl = options_Custom_domain_name + imageUrl.Key
                                item_liImgName = imageUrl.Key.split('/').pop()
                                item_liImgSize = (imageUrl.Size / 1024).toFixed(2)
                                item_liImgDate = imageUrl.LastModified
                                Image_Width_And_Height = "宽:不支持,高:不支持"
                                break;
                            case 'Aliyun_OSS':
                                imageUrlkey.push(imageUrl.name); // 删除图片的服务器key值
                                item_divKey = imageUrl.name
                                item_imgUrl = options_Custom_domain_name + imageUrl.name
                                item_liImgName = imageUrl.name.split('/').pop()
                                item_liImgSize = (imageUrl.size / 1024).toFixed(2)
                                item_liImgDate = imageUrl.lastModified
                                Image_Width_And_Height = "宽:不支持,高:不支持"
                                break;
                            case 'AWS_S3':
                                imageUrlkey.push(imageUrl.Key); // 删除图片的服务器key值
                                item_divKey = imageUrl.Key
                                item_imgUrl = options_Custom_domain_name + imageUrl.Key
                                item_liImgName = imageUrl.Key.split('/').pop()
                                item_liImgSize = (imageUrl.Size / 1024).toFixed(2)
                                item_liImgDate = imageUrl.LastModified
                                Image_Width_And_Height = "宽:不支持,高:不支持"
                                break;
                            case 'GitHubUP':
                                imageUrlkey.push(imageUrl.sha);
                                let fileinfo = {
                                    path: imageUrl.path,
                                    sha: imageUrl.sha,
                                    type: imageUrl.type
                                }
                                GitHubUP_file.push(fileinfo);
                                item_divKey = imageUrl.sha
                                item_divType = imageUrl.type
                                item_imgUrl = `https://raw.githubusercontent.com/` + options_owner + `/` + options_repository + `/main/` + options_UploadPath + imageUrl.name
                                item_liImgName = imageUrl.name
                                item_liImgSize = (imageUrl.size / 1024).toFixed(2)
                                item_liImgDate = "GitHub不支持"
                                Image_Width_And_Height = "宽:不支持,高:不支持"
                                break;
                        }
                        if (item_liImgSize < 1024) {
                            item_liImgSize = item_liImgSize + "KB"
                        } else if (item_liImgSize > 1024) {
                            item_liImgSize = (item_liImgSize / 1024).toFixed(2) + "MB"
                        }
                        const fileExtension = item_imgUrl.toLowerCase().match(/\.[0-9a-z]+$/);
                        if (fileExtension && fileTypeMap.hasOwnProperty(fileExtension[0])) {
                            imageUrl.PLFileType = fileTypeMap[fileExtension[0]];
                        } else {
                            imageUrl.PLFileType = null;
                        }
                        const item = $(`
                        <div class="item shadow-lg bg-body-tertiary" key=`+ item_divKey + ` type=` + item_divType + `>
                            
                            <ul class="logurl" style="display: none">
                                <li>`+ item_liImgName + `</li>
                                <li>大小：`+ item_liImgSize + `</li>
                                <li>日期：`+ item_liImgDate + `</li>
                            </ul>
                            <div class="delete" style="display: none">
                            <i class="bi bi-x-lg"></i>
                            </div>
                            <div class="copy" style="display: none">
                            <i class="bi bi-clipboard-check"></i>
                            </div>
                            <div class="Image_Width_And_Height" style="display: none;" data-bs-toggle="popover"
                            data-bs-trigger="hover focus" data-bs-content="点击获取宽高">
                                <span>`+ Image_Width_And_Height + `</span>
                            </div>
                        </div>`);

                        set_PLFileType(item, imageUrl, item_imgUrl, item_liImgSize)
                        $container.append(item);

                        // 给删除按钮添加点击事件
                        item.find('.delete').one('click', function () {
                            // 从瀑布流容器中删除图片元素
                            switch (options_exe) {
                                case 'Lsky':
                                    sendAjax(
                                        options_proxy_server + "https://" + options_host + "/api/v1/images/" + imageUrl.key,
                                        'DELETE',
                                        null,
                                        {
                                            "Accept": "application/json",
                                            "Authorization": options_token
                                        },
                                        function (res) {
                                            itemdelete()
                                            toastItem({
                                                toast_content: res.message
                                            })
                                            if ($container.find('.item').length === 0) {
                                                window.location.reload();
                                            }
                                        }
                                    )
                                    break;
                                case 'SM_MS':
                                    sendAjax(
                                        options_proxy_server + "https://" + options_host + "/api/v2/delete/" + imageUrl.hash,
                                        'GET',
                                        null,
                                        {
                                            "Authorization": options_token,
                                            "Content-Type": "multipart/form-data"
                                        },
                                        function (res) {
                                            itemdelete()
                                            toastItem({
                                                toast_content: res.message
                                            })
                                            if ($container.find('.item').length === 0) {
                                                window.location.reload();
                                            }
                                        }
                                    )
                                    break;
                                case 'Hellohao':
                                    sendAjax(
                                        options_proxy_server + "https://" + options_host + "/api/deleteimg/",
                                        'POST',
                                        {
                                            "token": options_token,
                                            "delkey": imageUrl.delkey
                                        },
                                        null,
                                        function (res) {
                                            itemdelete()
                                            toastItem({
                                                toast_content: '删除成功!'
                                            })
                                            if ($container.find('.item').length === 0) {
                                                window.location.reload();
                                            }
                                        }
                                    )
                                    break;
                                case 'Tencent_COS':
                                    cos.deleteObject({
                                        Bucket: options_Bucket, /* 填入您自己的存储桶,必须字段 */
                                        Region: options_Region,  /* 存储桶所在地域,例如ap-beijing,必须字段 */
                                        Key: imageUrl.Key,  /* 存储在桶里的对象键（例如1.jpg,a/b/test.txt）,必须字段 */
                                    }, function (err, data) {
                                        if (data) {
                                            itemdelete()
                                            toastItem({
                                                toast_content: '删除成功!'
                                            })
                                            if ($container.find('.item').length === 0) {
                                                window.location.reload();
                                            }
                                        }
                                        if (err) {
                                            toastItem({
                                                toast_content: '删除失败,详情请打开F12查看!'
                                            })
                                            console.error(err);
                                        }
                                    });
                                    break;
                                case 'Aliyun_OSS':
                                    async function oss_deleteObject() {
                                        try {
                                            await oss.delete(imageUrl.name);
                                            itemdelete()
                                            toastItem({
                                                toast_content: '删除成功!'
                                            })
                                            if ($container.find('.item').length === 0) {
                                                window.location.reload();
                                            }
                                        } catch (error) {
                                            toastItem({
                                                toast_content: '删除失败,详情请打开F12查看!'
                                            })
                                            console.log(error);
                                        }
                                    }
                                    oss_deleteObject();
                                    break;
                                case 'AWS_S3':
                                    s3.deleteObject({ Bucket: options_Bucket, Key: imageUrl.Key }, function (err) {
                                        if (err) {
                                            console.log(err);
                                            toastItem({
                                                toast_content: '删除失败,详情请打开F12查看!'
                                            })
                                            return;
                                        }
                                        itemdelete()
                                        toastItem({
                                            toast_content: '删除成功!'
                                        })
                                        if ($container.find('.item').length === 0) {
                                            window.location.reload();
                                        }
                                    });
                                    break;
                                case 'GitHubUP':
                                    if (imageUrl.type == "dir") {
                                        toastItem({
                                            toast_content: imageUrl.path + '是一个文件夹无法删除'
                                        });
                                    } else if (imageUrl.type == "file") {
                                        sendAjax(
                                            options_proxy_server + `https://api.github.com/repos/` + options_owner + `/` + options_repository + `/contents/` + options_UploadPath + imageUrl.name,
                                            'DELETE',
                                            JSON.stringify({
                                                message: 'Delete file', // 提交的消息
                                                sha: item_divKey
                                            }),
                                            {
                                                'Authorization': 'Bearer ' + options_token,
                                                'Content-Type': 'application/json'
                                            },
                                            function (res) {
                                                itemdelete()
                                                toastItem({
                                                    toast_content: "删除成功"
                                                })
                                                if ($container.find('.item').length === 0) {
                                                    window.location.reload();
                                                }
                                            },
                                            function (err) {
                                                console.log(err)
                                                toastItem({
                                                    toast_content: "获取失败"
                                                })
                                            }
                                        )
                                    }

                                    break;
                            }
                            async function itemdelete() {
                                // 启用删除按钮
                                item.remove()
                                $container.masonry('reloadItems')
                                $container.masonry();

                            }
                        });
                        // 点击选中
                        item.find('.FileMedia').click(function () {
                            $(this).parent().toggleClass('gigante');
                        });
                        // 点击复制
                        item.find('.copy').click(function () {
                            let name = $('.logurl').find('li').eq(0).text();
                            let src = item.find(".FileMedia").attr("PLlink");
                            let url;
                            switch (Copy_Selected_Mode) {
                                case 'URL':
                                    url = src
                                    break;
                                case 'HTML':
                                    url = '&lt;img src="' + src + '" alt="' + name + '" title="' + name + '" /&gt;'
                                    break;
                                case 'BBCode':
                                    url = '[img]' + src + '[/img]'
                                    break;
                                case 'Markdown':
                                    url = '![' + name + '](' + src + ')'
                                    break;
                                case 'MD with link':
                                    url = '[![' + name + '](' + src + ')](' + src + ')'
                                    break;
                            }
                            let $temp = $("<input>");
                            $("body").append($temp);
                            $temp.val(url).select();
                            document.execCommand("copy");
                            $temp.remove();
                            toastItem({
                                toast_content: '链接复制成功!'
                            })

                        });
                        //鼠标移入移出删除按钮的显示与隐藏
                        item.hover(function () {
                            $(this).find('.logurl').show();
                            $(this).find('.delete').show();
                            $(this).find('.copy').show();
                            $(this).find('.Image_Width_And_Height').show();
                            $container.masonry('layout');
                        }, function () {
                            $(this).find('.logurl').hide();
                            $(this).find('.delete').hide();
                            $(this).find('.copy').hide();
                            $(this).find('.Image_Width_And_Height').hide();
                            $container.masonry('layout');
                        });
                        switch (options_exe) {
                            case 'Tencent_COS':
                            case 'Aliyun_OSS':
                            case 'AWS_S3':
                            case 'GitHubUP':
                                item.imagesLoaded().progress(function () {
                                    item.find('.Image_Width_And_Height').html("点击加载宽高;")
                                    // 获取宽高
                                    item.find('.Image_Width_And_Height').one('click', function () {
                                        item.find('.Image_Width_And_Height').html("加载中...")
                                        const img = item.find('.imgs');
                                        // 获取img元素的src属性
                                        const src = img.attr('src');
                                        let Width_And_Height = new Image();
                                        Width_And_Height.src = src
                                        Width_And_Height.onload = function () {
                                            let width = Width_And_Height.width;
                                            let height = Width_And_Height.height
                                            item.find('.Image_Width_And_Height').html("宽:" + width + ",高:" + height)
                                        }
                                    });
                                });
                                break;
                        }
                        $container.imagesLoaded().progress(function () {
                            $container.masonry({
                                itemSelector: '.item',
                                fitWidth: true,
                                // horizontalOrder: true
                            });

                        });
                    });
                    $container.masonry({});
                    $container.masonry('reloadItems')
                }
                // 清除本页记录
                $("#deleteUrl").click(function () {
                    if (!imageUrlkey.length) return;
                    let completed = 0;
                    toastItem({
                        toast_content: '执行成功,正在努力删除中...'
                    })
                    // 禁止活动
                    $('body').append('<div class="overlay"></div>');
                    $('.overlay').css({
                        'position': 'fixed',
                        'top': '0',
                        'left': '0',
                        'width': '100%',
                        'height': '100%',
                        'background-color': '#000',
                        'opacity': '0.5',
                        'z-index': '9999'
                    });
                    $('body').css('overflow', 'hidden');
                    imageUrlkey.forEach(function (element, index) {
                        switch (options_exe) {
                            case 'Lsky':
                                sendAjax(
                                    options_proxy_server + "https://" + options_host + "/api/v1/images/" + element,
                                    'DELETE',
                                    null,
                                    {
                                        "Accept": "application/json",
                                        "Authorization": options_token
                                    },
                                    function (res) {
                                        completed++;
                                        deleteUrl(completed, imageUrlkey)
                                    }
                                )
                                break;
                            case 'SM_MS':
                                sendAjax(
                                    options_proxy_server + "https://" + options_host + "/api/v2/delete/" + element,
                                    'GET',
                                    null,
                                    {
                                        "Authorization": options_token,
                                        "Content-Type": "multipart/form-data"
                                    },
                                    function (res) {
                                        completed++;
                                        deleteUrl(completed, imageUrlkey)
                                    }
                                )
                                break;
                            case 'Hellohao':
                                sendAjax(
                                    options_proxy_server + "https://" + options_host + "/api/deleteimg/",
                                    'POST',
                                    {
                                        "token": options_token,
                                        "delkey": element
                                    },
                                    null,
                                    function (res) {
                                        completed++;
                                        deleteUrl(completed, imageUrlkey)
                                    }
                                )
                                break;
                            case 'Tencent_COS':
                                cos.deleteObject({
                                    Bucket: options_Bucket, /* 填入您自己的存储桶,必须字段 */
                                    Region: options_Region,  /* 存储桶所在地域,例如ap-beijing,必须字段 */
                                    Key: imageUrlkey[index],  /* 存储在桶里的对象键（例如1.jpg,a/b/test.txt）,必须字段 */
                                }, function (err, data) {
                                    if (data) {
                                        completed++;
                                        deleteUrl(completed, imageUrlkey)
                                    }
                                    if (err) {
                                        toastItem({
                                            toast_content: '删除失败,详情请打开F12查看!'
                                        })
                                        console.error(err);
                                    }
                                });
                                break;
                            case 'Aliyun_OSS':
                                async function deleteObject() {
                                    try {
                                        await oss.delete(imageUrlkey[index]);
                                        completed++;
                                        deleteUrl(completed, imageUrlkey)
                                    } catch (error) {
                                        toastItem({
                                            toast_content: '删除失败,详情请打开F12查看!'
                                        })
                                        console.log(error);
                                    }
                                }
                                deleteObject();
                                break;
                            case 'AWS_S3':
                                s3.deleteObject({ Bucket: options_Bucket, Key: imageUrlkey[index] }, function (err, data) {
                                    if (err) {
                                        console.log(err);
                                        toastItem({
                                            toast_content: '删除失败,详情请打开F12查看!'
                                        })
                                        return;
                                    }
                                    completed++;
                                    deleteUrl(completed, imageUrlkey)
                                });
                                break;
                        }

                    });
                    switch (options_exe) {
                        case 'GitHubUP':
                            measurePingDelay(function (error, ping) {
                                if (error) {
                                    toastItem({
                                        toast_content: error
                                    });
                                    return;
                                } else {
                                    if (!GitHubUP_file.length) return;
                                    let delay
                                    if (ping > 300) { //大于
                                        delay = Math.floor(ping / 2); // 设置延迟时间，单位为毫秒
                                    } else if (ping < 150) { //小于
                                        delay = 150
                                    } else {
                                        delay = ping
                                    }
                                    function deleteFileWithDelay() {
                                        if (completed < GitHubUP_file.length) {
                                            let element = GitHubUP_file[completed];
                                            if (element.type == "dir") {
                                                toastItem({
                                                    toast_content: element.path + '是一个文件夹无法删除'
                                                });
                                                completed++; // 延迟后处理下一个文件
                                                setTimeout(deleteFileWithDelay, delay);
                                            } else if (element.type == "file") {
                                                sendAjax(
                                                    options_proxy_server + 'https://api.github.com/repos/' + options_owner + '/' + options_repository + '/contents/' + element.path,
                                                    'DELETE',
                                                    JSON.stringify({
                                                        message: 'Delete file:' + element.path,
                                                        sha: element.sha
                                                    }),
                                                    {
                                                        'Authorization': 'Bearer ' + options_token,
                                                        'Content-Type': 'application/json'
                                                    },
                                                    function (res) {
                                                        toastItem({
                                                            toast_content: '删除成功'
                                                        });
                                                        completed++; // 延迟后处理下一个文件
                                                        deleteUrl(completed, GitHubUP_file)
                                                        // 使用 setTimeout 来添加延迟
                                                        setTimeout(deleteFileWithDelay, delay);

                                                    },
                                                    function (error) {
                                                        toastItem({
                                                            toast_content: '删除失败，请查看控制台！'
                                                        });
                                                        console.log(error);
                                                        $('.overlay').remove();
                                                        $('body').css('overflow', 'auto');
                                                    }
                                                );
                                            }
                                        } else {
                                            $('.overlay').remove();
                                            $('body').css('overflow', 'auto');
                                        }
                                    }
                                    deleteFileWithDelay();
                                }
                            }, 'https://github.com');
                            break;
                    }
                    async function deleteUrl(completed, imageUrlkey) {
                        if (completed === imageUrlkey.length) {
                            // 解除禁止
                            $('.overlay').remove();
                            $('body').css('overflow', 'auto');
                            window.location.reload();
                        }
                    }
                })
                //全选
                $("#Select_All").click(function () {
                    $("#container .item").toggleClass('gigante');
                })
                //取消选择
                $("#Select_cancel").click(function () {
                    $("#container .item").removeClass("gigante")
                })
                //复制选中
                $("#Copy_Selected").click(function () {
                    let selectedImgs = $(".gigante .FileMedia");
                    let selectedsrcName = $('.gigante .logurl').find('li').eq(0).text();
                    let imgSrcs = [];

                    selectedImgs.each(function () {
                        let link = $(this).attr("PLlink")
                        let links
                        switch (Copy_Selected_Mode) {
                            case 'URL':
                                links = link
                                break;
                            case 'HTML':
                                links = '&lt;img src="' + link + '" alt="' + selectedsrcName + '" title="' + selectedsrcName + '" /&gt;'
                                break;
                            case 'BBCode':
                                links = '[img]' + link + '[/img]'
                                break;
                            case 'Markdown':
                                links = '![' + selectedsrcName + '](' + link + ')'
                                break;
                            case 'MD with link':
                                links = '[![' + selectedsrcName + '](' + link + ')](' + link + ')'
                                break;
                        }
                        imgSrcs.push(links);
                    });
                    if (imgSrcs.length) {
                        let tempInput = $("<input>");
                        $("body").append(tempInput);
                        tempInput.val(imgSrcs.join(" ")).select();
                        document.execCommand("copy");
                        tempInput.remove();
                        toastItem({
                            toast_content: "复制成功"
                        })
                    }

                })

                //删除选中
                $("#Delete_Selected").click(function () {
                    let selectedImgs = $(".gigante");
                    let imgKey = []
                    selectedImgs.each(function () {
                        if (options_exe == "GitHubUP") {
                            let json = {
                                sha: $(this).attr("key"),
                                path: options_UploadPath + $(this).find('li').eq(0).text(),
                                type: $(this).attr("type")
                            }
                            imgKey.push(json);

                        } else {
                            imgKey.push($(this).attr("key"));
                        }

                    });
                    if (imgKey.length) {
                        let numDeleted = 0;  // 记录已经删除的图片数量
                        imgKey.forEach(function (element, index) {
                            switch (options_exe) {
                                case 'Lsky':
                                    sendAjax(
                                        options_proxy_server + "https://" + options_host + "/api/v1/images/" + element,
                                        'DELETE',
                                        null,
                                        {
                                            "Accept": "application/json",
                                            "Authorization": options_token
                                        },
                                        function () {
                                            numDeleted++;
                                            Delete_Selected(selectedImgs, numDeleted, imgKey)
                                        }
                                    )
                                    break;
                                case 'SM_MS':
                                    sendAjax(
                                        options_proxy_server + "https://" + options_host + "/api/v2/delete/" + element,
                                        'GET',
                                        null,
                                        {
                                            "Authorization": options_token,
                                            "Content-Type": "multipart/form-data"
                                        },
                                        function (res) {
                                            numDeleted++;
                                            Delete_Selected(selectedImgs, numDeleted, imgKey)
                                        }
                                    )
                                    break;
                                case 'Hellohao':
                                    sendAjax(
                                        options_proxy_server + "https://" + options_host + "/api/deleteimg/",
                                        'POST',
                                        {
                                            "token": options_token,
                                            "delkey": element
                                        },
                                        null,
                                        function (res) {
                                            numDeleted++;
                                            Delete_Selected(selectedImgs, numDeleted, imgKey)
                                        }
                                    )
                                    break;
                                case 'Tencent_COS':
                                    cos.deleteObject({
                                        Bucket: options_Bucket, /* 填入您自己的存储桶,必须字段 */
                                        Region: options_Region,  /* 存储桶所在地域,例如ap-beijing,必须字段 */
                                        Key: element,  /* 存储在桶里的对象键（例如1.jpg,a/b/test.txt）,必须字段 */
                                    }, function (err, data) {
                                        if (data) {
                                            numDeleted++;
                                            Delete_Selected(selectedImgs, numDeleted, imgKey)
                                        }
                                        if (err) {
                                            toastItem({
                                                toast_content: '删除失败,详情请打开F12查看!'
                                            })
                                            console.error(err);
                                        }
                                    });
                                    break;
                                case 'Aliyun_OSS':
                                    async function OSS_deleteObject() {
                                        try {
                                            await oss.delete(element);
                                            numDeleted++;
                                            Delete_Selected(selectedImgs, numDeleted, imgKey)
                                        } catch (error) {
                                            toastItem({
                                                toast_content: '删除失败,详情请打开F12查看!'
                                            })
                                            console.log(error);
                                        }
                                    }
                                    OSS_deleteObject()
                                    break;
                                case 'AWS_S3':
                                    s3.deleteObject({ Bucket: options_Bucket, Key: element }, function (err, data) {
                                        if (err) {
                                            console.log(err);
                                            toastItem({
                                                toast_content: '删除失败,详情请打开F12查看!'
                                            })
                                            return;
                                        }
                                        numDeleted++;
                                        Delete_Selected(selectedImgs, numDeleted, imgKey)
                                    })
                                    break;
                            }

                        });
                        switch (options_exe) {
                            case 'GitHubUP':
                                measurePingDelay(function (error, ping) {
                                    if (error) {
                                        toastItem({
                                            toast_content: error
                                        });
                                        return;
                                    } else {
                                        if (!imgKey.length) return;
                                        let delay
                                        if (ping > 300) { //大于
                                            delay = Math.floor(ping / 2); // 设置延迟时间，单位为毫秒
                                        } else if (ping < 150) { //小于
                                            delay = 150
                                        } else {
                                            delay = ping
                                        }
                                        function deleteFileWithDelay() {
                                            if (numDeleted < imgKey.length) {
                                                let element = imgKey[numDeleted];
                                                if (element.type == "dir") {
                                                    toastItem({
                                                        toast_content: element.path + '是一个文件夹无法删除'
                                                    });
                                                    numDeleted++; // 延迟后处理下一个文件
                                                    setTimeout(deleteFileWithDelay, delay);
                                                } else if (element.type == "file") {
                                                    sendAjax(
                                                        options_proxy_server + 'https://api.github.com/repos/' + options_owner + '/' + options_repository + '/contents/' + element.path,
                                                        'DELETE',
                                                        JSON.stringify({
                                                            message: 'Delete file:' + element.path,
                                                            sha: element.sha
                                                        }),
                                                        {
                                                            'Authorization': 'Bearer ' + options_token,
                                                            'Content-Type': 'application/json'
                                                        },
                                                        function (res) {
                                                            numDeleted++; // 延迟后处理下一个文件
                                                            Delete_Selected(selectedImgs, numDeleted, imgKey)
                                                            // 使用 setTimeout 来添加延迟
                                                            setTimeout(deleteFileWithDelay, delay);
                                                        },
                                                        function (error) {
                                                            toastItem({
                                                                toast_content: '删除失败，请查看控制台！'
                                                            });
                                                            console.log(error);
                                                        }
                                                    );
                                                }

                                            }
                                        }
                                        deleteFileWithDelay();
                                    }
                                }, 'https://github.com');

                                break;
                        }
                    }
                })
                async function Delete_Selected(selectedImgs, numDeleted, imgKey) {
                    selectedImgs.remove()
                    $container.masonry('reloadItems')
                    $container.masonry();
                    toastItem({
                        toast_content: "删除成功"
                    })
                    if (numDeleted === imgKey.length && $("#container .item").length < 1) {
                        toastItem({
                            toast_content: "页面无数据,即将刷新"
                        })
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    }
                }
            }

            function set_PLFileType(item, imageUrl, item_imgUrl, item_liImgSize) {
                item.append(`
                    <img class="FileMedia imgs" src="" PLlink=` + item_imgUrl + `>
                    `)
                if (imageUrl.PLFileType == "image") {
                    item.find(".imgs").attr("src", item_imgUrl)

                } else if (imageUrl.PLFileType == "ae") {
                    item.find(".imgs").attr("src", "./icons/fileicon/ae.png")
                } else if (imageUrl.PLFileType == "ai") {
                    item.find(".imgs").attr("src", "./icons/fileicon/ap.png")
                } else if (imageUrl.PLFileType == "ps") {
                    item.find(".imgs").attr("src", "./icons/fileicon/ps.png")
                } else if (imageUrl.PLFileType == "compressedfile") {
                    item.find(".imgs").attr("src", "./icons/fileicon/compressedfile.png")
                } else if (imageUrl.PLFileType == "dll") {
                    item.find(".imgs").attr("src", "./icons/fileicon/dll.png")
                } else if (imageUrl.PLFileType == "Excel") {
                    item.find(".imgs").attr("src", "./icons/fileicon/excel.png")
                } else if (imageUrl.PLFileType == "exe") {
                    item.find(".imgs").attr("src", "./icons/fileicon/exe.png")
                } else if (imageUrl.PLFileType == "music") {
                    item.find(".imgs").attr("src", "./icons/fileicon/music.png")
                } else if (imageUrl.PLFileType == "PowerPoint") {
                    item.find(".imgs").attr("src", "./icons/fileicon/ppt.png")
                } else if (imageUrl.PLFileType == "pr") {
                    item.find(".imgs").attr("src", "./icons/fileicon/pr.png")
                } else if (imageUrl.PLFileType == "sys") {
                    item.find(".imgs").attr("src", "./icons/fileicon/sys.png")
                } else if (imageUrl.PLFileType == "Word") {
                    item.find(".imgs").attr("src", "./icons/fileicon/WORD.png")
                } else {
                    item.find(".imgs").attr("src", "./icons/fileicon/file.png")
                }
                if (imageUrl.PLFileType != "image") {
                    item.find(".imgs").css("width", "250px")
                    item.find(".imgs").css("height", "250px")
                }
                if (imageUrl.PLFileType == "video" || imageUrl.PLFileType == "music") {
                    item.find(".imgs").remove()
                    item.find(".Image_Width_And_Height").remove()
                    item.append(`
                    <video controls class="video FileMedia" src="`+ item_imgUrl + `" PLlink=` + item_imgUrl + `></video>
                    `)
                    item.find(".logurl").css("position", "relative")
                }
                if (imageUrl.PLFileType == "editable") {
                    item.find(".imgs").remove()
                    item.find(".Image_Width_And_Height").remove()
                    item.find(".logurl").css("position", "relative")
                    item.append(`
                    <textarea id="textarea" class="FileMedia" rows="10" PLlink=` + item_imgUrl + `></textarea>
                    `)

                    const match = item_liImgSize.match(/\d+(\.\d+)?/);
                    let liImgSize = match ? parseFloat(match[0]) : null;
                    let xhr_512_state
                    if (item_liImgSize.includes("MB")) {
                        liImgSize *= 1024;
                    }
                    if (liImgSize >= 512) {
                        switch (Browse_mode_switching_status) {
                            case 0:
                                item.find("#textarea").val("本地状态不能获取在线文本")
                                break;
                            case 1:
                                item.find("#textarea").val("文件大于512KB,不给予展示")
                                xhr_512_state = false
                                break;
                        }
                    } else {
                        get_item_imgUrl_text()
                    }
                    if (xhr_512_state == false) {
                        item.find(".logurl").one('click', function () {
                            get_item_imgUrl_text()
                        })
                    }
                    function get_item_imgUrl_text() {
                        item.find("#textarea").val("文件加载中:0%")
                        let xhr = new XMLHttpRequest();
                        xhr.open('GET', item_imgUrl, true);
                        xhr.responseType = 'text';
                        xhr.onprogress = function (event) {
                            if (event.lengthComputable) {
                                var percentComplete = Math.floor((event.loaded / event.total) * 100);
                                item.find("#textarea").val('文件加载中:' + percentComplete + '%');
                            } else {
                                item.find("#textarea").val('已加载:' + (event.loaded / 1024).toFixed(2) + "KB");
                            }
                        };
                        xhr.onload = function () {
                            if (xhr.status === 200) {
                                let responseText = xhr.response;
                                item.find("#textarea").val(responseText)
                            } else {
                                item.find("#textarea").val("文件获取失败!")
                            }
                        };

                        xhr.send();
                    }
                }
            }
        }

        GetPicture_Library()

        $(".dropdown-item").click(function () {
            const value = $(this).attr("value");
            toastItem({ toast_content: "复制模式为:" + value })
            chrome.storage.local.set({ 'Copy_Selected_Mode': value })
            Copy_Selected_Mode = value
        });
        $("#dropdown-button").click(function () {
            $(".dropdown-menu li a").removeClass("active")
            let targetElement = $('a[value="' + Copy_Selected_Mode + '"]');
            targetElement.addClass("active")
        });

        $("#DeleteALL").click(function () {
            localStorage.UploadLog = "[]"
            chrome.storage.local.set({ 'UploadLog': [] }, function () {
                window.location.reload();
            })
        })

        $("#Browse_mode_switch_button").click(function () {
            window.location.reload();
            if ($(this).hasClass("btn-dark")) {
                // 开启
                $("#Browse_mode_switch_button").attr('data-bs-content', '现在加载的是图床服务器的图片噢!点一下就换成加载本地图片啦!')
                $("#Browse_mode_switch_button").html("切换到本地")
                chrome.storage.local.set({ 'Browse_mode_switching_status': 1 })
                $(this).removeClass("btn-dark");
                $(this).addClass('btn-danger');
            } else {
                $("#Browse_mode_switch_button").attr('data-bs-content', '现在加载的是本地图片噢!点一下就可以加载图床服务器上的图片了')
                $("#Browse_mode_switch_button").html("切换到图床")
                chrome.storage.local.set({ 'Browse_mode_switching_status': 0 })
                $(this).removeClass("btn-danger")
                $(this).addClass('btn-dark');
            }
        })
    })

});