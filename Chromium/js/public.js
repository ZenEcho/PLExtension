/**
 * @param {text} toast_title 标题
 * @param {text} toast_content 内容
 * @param {number} toast_DestroyTime 销毁时间
 */
function toastItem(options) {
  options = Object.assign({
    toast_title: chrome.i18n.getMessage("app_name"),
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
let storagelocal = [
  "ProgramConfiguration",
  "UploadLog",
  "Browse_mode_switching_status",
  "Copy_Selected_Mode",
  "uploadArea",
  "FuncDomain",
]
let ProgramConfigurations = {
  options_exe: null,
  options_proxy_server_state: null,
  options_proxy_server: null,
  options_host: null,
  options_token: null,
  options_CSRF: null,
  options_uid: null,
  options_source: null,
  options_imgur_post_mode: null,
  options_source_select: null, //存储源
  options_expiration_select: null, //删除时间
  options_album_id: null, //相册
  options_nsfw_select: null,//是否健康
  options_permission_select: null,//是否公开
  options_apihost: null, //自定义
  requestMethod: null, //请求方法
  options_parameter: null,
  options_Headers: null,
  options_Body: null,
  options_return_success: null,
  custom_ReturnPrefix: null, //前缀
  custom_ReturnAppend: null,//后缀
  Keyword_replacement1: null,//关键词1
  Keyword_replacement2: null,//替换为
  open_json_button: null,
  custom_Base64Upload: null,
  custom_Base64UploadRemovePrefix: null,
  custom_BodyUpload: null,
  custom_BodyStringify: null,
  custom_KeywordReplacement: null, //关键词替换
  options_owner: null,//GitHub
  options_repository: null,
  options_SecretId: null, //对象存储
  options_SecretKey: null,
  options_Bucket: null,
  options_AppId: null,
  options_Endpoint: null,
  options_Region: null,
  options_UploadPath: null,
  options_Custom_domain_name: null
}

storagelocal.forEach(function (key) {
  window[key] = null;
});

let uploader;
let cos
let oss
let s3
chrome.storage.local.get(["ProgramConfiguration"], function (result) {
  if (result.ProgramConfiguration) {
    const programConfig = result.ProgramConfiguration || {};
    for (const key in ProgramConfigurations) {
      if (programConfig.hasOwnProperty(key)) {
        ProgramConfigurations[key] = programConfig[key];
      }
    }
  }

  if (ProgramConfigurations.options_exe == 'Tencent_COS') {
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
  }
  if (ProgramConfigurations.options_exe == 'Aliyun_OSS') {
    try {
      oss = new OSS({
        accessKeyId: ProgramConfigurations.options_SecretId,
        accessKeySecret: ProgramConfigurations.options_SecretKey,
        bucket: ProgramConfigurations.options_Bucket,
        endpoint: ProgramConfigurations.options_Endpoint,
        region: ProgramConfigurations.options_Region,
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


  }
  if (ProgramConfigurations.options_exe == 'AWS_S3') {
    //AWS S3区域拼接
    if (!ProgramConfigurations.options_Endpoint) {
      ProgramConfigurations.options_Endpoint = "https://s3." + ProgramConfigurations.options_Region + ".amazonaws.com/"
    }

    try {
      AWS.config.update({
        accessKeyId: ProgramConfigurations.options_SecretId,
        secretAccessKey: ProgramConfigurations.options_SecretKey,
        region: ProgramConfigurations.options_Region,
        endpoint: ProgramConfigurations.options_Endpoint,
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
let fileTypeMap = {
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
  '.doc': 'word',
  '.docx': 'word',
  '.docm': 'word',
  '.dotx': 'word',
  '.dotm': 'word',
  '.xls': 'excel',
  '.xlsx': 'excel',
  '.xlsm': 'excel',
  '.xltx': 'excel',
  '.xltm': 'excel',
  '.xlsb': 'excel',
  '.xlam': 'excel',
  '.ppt': 'powerPoint',
  '.pptx': 'powerPoint',
  '.pptm': 'powerPoint',
  '.ppsx': 'powerPoint',
  '.ppsm': 'powerPoint',
  '.potx': 'powerPoint',
  '.potm': 'powerPoint',
  '.ppam': 'powerPoint',
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
let pluginOptions = chrome.runtime.getURL("options.html");
let currentURL = window.location.href;

chrome.storage.local.get(["ProgramConfiguration"], function (result) {
  if (result.ProgramConfiguration) {
    const programConfig = result.ProgramConfiguration || {};
    for (const key in ProgramConfigurations) {
      if (programConfig.hasOwnProperty(key)) {
        ProgramConfigurations[key] = programConfig[key];
      }
    }
  }
  // 判断跨域开关
  if (ProgramConfigurations.options_proxy_server_state == 0) {
    ProgramConfigurations.options_proxy_server = ""
  }
  if (!ProgramConfigurations.options_proxy_server) {
    ProgramConfigurations.options_proxy_server = ""
  }
  if (ProgramConfigurations.options_exe == "UserDiy") {
    localStorage.options_webtitle = chrome.i18n.getMessage("Custom_Upload")
    localStorage.options_webtitle_status = 0
    return;
  }
  if (ProgramConfigurations.options_exe == "GitHubUP") {
    localStorage.options_webtitle = chrome.i18n.getMessage("GitHub")
    localStorage.options_webtitle_status = 0
    return;
  }
  if (ProgramConfigurations.options_exe == "Tencent_COS") {
    localStorage.options_webtitle = chrome.i18n.getMessage("Tencent_COS")
    localStorage.options_webtitle_status = 0
    return;
  }
  if (ProgramConfigurations.options_exe == "Aliyun_OSS") {
    localStorage.options_webtitle = chrome.i18n.getMessage("Alibaba_OSS")
    localStorage.options_webtitle_status = 0
    return;
  }
  if (ProgramConfigurations.options_exe == "AWS_S3") {
    localStorage.options_webtitle = chrome.i18n.getMessage("AWS_S3")
    localStorage.options_webtitle_status = 0
    return;
  }

  if (ProgramConfigurations.options_host) {
    if (pluginURL != currentURL) {
      return;
    }
    // 自定义ajax函数属性
    if (ProgramConfigurations.options_exe == "Lsky") {
      fetch(ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/v1/profile", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': ProgramConfigurations.options_token
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
    if (ProgramConfigurations.options_exe == "SM_MS") {
      fetch(ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/v2/profile", {
        method: 'POST',
        headers: {
          'Authorization': ProgramConfigurations.options_token
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
  }
  if (localStorage.options_webtitle_status == 1) {
    // 获取web标题
    if (ProgramConfigurations.options_host == "pnglog.com") {
      localStorage.options_webtitle = "盘络图床"
      localStorage.options_webtitle_status = 0 // 不获取
    } else {
      fetch(ProgramConfigurations.options_proxy_server + 'https://' + ProgramConfigurations.options_host)
        .then(response => response.text())
        .then(html => {
          let webtitle = $(html).filter('title').text();
          localStorage.options_webtitle = webtitle
          localStorage.options_webtitle_status = 0
        })
        .catch(error => {
          console.log("标题获取失败,再次尝试获取...");
          fetch('https://cors-anywhere.pnglog.com/https://' + ProgramConfigurations.options_host)
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
  if (currentURL === pluginURL) {
    if (ProgramConfigurations.options_exe != "Lsky" && ProgramConfigurations.options_exe != "SM_MS") {
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
  }

})

function measurePingDelay(getUrl) {
  let startTime = new Date().getTime();
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      let endTime = new Date().getTime();
      let delay = endTime - startTime;
      if (delay > 300) {
        delay = Math.floor(delay / 3);
      } else if (delay < 100) { //小于
        delay = 100
      }
      return delay;
    }
  };
  xhr.onerror = () => {
    return 100;
  };
  xhr.open('GET', getUrl, true);
  xhr.send();
}

function extensionVersion() {
  const options = [
    "extensionVersion",
    "uploadArea",
    "FuncDomain",
    "GlobalUpload",
    "AutoInsert",
    "AutoCopy",
    "Right_click_menu_upload",
    "ImageProxy",
    "EditPasteUpload",
  ];
  chrome.storage.local.get(options, function (result) {
    uploadArea = result.uploadArea || {};
    FuncDomain = result.FuncDomain || {};
    const previousVersion = result.extensionVersion;
    const currentVersion = chrome.runtime.getManifest().version;
    async function updateConfiguration(previousVersion, currentVersion) {
      if (previousVersion !== currentVersion) {
        // 获取并更新程序配置
        await new Promise((resolve, reject) => {
          chrome.storage.local.get(null, function (result) {
            const programConfig = result || {};
            if (!result.ProgramConfiguration) {
              PLNotification({
                title: chrome.i18n.getMessage("app_name") + "：",
                type: "warning",
                content: currentVersion + `版本出现了破坏性修改,正在尝试自动恢复(依然可能会丢失)。`,
                duration: 0,
                saved: true,
              });
              for (const key in ProgramConfigurations) {
                if (programConfig.hasOwnProperty(key)) {
                  ProgramConfigurations[key] = programConfig[key];
                }
              }

              chrome.storage.local.set({ ProgramConfiguration: ProgramConfigurations }, () => {
                setTimeout(function () {
                  PLNotification({
                    title: chrome.i18n.getMessage("app_name") + "：",
                    type: "success",
                    content: `图床配置恢复完成,请查看是否可以正常上传。`,
                    duration: 0,
                    saved: true,
                  });
                }, 1000);
                resolve();
              });

            } else {
              resolve(); // 如果不需要设置也要继续
            }
          });
        });

        // 更新 BedConfig
        await new Promise((resolve, reject) => {
          chrome.storage.sync.get(["BedConfig"], function (result) {
            if (!result.BedConfig) return resolve();
            const newArray = result.BedConfig.map(item => {
              if (!item.data) {
                return {
                  id: crypto.randomUUID(),
                  data: item,
                  ConfigName: item.ConfigName || chrome.i18n.getMessage("Config"),
                };
              } else {
                return { ...item, id: crypto.randomUUID() };
              }
            });
            dbHelper("BedConfigStore").then(result => {
              const { db } = result;
              db.put(newArray).then(() => {
                chrome.storage.sync.remove("BedConfig");
                resolve();
              });
            });
          })
        });
        // 更新 exeButtons
        await new Promise((resolve, reject) => {
          let filteredData = buttonsData.filter(Data => {
            return Data.value === ProgramConfigurations.options_exe;
          });

          let indexedData = filteredData.map((item, index) => {
            return {
              ...item,
              index: 1000 + index
            };
          });
          dbHelper("exeButtons").then(result => {
            // 处理获取到的配置数据
            const { db } = result;
            db.put(indexedData).then(() => {
              resolve();
            })
          })
        });

        // // 最后设置版本号
        await new Promise((resolve, reject) => {
          chrome.storage.local.set({ extensionVersion: currentVersion }, () => {
            resolve()
            window.location.reload();
          });
        });
      }
    }
    updateConfiguration(previousVersion, currentVersion);

    const Defaults = {
      "uploadArea": {
        "uploadArea_width": 32,
        "uploadArea_height": 30,
        "uploadArea_Location": 34,
        "uploadArea_opacity": 0.3,
        "uploadArea_auto_close_time": 2,
        "uploadArea_Left_or_Right": "Right"
      },
      "FuncDomain": {
        "GlobalUpload": "on",
        "AutoInsert": "on",
        "AutoCopy": "off",
        "Right_click_menu_upload": "off",
        "ImageProxy": "off",
        "EditPasteUpload": "off"
      },
    };
    updateMissingProperties(Defaults);
    function updateMissingProperties(defaults) {
      const missingProps = {};
      const newUploadArea = {};
      const newFuncDomain = {};
      for (let key in defaults.uploadArea) {
        if (uploadArea[key] === undefined || uploadArea[key] === null) {
          uploadArea[key] = defaults.uploadArea[key];
          newUploadArea[key] = defaults.uploadArea[key];
          missingProps[key] = defaults.uploadArea[key];
        }
      }
      for (let key in defaults.FuncDomain) {
        if (FuncDomain[key] === undefined || FuncDomain[key] === null) {
          FuncDomain[key] = defaults.FuncDomain[key];
          newFuncDomain[key] = defaults.uploadArea[key];
          missingProps[key] = defaults.FuncDomain[key];
        }
      }
      if (Object.keys(newUploadArea).length > 0) {
        chrome.storage.local.set({ "uploadArea": uploadArea });
      }
      if (Object.keys(newFuncDomain).length > 0) {
        chrome.storage.local.set({ "FuncDomain": FuncDomain });
      }
      if (Object.keys(missingProps).length > 0) {
        setTimeout(function () {
          alert(`${chrome.i18n.getMessage("app_name")}:属性缺失：\n${Object.keys(missingProps).join('\n')}\n请刷新页面将自动恢复默认值`);
        }, 1500);
      }
    }

  });

}
extensionVersion()

// 创建任务队列和处理标志
const taskQueue = [];
let isProcessing = false;

// 处理任务队列中的任务
async function processQueue() {
  if (isProcessing || taskQueue.length === 0) {
    return;
  }

  isProcessing = true;
  const task = taskQueue.shift();
  try {
    await task(); // 执行自定义函数
  } catch (error) {
    console.error(error);
  } finally {
    isProcessing = false;
    processQueue(); // 处理下一个任务
  }
}

// 将任务函数添加到队列
function addToQueue(taskFunction) {
  taskQueue.push(taskFunction);
  processQueue();
}


async function storProgramConfiguration(data) {
  return new Promise((resolve, reject) => {
    const PCLocalStorage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome.storage.local : (typeof browser !== 'undefined' && browser.storage && browser.storage.local) ? browser.storage.local : null;
    if (PCLocalStorage) {
      PCLocalStorage.get("ProgramConfiguration", function (result) {
        if (chrome.runtime.lastError) {
          alert("获取存储数据失败: " + chrome.runtime.lastError);
          reject(false);
        } else {
          const existingData = result.ProgramConfiguration || {};
          const updatedData = { ...existingData, ...data };
          PCLocalStorage.set({ "ProgramConfiguration": updatedData }, function () {
            localStorage.options_webtitle_status = 1
            resolve(true);
          });
        }
      });
    } else {
      alert("该浏览器不支持存储API, 保存失败!");
      reject(false);
    }
  });
}
const buttonsData = [
  {
    id: 'exe_Lsky', value: 'Lsky', dataI18n: 'lsky',
    text: '兰空图床程序', icon: "https://www.lsky.pro/assets/favicon.ico"
  },
  {
    id: 'exe_EasyImages', value: 'EasyImages', dataI18n: 'EasyImages',
    text: '简单图床程序', icon: `<svg t="1714368047818" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3512" width="200" height="200"><path d="M184.5 207.1h751.2v608.2H184.5z" fill="#91B4FF" p-id="3513"></path><path d="M87.8 603c-13.3 0-24.2-10.8-24.2-24.2v-49.2c0-13.3 10.8-24.2 24.2-24.2s24.2 10.8 24.2 24.2v49.2c0 13.4-10.8 24.2-24.2 24.2z" fill="#3778FF" p-id="3514"></path><path d="M935.6 839.4H87.8c-13.3 0-24.2-10.8-24.2-24.2V665.5c0-13.3 10.8-24.2 24.2-24.2s24.2 10.8 24.2 24.2v125.6h799.5V231.2H112v202.1c0 13.3-10.8 24.2-24.2 24.2s-24.2-10.8-24.2-24.2V207.1c0-13.3 10.8-24.2 24.2-24.2h847.8c13.3 0 24.2 10.8 24.2 24.2v608.2c0 13.3-10.8 24.1-24.2 24.1z" fill="#3778FF" p-id="3515"></path><path d="M643.7 836H107.3c-9.7 0-18.5-5.8-22.3-14.8-3.8-9-1.8-19.3 5-26.3L358.3 522c9.1-9.2 25.4-9.2 34.5 0L661 794.8c6.8 7 8.8 17.3 5 26.3-3.8 9-12.6 14.9-22.3 14.9zM165 787.7h421.1L375.5 573.4 165 787.7z" fill="#3778FF" p-id="3516"></path><path d="M927.9 836H638.2c-13.3 0-24.2-10.8-24.2-24.2s10.8-24.2 24.2-24.2h234L672.5 574.3 545.2 710.2c-9.1 9.7-24.4 10.3-34.2 1.1-9.7-9.1-10.2-24.4-1.1-34.2l144.9-154.7c9.1-9.8 26.2-9.8 35.3 0l255.5 272.8c6.6 7 8.4 17.3 4.5 26.1-3.9 9-12.6 14.7-22.2 14.7zM677.8 473.6c-57.2 0-103.7-46.5-103.7-103.7s46.5-103.7 103.7-103.7 103.7 46.5 103.7 103.7-46.6 103.7-103.7 103.7z m0-159.1c-30.5 0-55.4 24.8-55.4 55.4s24.8 55.4 55.4 55.4 55.4-24.8 55.4-55.4-24.9-55.4-55.4-55.4z" fill="#3778FF" p-id="3517"></path></svg>`
  },
  {
    id: 'exe_ImgURL', value: 'ImgURL', dataI18n: 'ImgURL',
    text: 'ImgURL图床程序', icon: "https://www.imgurl.org/favicon.ico"
  },
  {
    id: 'exe_Chevereto', value: 'Chevereto', dataI18n: 'Chevereto',
    text: 'Chevereto图床程序', icon: "https://chevereto.com/app/themes/v3/img/favicon.png"
  },
  {
    id: 'exe_Hellohao', value: 'Hellohao', dataI18n: 'Hellohao',
    text: 'Hellohao图床程序', icon: "https://hellohao.nos-eastchina1.126.net/xpayICO/favicon.ico"
  },
  {
    id: 'exe_SM_MS', value: 'SM_MS', dataI18n: 'SM_MS',
    text: 'SM.MS图床程序', icon: "https://sm.ms/apple-touch-icon.png"
  },
  {
    id: 'exe_Imgur', value: 'Imgur', dataI18n: 'Imgur',
    text: 'Imgur图床程序', icon: "https://images.squarespace-cdn.com/content/v1/59b44ed8ccc5c5736a2f490d/1512027840464-WTX655ZP5KIULZWQXBF2/favicon.ico"
  },
  {
    id: 'exe_Tencent_COS', value: 'Tencent_COS', dataI18n: 'Tencent_COS',
    text: '腾讯云COS', icon: "https://cloud.tencent.com/favicon.ico"
  },
  {
    id: 'exe_Aliyun_OSS', value: 'Aliyun_OSS', dataI18n: 'Alibaba_OSS',
    text: '阿里云OSS', icon: "https://pp.myapp.com/ma_icon/0/icon_42274589_1701749051/256"
  },
  {
    id: 'exe_AWS_S3', value: 'AWS_S3', dataI18n: 'AWS_S3',
    text: 'AWS S3', icon: "https://a0.awsstatic.com/libra-css/images/site/fav/favicon.ico"
  },
  {
    id: 'exe_GitHubUP', value: 'GitHubUP', dataI18n: 'GitHub',
    text: 'GitHub', icon: `<svg t="1703835036367" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="25077" width="200" height="200"><path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#161614" p-id="25078"></path><path d="M411.306667 831.146667c3.413333-5.12 6.826667-10.24 6.826666-11.946667v-69.973333c-105.813333 22.186667-128-44.373333-128-44.373334-17.066667-44.373333-42.666667-56.32-42.666666-56.32-34.133333-23.893333 3.413333-23.893333 3.413333-23.893333 37.546667 3.413333 58.026667 39.253333 58.026667 39.253333 34.133333 58.026667 88.746667 40.96 110.933333 32.426667 3.413333-23.893333 13.653333-40.96 23.893333-51.2-85.333333-10.24-174.08-42.666667-174.08-187.733333 0-40.96 15.36-75.093333 39.253334-102.4-3.413333-10.24-17.066667-47.786667 3.413333-100.693334 0 0 32.426667-10.24 104.106667 39.253334 30.72-8.533333 63.146667-11.946667 95.573333-11.946667 32.426667 0 64.853333 5.12 95.573333 11.946667 73.386667-49.493333 104.106667-39.253333 104.106667-39.253334 20.48 52.906667 8.533333 90.453333 3.413333 100.693334 23.893333 27.306667 39.253333 59.733333 39.253334 102.4 0 145.066667-88.746667 177.493333-174.08 187.733333 13.653333 11.946667 25.6 34.133333 25.6 69.973333v104.106667c0 3.413333 1.706667 6.826667 6.826666 11.946667 5.12 6.826667 3.413333 18.773333-3.413333 23.893333-3.413333 1.706667-6.826667 3.413333-10.24 3.413333h-174.08c-10.24 0-17.066667-6.826667-17.066667-17.066666 0-5.12 1.706667-8.533333 3.413334-10.24z" fill="#FFFFFF" p-id="25079"></path></svg>`
  },
  {
    id: 'exe_Telegra_ph', value: 'Telegra_ph', dataI18n: 'Telegra_ph',
    text: 'Telegra.ph', icon: `<svg t="1703835160925" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27180" data-spm-anchor-id="a313x.search_index.0.i63.57f83a815LXcRO" width="200" height="200"><path d="M512 512m-447 0a447 447 0 1 0 894 0 447 447 0 1 0-894 0Z" fill="#32A8DE" p-id="27181"></path><path d="M711.3 344.7l-77 363.1c-5.8 25.6-20.9 32-42.5 19.9l-117.3-86.3-56.6 54.3c-5.6 7.3-14.4 11.6-23.6 11.5l8.4-119.5L620 391.2c9.5-8.4-2.1-13.1-14.7-4.7L336.7 555.8 221 519.6c-25.2-7.9-25.6-25.2 5.2-37.2l452.6-174.5c20.9-7.9 39.3 4.7 32.5 36.7v0.1z" fill="#FFFFFF" p-id="27182" data-spm-anchor-id="a313x.search_index.0.i62.57f83a815LXcRO" class="selected"></path></svg>`
  },
  // { id: 'exe_BilibliBed', value: 'BilibliBed', text: '哔哩哔哩[后端]' },
  // { id: 'exe_toutiaoBed2', value: 'toutiaoBed2', text: '今日头条2[后端]' },
  { id: 'exe_imgdd', value: 'imgdd', dataI18n: 'IMGDD', text: 'IMGDD图床', icon: `` },
  {
    id: 'exe_freebufBed', value: 'freebufBed',
    text: 'freebuf[免登]', icon: "https://www.freebuf.com/favicon.ico"
  },
  {
    id: 'exe_toutiaoBed', value: 'toutiaoBed',
    text: '今日头条[免登]', icon: `<svg t="1703835457463" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="44446" width="200" height="200"><path d="M182.044444 3.982222h659.911112c98.417778 0 178.062222 79.644444 178.062222 178.062222v659.911112c0 98.417778-79.644444 178.062222-178.062222 178.062222H182.044444C83.626667 1020.017778 3.982222 940.373333 3.982222 841.955556V182.044444C3.982222 83.626667 83.626667 3.982222 182.044444 3.982222z" fill="#FFFFFF" p-id="44447"></path><path d="M841.955556 1024H182.044444c-100.693333 0-182.044444-81.92-182.044444-182.044444V182.044444C0 81.351111 81.351111 0 182.044444 0h659.911112c100.693333 0 182.044444 81.351111 182.044444 182.044444v659.911112c0 100.124444-81.351111 182.044444-182.044444 182.044444zM182.044444 7.964444C85.902222 7.964444 7.964444 85.902222 7.964444 182.044444v659.911112c0 96.142222 77.937778 174.648889 174.648889 174.648888h659.911111c96.142222 0 174.08-77.937778 174.648889-174.648888V182.044444c0-96.142222-77.937778-174.08-174.648889-174.648888L182.044444 7.964444z" fill="#DBDCDC" p-id="44448"></path><path d="M208.782222 291.84l65.422222-97.848889 27.875556 35.271111L341.333333 164.977778l61.44 114.915555V156.444444H141.653333v172.942223h261.12v-37.546667H208.782222z m-36.977778-100.124444c0-9.102222 5.688889-17.066667 13.653334-21.048889s18.204444-1.706667 24.462222 5.12c6.257778 6.257778 8.533333 15.928889 5.12 24.462222s-11.946667 13.653333-21.048889 13.653333c-12.515556 0-22.186667-9.671111-22.186667-22.186666z m515.982223-35.271112h195.128889v28.444445h-195.128889v-28.444445z m0 54.613334h195.128889v28.444444h-195.128889v-28.444444z m0-108.657778h195.128889v28.444444h-195.128889v-28.444444z m-253.724445 54.044444h221.297778v28.444445H434.062222v-28.444445z m0 54.613334h221.297778v28.444444H434.062222v-28.444444z m0-108.657778h221.297778v28.444444H434.062222v-28.444444zM141.084444 838.542222h514.275556v28.444445H141.084444v-28.444445z m0 54.613334h514.275556v28.444444H141.084444v-28.444444z m0-108.657778h514.275556v28.444444H141.084444v-28.444444z m546.702223 54.044444h195.128889v28.444445h-195.128889v-28.444445z m0 54.613334h195.128889v28.444444h-195.128889v-28.444444z m0-108.657778h195.128889v28.444444h-195.128889v-28.444444zM158.151111 102.4h4.551111c1.137778 0 2.844444 0.568889 3.982222 1.706667 1.137778 0.568889 1.706667 1.706667 2.275556 2.844444 0.568889 1.137778 1.137778 2.844444 0.568889 3.982222 0 1.706667-0.568889 3.413333-1.137778 4.551111-1.137778 1.137778-2.275556 2.275556-3.982222 2.844445 2.275556 0.568889 3.982222 1.706667 5.12 3.413333 2.275556 3.413333 2.844444 7.395556 1.137778 10.808889-0.568889 1.137778-1.706667 2.275556-2.844445 3.413333-1.137778 1.137778-2.844444 1.706667-3.982222 1.706667-1.706667 0.568889-2.844444 0.568889-4.551111 0.568889h-18.204445V102.4h17.066667z m-1.137778 14.222222c1.137778 0 2.275556-0.568889 3.413334-1.137778 1.137778-0.568889 1.706667-2.275556 1.137777-3.413333v-2.275555c-0.568889-0.568889-0.568889-1.137778-1.137777-1.137778-0.568889-0.568889-1.137778-0.568889-1.706667-0.568889h-9.671111v8.533333h7.964444z m0 15.928889h2.275556c0.568889 0 1.137778-0.568889 1.706667-0.568889 0.568889-0.568889 1.137778-1.137778 1.137777-1.706666 0.568889-0.568889 0.568889-1.706667 0.568889-2.275556 0-1.706667-0.568889-2.844444-1.706666-3.982222-1.137778-1.137778-2.844444-1.137778-3.982223-1.137778h-8.533333v10.24l8.533333-0.568889z m27.306667 13.084445c-1.706667 1.137778-3.982222 1.706667-5.688889 1.137777h-4.551111v-6.257777h3.982222c0.568889 0 1.706667-0.568889 2.275556-1.137778 0.568889-0.568889 0.568889-1.137778 0.568889-2.275556v-1.706666l-9.102223-24.462223h7.964445l5.688889 18.204445 5.12-17.635556h7.395555l-10.808889 29.582222c-0.568889 1.706667-1.137778 3.413333-2.844444 4.551112z m36.408889-34.133334l-3.413333 4.551111h-5.12v13.653334c0 0.568889 0 1.706667 0.568888 2.275555 0.568889 0.568889 1.706667 1.137778 2.275556 0.568889h2.275556v5.688889H209.92c-1.137778 0-1.706667-0.568889-2.844444-1.137778-0.568889-0.568889-1.706667-1.137778-1.706667-1.706666-0.568889-1.137778-0.568889-2.275556-0.568889-3.413334v-15.928889h-4.551111v-4.551111h4.551111v-3.982222l7.395556-3.413333v7.395555h8.533333z m46.08-9.102222c2.275556 0 4.551111 0.568889 6.257778 1.137778 1.706667 0.568889 3.982222 1.706667 5.12 3.413333 1.706667 1.706667 2.844444 3.413333 3.413333 5.688889 1.137778 2.275556 1.137778 5.12 1.137778 7.964444 0 2.275556-0.568889 5.12-1.137778 7.395556s-1.706667 3.982222-2.844444 5.688889c-1.137778 1.706667-2.844444 2.844444-5.12 3.982222-2.275556 1.137778-4.551111 1.706667-7.395556 1.137778H250.311111V102.4h16.497778z m0 29.582222h3.413333c1.137778-0.568889 2.275556-1.137778 2.844445-1.706666 1.137778-1.137778 1.706667-2.275556 2.275555-3.413334 0.568889-1.706667 0.568889-3.413333 0.568889-5.12 0-1.706667 0-3.413333-0.568889-5.12 0-1.137778-1.137778-2.844444-1.706666-3.982222-0.568889-1.137778-1.706667-1.706667-3.413334-2.275556-1.706667-0.568889-3.413333-1.137778-5.12-0.568888h-5.688889v22.755555l7.395556-0.568889z m97.848889-3.982222c-0.568889 2.844444-2.844444 4.551111-5.688889 5.12-5.688889 0-6.257778-7.395556-6.257778-7.395556v-1.706666s0-7.395556 6.257778-7.395556c2.844444 0 5.12 2.275556 5.688889 5.12h6.826666c-1.137778-5.688889-6.257778-10.24-12.515555-10.24-6.826667 0-12.515556 5.12-13.084445 11.946667v3.982222c0.568889 6.826667 6.257778 11.946667 13.084445 11.946667 6.257778 0 11.377778-3.982222 12.515555-10.24l-6.826666-1.137778z m32.426666-1.706667h3.413334v-3.413333c0-6.826667-5.688889-12.515556-13.084445-12.515556-6.826667 0-12.515556 5.12-13.084444 11.946667v3.982222c0.568889 6.826667 6.257778 11.946667 13.084444 11.946667 5.688889 0 10.808889-3.413333 12.515556-8.533333H392.533333c-1.137778 1.706667-2.844444 3.413333-5.12 3.413333-4.551111 0-5.688889-4.551111-5.688889-6.826667h15.36z m-9.671111-9.671111c3.982222 0 5.12 3.413333 5.688889 5.688889h-10.808889c0.568889-2.844444 1.706667-5.688889 5.12-5.688889z m-143.928889 9.671111h3.413334v-3.413333c0-6.826667-5.688889-12.515556-13.084445-12.515556-6.826667 0-12.515556 5.12-12.515555 11.946667v3.982222c0.568889 6.826667 6.257778 11.946667 12.515555 11.946667 5.688889 0 10.808889-3.413333 11.946667-8.533333h-7.395556c-0.568889 2.275556-2.844444 3.413333-5.12 3.413333-4.551111 0-5.688889-4.551111-5.688888-6.826667h15.928888z m-9.671111-9.671111c2.844444 0 5.12 2.844444 5.688889 5.688889h-10.808889c0.568889-2.844444 2.275556-5.688889 5.12-5.688889z m79.075556-4.551111h-7.964445c-1.706667-0.568889-3.413333-1.137778-5.688888-1.137778-6.826667 0-12.515556 5.12-12.515556 11.946667v3.982222c0.568889 6.826667 5.688889 11.946667 12.515556 11.946667 2.275556 0 4.551111-0.568889 6.826666-1.706667l6.257778 1.706667v-26.737778z m-13.084445 21.048889c-5.688889 0-5.688889-7.395556-5.688888-7.395556v-1.706666s0-7.395556 5.688888-7.395556 5.688889 7.395556 5.688889 7.395556v1.706666c0.568889 0 0 7.395556-5.688889 7.395556z m42.097778-14.222222c-0.568889-4.551111-3.982222-7.964444-8.533333-7.964445-3.413333 0-6.257778 1.137778-8.533333 3.413334l-7.395556-2.275556v26.737778h7.395556v-15.36c0-7.395556 6.257778-6.826667 6.257777-6.826667 4.551111 0 3.982222 6.257778 3.982223 6.257778v15.928889h7.395555v-15.928889c-0.568889-2.275556-0.568889-3.982222-0.568889-3.982222z" fill="#DBDCDC" p-id="44449"></path><path d="M0 220.16V841.955556c0 5.12 0 10.808889 0.568889 15.928888L1024 799.857778V182.044444c0-5.12 0-10.808889-0.568889-15.928888L0 220.16z" fill="#E62318" p-id="44450"></path><path d="M915.342222 577.991111v-48.355555l-153.6 8.533333v-24.462222l-73.955555 3.982222v24.462222l-153.6 8.533333v48.355556l153.6-8.533333v106.951111l73.955555-3.982222v-106.951112l153.6-8.533333z" fill="#FFFFFF" p-id="44451"></path><path d="M534.186667 488.675556v48.355555l52.906666-2.844444 135.964445-67.128889 138.808889 51.2 53.475555-2.844445v-48.355555l-35.271111 2.275555-91.591111-33.564444L910.222222 376.035556V291.271111l-73.955555 3.982222-170.666667 9.671111-59.164444-27.875555-75.662223 119.466667 62.577778 22.755555 40.391111-63.715555 201.955556-11.377778v11.946666l-112.64 55.182223-87.608889-32.426667-29.582222 44.942222 51.768889 19.342222-88.746667 43.804445-34.702222 1.706667z m341.333333 105.813333l-73.955556 3.982222 54.044445 89.884445 73.955555-3.982223-54.044444-89.884444zM534.755556 707.128889l73.955555-3.982222 49.493333-95.573334-73.955555 3.982223-49.493333 95.573333z m-175.786667-109.226667l58.595555 114.915556 81.92-3.982222-58.595555-114.915556-81.92 3.982222zM282.168889 514.275556L222.435556 438.613333l-81.351112 4.551111 59.733334 75.093334 81.351111-3.982222z m0-94.435556L222.435556 344.746667l-81.351112 4.551111 59.733334 75.662222 81.351111-5.12z" fill="#FFFFFF" p-id="44452"></path><path d="M352.711111 584.817778l136.533333-7.964445v-48.355555l-91.022222 5.12V320.284444L324.266667 324.266667v213.333333l-216.177778 12.515556v48.355555l150.186667-8.533333-66.56 87.608889-81.351112 5.12v48.355555l137.102223-7.964444L352.711111 584.817778z" fill="#FFFFFF" p-id="44453"></path></svg>`
  },
  {
    id: 'exe_BaiJiaHaoBed', value: 'BaiJiaHaoBed',
    text: '百度[登录]', icon: "https://www.baidu.com/favicon.ico",
  },
  {
    id: 'exe_UserDiy', value: 'UserDiy', dataI18n: 'Custom_Upload',
    text: '自定义上传', icon: `<svg t="1703835600065" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="57776" width="200" height="200"><path d="M0 0m214.38 0l595.24 0q214.38 0 214.38 214.38l0 595.24q0 214.38-214.38 214.38l-595.24 0q-214.38 0-214.38-214.38l0-595.24q0-214.38 214.38-214.38Z" fill="#00CE8C" p-id="57777"></path><path d="M578.78 535.07l-56.07 56.08-89.72-89.71 52.34-52.29-26.17-26.16-52.33 52.33-52.33-52.33-63.58 63.49a172 172 0 0 0-14.95 228l-86 89.71 26.17 26.16 86-86c29.9 26.16 67.28 37.38 104.66 37.38 44.86 0 89.71-18.69 123.35-52.33l63.55-63.55-48.6-48.59 56.07-56.07z m-74.76 164.47c-26.17 26.17-59.81 41.12-93.45 41.12s-67.29-11.21-89.71-37.38l-3.74-3.74c-48.59-48.59-48.59-130.82 3.74-183.16l33.64-33.64L537.66 665.9z m328.9-482.19l-26.13-26.2-82.23 78.5c-29.91-26.17-67.29-37.38-104.67-37.38-44.85 0-89.71 18.69-123.35 52.33l-63.55 59.81 243 243 59.81-59.81a172 172 0 0 0 14.95-228z m-127 280.34l-30 29.91L492.8 344.44l29.91-29.9c26.16-26.17 59.8-41.12 93.45-41.12s67.28 11.21 89.71 37.38l3.73 3.74c52.32 48.61 48.6 130.82-3.68 183.15z m0 0" fill="#FFFFFF" p-id="57778"></path></svg>`
  }
];

function createImageHostingButton(buttonInfo) {
  let imgIcon = createButtonIconMarkup(buttonInfo.icon);
  let dataI18nAttribute = buttonInfo.dataI18n ? `data-i18n="${buttonInfo.dataI18n}"` : "";
  let button = $(`
  <button  type="button"  class="Animation_button2" value="${buttonInfo.value}">
    <span class="icon">${imgIcon}</span>
    <span class="Animation_button_span" ${dataI18nAttribute}>${buttonInfo.text}</span>
  </button>
  `
  );
  if (buttonInfo.data) {

  }
  return button;
}
function createButtonIconMarkup(icon, w = 32, h = 32) {
  if (icon && icon.trim().startsWith('<svg')) {
    return icon;
  } else if (icon) {
    return `<img src="${icon}"class="icon" />`;
  } else {
    return `<svg t="1703817171733" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
    p-id="11159" width="${w}" height="${h}">
    <path
        d="M432.718512 194.015006H916.517638c21.847665 0 39.559857 17.522773 39.559857 39.134945v564.763883c0 21.616267-17.712192 39.132897-39.559857 39.132897H105.718208c-21.847665 0-39.561905-17.51663-39.561906-39.132897v-564.764907c0-21.612171 17.71424-39.134945 39.561906-39.134945h327.000304z"
        fill="#FFFFFF" p-id="11160"></path>
    <path
        d="M916.516614 220.416913c7.255251 0 13.15795 5.712256 13.15795 12.732014v564.763883c0 7.019758-5.902699 12.73099-13.15795 12.73099H105.718208c-7.256275 0-13.158974-5.711232-13.158975-12.73099V233.148927c0-7.020782 5.902699-12.732014 13.158975-12.732014h810.798406m0-26.401907H105.718208c-21.847665 0-39.561905 17.522773-39.561906 39.133921v564.763883c0 21.616267 17.71424 39.132897 39.561906 39.132897h810.798406c21.847665 0 39.560881-17.51663 39.560881-39.132897V233.148927c0-21.611148-17.713216-39.133921-39.560881-39.133921z"
        fill="#4E6DC4" p-id="11161"></path>
    <path
        d="M934.895356 796.822372c0 12.132017-13.619723 21.96746-30.421681 21.96746H120.391508c-16.800934 0-30.421681-9.835442-30.421681-21.96746v-83.544947s98.066713-164.881373 169.187835-161.261939c33.551698 1.707841 152.003968 87.402947 238.010335 87.402947 84.053818 0 123.329035-179.371398 237.161534-179.371398 61.054282 0 200.564801 109.915114 200.564801 109.915113v226.860224z"
        fill="#DCE5F7" p-id="11162"></path>
    <path
        d="M904.478794 831.996928H120.391508c-24.468811 0-43.625706-15.444286-43.625706-35.168413v-83.55109c0-2.372342 0.645048-4.705777 1.856304-6.742285 10.339194-17.404003 104.976915-171.982018 181.206201-167.702177 15.276369 0.773033 39.048939 12.801638 71.948422 29.444894 48.331483 24.449358 114.529765 57.941671 165.388197 57.94167 32.319964 0 59.920841-36.109364 89.146623-74.340217 37.617547-49.233526 80.276705-105.035276 148.023102-105.035277 63.788056 0 194.084631 101.205945 208.730286 112.744109a13.230646 13.230646 0 0 1 5.027277 10.370935v226.868414c-0.001024 19.725151-19.157918 35.169437-43.61342 35.169437zM103.167709 716.938839v79.889676c0 3.493497 6.871294 8.766506 17.223799 8.766506h784.087286c10.352505 0 17.210488-5.273009 17.210489-8.766506V576.405459c-41.614795-32.106996-142.969203-103.159518-187.355656-103.159519-54.70005 0-91.480058 48.124658-127.047787 94.664342-33.299822 43.561201-64.755627 84.711152-110.120914 84.711152-57.16147 0-126.596253-35.129505-177.312365-60.783976-25.409762-12.852832-51.670373-26.144912-61.36452-26.640472l-1.650503-0.038908c-50.819524 0-126.325947 106.691923-153.669829 151.780761z"
        fill="#4E6DC4" p-id="11163"></path>
    <path
        d="M290.78548 382.564513m-65.512279 0a65.512279 65.512279 0 1 0 131.024558 0 65.512279 65.512279 0 1 0-131.024558 0Z"
        fill="#FFFFFF" p-id="11164"></path>
    <path
        d="M290.806982 461.276721l-1.250164-0.006143c-21.026509-0.328667-40.660534-8.823844-55.29288-23.927176-14.632345-15.096165-22.509095-34.994353-22.186571-56.014719 0.670645-42.716496 35.968068-77.472283 78.690707-77.472283 22.276673 0.334811 41.910698 8.831011 56.543043 23.93332 14.632345 15.096165 22.495784 34.988209 22.173261 56.008575-0.669621 42.721615-35.967044 77.478426-78.677396 77.478426z m0.786344-131.012271c-29.225783 0-52.675828 23.088614-53.114052 51.476859-0.219111 13.975011 5.01499 27.195418 14.748045 37.224375 9.720767 10.036124 22.767114 15.682852 36.741101 15.901963l0.837538 13.207097v-13.200954c28.387221 0 51.837266-23.095781 52.275489-51.489145 0.219111-13.967844-5.01499-27.188251-14.734734-37.224375-9.720767-10.029981-22.767114-15.676708-36.741101-15.89582h-0.012286z"
        fill="#4E6DC4" p-id="11165"></path>
</svg>`;
  }
}
function createIconMarkup(data) {
  const match = buttonsData.find(button => button.value === data.data.options_exe);
  let icon = match.icon
  if (icon && icon.trim().startsWith('<svg')) {
    return icon;
  } else if (icon) {
    return `<img src="${icon}"class="icon" />`;
  } else {
    return `<svg t="1703817171733" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
    p-id="11159" width="32" height="32">
    <path
        d="M432.718512 194.015006H916.517638c21.847665 0 39.559857 17.522773 39.559857 39.134945v564.763883c0 21.616267-17.712192 39.132897-39.559857 39.132897H105.718208c-21.847665 0-39.561905-17.51663-39.561906-39.132897v-564.764907c0-21.612171 17.71424-39.134945 39.561906-39.134945h327.000304z"
        fill="#FFFFFF" p-id="11160"></path>
    <path
        d="M916.516614 220.416913c7.255251 0 13.15795 5.712256 13.15795 12.732014v564.763883c0 7.019758-5.902699 12.73099-13.15795 12.73099H105.718208c-7.256275 0-13.158974-5.711232-13.158975-12.73099V233.148927c0-7.020782 5.902699-12.732014 13.158975-12.732014h810.798406m0-26.401907H105.718208c-21.847665 0-39.561905 17.522773-39.561906 39.133921v564.763883c0 21.616267 17.71424 39.132897 39.561906 39.132897h810.798406c21.847665 0 39.560881-17.51663 39.560881-39.132897V233.148927c0-21.611148-17.713216-39.133921-39.560881-39.133921z"
        fill="#4E6DC4" p-id="11161"></path>
    <path
        d="M934.895356 796.822372c0 12.132017-13.619723 21.96746-30.421681 21.96746H120.391508c-16.800934 0-30.421681-9.835442-30.421681-21.96746v-83.544947s98.066713-164.881373 169.187835-161.261939c33.551698 1.707841 152.003968 87.402947 238.010335 87.402947 84.053818 0 123.329035-179.371398 237.161534-179.371398 61.054282 0 200.564801 109.915114 200.564801 109.915113v226.860224z"
        fill="#DCE5F7" p-id="11162"></path>
    <path
        d="M904.478794 831.996928H120.391508c-24.468811 0-43.625706-15.444286-43.625706-35.168413v-83.55109c0-2.372342 0.645048-4.705777 1.856304-6.742285 10.339194-17.404003 104.976915-171.982018 181.206201-167.702177 15.276369 0.773033 39.048939 12.801638 71.948422 29.444894 48.331483 24.449358 114.529765 57.941671 165.388197 57.94167 32.319964 0 59.920841-36.109364 89.146623-74.340217 37.617547-49.233526 80.276705-105.035276 148.023102-105.035277 63.788056 0 194.084631 101.205945 208.730286 112.744109a13.230646 13.230646 0 0 1 5.027277 10.370935v226.868414c-0.001024 19.725151-19.157918 35.169437-43.61342 35.169437zM103.167709 716.938839v79.889676c0 3.493497 6.871294 8.766506 17.223799 8.766506h784.087286c10.352505 0 17.210488-5.273009 17.210489-8.766506V576.405459c-41.614795-32.106996-142.969203-103.159518-187.355656-103.159519-54.70005 0-91.480058 48.124658-127.047787 94.664342-33.299822 43.561201-64.755627 84.711152-110.120914 84.711152-57.16147 0-126.596253-35.129505-177.312365-60.783976-25.409762-12.852832-51.670373-26.144912-61.36452-26.640472l-1.650503-0.038908c-50.819524 0-126.325947 106.691923-153.669829 151.780761z"
        fill="#4E6DC4" p-id="11163"></path>
    <path
        d="M290.78548 382.564513m-65.512279 0a65.512279 65.512279 0 1 0 131.024558 0 65.512279 65.512279 0 1 0-131.024558 0Z"
        fill="#FFFFFF" p-id="11164"></path>
    <path
        d="M290.806982 461.276721l-1.250164-0.006143c-21.026509-0.328667-40.660534-8.823844-55.29288-23.927176-14.632345-15.096165-22.509095-34.994353-22.186571-56.014719 0.670645-42.716496 35.968068-77.472283 78.690707-77.472283 22.276673 0.334811 41.910698 8.831011 56.543043 23.93332 14.632345 15.096165 22.495784 34.988209 22.173261 56.008575-0.669621 42.721615-35.967044 77.478426-78.677396 77.478426z m0.786344-131.012271c-29.225783 0-52.675828 23.088614-53.114052 51.476859-0.219111 13.975011 5.01499 27.195418 14.748045 37.224375 9.720767 10.036124 22.767114 15.682852 36.741101 15.901963l0.837538 13.207097v-13.200954c28.387221 0 51.837266-23.095781 52.275489-51.489145 0.219111-13.967844-5.01499-27.188251-14.734734-37.224375-9.720767-10.029981-22.767114-15.676708-36.741101-15.89582h-0.012286z"
        fill="#4E6DC4" p-id="11165"></path>
</svg>`;
  }
}
function createFrameworkModule() {
  return $(`
  <div class="overlay">
    <div class="content">
        
    </div>
  </div>
  `);
}
function loadButtonModule() {
  let welcomeContent = createFrameworkModule()
  welcomeContent.find('.content').append(`
      <div class="title">
          <h2>选择程序</h1>
      </div>
      <div class="cardsSort">
          <div class="cards">
          </div>
      </div>
      <div class="welcomeContentButton">
          <div class="button-borders">
              <button class="primary-button"> 关闭 / 完成
              </button>
          </div>
          <div class="cntr">
              <input type="checkbox" id="buttonModuleSelect" class="hidden-xs-up">
              <label for="buttonModuleSelect" class="buttonModuleSelect"></label>
          </div>
      </div>
  `)
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', "pink", "lime", "teal", "indigo", "brown", "cyan", "grey", "deepOrange", "lightBlue", "lightGreen", "deepPurple"
  ];
  buttonsData.forEach(function (element, index) {
    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    let imgIcon = createButtonIconMarkup(element.icon);
    let item = $(`
      <div class="card  ${randomColor}">
          ${imgIcon}
          <p class="tip" data-id="${element.id}" vlaue="${element.value}">${chrome.i18n.getMessage(`${element.dataI18n}`) || element.text}</p>
      </div>
      `);
    item.click(function (e) {
      item.toggleClass("active")
    });
    welcomeContent.find(".cards").append(item)
  })
  welcomeContent.click(function (e) {
    if (e.target.className === "overlay") {
      if ($(".sidebar .buttons button").length < 1) {
        return;
      }
      welcomeContent.remove();
    }
  })
  welcomeContent.find(".primary-button").click(function () {
    let actives = []
    let active = $(".cards .active");
    if (active.length === 0) {
      overlayElement.remove();
      welcomeContent.remove();
      return;
    }
    active.each(function (index, element) {
      let value = $(element).find(".tip").attr("vlaue");
      actives.push(value)
    })
    let filteredData = buttonsData.filter(button => actives.includes(button.value));
    let indexedData = filteredData.map((item, index) => {
      return {
        ...item, // 展开原始对象
        index    // 添加 index 属性
      };
    });
    console.log(indexedData);
    dbHelper("exeButtons").then(result => {
      // 处理获取到的配置数据
      const { db } = result;
      db.clear().then(result => {
        db.put(indexedData).then(result => {
          window.location.reload();
        }).catch(error => {
          console.error("Put failed: ", error);
        });
      })

    }).catch(error => {
      console.error("Error opening database:", error);
    });

  })
  welcomeContent.find("#buttonModuleSelect").change(function () {
    let cards = welcomeContent.find(".cards .card"); // 获取所有的.card元素
    if (this.checked) {
      cards.each(function () {
        $(this).toggleClass("active"); // 为每个元素切换.active类
      });
    } else {
      cards.each(function () {
        $(this).removeClass("active"); // 为每个元素移除.active类
      });
    }
  });


  $("body").append(welcomeContent)
  dbHelper("exeButtons").then(result => {
    // 处理获取到的配置数据
    const { db } = result;
    db.getAll().then(result => {
      result.forEach(element => {
        welcomeContent.find(`.cards p[data-id=` + element.id + `]`).parent().addClass("active")
      });
    })
  }).catch(error => {
    reject(error);
  });
}
async function storExeButtons(data) {
  return new Promise((resolve, reject) => {
    let filteredData = buttonsData.filter(Data => {
      return Data.value === data.data.options_exe;
    });

    let indexedData = filteredData.map((item, index) => {
      return {
        ...item,
        index: 1000 + index
      };
    });
    if (indexedData.length < 1) {
      reject("按钮组未找到匹配的数据")
    }
    storProgramConfiguration(data.data)
      .then(() => {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
          chrome.storage.local.set({ "exeButtons": indexedData }, function () {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(true);
            }
          });
        } else {
          dbHelper("exeButtons").then(result => {
            // 处理获取到的配置数据
            const { db } = result;
            db.put(indexedData).then(() => {
              resolve(true);
            })
          }).catch(error => {
            reject(error);
          });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function replaceKeywordsInText(text, keywords, replacements) {
  if (keywords.length != replacements.length) {
    return text;
  }
  for (let i = 0; i < keywords.length; i++) {
    let keyword = keywords[i];
    let replacement = replacements[i];
    text = text.replace(new RegExp(keyword, 'g'), replacement);
  }
  return text;
}
function debounce(func, delay) {
  let debounceTimer;
  return function(...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
          func.apply(this, args);
      }, delay);
  };
}