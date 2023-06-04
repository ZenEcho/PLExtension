$(document).ready(function () {
  Dropzone.autoDiscover = false;
  chrome.storage.local.get(getSave, function (result) {
    // 初始化读取数据
    var options_exe = result.options_exe
    var options_proxy_server_state = result.options_proxy_server_state
    var options_proxy_server = result.options_proxy_server
    var options_host = result.options_host
    var options_token = result.options_token
    var options_uid = result.options_uid
    var options_source = result.options_source
    var options_imgur_post_mode = result.options_imgur_post_mode
    var options_source_select = result.options_source_select
    var options_expiration_select = result.options_expiration_select || "NODEL"
    var options_album_id = result.options_album_id
    var options_nsfw_select = result.options_nsfw_select || 0
    var options_permission_select = result.options_permission_select || 0
    //自定义请求
    var options_apihost = result.options_apihost
    var options_parameter = result.options_parameter
    var options_Headers = result.options_Headers
    var options_Body = result.options_Body
    var options_return_success = result.options_return_success
    var open_json_button = result.open_json_button
    var Copy_Selected_Mode = result.Copy_Selected_Mode

    //GitHub
    var options_owner = result.options_owner
    var options_repository = result.options_repository

    //对象存储
    var options_SecretId = result.options_SecretId
    var options_SecretKey = result.options_SecretKey
    var options_Bucket = result.options_Bucket
    var options_AppId = result.options_AppId
    var options_Endpoint = result.options_Endpoint
    var options_Region = result.options_Region
    var options_UploadPath = result.options_UploadPath
    var options_Custom_domain_name = result.options_Custom_domain_name

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
          alert('Headers请求参数不是一个合法的 JSON 格式字符串!');
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
          alert('Body请求参数不是一个合法的 JSON 格式字符串!');
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
    var SvgData = `<img class="icon" src="/icons/logo.ico">`
    var UserBox = `
    <div class="userBox"  style="display: none;">
    <i class="bi bi-person"></i>用户:(<span class="userName" style="color: #03a9f4;">游客(仅兰空,SM.MS图床程序)</span>),
    <i class="bi bi-bar-chart-line-fill"></i>总容量:(<span class="userCapacity" style="color: #03a9f4;">0Gb</span>),
    <i class="bi bi-bar-chart-line"></i>已使用:(<span class="userSize" style="color: #03a9f4;">0Gb</span>),
    <i class="bi bi-image"></i>图片数量:(<span class="userImage_num" style="color: #03a9f4;">0</span>)
    </div>`
    var links
    var LinksUrl = []
    var LinksHtml = []
    var LinksBBCode = []
    var LinksMarkdown = []
    var LinksMDwithlink = []
    var imageUrl
    var filePreviewElements = [];
    var fileDeletePreview = [];
    // 实现上传功能
    var uploader;
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
        parallelUploads: 20, //上传个数限制
        dictDefaultMessage: SvgData + `<p>点击上传 / 拖拽上传 / 粘贴上传</p>` + UserBox,
        dictFallbackMessage: "您的浏览器不支持拖拽......",
        dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
        dictFileTooBig: "你传的玩意有 {{filesize}}MiB这么大.但是我就允许你传: {{maxFilesize}}MiB.",
        dictInvalidFileType: "你不能上传这个文件类型.......",
        dictResponseError: "服务器返回 {{statusCode}} 代码.",
        dictCancelUpload: `<button type="button" class="btn btn-outline-danger" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem; width: 100%;">取消上传</button>`,
        dictCancelUploadConfirmation: "你确认取消上传吗?",
        dictRemoveFile: `<button type="button" class="btn btn-outline-danger" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem; width: 100%;">删除图片</button>`,
        dictMaxFilesExceeded: "您不能上传更多啦......",
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
            $(".Functional_animation").removeClass("active")
            let confirm_input = confirm("真棒👍!你已经学会“粘贴上传”啦,那我们进行下一步“拖拽上传”吧!")
            if (confirm_input == true) {
              chrome.runtime.sendMessage({ Demonstration_middleware: "Paste_Upload_100" });
            } else {
              $(".Functional_animation").removeClass("active")
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
          <p class="p_urls">上传成功后URL将会显示在这里</p>
        </div>
        <div class="text-center selector_p_urls">
          <span>选择</span>
        </div>
        <div class="text-center copy">
          <span>复制</span>
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
                <span>选择</span>
              </div>
              <div class="text-center copy">
                <span>复制</span>
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
          if (!res.message) {
            res.data.links.url = "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
          }
          imageUrl = res.data.links.url
          LinksUrl.push(res.data.links.url)
          LinksHtml.push(res.data.links.html)
          LinksBBCode.push(res.data.links.bbcode)
          LinksMarkdown.push(res.data.links.markdown)
          LinksMDwithlink.push(res.data.links.markdown_with_link)
          break;
        case 'EasyImages':
          if (res.indexOf('Warning') === -1) {
            if (typeof res !== 'object') {
              try {
                var res = JSON.parse(res);
              } catch (error) {
                alert('返回的数据无法转换为JSON,请联系作者进行错误修正!');
                return;
              }
            }
            toastItem({
              toast_content: res.result
            })
          } else {
            var res = {};
            toastItem({
              toast_content: "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
            })
            res.url = "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
          }
          imageUrl = res.url
          LinksUrl.push(res.url)
          LinksHtml.push('&lt;img src="' + res.url + '" alt="' + res.srcName + '" title="' + res.srcName + '" /&gt;')
          LinksBBCode.push('[img]' + res.url + '[/img]')
          LinksMarkdown.push('![' + res.srcName + '](' + res.url + ')')
          LinksMDwithlink.push('[![' + res.srcName + '](' + res.url + ')](' + res.url + ')')
          break;
        case 'ImgURL':
          toastItem({
            toast_content: res.msg
          })
          if (!res.msg) {
            res.data.url = "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
          }
          imageUrl = res.data.url
          LinksUrl.push(res.data.url)
          LinksHtml.push('&lt;img src="' + res.data.url + '" alt="' + res.data.client_name + '" title="' + res.data.client_name + '" /&gt;')
          LinksBBCode.push('[img]' + res.data.url + '[/img]')
          LinksMarkdown.push('![' + res.data.client_name + '](' + res.data.url + ')')
          LinksMDwithlink.push('[![' + res.data.client_name + '](' + res.data.url + ')](' + res.data.url + ')')
          break;
        case 'SM_MS':
          toastItem({
            toast_content: res.message
          })
          if (!res.message) {
            res.data.url = "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
          }
          imageUrl = res.data.url
          LinksUrl.push(res.data.url)
          LinksHtml.push('&lt;img src="' + res.data.url + '" alt="' + res.data.filename + '" title="' + res.data.filename + '" /&gt;')
          LinksBBCode.push('[img]' + res.data.url + '[/img]')
          LinksMarkdown.push('![' + res.data.filename + '](' + res.data.url + ')')
          LinksMDwithlink.push('[![' + res.data.filename + '](' + res.data.url + ')](' + res.data.url + ')')
          break;
        case 'Chevereto':
          if (res.status != 200) {
            toastItem({
              toast_content: "上传成功"
            })

          } else {
            res.image.url = "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
          }
          imageUrl = res.image.url
          LinksUrl.push(res.image.url)
          LinksHtml.push('&lt;img src="' + res.image.url + '" alt="' + res.image.original_filename + '" title="' + res.image.original_filename + '" /&gt;')
          LinksBBCode.push('[img]' + res.image.url + '[/img]')
          LinksMarkdown.push('![' + res.image.original_filename + '](' + res.image.url + ')')
          LinksMDwithlink.push('[![' + res.image.original_filename + '](' + res.image.url + ')](' + res.image.url + ')')
          break;
        case 'Hellohao':
          toastItem({
            toast_content: res.info
          })
          if (!res.info) {
            res.data.url = "上传失败,请打开DevTools查看报错并根据常见问题进行报错排除"
          }
          imageUrl = res.data.url
          LinksUrl.push(res.data.url)
          LinksHtml.push('&lt;img src="' + res.data.url + '" alt="' + file.name + '" title="' + file.name + '" /&gt;')
          LinksBBCode.push('[img]' + res.data.url + '[/img]')
          LinksMarkdown.push('![' + file.name + '](' + res.data.url + ')')
          LinksMDwithlink.push('[![' + file.name + '](' + res.data.url + ')](' + res.data.url + ')')
          break;
        case 'Imgur':
          imageUrl = res.data.link
          LinksUrl.push(res.data.link)
          LinksHtml.push('&lt;img src="' + res.data.link + '" alt="' + file.name + '" title="' + file.name + '" /&gt;')
          LinksBBCode.push('[img]' + res.data.link + '[/img]')
          LinksMarkdown.push('![' + file.name + '](' + res.data.link + ')')
          LinksMDwithlink.push('[![' + file.name + '](' + res.data.link + ')](' + res.data.link + ')')
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
          const options_return_success_value = res;
          options_return_success.split('.').forEach(function (prop) {
            if (options_return_success_value) {
              options_return_success_value = options_return_success_value[prop];
            }
          });
          imageUrl = options_return_success_value
          LinksUrl.push(options_return_success_value)
          LinksHtml.push('&lt;img src="' + options_return_success_value + '" alt="' + file.name + '" title="' + file.name + '" /&gt;')
          LinksBBCode.push('[img]' + options_return_success_value + '[/img]')
          LinksMarkdown.push('![' + file.name + '](' + options_return_success_value + ')')
          LinksMDwithlink.push('[![' + file.name + '](' + options_return_success_value + ')](' + options_return_success_value + ')')
          break;
        case 'Tencent_COS':
          imageUrl = options_Custom_domain_name + filename
          LinksUrl.push(imageUrl)
          LinksHtml.push('&lt;img src="' + imageUrl + '" alt="' + file.name + '" title="' + file.name + '" /&gt;')
          LinksBBCode.push('[img]' + imageUrl + '[/img]')
          LinksMarkdown.push('![' + file.name + '](' + imageUrl + ')')
          LinksMDwithlink.push('[![' + file.name + '](' + imageUrl + ')](' + imageUrl + ')')
          // 默认点击
          $('div[value="' + Copy_Selected_Mode + '"]').click();
          toastItem({
            toast_content: '上传完成'
          })
          options_host = options_Bucket
          break;
        case 'Aliyun_OSS':
          imageUrl = options_Custom_domain_name + filename
          LinksUrl.push(imageUrl)
          LinksHtml.push('&lt;img src="' + imageUrl + '" alt="' + file.name + '" title="' + file.name + '" /&gt;')
          LinksBBCode.push('[img]' + imageUrl + '[/img]')
          LinksMarkdown.push('![' + file.name + '](' + imageUrl + ')')
          LinksMDwithlink.push('[![' + file.name + '](' + imageUrl + ')](' + imageUrl + ')')
          // 默认点击
          $('div[value="' + Copy_Selected_Mode + '"]').click();
          toastItem({
            toast_content: '上传完成'
          })
          options_host = options_Endpoint
          break;
        case 'AWS_S3':
          imageUrl = options_Custom_domain_name + filename
          LinksUrl.push(imageUrl)
          LinksHtml.push('&lt;img src="' + imageUrl + '" alt="' + file.name + '" title="' + file.name + '" /&gt;')
          LinksBBCode.push('[img]' + imageUrl + '[/img]')
          LinksMarkdown.push('![' + file.name + '](' + imageUrl + ')')
          LinksMDwithlink.push('[![' + file.name + '](' + imageUrl + ')](' + imageUrl + ')')
          // 默认点击
          $('div[value="' + Copy_Selected_Mode + '"]').click();
          toastItem({
            toast_content: '上传完成'
          })
          options_host = options_Endpoint
          break;
        case 'GitHubUP':
          imageUrl = `https://raw.githubusercontent.com/` + options_owner + `/` + options_repository + `/main/` + options_UploadPath + file.name
          LinksUrl.push(imageUrl)
          LinksHtml.push('&lt;img src="' + imageUrl + '" alt="' + file.name + '" title="' + file.name + '" /&gt;')
          LinksBBCode.push('[img]' + imageUrl + '[/img]')
          LinksMarkdown.push('![' + file.name + '](' + imageUrl + ')')
          LinksMDwithlink.push('[![' + file.name + '](' + imageUrl + ')](' + imageUrl + ')')
          // 默认点击
          $('div[value="' + Copy_Selected_Mode + '"]').click();
          toastItem({
            toast_content: '上传完成'
          })
          options_host = "GitHub.com"
          break;
      }
      console.log(res)
      chrome.runtime.sendMessage({ Middleware_AutoInsert_message: imageUrl });
      await LocalStorage(file, imageUrl)
    })


    uploader.on("error", function (file, err) {
      console.log(err)
      LinksUrl.push('文件：' + file.upload.filename + "-上传失败")
      LinksHtml.push('文件：' + file.upload.filename + "-上传失败")
      LinksBBCode.push('文件：' + file.upload.filename + "-上传失败")
      LinksMarkdown.push('文件：' + file.upload.filename + "-上传失败")
      LinksMDwithlink.push('文件：' + file.upload.filename + "-上传失败")
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
          for (var key in options_Body) {
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
                  uploader.emit("uploadprogress", file, progress, 100);
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
    }
    function LocalStorage(file, url, UploadLog) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get("UploadLog", function (result) {
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
              url: url,
              uploadExe: options_exe,
              upload_domain_name: options_host,
              original_file_name: file.name,
              img_file_size: "宽:不支持,高:不支持",
              uploadTime: d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + d.getMinutes() + "分" + d.getSeconds() + "秒"
            }
            if (typeof UploadLog !== 'object') {
              UploadLog = JSON.parse(UploadLog);
            }
            UploadLog.push(UploadLogData);
            chrome.storage.local.set({ 'UploadLog': UploadLog }, function (e) {
              // 数据保存完成后的回调函数
              resolve(); // 标记操作完成
            })
          })
        })
      });
    }
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
        let tempInput = $("<input>");  // create a temporary input element
        $("body").append(tempInput);  // add the input element to the document
        tempInput.val(selected_text.join(" ")).select();  // set the value of the input element to the imgSrcs array joined with newline characters, and select the input element
        document.execCommand("copy");  // copy the selected text to the clipboard
        tempInput.remove();  // remove the temporary input element from the document
        toastItem({
          toast_content: "复制成功"
        })
      }
    })


    if (!options_host) {
      if (options_exe != "UserDiy" && options_exe != "Tencent_COS" && options_exe != "Aliyun_OSS" && options_exe != "AWS_S3" && options_exe != "GitHubUP") {
        alert('网站域名为空,请初始化配置再上传!');
        window.location.href = "options.html";
        return;
      }
    }

    var tokenRequired = ['Lsky', 'EasyImages', 'ImgURL', 'SM_MS', 'Chevereto', 'Hellohao', 'Imgur'];
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
    var options_webtitle = localStorage.options_webtitle
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
        $(".Functional_animation").addClass("active")
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
  // 关闭蒙层和介绍框
  function Animation_auto() {
    removeIntro()
    $(".Functional_animation").removeClass("active")
    setTimeout(() => {
      $(".Functional_animation").addClass("active")
    }, 1800)
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