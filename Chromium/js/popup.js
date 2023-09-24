$(document).ready(function () {
  Dropzone.autoDiscover = false;
  chrome.storage.local.get(storagelocal, function (result) {
    // 初始化读取数据
    options_exe = result.options_exe
    options_proxy_server_state = result.options_proxy_server_state
    options_proxy_server = result.options_proxy_server
    options_host = result.options_host
    options_token = result.options_token
    options_CSRF = result.options_CSRF
    options_uid = result.options_uid
    options_source = result.options_source
    options_imgur_post_mode = result.options_imgur_post_mode
    options_source_select = result.options_source_select
    options_expiration_select = result.options_expiration_select || "NODEL"
    options_album_id = result.options_album_id
    options_nsfw_select = result.options_nsfw_select || 0
    options_permission_select = result.options_permission_select || 0
    ImageProxy = result.ImageProxy || 0
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
    let LinksUrl = []
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
      // 判断是否为 HTTP URL
      const urlRegExp = /^(http|https):\/\/[^\s]+$/;
      if (urlRegExp.test(Copy_Url)) {
        async function clipboard_Request_Success(blob) {
          if (Simulated_upload == true) {
            toastItem({
              toast_content: chrome.i18n.getMessage("Clipboard_upload_1")
            })
            Simulated_upload = false; //模拟上传
            Black_curtain = false //显示灰块
            //自动演示
            $(".Functional_animation").remove()
            let confirm_input = confirm(chrome.i18n.getMessage("Clipboard_upload_2"))
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
              toast_content: chrome.i18n.getMessage("Clipboard_upload_3")
            })
            uploader.addFile(Copy_Img);
          } else {
            toastItem({
              toast_content: chrome.i18n.getMessage("Clipboard_upload_4")
            })
          }
        }
        fetch(options_proxy_server + Copy_Url)
          .then(res => {
            toastItem({
              toast_content: chrome.i18n.getMessage("Clipboard_upload_5")
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
                  toast_content: chrome.i18n.getMessage("Clipboard_upload_6")
                })
                return res.blob()
              })
              .then(blob => {
                toastItem({
                  toast_content: chrome.i18n.getMessage("Clipboard_upload_7")
                })
                clipboard_Request_Success(blob)
              })
              .catch((error) => {
                toastItem({
                  toast_content: chrome.i18n.getMessage("Upload_prompt4")
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
              toast_content: chrome.i18n.getMessage("Clipboard_upload_4")
            })
          }
        }
      }


    });

    function textFrame() {
      const textFrame = `
      <div class="Upload_Return_Box">
        <div class="col">
          <p class="p_urls">`+ chrome.i18n.getMessage("Upload_return_information") + `</p>
        </div>
        <div class="text-center selector_p_urls">
          <span>`+ chrome.i18n.getMessage("Selected") + `</span>
        </div>
        <div class="text-center copy">
          <span>`+ chrome.i18n.getMessage("Copy") + `</span>
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
      // 默认点击
      $('div[value="' + Copy_Selected_Mode + '"]').click();
    })

    uploader.on("removedfile", function (removefile) {
      const index = filePreviewElements.indexOf(removefile.previewElement);
      const pTag = $(".p_urls").eq(index);
      $(pTag).parent().parent().remove()
      filePreviewElements.splice(index, 1);
      fileDeletePreview.splice(index, 1);
      LinksUrl.splice(index, 1);
      textFrame()
      toastItem({
        toast_content: chrome.i18n.getMessage("Delete_successful")
      })
    });//文件删除
    uploader.on("success", async function (file, res) {
      console.log(res)
      textFrame()
      if ($('.LinksBox').is(':hidden')) {
        $('.LinksBox').hide().slideDown('slow'); //动画
      }
      let date = new Date();
      let getMonth = date.getMonth() + 1
      let filename = options_UploadPath + date.getFullYear() + "/" + getMonth + "/" + date.getDate() + "/" + file.name;
      try {
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
              toast_content: chrome.i18n.getMessage("Server_response_successful")
            })
            //奖字符串转为JSON
            if (open_json_button == 1) {
              if (typeof res !== 'object') {
                try {
                  var res = JSON.parse(res)
                } catch (error) {
                  alert(chrome.i18n.getMessage("data_cannot_be_converted_to_JSON"));
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
              toast_content: chrome.i18n.getMessage("Upload_prompt7")
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
          case 'fiftyEight':
            if (res && res.indexOf("n_v2") > -1) {
              let index = parseInt(Math.random() * 8) + 1;
              imageUrl = "https://pic" + index + ".58cdn.com.cn/nowater/webim/big/" + res;
            }
            break;
          case 'BilibliBed':
            imageUrl = res.data.image_url
            toastItem({
              toast_content: chrome.i18n.getMessage("Upload_prompt7")
            })
            break;
          case 'BaiJiaHaoBed':
            imageUrl = res.ret.https_url;
            toastItem({
              toast_content: chrome.i18n.getMessage("Upload_prompt7")
            })
            break;
          case 'freebufBed':
            imageUrl = res.data.url.replace(/\\/g, "").replace('!small', '');
            toastItem({
              toast_content: chrome.i18n.getMessage("Upload_prompt7")
            })
            break;
          case 'toutiaoBed':
            imageUrl = res.data.url_list[0].url;
            toastItem({
              toast_content: chrome.i18n.getMessage("Upload_prompt7")
            })
            break;
        }
      } catch (error) {
        if (!imageUrl) {
          imageUrl = chrome.i18n.getMessage("Upload_prompt4")
        }
      }
      let info = {
        url: imageUrl,
        name: file.name
      }

      LinksUrl.push(info)
      chrome.runtime.sendMessage({ Middleware_AutoInsert_message: imageUrl });
      await LocalStorage(null, imageUrl, file)

    })
    uploader.on("error", function (file, err) {
      console.log(err)
      let info = {
        url: "文件" + file.name + "上传失败",
        name: file.name
      }
      LinksUrl.push(info)
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
    // 实现链接按钮下划线
    $(".urlButton").click(function () {
      const value = $(this).attr("value");
      $(this).addClass('Check');
      $('.urlButton').not(this).removeClass('Check');
      chrome.storage.local.set({ 'Copy_Selected_Mode': value })
      Copy_Selected_Mode = value

      let newUrl
      if (filePreviewElements.length == 0) {
        return;
      }
      $('.textFrame').empty();
      LinksUrl.forEach((e, i) => {
        let eUrl = e.url
        switch (ImageProxy) {
          case "1":
            let index = parseInt(Math.random() * 3);
            eUrl = `https://i` + index + `.wp.com/` + eUrl.replace(/^https:\/\//, '')
            break;
          case "2":
            eUrl = `https://images.weserv.nl/?url=` + eUrl
            break;
          case "3":
            eUrl = `https://imageproxy.pimg.tw/resize?url=` + eUrl
            break;
          case "4":
            eUrl = `https://pic1.xuehuaimg.com/proxy/` + eUrl
            break;
          case "5":
            eUrl = `https://cors.zme.ink/` + eUrl
            break;
        }
        switch (Copy_Selected_Mode) {
          case 'URL':
            newUrl = eUrl
            break;
          case 'HTML':
            newUrl = '&lt;img src="' + eUrl + '" alt="' + e.name + '" title="' + e.name + '" /&gt;'
            break;
          case 'BBCode':
            newUrl = '[img]' + eUrl + '[/img]'
            break;
          case 'Markdown':
            newUrl = '![' + e.name + '](' + eUrl + ')'
            break;
          case 'MDWithLink':
            newUrl = '[![' + e.name + '](' + eUrl + ')](' + eUrl + ')'
            break;
        }
        $('.textFrame').append(`
      <div class="Upload_Return_Box">
        <div class="col">
          <p class="p_urls">`+ newUrl + `</p>
        </div>
        <div class="text-center selector_p_urls">
          <span>`+ chrome.i18n.getMessage("Selected") + `</span>
        </div>
        <div class="text-center copy">
          <span>`+ chrome.i18n.getMessage("Copy") + `</span>
        </div>
      </div>
      `);
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
            toast_content: chrome.i18n.getMessage("Copy_successful")
          })
        });


      })
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
          toast_content: chrome.i18n.getMessage("Copy_successful")
        })
      }
    })


    if (!options_host) {
      if (options_exe != "UserDiy" && options_exe != "Tencent_COS" && options_exe != "Aliyun_OSS" && options_exe != "AWS_S3" && options_exe != "GitHubUP" && options_exe != "imgdd") {
        alert(chrome.i18n.getMessage("Website_domain_is_blank"));
        window.location.href = "options.html";
        return;
      }
    }

    let tokenRequired = ['Lsky', 'EasyImages', 'ImgURL', 'SM_MS', 'Chevereto', 'Hellohao', 'Imgur'];
    if (tokenRequired.includes(options_exe)) {
      if (!options_token) {
        alert(`${options_exe}` + chrome.i18n.getMessage("Token_is_required") + ``);
        window.location.href = "options.html";
        return;
      }
      if (options_exe === "ImgURL" && !options_uid) {
        alert('ImgURL' + chrome.i18n.getMessage("UID_is_required"));
        window.location.href = "options.html";
        return;
      }
      if (options_exe == "Hellohao" && !options_source) {
        alert('Hellohao' + chrome.i18n.getMessage("source_is_required"));
        window.location.href = "options.html";
        return;
      }

    }
    switch (options_exe) {
      case 'UserDiy':
        if (!options_apihost) {
          alert(chrome.i18n.getMessage("Website_domain_is_blank"));
          window.location.href = "options.html";
          return;
        }
        break;
      case 'Tencent_COS':
        if (!options_SecretId) {
          alert(chrome.i18n.getMessage("Tencent_cos_1"))
          window.location.href = "options.html";
          return;
        }
        if (!options_SecretKey) {
          alert(chrome.i18n.getMessage("Tencent_cos_2"))
          window.location.href = "options.html";
          return;
        }
        if (!options_Region) {
          alert(chrome.i18n.getMessage("Tencent_cos_3"))
          window.location.href = "options.html";
          return;
        }
        if (!options_Bucket) {
          alert(chrome.i18n.getMessage("Tencent_cos_4"))
          window.location.href = "options.html";
          return;
        }
        break;
      case 'Aliyun_OSS':
        if (!options_SecretId) {
          alert(chrome.i18n.getMessage("Alibaba_oss_1"))
          window.location.href = "options.html";
          return;
        }
        if (!options_SecretKey) {
          alert(chrome.i18n.getMessage("Alibaba_oss_2"))
          window.location.href = "options.html";
          return;
        }
        if (!options_Bucket) {
          alert(chrome.i18n.getMessage("Alibaba_oss_3"))
          window.location.href = "options.html";
          return;
        }
        if (!options_Endpoint) {
          alert(chrome.i18n.getMessage("Alibaba_oss_4"))
          window.location.href = "options.html";
          return;
        }
        if (!options_Region) {
          alert(chrome.i18n.getMessage("Alibaba_oss_5"))
          window.location.href = "options.html";
          return;
        }
        break;
      case 'AWS_S3':
        if (!options_SecretId) {
          alert(chrome.i18n.getMessage("s3_oss_1"))
          window.location.href = "options.html";
          return;
        }
        if (!options_SecretKey) {
          alert(chrome.i18n.getMessage("s3_oss_1"))
          window.location.href = "options.html";
          return;
        }
        if (!options_Region) {
          alert(chrome.i18n.getMessage("s3_oss_1"))
          window.location.href = "options.html";
          return;
        }
        if (!options_Bucket) {
          alert(chrome.i18n.getMessage("s3_oss_1"))
          window.location.href = "options.html";
          return;
        }
        break;
    }


    // 写入标题
    let options_webtitle = localStorage.options_webtitle
    $(".title-a").text(options_webtitle)
    $(".exeinfo_p").text(options_exe)

  }) // chrome.storage.local.get
  animation_button('.Animation_button')// 设置按钮动画
  $('.container-md').hide().fadeIn('slow'); //全局动画

  let Simulated_upload = false//模拟上传
  function showIntro() {
    if ($("#overlay").length == 0) {
      $("body").append(`
    <div id="overlay">
      <div id="introBox">
        <h2 style="padding: 0;margin: 0;">`+ chrome.i18n.getMessage("Function_demonstration_1") + `</h2>
        <p>`+ chrome.i18n.getMessage("Function_demonstration_2") + `</p>
        </p>
        <p style="margin: 10px;">
          <button id="Animation_auto_Btn">`+ chrome.i18n.getMessage("Function_demonstration_3") + `</button>
          <button id="Animation_close_Btn">`+ chrome.i18n.getMessage("Function_demonstration_4") + `</button>
        </p>
        <div class="Demo-container">
          <!-- 第一个卡片 -->
          <div class="card">
            <div class="icon"></div>
            <h2>01</h2>
            <div class="content">
              <h3>`+ chrome.i18n.getMessage("Function_demonstration_5") + `</h3>
              <p>`+ chrome.i18n.getMessage("Function_demonstration_6") + `</p>
              <a href="#" id="Animation_Paste_Upload_Btn">`+ chrome.i18n.getMessage("Function_demonstration_3") + `</a>
            </div>
          </div>
          <!-- 第二个卡片 -->
          <div class="card">
            <h2>02</h2>
            <div class="content">
              <h3>`+ chrome.i18n.getMessage("Function_demonstration_7") + `</h3>
              <p>`+ chrome.i18n.getMessage("Function_demonstration_8") + `</p>
              <a href="#" id="Animation_Drag_upload_Btn">`+ chrome.i18n.getMessage("Function_demonstration_3") + `</a>
            </div>
          </div>
          <!-- 第三个卡片 -->
          <div class="card">
            <h2>03</h2>
            <div class="content">
              <h3>`+ chrome.i18n.getMessage("Function_demonstration_9") + `</h3>
              <p>`+ chrome.i18n.getMessage("Function_demonstration_10") + `</p>
              <a href="#" id="Functional_Right_click_menu_Btn">`+ chrome.i18n.getMessage("Function_demonstration_3") + `</a>
            </div>
          </div>
        </div>
  
        <p>`+ chrome.i18n.getMessage("Function_demonstration_11") + `</p>
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
            <h1>CTRL+V</h1>
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
        <h1>CTRL+V</h1>
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

  $(".title-a").click(() => {
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
  })
})