function createAlertBox(options) {
  options = Object.assign({
    alert_width: "300px",
    alert_height: "100px",
    alert_title: "警告：",
    alert_content: "这是一条测试内容",
    alert_DestroyTime: '300000'
  }, options);
  if ($('#alert').length > 0) {
    // 如果已经有提示框存在，则不再创建新的提示框
    return;
  }
  $("body").css("overflow", "hidden");
  $('body').append('<div id="alert" style="width:' + options.alert_width + ';height: ' + options.alert_height + ';" ></div>')
  $('body').append('<div id="alertBG"></div>')
  $('#alert').append('<div class="alert_title"></div><div style="line-height: ' + options.alert_height + ' ;" class="alert_content">' + options.alert_content + '</div>')
  $('.alert_title').append('<p class="alert_title_p">' + options.alert_title + '</p><button class="alert_title_button" >X</button>')
  setTimeout(function () {
    $('.alert_title_button').click()
  }, options.alert_DestroyTime);

  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  $('#alert').mousedown(function (e) {
    mouse_left = parseInt($(this).css('left'));
    mouse_top = parseInt($(this).css('top'));
    initialX = e.clientX - mouse_left;
    initialY = e.clientY - mouse_top;
    isDragging = true;
  });
  $(document).mouseup(function (e) {
    isDragging = false;
  });

  $(document).mousemove(function (e) {
    if (isDragging) {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      $('#alert').css({
        top: currentY + 'px',
        left: currentX + 'px'
      });
    }
  });
  // 点击X关闭弹窗
  $('.alert_title_button').click(function () {
    $("body").css("overflow", "");
    let $alert = $(this).parent().parent();
    let $alertBG = $("#alertBG");
    $alert.remove();
    $alertBG.remove();
  });
  $("#alertBG").click(function () {
    $('.alert_title_button').click()
  })
}
/**
 * @param {text} toast_title 标题
 * @param {text} toast_content 内容
 * @param {number} toast_DestroyTime 销毁时间
 */
function toastItem(options) {
  options = Object.assign({
    toast_title: "盘络程序",
    toast_content: "你好世界",
    toast_DestroyTime: '8000'
  }, options);

  let existingToast = $(`.toast-body:contains("${options.toast_content}")`);
  if (existingToast.length) {
    updateExistingToast(existingToast, options.toast_DestroyTime);
    return;
  }

  let Item = `
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <img src="/icons/logo32.png" class="rounded me-2" alt="...">
          <strong class="me-auto">`+ options.toast_title + `</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          `+ options.toast_content + `
        </div>
      </div>`
  if ($(".toast").length > 4) {
    $(".toast").last().slideUp(500, function () {
      $(this).remove();
    });
  }
  let newToast = $(Item).hide();
  $(".toast-container").append(newToast);
  newToast.last().slideDown('slow');
  let toastBody = $(".toast").last().find(".toast-body");
  updateExistingToast(toastBody, options.toast_DestroyTime);
}

function updateExistingToast(toastBody, destroyTime) {
  clearTimeout(toastBody.data("timeoutId"));
  toastBody.data("timeoutId", setTimeout(function () {
    toastBody.parent().slideUp(500, function () {
      $(this).remove();
    });
  }, destroyTime));
  let count = toastBody.siblings(".position-absolute");
  if (count.length) {
    count.text(parseInt(count.text()) + 1);
  } else {
    toastBody.after(
      `<span class="position-absolute translate-middle badge rounded-pill bg-danger">1</span>`);
  }
}

/**
 * @param {calss} Animation_class 类名
 */
function animation_button(Animation_class) {
  let classNames = ['Animation_button1', 'Animation_button2', 'Animation_button3', 'Animation_button4', 'Animation_button5', 'Animation_button6'];
  let $animationElement = $(Animation_class);
  let randomClass = classNames[Math.floor(Math.random() * classNames.length)];
  $animationElement.addClass(randomClass);
}

function animation_button2(Animation_class) {
  return new Promise(function (resolve, reject) {
    let classNames = ['css-button-sliding-bottom', 'css-button-sliding-top', 'css-button-sliding-right', 'css-button-sliding-left'];
    let $animationElement = $(Animation_class);
    let randomClass = classNames[Math.floor(Math.random() * classNames.length)];
    $animationElement.addClass(randomClass);
    resolve();
  });
}

//读取本地数组
var storagelocal = [
  "options_exe",
  "options_proxy_server_state",
  "options_proxy_server",
  "options_host",
  "options_token",
  "options_CSRF",
  "options_uid",
  "options_source",
  "options_imgur_post_mode",
  "options_source_select",
  "options_expiration_select", //删除时间
  "options_album_id", //相册
  "options_nsfw_select",//是否健康
  "options_permission_select",//是否公开
  "ImageProxy",//图片代理
  //自定义请求
  "options_apihost",
  "options_parameter",
  "options_Headers",
  "options_Body",
  "options_return_success",
  //GitHub
  "options_owner",
  "options_repository",

  //对象存储
  "options_SecretId",
  "options_SecretKey",
  "options_Bucket",
  "options_AppId",
  "options_Endpoint",
  "options_Region",
  "options_UploadPath",
  "options_Custom_domain_name",

  "open_json_button",
  "UploadLog",
  "Browse_mode_switching_status",
  "Copy_Selected_Mode",
  "GlobalUpload",
  "edit_uploadArea_width",
  "edit_uploadArea_height",
  "edit_uploadArea_Location",
  "edit_uploadArea_opacity",
  "edit_uploadArea_auto_close_time",
  "edit_uploadArea_Left_or_Right"
]
var uploader;
var options_exe,
  options_proxy_server_state,
  options_proxy_server,
  options_host,
  options_token,
  options_CSRF,
  options_uid,
  options_source,
  options_imgur_post_mode,
  options_source_select,
  options_expiration_select, //删除时间
  options_album_id,//相册
  options_nsfw_select,//是否健康
  options_permission_select,//是否公开
  ImageProxy,//图片代理
  //自定义请求
  options_apihost,
  options_parameter,
  options_Headers,
  options_Body,
  options_return_success,
  //GitHub
  options_owner,
  options_repository,
  //对象存储
  options_SecretId,
  options_SecretKey,
  options_Bucket,
  options_AppId,
  options_Endpoint,
  options_Region,
  options_UploadPath,
  options_Custom_domain_name,

  open_json_button,
  UploadLog,
  Browse_mode_switching_status,
  Copy_Selected_Mode,
  GlobalUpload,
  edit_uploadArea_width,
  edit_uploadArea_height,
  edit_uploadArea_Location,
  edit_uploadArea_opacity,
  edit_uploadArea_auto_close_time,
  edit_uploadArea_Left_or_Right;

var cos
var oss
var s3
chrome.storage.local.get(storagelocal, function (result) {
  options_exe = result.options_exe
  //对象存储
  options_SecretId = result.options_SecretId
  options_SecretKey = result.options_SecretKey
  options_Bucket = result.options_Bucket
  options_AppId = result.options_AppId
  options_Endpoint = result.options_Endpoint
  options_Region = result.options_Region
  options_UploadPath = result.options_UploadPath
  options_Custom_domain_name = result.options_Custom_domain_name

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
      cos = new COS({
        getAuthorization: getAuthorization,
        UploadCheckContentMd5: true,
        protocol: 'https:' // 强制使用 HTTPS 协议
      });
    } catch (error) {
      console.error(error)
      try {
        toastItem({
          toast_content: error
        });
      } catch (error) {
        chrome.runtime.sendMessage({ Loudspeaker: error.toString() });
      }
    }

    //腾讯云cos拼接
    if (!options_Custom_domain_name) {
      options_Custom_domain_name = "https://" + options_Bucket + ".cos." + options_Region + ".myqcloud.com/"
    }
  }
  if (options_exe == 'Aliyun_OSS') {
    try {
      oss = new OSS({
        accessKeyId: options_SecretId,
        accessKeySecret: options_SecretKey,
        bucket: options_Bucket,
        endpoint: options_Endpoint,
        region: options_Region,
        secure: true //强制https
      });
    } catch (error) {
      console.error(error)
      try {
        toastItem({
          toast_content: error
        });
      } catch (error) {
        chrome.runtime.sendMessage({ Loudspeaker: error.toString() });
      }
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
      s3 = new AWS.S3();
    } catch (error) {
      console.error(error)
      try {
        toastItem({
          toast_content: error
        });
      } catch (error) {
        chrome.runtime.sendMessage({ Loudspeaker: error.toString() });
      }
    }
  }
})
var fileTypeMap = {
  '.zip': 'compressedfile',
  '.zipx': 'compressedfile',
  '.rar': 'compressedfile',
  '.7z': 'compressedfile',
  '.alz': 'compressedfile',
  '.egg': 'compressedfile',
  '.cab': 'compressedfile',
  '.hb': 'compressedfile',
  '.001': 'compressedfile',
  '.arj': 'compressedfile',
  '.lha': 'compressedfile',
  '.lzh': 'compressedfile',
  '.pma': 'compressedfile',
  '.ace': 'compressedfile',
  '.arc': 'compressedfile',
  '.aes': 'compressedfile',
  '.zpaq': 'compressedfile',
  '.zstd': 'compressedfile',
  '.br': 'compressedfile',
  '.pea': 'compressedfile',
  '.tar': 'compressedfile',
  '.gz': 'compressedfile',
  '.tgz': 'compressedfile',
  '.bz': 'compressedfile',
  '.bz2': 'compressedfile',
  '.tbz': 'compressedfile',
  '.tbz2': 'compressedfile',
  '.xz': 'compressedfile',
  '.txz': 'compressedfile',
  '.lzma': 'compressedfile',
  '.tlz': 'compressedfile',
  '.lz': 'compressedfile',
  '.uu': 'compressedfile',
  '.uue': 'compressedfile',
  '.xxe': 'compressedfile',
  '.z': 'compressedfile',
  '.jar': 'jar',
  '.war': 'war',
  '.apk': 'apk',
  '.ipa': 'ipa',
  '.xpi': 'xpi',
  '.deb': 'deb',
  '.asar': 'asar',
  '.iso': 'iso',
  '.img': 'img',
  '.isz': 'isz',
  '.udf': 'udf',
  '.wim': 'wim',
  '.bin': 'bin',
  //图片后缀
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.bmp': 'image',
  '.ico': 'image',
  '.icns': 'image',
  '.webp': 'image',
  '.raw': 'image',
  '.tif': 'print',
  '.tiff': 'print',
  '.svg': 'svg',
  '.cr2': 'cr2',
  '.nef': 'nef',
  '.dng': 'dng',
  //office后缀
  '.doc': 'Word',
  '.docx': 'Word',
  '.docm': 'Word',
  '.dotx': 'Word',
  '.dotm': 'Word',
  '.xls': 'Excel',
  '.xlsx': 'Excel',
  '.xlsm': 'Excel',
  '.xltx': 'Excel',
  '.xltm': 'Excel',
  '.xlsb': 'Excel',
  '.xlam': 'Excel',
  '.ppt': 'PowerPoint',
  '.pptx': 'PowerPoint',
  '.pptm': 'PowerPoint',
  '.ppsx': 'PowerPoint',
  '.ppsm': 'PowerPoint',
  '.potx': 'PowerPoint',
  '.potm': 'PowerPoint',
  '.ppam': 'PowerPoint',
  //adobe
  '.ai': 'ai',
  '.pdf': 'Acrobat',
  '.psd': 'ps',
  '.prproj': 'pr',
  '.aep': 'ae',
  //win系统后缀
  '.exe': 'exe',
  '.dll': 'dll',
  '.sys': 'sys',
  '.bat': 'editable',
  '.reg': 'reg',
  '.txt': 'editable',
  //媒体后缀
  '.mp3': 'music',
  '.wav': 'music',
  '.wma': 'music',
  '.aac': 'music',
  '.flac': 'music',
  '.mp4': 'video',
  '.avi': 'video',
  '.wmv': 'video',
  '.mkv': 'video',
  '.mov': 'video',
  '.c': 'editable',
  '.cpp': 'editable',
  '.java': 'editable',
  '.py': 'editable',
  '.js': 'editable',
  '.html': 'editable',
  '.css': 'editable',
  '.php': 'editable',
  '.asp': 'editable',
  '.json': 'editable',
  '.sh': 'editable',
  '.pl': 'editable',
  '.h': 'editable',
  '.hpp': 'editable',
  '.md': 'editable',
  '.sql': 'editable',
  '.log': 'editable',
  '.conf': 'editable',
  '.cfg': 'editable',
  '.ini': 'editable',
  '.rst': 'editable',
  '.csv': 'editable',
  '.tsv': 'editable',
};

let pluginURL = chrome.runtime.getURL("popup.html");
let currentURL = window.location.href;
if (currentURL === pluginURL) {
  chrome.storage.local.get(storagelocal, function (result) {
    let options_exe = result.options_exe
    let options_proxy_server = result.options_proxy_server
    let options_host = result.options_host
    let options_token = result.options_token
    let options_proxy_server_state = result.options_proxy_server_state

    // 判断跨域开关
    if (options_proxy_server_state == 0) {
      options_proxy_server = ""
    }

    if (!options_proxy_server) {
      options_proxy_server = ""
    }


    if (options_exe == "UserDiy") {
      localStorage.options_webtitle = chrome.i18n.getMessage("Custom_Upload")
      localStorage.options_webtitle_status = 0
      return;
    }
    if (options_exe == "GitHubUP") {
      localStorage.options_webtitle = chrome.i18n.getMessage("GitHub")
      localStorage.options_webtitle_status = 0
      return;
    }
    if (options_exe == "Tencent_COS") {
      localStorage.options_webtitle = chrome.i18n.getMessage("Tencent_COS")
      localStorage.options_webtitle_status = 0
      return;
    }
    if (options_exe == "Aliyun_OSS") {
      localStorage.options_webtitle = chrome.i18n.getMessage("Alibaba_OSS")
      localStorage.options_webtitle_status = 0
      return;
    }
    if (options_exe == "AWS_S3") {
      localStorage.options_webtitle = chrome.i18n.getMessage("AWS_S3")
      localStorage.options_webtitle_status = 0
      return;
    }

    if (options_host) {
      // 自定义ajax函数属性
      if (options_exe == "Lsky") {
        fetch(options_proxy_server + "https://" + options_host + "/api/v1/profile", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': options_token
          }
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Network response was not ok.');
            }
          })
          .then(res => {
            $('.userBox').hide().fadeIn('slow'); // 动画
            let getUser_name = res.data.name;
            let getUser_capacity = (res.data.capacity / 1024 / 1024).toFixed(2);
            let getUser_size = (res.data.size / 1024 / 1024).toFixed(3);
            let getUser_image_num = res.data.image_num;
            $(".userName").text(getUser_name);
            $(".userCapacity").text(getUser_capacity + "GB");
            $(".userSize").text(getUser_size + "GB");
            $(".userImage_num").text(getUser_image_num);
          })
          .catch(error => {
            if (error.message.includes('401')) {
              console.error('未登录或授权失败');
            } else if (error.message.includes('403')) {
              console.error('管理员关闭了接口功能或没有该接口权限');
            } else if (error.message.includes('429')) {
              console.error('超出请求配额，请求受限');
            } else if (error.message.includes('500')) {
              console.error('服务端出现异常');
            } else {
              console.error('请求失败:', error.message);
            }
          });
      }
      if (options_exe == "SM_MS") {
        fetch(options_proxy_server + "https://" + options_host + "/api/v2/profile", {
          method: 'POST',
          headers: {
            'Authorization': options_token
          }
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Network response was not ok.');
            }
          })
          .then(res => {
            $('.userBox').hide().fadeIn('slow'); // 动画
            let getUser_name = res.data.username;
            let getUser_capacity = (res.data.disk_limit_raw / 1024 / 1024 / 1024).toFixed(2);
            let getUser_size = (res.data.disk_usage_raw / 1024 / 1024 / 1024).toFixed(3);
            let getUser_image_num = "SM.MS不支持";
            $(".userName").text(getUser_name);
            $(".userCapacity").text(getUser_capacity + "GB");
            $(".userSize").text(getUser_size + "GB");
            $(".userImage_num").text(getUser_image_num);
          })
          .catch(error => {
            console.error('未知原因请求失败了:', error);
          });
      }

      if (localStorage.options_webtitle_status == 1) {
        // 获取web标题
        if (options_host == "pnglog.com") {
          localStorage.options_webtitle = "盘络图床"
          localStorage.options_webtitle_status = 0 // 不获取
        } else {
          fetch(options_proxy_server + 'https://' + options_host)
            .then(response => response.text())
            .then(html => {
              let webtitle = $(html).filter('title').text();
              localStorage.options_webtitle = webtitle
              localStorage.options_webtitle_status = 0
            })
            .catch(error => {
              console.log("标题获取失败,再次尝试获取...");
              fetch('https://cors-anywhere.pnglog.com/https://' + options_host)
                .then(response => response.text())
                .then(html => {
                  let webtitle = $(html).filter('title').text();
                  localStorage.options_webtitle = webtitle
                  localStorage.options_webtitle_status = 0
                })
                .catch(error => {
                  localStorage.options_webtitle = chrome.i18n.getMessage("app_name")
                });
            });
        }
      }
    }
    if (options_exe != "Lsky" && options_exe != "SM_MS") {
      chrome.storage.local.get("UploadLog", function (result) {
        setTimeout(() => {
          let Log = result.UploadLog || [];
          let size = 0
          try {
            Log.forEach(element => {
              size = size + element.file_size
            });
            let NewSize = (size / 1024 / 1024).toFixed(3)
            $(".userName").text("本地存储");
            $(".userCapacity").text("无限");
            $(".userSize").text(NewSize + "MB");
            $(".userImage_num").text(Log.length);
            $('.userBox').hide().fadeIn('slow'); // 动画
          } catch (error) {
            $('.userBox').hide()
          }

        }, 1500)

      })
    }
  })
}


function measurePingDelay(callback, getUrl) {
  let startTime = new Date().getTime();
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      let endTime = new Date().getTime();
      let delay = endTime - startTime;
      callback(null, delay);
    }
  };
  xhr.onerror = () => {
    let corsUrl = 'https://cors-anywhere.pnglog.com/' + getUrl;
    xhr.onerror = () => {
      callback(new Error('无法连接到') + getUrl, null);
    };
    xhr.open('GET', corsUrl, true);
    xhr.send();
  };

  xhr.open('GET', getUrl, true);
  xhr.send();
}
