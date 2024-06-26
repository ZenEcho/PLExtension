function showNotification(title, message, onClickCallback) {
	if (!title) {
		title = chrome.i18n.getMessage("app_name")
	}
	chrome.notifications.create({
		type: 'basic',
		title: title,
		message: message,
		iconUrl: 'icons/logo32.png'
	}, function () { });

	if (onClickCallback) {
		chrome.notifications.onClicked.addListener(onClickCallback);
	}
}
// 安装时的初始化
let browser_Open_with
chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason === "install") {
		try {
			if (window.navigator.userAgent.indexOf('Firefox') > -1) {
				chrome.storage.local.set({ 'browser_Open_with': 1 }, function () {
					chrome.tabs.create({
						'url': ('popup.html')
					});
					console.log(chrome.i18n.getMessage("Installing_initialization"));
				});
			} else {
				chrome.storage.local.set({ 'browser_Open_with': 3 }, function () {
					chrome.action.setPopup({
						popup: "popup.html"
					});
					console.log(chrome.i18n.getMessage("Installing_initialization"));
				});
			}
			const currentVersion = chrome.runtime.getManifest().version;
			chrome.storage.local.set({ extensionVersion: currentVersion });
		} catch (error) {
			chrome.storage.local.set({ 'browser_Open_with': 1 }, function () {
				chrome.tabs.create({
					'url': ('popup.html')
				});
				console.log(chrome.i18n.getMessage("Installing_initialization"));
			});
		}
		chrome.storage.local.set({
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
				"Right_click_menu_upload": "on",
				"ImageProxy": "off",
				"EditPasteUpload": "off"
			},
			"StickerOptional": 0, //自选贴纸格式开关
			"StickerCodeSelect": "URL", //贴纸格式
			"StickerURL": "https://plextension-sticker.pnglog.com/sticker.json" //贴纸链接
		});
		chrome.contextMenus.create({
			title: chrome.i18n.getMessage("Right_click_menu_upload_prompt"),
			contexts: ["image"],
			id: "upload_imagea"
		})

		chrome.storage.local.get(["browser_Open_with"], function (result) {
			browser_Open_with = result.browser_Open_with
			showNotification(null, chrome.i18n.getMessage("Installing_initialization_completed"), function () {
				chrome.tabs.create({
					'url': ('options.html')
				});
			})
		});
	}
	if (details.reason === 'update') {
		chrome.storage.local.get(['extensionVersion'], function (result) {
			const previousVersion = result.extensionVersion;
			const currentVersion = chrome.runtime.getManifest().version;
			if (previousVersion !== currentVersion) {
				console.log("升级..");
			}
		});
	}
});

chrome.storage.local.get(["FuncDomain"], function (result) {
	if (result.FuncDomain && result.FuncDomain.Right_click_menu_upload == "on") {
		chrome.contextMenus.create({
			title: chrome.i18n.getMessage("Right_click_menu_upload_prompt"),
			contexts: ["image"],
			id: "upload_imagea"
		}, function () {
			if (chrome.runtime.lastError) {
				console.log("Menu item created successfully.");
			} else {
				return;
			}
		});
	}
})



chrome.contextMenus.onClicked.addListener(function (info) {
	if (info.menuItemId === "upload_imagea") {
		const imgUrl = info.srcUrl;
		Fetch_Upload(imgUrl, null, "Right_Upload")
	}

});
let ProgressDATA = []; // 保存创建的进度条元素
function Fetch_Upload(imgUrl, data, MethodName, callback) {
	if (Simulated_upload == true) {
		chrome.tabs.query({ active: true }, function (tabs) {
			let currentTabId
			try {
				currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { Demonstration_middleware: "Right_click_100" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			} catch (error) {
			}
		});
		return;
	}
	if (typeof callback !== 'function') {
		callback = function () { };
	}
	chrome.storage.local.get(["ProgramConfiguration", "FuncDomain"], function (result) {
		let options_exe = result.ProgramConfiguration.options_exe
		let options_proxy_server_state = result.ProgramConfiguration.options_proxy_server_state
		let options_proxy_server = result.ProgramConfiguration.options_proxy_server
		let options_host = result.ProgramConfiguration.options_host
		let options_token = result.ProgramConfiguration.options_token
		let options_uid = result.ProgramConfiguration.options_uid
		let options_source = result.ProgramConfiguration.options_source
		let options_source_select = result.ProgramConfiguration.options_source_select
		let options_expiration_select = result.ProgramConfiguration.options_expiration_select || "NODEL"
		let options_album_id = result.ProgramConfiguration.options_album_id
		let options_nsfw_select = result.ProgramConfiguration.options_nsfw_select || 0
		let options_permission_select = result.ProgramConfiguration.options_permission_select || 0
		let AutoCopy = result.FuncDomain.AutoCopy
		//自定义请求
		let options_apihost = result.ProgramConfiguration.options_apihost
		let options_parameter = result.ProgramConfiguration.options_parameter
		let options_Headers = result.ProgramConfiguration.options_Headers
		let options_Body = result.ProgramConfiguration.options_Body
		let options_return_success = result.ProgramConfiguration.options_return_success
		// var open_json_button = result.open_json_button

		let d = new Date();
		const getFullYear = d.getFullYear()
		const getMonth = d.getMonth() + 1
		const getDate = d.getDate()
		const getHours = d.getHours()
		const getMinutes = d.getMinutes()
		const getSeconds = d.getSeconds()
		const getStamp = d.getTime()
		if (!options_Headers) {
			options_Headers = {}
		} else {
			try {
				options_Headers = JSON.parse(options_Headers);
			} catch (error) {
				showNotification(null, chrome.i18n.getMessage("Headers_error"), function () {
					chrome.tabs.create({
						'url': ('options.html')
					});
				})
				console.error(chrome.i18n.getMessage("Headers_error"))
				return;
			}
		}
		if (!options_Body) {
			options_Body = {}
		} else {
			try {
				options_Body = JSON.parse(options_Body);
			} catch (error) {
				showNotification(null, chrome.i18n.getMessage("Body_error"), function () {
					chrome.tabs.create({
						'url': ('options.html')
					});
				})
				console.error(chrome.i18n.getMessage("Body_error"))
				return;
			}
		}

		// 判断跨域开关
		if (options_proxy_server_state == 0) {
			options_proxy_server = ""
		}
		if (!options_proxy_server) {
			options_proxy_server = ""
		}

		async function Img_Request_Success(blob) {
			showNotification(null, chrome.i18n.getMessage("Upload_prompt1"))
			const imageExtension = getImageFileExtension(imgUrl, blob)
			let UrlImgNema = options_exe + '_' + MethodName + '_' + d.getTime() + '.' + imageExtension
			const file = new File([blob], UrlImgNema, { type: 'image/' + imageExtension });//将获取到的图片数据(blob)导入到file中
			const formData = new FormData();
			UploadStatus(1)
			// 自定义上传属性
			let optionsUrl
			let optionHeaders
			/**
			 * 上传到图床
			 */
			switch (options_exe) {
				case 'Lsky':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/v1/upload";
					optionHeaders = { "Authorization": options_token };
					formData.append('file', file);
					if (options_source_select) {
						formData.append("strategy_id", options_source_select);
					}
					if (options_album_id) {
						formData.append("album_id", options_album_id);
					}
					formData.append("permission", options_permission_select);
					break;
				case 'EasyImages':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/index.php";
					formData.append('image', file);
					formData.append('token', options_token);
					break;
				case 'ImgURL':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/v2/upload";
					formData.append('uid', options_uid);
					formData.append('token', options_token);
					formData.append('file', file);
					break;
				case 'SM_MS':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/v2/upload";
					optionHeaders = { "Authorization": options_token };
					formData.append('smfile', file);
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
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/1/upload/?key=" + options_token;
					optionHeaders = { "Authorization": options_token };
					formData.append('source', file);
					break;
				case 'Hellohao':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/uploadbytoken/";
					formData.append('file', file);
					formData.append('token', options_token);
					formData.append('source', options_source);
					break;
				case 'Imgur':
					optionsUrl = options_proxy_server + "https://" + options_host + "/3/upload";
					optionHeaders = { "Authorization": 'Client-ID ' + options_token };
					formData.append("image", file);
					break;
				case 'Telegra_ph':
					optionsUrl = options_proxy_server + "https://" + options_host + "/upload";
					optionHeaders = { "Accept": "application/json" };
					formData.append("file", file);
					break;
				case 'imgdd':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/v1/upload";
					optionHeaders = { "Accept": "application/json", "User-Agent": "PLExtension" };
					formData.append("image", file);
					break;
				case 'BaiJiaHaoBed':
					optionsUrl = options_proxy_server + "https://baijiahao.baidu.com/pcui/picture/upload";
					optionHeaders = { "Accept": "application/json" };
					formData.append("media", file);
					formData.append("type", "image");
					break;
				case 'freebufBed':
					optionsUrl = options_proxy_server + "https://www.freebuf.com/fapi/frontend/upload/image";
					optionHeaders = {
						"Accept": "application/json, text/plain, */*",
						"Referer": "https://www.freebuf.com/write",
						"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
					};
					formData.append("file", file);
					break;
				case 'toutiaoBed':
					const randomAid = Math.floor(Math.random() * 24) + 1;
					optionsUrl = options_proxy_server + `https://i.snssdk.com/feedback/image/v1/upload/?appkey=toutiao_web-web&aid=` + randomAid + `&app_name=toutiao_web`;
					optionHeaders = {
						"Accept": "application/json, text/plain, */*",
						"Referer": "https://helpdesk.bytedance.com/",
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.31"
					};
					formData.append("image", file);
					formData.append("app_id", randomAid);
					break;
			}
			fetch(optionsUrl, {
				method: 'POST',
				body: formData,
				headers: optionHeaders
			})
				.then(response => response.json())
				.then(res => {
					console.log(res);
					let imageUrl
					switch (options_exe) {
						case 'Lsky':
							imageUrl = res.data.links.url
							break;
						case 'EasyImages':
							imageUrl = res.url
							break;
						case 'ImgURL':
							imageUrl = res.data.url
							break;
						case 'SM_MS':
							if (res.code == "image_repeated") {
								imageUrl = res.images
							} else {
								imageUrl = res.data.url
							}
							break;
						case 'Chevereto':
							imageUrl = res.image.url
							break;
						case 'Hellohao':
							imageUrl = res.data.url
							break;
						case 'Imgur':
							imageUrl = res.data.link
							break;
						case 'UserDiy':
							// 已迁移至：uploader.js/custom_uploadFile（）
							break;
						case 'Telegra_ph':
							if (res.error) {
								showNotification(null, res.error)
								UploadStatus(0)
								return;
							}
							if (result.ProgramConfiguration.options_Custom_domain_name) {
								imageUrl = result.ProgramConfiguration.options_Custom_domain_name + res[0].src;
							} else {
								imageUrl = `https://telegra.ph` + res[0].src;
							}
							break;
						case 'imgdd':
							imageUrl = res.url
							break;
						case 'BaiJiaHaoBed':
							imageUrl = res.ret.https_url;
							break;
						case 'freebufBed':
							imageUrl = res.data.url.replace(/\\/g, "").replace('!small', '');
							break;
					}

					if (AutoCopy == "on") {
						//复制
						try {
							chrome.tabs.query({ active: true }, function (tabs) {
								let currentTabId = tabs[0].id;
								chrome.tabs.sendMessage(currentTabId, { AutoCopy: imageUrl })
							});
						} catch (error) {
							console.log(error);
						}
					}
					UploadStatus(2)
					chrome.storage.local.get('UploadLog', function (result) {
						let UploadLog = result.UploadLog || [];
						if (!Array.isArray(UploadLog)) {
							UploadLog = [];
						}
						const UploadLogData = {
							key: crypto.randomUUID(),
							url: imageUrl,
							uploadExe: options_exe + "-" + MethodName,
							upload_domain_name: options_host,
							original_file_name: UrlImgNema,
							file_size: file.size,
							img_file_size: chrome.i18n.getMessage("img_file_size"),
							uploadTime: getFullYear + "年" + getMonth + "月" + getDate + "日" + getHours + "时" + getMinutes + "分" + getSeconds + "秒"
						}
						if (typeof UploadLog !== 'object') {
							UploadLog = JSON.parse(UploadLog);
						}
						UploadLog.push(UploadLogData);
						chrome.storage.local.set({ 'UploadLog': UploadLog }, function () {
							showNotification(null, chrome.i18n.getMessage("Upload_prompt2"))
						})
						callback(res, null);
						chrome.tabs.query({ active: true }, function (tabs) {
							let currentTabId
							try {
								currentTabId = tabs[0].id;
								chrome.tabs.sendMessage(currentTabId, { AutoInsert_message: imageUrl }, function (response) {
									if (chrome.runtime.lastError) {
										//发送失败
										return;
									}
								});
							} catch (error) {
							}
						});
					});
				})
				.catch(error => {
					console.error(error);
					callback(null, new Error(chrome.i18n.getMessage("Upload_prompt3")));
					showNotification(null, chrome.i18n.getMessage("Upload_prompt4") + error.toString())
					UploadStatus(0)
				});
			let currentTabId1;
			function UploadStatus(Status) {
				if (Status == 1) {
					try {
						chrome.tabs.query({ active: true }, function (tabs) {
							currentTabId1 = tabs[0].id;
							chrome.tabs.sendMessage(currentTabId1, { Progress_bar: { "filename": UrlImgNema, "status": 1, "IsCurrentTabId": true } })
						});

					} catch (error) {
						console.log(error)
					}
				}
				if (Status == 2) {
					try {
						chrome.tabs.query({ active: true }, function (tabs) {
							let currentTabId = tabs[0].id;
							if (currentTabId1 == currentTabId) {
								chrome.tabs.sendMessage(currentTabId, { Progress_bar: { "filename": UrlImgNema, "status": 2, "IsCurrentTabId": true } })
							} else {
								chrome.tabs.sendMessage(currentTabId, { Progress_bar: { "filename": UrlImgNema, "status": 2, "IsCurrentTabId": false } })
								chrome.tabs.sendMessage(currentTabId1, { Progress_bar: { "filename": UrlImgNema, "status": 2, "IsCurrentTabId": true } })
							}

						});
					} catch (error) {
						console.log(error);
					}
				}
				if (Status == 0) {
					try {
						chrome.tabs.query({ active: true }, function (tabs) {
							let currentTabId = tabs[0].id;
							if (currentTabId1 == currentTabId) {
								chrome.tabs.sendMessage(currentTabId, { Progress_bar: { "filename": UrlImgNema, "status": 0, "IsCurrentTabId": true } })
							} else {
								chrome.tabs.sendMessage(currentTabId, { Progress_bar: { "filename": UrlImgNema, "status": 0, "IsCurrentTabId": false } })
								chrome.tabs.sendMessage(currentTabId1, { Progress_bar: { "filename": UrlImgNema, "status": 0, "IsCurrentTabId": true } })
							}
						});
					} catch (error) {
						console.log(error);
					}
				}
			}
		}
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
		 * 在线图片请求
		 */
		if (MethodName == "GlobalUpload") {
			Img_Request_Success(data)
			return;
		}

		if (options_exe === "UserDiy" ||
			options_exe === "Tencent_COS" ||
			options_exe === "Aliyun_OSS" ||
			options_exe === "AWS_S3" ||
			options_exe === "GitHubUP") {
			const menuData = {
				url: imgUrl,
				Metho: MethodName
			};
			chrome.tabs.query({ active: true }, function (tabs) {
				let currentTabId = tabs[0].id;
				const message = {};
				message[options_exe + '_contextMenus'] = menuData;
				chrome.tabs.sendMessage(currentTabId, message);
			});
			return;
		}
		fetch(options_proxy_server + imgUrl)
			.then(res => res.blob())
			.then(blob => {
				Img_Request_Success(blob)
			})
			.catch(error => {
				console.log(chrome.i18n.getMessage("Upload_prompt5"))
				fetch("https://cors-anywhere.pnglog.com/" + imgUrl)
					.then(res => res.blob())
					.then(blob => {
						Img_Request_Success(blob)
					})
					.catch(error => {
						console.log(chrome.i18n.getMessage("Upload_prompt6"))
						console.log(error)
						return;
					})
			})

	})


}

/**	
 * request返回信息
 * sender发送信息页面以及它的详细信息
 */
let TabId
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	//大喇叭
	if (request.Loudspeaker) {
		showNotification(null, request.Loudspeaker)
	}
	//拖拽上传
	// Circle_dragUpload
	if (request.Drag_Upload) {
		const imgUrl = request.Drag_Upload;
		Fetch_Upload(imgUrl, null, "Drag_Upload")
	}
	//全局上传
	if (request.GlobalUpload) {
		let base64String = request.GlobalUpload
		function processBase64String(index) {
			if (index < base64String.length) {
				let binaryData = atob(base64String[index]);
				let array = new Uint8Array(binaryData.length);
				for (let i = 0; i < binaryData.length; i++) {
					array[i] = binaryData.charCodeAt(i);
				}
				let blob = new Blob([array], { type: 'image/jpeg' });
				Fetch_Upload(null, blob, "GlobalUpload", () => {
					setTimeout(function () {
						processBase64String(index + 1);
					}, 150);
				})

			}
		}
		processBase64String(0)
	}
	//自动插入，中间件转发
	if (request.Middleware_AutoInsert_message) {
		let AutoInsert_message_content = request.Middleware_AutoInsert_message
		//向当前选项卡发送消息
		chrome.tabs.query({ active: true }, function (tabs) {
			let currentTabId
			try {
				currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { AutoInsert_message: AutoInsert_message_content }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			} catch (error) {
				return "未找到插入组件"
			}

		});
	}
	//演示动画中间转发
	if (request.Demonstration_middleware) {

		/**
		 * 粘贴演示完成
		 */
		if (request.Demonstration_middleware == "Paste_Upload_100") {
			chrome.tabs.query({ active: true }, function (tabs) {
				let currentTabId
				try {
					currentTabId = tabs[0].id;
				} catch (error) {
				}
				//拖拽开启
				chrome.tabs.sendMessage(currentTabId, { Demonstration_middleware: "Drag_upload_0" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			});
		}
		/**	
		 * 拖拽演示完成
		 */
		if (request.Demonstration_middleware == "Drag_upload_100") {
			chrome.tabs.query({ active: true }, function (tabs) {
				let currentTabId
				try {
					currentTabId = tabs[0].id;
				} catch (error) {
				}
				//右键开启
				chrome.tabs.sendMessage(currentTabId, { Demonstration_middleware: "Right_click_0" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			});
		}
		/**右键上传开始 */
		if (request.Demonstration_middleware == "Right_click_1") {
			Simulated_upload = true
		}
		/**表演结束 */
		if (request.Demonstration_middleware == "demonstrate_end") {
			Simulated_upload = false
		}

		// 关闭演示
		if (request.Demonstration_middleware == "closeIntro") {
			Simulated_upload = false
			chrome.tabs.query({ active: true }, function (tabs) {
				let currentTabId
				try {
					currentTabId = tabs[0].id;
				} catch (error) {
				}
				// 告诉content_scripts.js关闭演示
				chrome.tabs.sendMessage(currentTabId, { Demonstration_middleware: "closeIntro" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			});
		}
	}
	//演示模式
	if (request.Functional_Demonstration) {
		chrome.tabs.query({ active: true }, function (tabs) {
			let currentTabId
			try {
				currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { Paste_Upload_Start: "粘贴上传开始" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			} catch (error) {
			}
		});
	}
	if (request.Progress_bar) {
		if (request.Progress_bar.status == 1) {
			chrome.tabs.query({ active: true }, function (tabs) {
				TabId = tabs[0].id;
				chrome.tabs.sendMessage(TabId, { Progress_bar: { "filename": request.Progress_bar.filename, "status": request.Progress_bar.status, "IsCurrentTabId": true } })
			});
		}
		if (request.Progress_bar.status == 2 || request.Progress_bar.status == 0) {
			chrome.tabs.query({ active: true }, function (tabs) {
				let currentTabId = tabs[0].id;
				if (TabId == currentTabId) { //如果是提示状态初始页
					chrome.tabs.sendMessage(currentTabId, { Progress_bar: { "filename": request.Progress_bar.filename, "status": request.Progress_bar.status, "IsCurrentTabId": true } })
				} else {
					// 新页面更新状态
					chrome.tabs.sendMessage(currentTabId, { Progress_bar: { "filename": request.Progress_bar.filename, "status": request.Progress_bar.status, "IsCurrentTabId": false } })
					if (TabId) {
						// 初始页更新状态
						chrome.tabs.sendMessage(TabId, { Progress_bar: { "filename": request.Progress_bar.filename, "status": request.Progress_bar.status, "IsCurrentTabId": true } })
					}
				}
			});
		}

	}
	if (request.PLNotification) {
		chrome.tabs.query({ active: true }, function (tabs) {
			TabId = tabs[0].id;
			chrome.tabs.sendMessage(TabId, { PLNotificationJS: request.PLNotification })
		});
	}
	if (request.AutoInsert) {
		chrome.tabs.query({ active: true }, function (tabs) {
			TabId = tabs[0].id;
			chrome.tabs.sendMessage(TabId, { AutoInsertFun: request.AutoInsert }, function (response) {
				if (chrome.runtime.lastError) {
					return;
				}
			});
		});
	}
	if (request.exe_BilibliBed) {
		getOptionsFromStorage()
	}
	if (request.openOptionsPage) {
		chrome.tabs.create({
			'url': ('options.html')
		});
	}
	if (request.getXsrfToken) {
		getXsrfToken(request.url);
	}
	if (request.action === 'getInadexDbData') {
		getAllDataFromIndexedDB('PLExtension', 'Uploads').then(data => {
			sendResponse(data);
		}).catch(error => {
			console.error('Error:', error);
			sendResponse(null);
		});
		return true; // 保持消息通道打开，等待异步响应
	}
});
let Simulated_upload = false//模拟上传
chrome.action.onClicked.addListener(function (tab) {
	chrome.storage.local.get(["browser_Open_with"], function (result) {
		browser_Open_with = result.browser_Open_with
		if (!browser_Open_with) {
			chrome.storage.local.set({ 'browser_Open_with': 1 });
			// 在标签页打开
			chrome.tabs.create({
				'url': ('popup.html')
			});
		}
		if (browser_Open_with == 1) {
			// 在标签页打开
			chrome.tabs.create({
				'url': ('popup.html')
			});
		}
		if (browser_Open_with == 2) {
			// 在新窗口打开
			chrome.windows.create({
				type: "popup",
				url: "popup.html",
				width: 1200,
				height: 750
			});
		}
		if (browser_Open_with == 3) {
			// 在内置页打开
			chrome.action.setPopup({
				popup: "popup.html"
			});
		}
	});

});
function getXsrfToken(url) {
	chrome.cookies.get({ url: url, name: 'XSRF-TOKEN' }, function (cookie) {
		if (cookie) {
			chrome.tabs.query({ active: true }, function (tabs) {
				TabId = tabs[0].id;
				chrome.tabs.sendMessage(TabId, { XSRF_TOKEN: decodeURIComponent(cookie.value) }, function (response) {
					if (chrome.runtime.lastError) {
						return;
					}
				});
			});
		}
	});
}



function getAllDataFromIndexedDB(dbName, storeName) {
	return new Promise((resolve, reject) => {
		let request = indexedDB.open(dbName);

		request.onerror = function (event) {
			console.error("Database error: " + event.target.errorCode);
			reject(event.target.errorCode);
		};

		request.onsuccess = function (event) {
			let db = event.target.result;
			let transaction = db.transaction(storeName, "readonly");
			let store = transaction.objectStore(storeName);
			let getAllRequest = store.getAll();

			getAllRequest.onerror = function (event) {
				reject(event.target.errorCode);
			};

			getAllRequest.onsuccess = function (event) {
				resolve(getAllRequest.result);
			};
		};
	});
}

// 获取cookie #已弃用
// 需manifest.json调用  "webRequest", "cookies"权限
// function onRequestCompleted(details) {
// 	if (!cookieFound && details.type === "xmlhttprequest") {
// 		chrome.cookies.getAll({ url: details.initiator }, function (cookies) {
// 			cookies.forEach(function (cookie) {
// 				if (cookie.name === "SESSDATA" || cookie.name === "bili_jct") {
// 					// 存储找到的Cookie
// 					foundCookies[cookie.name] = decodeURIComponent(cookie.value);
// 				}
// 			});
// 			// 检查是否找到了SESSDATA和bili_jct
// 			if (foundCookies["SESSDATA"] && foundCookies["bili_jct"]) {
// 				// 找到所需的Cookie，设置标志为true，并停止监听XHR请求
// 				console.log(foundCookies);
// 				chrome.storage.local.set({ 'options_token': foundCookies["SESSDATA"] })
// 				chrome.storage.local.set({ 'options_CSRF': foundCookies["bili_jct"] })
// 				cookieFound = true;
// 				chrome.webRequest.onCompleted.removeListener(onRequestCompleted);
// 			}
// 		});
// 	}
// }
// let cookieFound = false; // 标志用于表示是否已获取所需的Cookie
// let foundCookies = {}; // 用于存储找到的Cookie

// function getOptionsFromStorage() {
// 	console.log("自动获取cookie中...");
// 	chrome.storage.local.get(["options_exe", "options_token", "options_CSRF"], function (result) {
// 		let { options_exe, options_token, options_CSRF } = result;
// 		if (options_exe == "BilibliBed" && !options_token && !options_CSRF) {
// 			// 添加监听器
// 			cookieFound = false
// 			foundCookies = {}
// 			chrome.webRequest.onCompleted.addListener(onRequestCompleted, { urls: ["*://*.bilibili.com/*"] });
// 		}

// 	})
// }