$(document).ready(function () {
  Dropzone.autoDiscover = false;
  chrome.storage.local.get(storagelocal, function (result) {
    // 初始化读取数据
    options_exe = result.options_exe
    options_proxy_server_state = result.options_proxy_server_state
    options_proxy_server = result.options_proxy_server
    options_host = result.options_host
    options_token = result.options_token
    options_uid = result.options_uid
    options_source = result.options_source
    options_imgur_post_mode = result.options_imgur_post_mode
    options_source_select = result.options_source_select
    options_expiration_select = result.options_expiration_select || "NODEL"
    options_album_id = result.options_album_id
    options_nsfw_select = result.options_nsfw_select || 0
    options_permission_select = result.options_permission_select || 0
    //自定义请求
    options_apihost = result.options_apihost
    options_parameter = result.options_parameter
    options_Headers = result.options_Headers
    options_Body = result.options_Body
    options_return_success = result.options_return_success
    open_json_button = result.open_json_button
    Copy_Selected_Mode = result.Copy_Selected_Mode

    //GitHub
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

    // 初始化JSON转换的模式
    if (!open_json_button) {
      chrome.storage.local.set({ 'open_json_button': 0 })
      open_json_button = 0
    }

    if (options_exe == "UserDiy") {
      if (!options_Headers) {
        options_Headers = {}
      } else {
        try {
          options_Headers = JSON.parse(options_Headers);
        } catch (error) {
          alert(chrome.i18n.getMessage("Headers_error"));
          window.location.href = "options.html"
          return;
        }
      }
      if (!options_Body) {
        options_Body = {}
      } else {
        try {
          options_Body = JSON.parse(options_Body);
        } catch (error) {
          alert(chrome.i18n.getMessage("Body_error"));
          window.location.href = "options.html"
          return;
        }
      }
    }

    // 修复出现undefined的情况
    if (!options_proxy_server) {
      options_proxy_server = ""
    }
    // 如果source 等于空
    if (!options_source) {
      options_source = ""
    }
    // 判断跨域开关
    if (options_proxy_server_state == 0) {
      options_proxy_server = ""
    }
    // 判断复制模式
    if (!Copy_Selected_Mode) {
      chrome.storage.local.set({ 'Copy_Selected_Mode': "URL" })
      Copy_Selected_Mode = "URL"
    }
    // 初始化链接按钮
    $(".urlButton").removeClass("Check")
    if ($('div[value="' + Copy_Selected_Mode + '"]').length) {
      $('div[value="' + Copy_Selected_Mode + '"]').addClass("Check")
    } else {
      $('div[value="URL"]').addClass("Check")
      chrome.storage.local.set({ 'Copy_Selected_Mode': "URL" })
      Copy_Selected_Mode = "URL"
    }


    // 定义数组
    let SvgData = `<img class="icon" src="/icons/logo.ico">`
    let UserBox = `
    <div class="userBox"  style="display: none;">
    <i class="bi bi-person"></i>`+ chrome.i18n.getMessage("user") + `:(<span class="userName" style="color: #03a9f4;">游客</span>),
    <i class="bi bi-bar-chart-line-fill"></i>`+ chrome.i18n.getMessage("Total_capacity") + `:(<span class="userCapacity" style="color: #03a9f4;">0Gb</span>),
    <i class="bi bi-bar-chart-line"></i>`+ chrome.i18n.getMessage("Used") + `:(<span class="userSize" style="color: #03a9f4;">0Gb</span>),
    <i class="bi bi-image"></i>`+ chrome.i18n.getMessage("Number_images") + `:(<span class="userImage_num" style="color: #03a9f4;">0</span>)
    </div>`
    let links
    let LinksUrl = []
    let LinksHtml = []
    let LinksBBCode = []
    let LinksMarkdown = []
    let LinksMDwithlink = []
    let imageUrl
    let filePreviewElements = [];
    let fileDeletePreview = [];
    // 实现上传功能
    if ($('.dropzone').length) {
      uploader = new Dropzone(".dropzone", {
        method: 'post',
        acceptedFiles: 'image/*',
        paramName: "",
        addRemoveLinks: true,
        forceFallback: false,
        maxThumbnailFilesize: 50,//缩略图MB
        previewTemplate: `
      <div class="dz-preview dz-file-preview shadow p-3 bg-body-tertiary rounded">
        <div class="dz-image">
          <img data-dz-thumbnail />
        </div>
        <div class="dz-details">
          <div class="dz-filename"><span data-dz-name></span></div>
          <div class="dz-size" data-dz-size></div>
        </div>
        <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
        <div class="dz-error-message"><span data-dz-errormessage></span></div>
        <div class="dz-success-mark" style="color:white;border-radius:10px"><i class="bi bi-check-circle"></i></div>
        <div class="dz-error-mark"  style="color:white;border-radius:10px"><i class="bi bi-x-circle"></i></div>
      </div>
    `,
        // autoProcessQueue: false, //自动上传
        parallelUploads: 1, // 每次上传1个
        dictDefaultMessage: SvgData + `<p>` + chrome.i18n.getMessage("Upload_box_prompt") + `</p>` + UserBox,
        dictFallbackMessage: chrome.i18n.getMessage("dictFallbackMessage"),
        dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
        dictFileTooBig: "你传的玩意有 {{filesize}}MiB这么大.但是我就允许你传: {{maxFilesize}}MiB.",
        dictInvalidFileType: chrome.i18n.getMessage("dictInvalidFileType"),
        dictResponseError: "{{statusCode}}",
        dictCancelUpload: `<button type="button" class="btn btn-outline-danger" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem; width: 100%;">X</button>`,
        dictCancelUploadConfirmation: chrome.i18n.getMessage("dictCancelUploadConfirmation"),
        dictRemoveFile: `<button type="button" class="btn btn-outline-danger" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem; width: 100%;">X</button>`,
        dictMaxFilesExceeded: chrome.i18n.getMessage("dictMaxFilesExceeded"),
      });
    }
    //剪切板上传
    document.addEventListener("paste", function (e) {
      const Copy_Url = e.clipboardData.getData("text")
      toastItem({
        toast_content: '检测到粘贴动作'
      })
      // 判断是否为 HTTP URL
      const urlRegExp = /^(http|https):\/\/[^\s]+$/;
      if (urlRegExp.test(Copy_Url)) {
        async function clipboard_Request_Success(blob) {
          if (Simulated_upload == true) {
            toastItem({
              toast_content: '恭喜你学会了粘贴上传'
            })
            Simulated_upload = false; //模拟上传
            Black_curtain = false //显示灰块
            //自动演示
            $(".Functional_animation").remove()
            let confirm_input = confirm("真棒👍!你已经学会“粘贴上传”啦,那我们进行下一步“拖拽上传”吧!")
            if (confirm_input == true) {
              chrome.runtime.sendMessage({ Demonstration_middleware: "Paste_Upload_100" });
            } else {
              showIntro()
            }

            return;
          }
          if (blob.type.indexOf("image") != -1) {//如果是图片文件时
            const Copy_Img = new File([blob], `pasted_image_` + new Date().getTime() + `.png`, { type: 'image/png' });
            toastItem({
              toast_content: '资源获取成功'
            })
            uploader.addFile(Copy_Img);
          } else {
            toastItem({
              toast_content: '无效资源'
            })
          }
        }
        fetch(options_proxy_server + Copy_Url)
          .then(res => {
            toastItem({
              toast_content: '网络资源正在努力获取中...'
            })
            return res.blob()
          })
          .then(blob => {
            clipboard_Request_Success(blob)
          })
          .catch((error) => {
            fetch("https://cors-anywhere.pnglog.com/" + Copy_Url)
              .then(res => {
                toastItem({
                  toast_content: '第二遍网络资源获取中...'
                })
                return res.blob()
              })
              .then(blob => {
                toastItem({
                  toast_content: '第二遍资源获取成功,添加到上传框...'
                })
                clipboard_Request_Success(blob)
              })
              .catch((error) => {
                toastItem({
                  toast_content: '很抱歉还是获取失败了,请打开DevTools查看错误信息进行错误排除!'
                })
                console.error(error);
              });
          });

        return;
      } else {
        const Copy_File_Items = e.clipboardData.items;
        for (let i = 0; i < Copy_File_Items.length; i++) {
          const Copy_File_Item = Copy_File_Items[i];
          if (Copy_File_Item.kind == "file") {//判断是不是文件
            if (Copy_File_Item.type.indexOf("image") != -1) {//判断文件类型
              const file = Copy_File_Item.getAsFile();
              const Copy_Img = new File([file], `pasted_image_` + new Date().getTime() + `.png`, { type: 'image/png' });
              uploader.addFile(file);
            }
          } else {
            toastItem({
              toast_content: '无效资源'
            })
          }
        }
      }


    });

    function textFrame() {
      const textFrame = `
      <div class="Upload_Return_Box">
        <div class="col">
          <p class="p_urls">`+chrome.i18n.getMessage("Upload_return_information")+`</p>
        </div>
        <div class="text-center selector_p_urls">
          <span>`+chrome.i18n.getMessage("Selected")+`</span>
        </div>
        <div class="text-center copy">
          <span>`+chrome.i18n.getMessage("Copy")+`</span>
        </div>
      </div>
    `
      if (filePreviewElements.length == 0) {
        $('.LinksBox').slideUp(500, function () {
          $('.LinksBox').hide()
        });
        $('#textFrame').append(textFrame);

      }
    }
    uploader.on("complete", function (file) {
      fileDeletePreview.push(file);
      filePreviewElements.push(file.previewElement);

      // 实现点击预览框,.p_urls加类
      $(file.previewElement).click(function () {
        $(".dz-preview").removeClass("IMGpreview");
        $(".dz-preview").addClass("shadow");
        let index = filePreviewElements.indexOf(file.previewElement);
        let pTag = $(".p_urls").eq(index);
        $(".p_urls").removeClass("IMGpreview");
        $(pTag).toggleClass("IMGpreview");
      });


      links = {
        "popup_URL": LinksUrl,
        "popup_HTML": LinksHtml,
        "popup_BBCode": LinksBBCode,
        "popup_Markdown": LinksMarkdown,
        "popup_MDwithlink": LinksMDwithlink
      };

      for (let key in links) {
        $(`#${key}`).click(() => {
          $('.textFrame').empty();
          textFrame()
          // 实现点击按钮添加元素
          links[key].forEach(link => {
            $('.textFrame').append(`
            <div class="Upload_Return_Box">
              <div class="col">
                <p class="p_urls">${link}</p>
              </div>
              <div class="text-center selector_p_urls">
                <span>`+chrome.i18n.getMessage("Selected")+`</span>
              </div>
              <div class="text-center copy">
                <span>`+chrome.i18n.getMessage("Copy")+`</span>
              </div>
            </div>

              `);
          });
          $(".Upload_Return_Box .col").click(function () {
            $(".p_urls").removeClass("IMGpreview");
            $(".dz-preview").addClass("shadow");
            // 全选
            let range = document.createRange();
            range.selectNodeContents(this);
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            // 实现点击p标签,预览框添加类

            let index = $(this).parent().index();
            let previewElement = filePreviewElements[index];
            $(".dz-preview").removeClass("IMGpreview");
            $(previewElement).removeClass("shadow");
            $(previewElement).toggleClass("IMGpreview");
          });
          // 实现点击复制
          $(".copy").click(function () {
            let $temp = $("<input>");
            $("body").append($temp);
            let text = $(this).parent().find('.p_urls').text();
            $temp.val(text).select();
            document.execCommand("copy");
            $temp.remove();
            toastItem({
              toast_content: '复制成功!'
            })
          });
          $(".selector_p_urls").click(function () {
            $(this).parent().find(".p_urls").toggleClass("IMGpreview")
            $(this).toggleClass('selector_p_urls_Click');
            let index = $(this).parent().index();
            let previewElement = filePreviewElements[index];
            $(previewElement).removeClass("shadow");
            $(previewElement).toggleClass("IMGpreview");
            if (!$(previewElement).hasClass("IMGpreview") && !$(previewElement).hasClass("shadow")) {
              $(previewElement).addClass("shadow");
            }
          })

        });

      }

      // 默认点击
      $('div[value="' + Copy_Selected_Mode + '"]').click();

    })

    uploader.on("removedfile", function (removefile) {

      const index = filePreviewElements.indexOf(removefile.previewElement);
      const pTag = $(".p_urls").eq(index);
      $(pTag).parent().parent().remove()
      filePreviewElements.splice(index, 1);
      fileDeletePreview.splice(index, 1);
      for (let key in links) {
        links[key].splice(index, 1);
      }
      textFrame()
      toastItem({
        toast_content: '删除成功'
      })
    });//文件删除

    uploader.on("success", async function (file, res) {
      console.log(res)
      if ($('.LinksBox').is(':hidden')) {
        $('.LinksBox').hide().slideDown('slow'); //动画
      }
      let date = new Date();
      let getMonth = date.getMonth() + 1
      let filename = options_UploadPath + date.getFullYear() + "/" + getMonth + "/" + date.getDate() + "/" + file.name;
      switch (options_exe) {
        case 'Lsky':
          toastItem({
            toast_content: res.message
          })
          imageUrl = res.data.links.url
          break;
        case 'EasyImages':
          toastItem({
            toast_content: res.message
          })
          imageUrl = res.url
          break;
        case 'ImgURL':
          toastItem({
            toast_content: res.msg
          })
          imageUrl = res.data.url
          break;
        case 'SM_MS':
          toastItem({
            toast_content: res.message
          })
          imageUrl = res.data.url
          break;
        case 'Chevereto':
          imageUrl = res.image.url
          break;
        case 'Hellohao':
          toastItem({
            toast_content: res.info
          })
          imageUrl = res.data.url

          break;
        case 'Imgur':
          imageUrl = res.data.link
          break;
        case 'UserDiy':
          toastItem({
            toast_content: "服务器成功响应"
          })
          //奖字符串转为JSON
          if (open_json_button == 1) {
            if (typeof res !== 'object') {
              try {
                var res = JSON.parse(res)
              } catch (error) {
                alert('返回的数据无法转换为JSON');
                return;
              }
            }
          }
          let options_return_success_value = res;
          for (let property of options_return_success.split('.')) {
            options_return_success_value = options_return_success_value[property];
          }
          imageUrl = options_return_success_value
          options_host = options_apihost
          break;
        case 'Tencent_COS':
          imageUrl = options_Custom_domain_name + filename
          toastItem({
            toast_content: '上传完成'
          })
          options_host = options_Bucket
          break;
        case 'Aliyun_OSS':
          imageUrl = options_Custom_domain_name + filename
          toastItem({
            toast_content: chrome.i18n.getMessage("Upload_prompt7")
          })
          options_host = options_Endpoint
          break;
        case 'AWS_S3':
          imageUrl = options_Custom_domain_name + filename
          toastItem({
            toast_content: chrome.i18n.getMessage("Upload_prompt7")
          })
          options_host = options_Endpoint
          break;
        case 'GitHubUP':
          imageUrl = `https://raw.githubusercontent.com/` + options_owner + `/` + options_repository + `/main/` + options_UploadPath + file.name
          toastItem({
            toast_content: chrome.i18n.getMessage("Upload_prompt7")
          })
          options_host = "GitHub.com"
          break;
        case 'Telegra_ph':
          if (options_Custom_domain_name) {
            imageUrl = options_Custom_domain_name + res[0].src;
            options_host = options_Custom_domain_name
          } else {
            imageUrl = `https://telegra.ph` + res[0].src;
          }
          break;
        case 'imgdd':
          imageUrl = res.url
          break;
      }
      if (!imageUrl) {
        imageUrl = chrome.i18n.getMessage("Upload_prompt4")
      }
      LinksUrl.push(imageUrl)
      LinksHtml.push('&lt;img src="' + imageUrl + '" alt="' + file.name + '" title="' + file.name + '" /&gt;')
      LinksBBCode.push('[img]' + imageUrl + '[/img]')
      LinksMarkdown.push('![' + file.name + '](' + imageUrl + ')')
      LinksMDwithlink.push('[![' + file.name + '](' + imageUrl + ')](' + imageUrl + ')')

      chrome.runtime.sendMessage({ Middleware_AutoInsert_message: imageUrl });
      await LocalStorage(null, imageUrl, file)
    })
    uploader.on("error", function (file, err) {
      console.log(err)
      LinksUrl.push('file：' + file.upload.filename + "-error")
      LinksHtml.push('file：' + file.upload.filename + "-error")
      LinksBBCode.push('file：' + file.upload.filename + "-error")
      LinksMarkdown.push('file：' + file.upload.filename + "-error")
      LinksMDwithlink.push('file：' + file.upload.filename + "-error")
      switch (options_exe) {
        case 'Lsky':
          toastItem({
            toast_content: err.message
          })
          break;
        case 'EasyImages':
          break;
        case 'ImgURL':

          break;
        case 'SM_MS':

          break;
        case 'Chevereto':

          toastItem({
            toast_content: err.error.message
          })
          break;
        case 'Hellohao':

          break;
        case 'Imgur':

          break;
        case 'UserDiy':

          break;
        case 'GitHubUP':
          toastItem({
            toast_content: err.responseJSON.message
          })
          break;
      }
    })
    popup_Uploader()
    // function LocalStorage(file, url) {
    //   chrome.storage.local.get("UploadLog", function (result) {
    //     UploadLog = result.UploadLog || [];
    //     if (!Array.isArray(UploadLog)) {
    //       UploadLog = [];
    //     }
    //     function generateRandomKey() {
    //       return new Promise(resolve => {
    //         const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    //         let key = '';
    //         for (let i = 0; i < 6; i++) {
    //           key += characters.charAt(Math.floor(Math.random() * characters.length));
    //         }
    //         // 确保不会重复
    //         while (UploadLog.some(log => log.id === key)) {
    //           key = '';
    //           for (let i = 0; i < 6; i++) {
    //             key += characters.charAt(Math.floor(Math.random() * characters.length));
    //           }
    //         }
    //         resolve(key);
    //       });
    //     }
    //     let d = new Date();
    //     generateRandomKey().then(key => {
    //       let UploadLogData = {
    //         key: key,
    //         url: url,
    //         uploadExe: options_exe,
    //         upload_domain_name: options_host,
    //         original_file_name: file.name,
    //         file_size: file.size,
    //         img_file_size: "宽:不支持,高:不支持",
    //         uploadTime: d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + d.getMinutes() + "分" + d.getSeconds() + "秒"
    //       }
    //       if (typeof UploadLog !== 'object') {
    //         UploadLog = JSON.parse(UploadLog);
    //       }
    //       UploadLog.push(UploadLogData);
    //       chrome.storage.local.set({ 'UploadLog': UploadLog }, function (e) {
    //       })
    //     })
    //   })
    // }
    // 实现链接按钮下划线
    $(".urlButton").click(function () {
      const value = $(this).attr("value");
      $(this).addClass('Check');
      $('.urlButton').not(this).removeClass('Check');
      chrome.storage.local.set({ 'Copy_Selected_Mode': value })
      Copy_Selected_Mode = value
    })

    //全选
    $("#popup-Select-All").click(function () {
      if ($(".p_urls").length) {
        $(".p_urls").toggleClass('IMGpreview');
        if ($(".dropzone .dz-preview ").hasClass("shadow")) {
          $(".dropzone .dz-preview ").removeClass("shadow")
          $(".dropzone .dz-preview ").addClass("IMGpreview")
        } else {
          $(".dropzone .dz-preview ").removeClass("IMGpreview")
          $(".dropzone .dz-preview ").addClass("shadow")
        }
      }
    })

    //取消
    $("#popup-Select-cancel").click(function () {
      if ($(".p_urls").length) {
        $(".p_urls").removeClass("IMGpreview");
        $(".dropzone .dz-preview ").removeClass("IMGpreview");
        $(".dropzone .dz-preview ").addClass("shadow")
      }
    })

    //复制选中
    $("#popup-Copy-Selected").click(function () {
      let selected_p_urls = $(".Upload_Return_Box .IMGpreview");
      let selected_text = [];
      if (selected_p_urls.length) {
        selected_p_urls.each(function () {
          selected_text.push($(this).text())
        })
        let tempInput = $(`<textarea>`);
        $("body").append(tempInput);
        tempInput.val(selected_text.join("\n")).select();
        document.execCommand("copy");
        tempInput.remove();
        toastItem({
          toast_content: "复制成功"
        })
      }
    })


    if (!options_host) {
      if (options_exe != "UserDiy" && options_exe != "Tencent_COS" && options_exe != "Aliyun_OSS" && options_exe != "AWS_S3" && options_exe != "GitHubUP" && options_exe != "imgdd") {
        alert('网站域名为空,请初始化配置再上传!');
        window.location.href = "options.html";
        return;
      }
    }

    let tokenRequired = ['Lsky', 'EasyImages', 'ImgURL', 'SM_MS', 'Chevereto', 'Hellohao', 'Imgur'];
    if (tokenRequired.includes(options_exe)) {
      if (!options_token) {
        alert(`${options_exe}图床程序必须填写Token`);
        window.location.href = "options.html";
        return;
      }
      if (options_exe === "ImgURL" && !options_uid) {
        alert('ImgURL图床程序必须填写UID');
        window.location.href = "options.html";
        return;
      }
      if (options_exe == "Hellohao" && !options_source) {
        alert('Hellohao图床程序必须填写存储源');
        window.location.href = "options.html";
        return;
      }

    }
    switch (options_exe) {
      case 'UserDiy':
        if (!options_apihost) {
          alert('API地址为空,请初始化配置再上传!');
          window.location.href = "options.html";
          return;
        }
        break;
      case 'Tencent_COS':
        if (!options_SecretId) {
          alert(`腾讯云COS必须填写SecretId`)
          window.location.href = "options.html";
          return;
        }
        if (!options_SecretKey) {
          alert(`腾讯云COS必须填写SecretKey`)
          window.location.href = "options.html";
          return;
        }
        if (!options_Region) {
          alert(`腾讯云COS必须填写Region`)
          window.location.href = "options.html";
          return;
        }
        if (!options_Bucket) {
          alert(`腾讯云COS必须填写Bucket`)
          window.location.href = "options.html";
          return;
        }
        break;
      case 'Aliyun_OSS':
        if (!options_SecretId) {
          alert(`阿里云OSS必须填写AccessKeyId`)
          window.location.href = "options.html";
          return;
        }
        if (!options_SecretKey) {
          alert(`阿里云OSS必须填写AccessKeySecret`)
          window.location.href = "options.html";
          return;
        }
        if (!options_Bucket) {
          alert(`阿里云OSS必须填写Bucket`)
          window.location.href = "options.html";
          return;
        }
        if (!options_Endpoint) {
          alert(`阿里云OSS必须填写Endpoint`)
          window.location.href = "options.html";
          return;
        }
        if (!options_Region) {
          alert(`阿里云OSS必须填写Region`)
          window.location.href = "options.html";
          return;
        }
        break;
      case 'AWS_S3':
        if (!options_SecretId) {
          alert(`AWS S3必须填写options_SecretId`)
          window.location.href = "options.html";
          return;
        }
        if (!options_SecretKey) {
          alert(`AWS S3必须填写options_SecretKey`)
          window.location.href = "options.html";
          return;
        }
        if (!options_Region) {
          alert(`AWS S3必须填写options_Region`)
          window.location.href = "options.html";
          return;
        }
        if (!options_Bucket) {
          alert(`AWS S3必须填写options_Bucket`)
          window.location.href = "options.html";
          return;
        }
        break;
    }


    // 写入标题
    let options_webtitle = localStorage.options_webtitle
    $(".title-a").text(options_webtitle)
    $(".exeinfo_p").text(options_exe + "图床程序")

  }) // chrome.storage.local.get
  animation_button('.Animation_button')// 设置按钮动画
  $('.container-md').hide().fadeIn('slow'); //全局动画

  let Simulated_upload = false//模拟上传

  function showIntro() {
    if ($("#overlay").length == 0) {
      $("body").append(`
    <div id="overlay">
      <div id="introBox">
        <h2 style="padding: 0;margin: 0;">欢迎！功能演示</h2>
        <p>我将从第一节"粘贴上传"引导您，盘络上传的使用方法,您也可以选择其他演示</p>
        </p>
        <p style="margin: 10px;">
          <button id="Animation_auto_Btn">开启演示</button>
          <button id="Animation_close_Btn">关闭演示</button>
        </p>
        <div class="Demo-container">
          <!-- 第一个卡片 -->
          <div class="card">
            <div class="icon"></div>
            <h2>01</h2>
            <div class="content">
              <h3>粘贴上传</h3>
              <p>"粘贴上传"便捷的文件上传功能，支持直接粘贴图片数据、图片链接或本地文件到上传框，实现快速上传。省去了繁琐的选择步骤，只需简单复制并粘贴，即可将文件上传。
              </p>
              <a href="#" id="Animation_Paste_Upload_Btn">开始演示</a>
            </div>
          </div>
          <!-- 第二个卡片 -->
          <div class="card">
            <h2>02</h2>
            <div class="content">
              <h3>拖拽上传</h3>
              <p>"拖拽上传"是便捷的文件上传方式。只需将文件从本地拖动到指定区域即可完成上传，还可以快速拖拽多个文件或频繁上传文件，提高工作效率，为用户带来便利和舒适的上传体验。</p>
              <a href="#" id="Animation_Drag_upload_Btn">开始演示</a>
            </div>
          </div>
          <!-- 第三个卡片 -->
          <div class="card">
            <h2>03</h2>
            <div class="content">
              <h3>右键上传</h3>
              <p>"右键上传"是浏览器右键菜单中的便捷文件上传方式。用户只需在网页上对着图片右键点击，选择上传选项，即可完成文件上传。用户可以在浏览网页的同时，快速上传图片。</p>
              <a href="#" id="Functional_Right_click_menu_Btn">开始演示</a>
            </div>
          </div>
        </div>
  
        <p>开启“粘贴上传”后会自动复制👇消息</p>
        <p>https://cdn-us.imgs.moe/2023/05/31/64770cc077bfc.png</p>
      </div>
    </div>
      `)

      // 绑定按钮的点击事件
      $("#Animation_auto_Btn").click(Animation_auto);

      $("#Animation_close_Btn").click(closeIntro);

      $("#Animation_Paste_Upload_Btn").click(() => { //粘贴上传
        removeIntro()
        if ($(".Functional_animation").length == 0) {
          $("body").append(`
          <div class="Functional_animation">
            <h1>按下CTRL+V</h1>
            <div class="animation_finger"></div>
          </div>
          `)
        }
        setTimeout(function () {
          $(".Functional_animation").addClass("active")
        }, 1000);
        Simulated_upload = true;  //模拟上传开启
        /**
         * 剪切板数据
         */
        let $temp = $("<input>");
        $("body").append($temp);
        $temp.val("https://cdn-us.imgs.moe/2023/05/31/64770cc077bfc.png").select();
        document.execCommand("copy");
        $temp.remove();
      });
      $("#Animation_Drag_upload_Btn").click(() => {//拖拽
        chrome.runtime.sendMessage({ Demonstration_middleware: "Paste_Upload_100" });
      });
      $("#Functional_Right_click_menu_Btn").click(() => {//右键
        chrome.runtime.sendMessage({ Demonstration_middleware: "Drag_upload_100" });
      });
    }
  }
  function removeIntro() {
    $("#overlay").remove()
  }
  function Animation_auto() {
    removeIntro()
    if ($(".Functional_animation").length == 0) {
      $("body").append(`
      <div class="Functional_animation">
        <h1>按下CTRL+V</h1>
        <div class="animation_finger"></div>
      </div>
      `)
    }
    setTimeout(() => {
      $(".Functional_animation").addClass("active")
    }, 1000)
    Simulated_upload = true;  //模拟上传开启
    /**
     * 剪切板数据
     */
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val("https://cdn-us.imgs.moe/2023/05/31/64770cc077bfc.png").select();
    document.execCommand("copy");
    $temp.remove();
  }

  function closeIntro() {
    removeIntro()
    Simulated_upload = false;
    Black_curtain = false
    $(".Functional_animation").remove()
    chrome.runtime.sendMessage({ Demonstration_middleware: "closeIntro" });
  }
  let Black_curtain = false
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.Paste_Upload_Start) {
      if (Black_curtain == true) { return; }
      // 禁止活动
      Black_curtain = true
      showIntro();
    }
  });
})