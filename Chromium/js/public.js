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
  { id: 'exe_Lsky', value: 'Lsky', dataI18n: 'lsky', text: '兰空图床程序' },
  { id: 'exe_EasyImages', value: 'EasyImages', dataI18n: 'EasyImages', text: '简单图床程序' },
  { id: 'exe_ImgURL', value: 'ImgURL', dataI18n: 'ImgURL', text: 'ImgURL图床程序' },
  { id: 'exe_Chevereto', value: 'Chevereto', dataI18n: 'Chevereto', text: 'Chevereto图床程序' },
  { id: 'exe_Hellohao', value: 'Hellohao', dataI18n: 'Hellohao', text: 'Hellohao图床程序' },
  { id: 'exe_SM_MS', value: 'SM_MS', dataI18n: 'SM_MS', text: 'SM.MS图床程序' },
  { id: 'exe_Imgur', value: 'Imgur', dataI18n: 'Imgur', text: 'Imgur图床程序' },
  { id: 'exe_Tencent_COS', value: 'Tencent_COS', dataI18n: 'Tencent_COS', text: '腾讯云COS' },
  { id: 'exe_Aliyun_OSS', value: 'Aliyun_OSS', dataI18n: 'Alibaba_OSS', text: '阿里云OSS' },
  { id: 'exe_AWS_S3', value: 'AWS_S3', dataI18n: 'AWS_S3', text: 'AWS S3' },
  { id: 'exe_GitHubUP', value: 'GitHubUP', dataI18n: 'GitHub', text: 'GitHub' },
  { id: 'exe_Telegra_ph', value: 'Telegra_ph', dataI18n: 'Telegra_ph', text: 'Telegra.ph' },
  // { id: 'exe_BilibliBed', value: 'BilibliBed', text: '哔哩哔哩[后端]' },
  // { id: 'exe_toutiaoBed2', value: 'toutiaoBed2', text: '今日头条2[后端]' },
  { id: 'exe_imgdd', value: 'imgdd', dataI18n: 'IMGDD', text: 'IMGDD图床' },
  { id: 'exe_fiftyEight', value: 'fiftyEight', text: '58同城(免登)' },
  { id: 'exe_freebufBed', value: 'freebufBed', text: 'freebuf[免登]' },
  { id: 'exe_toutiaoBed', value: 'toutiaoBed', text: '今日头条[免登]' },
  { id: 'exe_BaiJiaHaoBed', value: 'BaiJiaHaoBed', text: '百度[登录]' },
  { id: 'exe_UserDiy', value: 'UserDiy', dataI18n: 'Custom_Upload', text: '自定义上传' }
];

function createImageHostingButton(buttonInfo) {
  let dataI18nAttribute = buttonInfo.dataI18n ? `data-i18n="${buttonInfo.dataI18n}"` : "";
  let button = $(`
  <button  type="button" id="${buttonInfo.id}" class="Animation_button2" value="${buttonInfo.value}">
    <span class="Animation_button_span" ${dataI18nAttribute}>${buttonInfo.text}</span>
    <span class="icon">
    <svg t="1702387568078"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5081" width="200" height="200"><path d="M512 1023.999431a510.406544 510.406544 0 0 0 362.040487-149.958944A510.406544 510.406544 0 0 0 1023.999431 512a510.406544 510.406544 0 0 0-149.958944-362.040487A510.406544 510.406544 0 0 0 512 0.000569a510.406544 510.406544 0 0 0-362.040487 149.958944A510.406544 510.406544 0 0 0 0.000569 512a510.406544 510.406544 0 0 0 149.958944 362.040487A510.406544 510.406544 0 0 0 512 1023.999431z" fill="#00CC52" p-id="5082"></path><path d="M455.111174 602.225678L324.665097 471.7796a56.888826 56.888826 0 0 0-80.440799 80.4408l170.666477 170.666477a56.888826 56.888826 0 0 0 80.440799 0l312.888541-312.888541a56.888826 56.888826 0 1 0-80.440799-80.4408L455.111174 602.225678z" fill="#FFFFFF" p-id="5083"></path></svg>
    </span>
  </button>
  `
  );
  return button;
}

function loadButtonModule() {
  let welcomeContent = $(`
<div class="overlay">
  <div class="content">
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
  </div>
</div>
`);
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', "pink", "lime", "teal", "indigo", "brown", "cyan", "grey", "deepOrange", "lightBlue", "lightGreen", "deepPurple"
  ];
  buttonsData.forEach(function (element, index) {
    let randomColor = colors[Math.floor(Math.random() * colors.length)];

    let item = $(`
      <div class="card ${randomColor}">
          <p class="tip" vlaue="${element.value}">${chrome.i18n.getMessage(`${element.dataI18n}`) || element.text}</p>
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
        welcomeContent.find(`.cards p[vlaue=` + element.value + `]`).parent().addClass("active")
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
