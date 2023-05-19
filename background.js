function showNotification(title, message, onClickCallback) {
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
var browser_Open_with
chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason === "install") {
		chrome.storage.local.set({ 'browser_Open_with': 3 }, function () {
			chrome.action.setPopup({
				popup: "popup.html"
			});
			console.log("安装初始中...");
		});
		chrome.storage.local.set({ "Circle_dragUpload": "Circle_dragUpload_off" }) //画圆上传
		chrome.storage.local.set({ "GlobalUpload": "GlobalUpload_Default" }) //全局上传
		chrome.storage.local.set({ "Right_click_menu_upload": "on" }) //右键上传
		chrome.storage.local.set({ "AutoInsert": "AutoInsert_on" }) //自动插入

		chrome.storage.local.set({ "edit_uploadArea_width": 32 }) //宽度
		chrome.storage.local.set({ "edit_uploadArea_height": 30 }) //高度
		chrome.storage.local.set({ "edit_uploadArea_Location": 34 }) //位置
		chrome.storage.local.set({ "edit_uploadArea_opacity": 0.3 }) //透明度
		chrome.storage.local.set({ "edit_uploadArea_auto_close_time": 2 }) //关闭时间
		chrome.storage.local.set({ "edit_uploadArea_Left_or_Right": "Right" })

		chrome.contextMenus.create({
			title: '使用盘络程序上传图片',
			contexts: ["image"],
			id: "upload_imagea"
		})

		chrome.storage.local.get(["browser_Open_with"], function (result) {
			browser_Open_with = result.browser_Open_with
			showNotification("盘络上传程序", "安装初始化完成，完成配置填写即可上传", function () {
				chrome.tabs.create({
					'url': ('options.html')
				});
			})
		});


	}
});

const getSave = [
	"options_exe",
	"options_proxy_server_state",
	"options_proxy_server",
	"options_host",
	"options_token",
	"options_uid",
	"options_source",
	"options_imgur_post_mode",
	//自定义请求
	"options_apihost",
	"options_parameter",
	"options_Headers",
	"options_Body",
	"options_return_success",
	"open_json_button",
]

chrome.storage.local.get(["Right_click_menu_upload"], function (result) {
	if (result.Right_click_menu_upload == "on") {
		chrome.contextMenus.create({
			title: '使用盘络程序上传图片',
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
		Fetch_Upload(imgUrl, null, "Rightupload")
	}

});

async function Fetch_Upload(imgUrl, data, MethodName) {

	chrome.storage.local.get(getSave, function (result) {
		var options_exe = result.options_exe
		var options_proxy_server_state = result.options_proxy_server_state
		var options_proxy_server = result.options_proxy_server
		var options_host = result.options_host
		var options_token = result.options_token
		var options_uid = result.options_uid
		var options_source = result.options_source

		//自定义请求
		var options_apihost = result.options_apihost
		var options_parameter = result.options_parameter
		var options_Headers = result.options_Headers
		var options_Body = result.options_Body
		var options_return_success = result.options_return_success
		// var open_json_button = result.open_json_button

		var d = new Date();
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
				showNotification("盘络上传程序", "Headers请求参数不是一个合法的 JSON 格式字符串！", function () {
					chrome.tabs.create({
						'url': ('options.html')
					});
				})
				console.error("Headers请求参数不是一个合法的 JSON 格式字符串！")
				return;
			}
		}
		if (!options_Body) {
			options_Body = {}
		} else {
			try {
				options_Body = JSON.parse(options_Body);
			} catch (error) {
				showNotification("盘络上传程序", "Body请求参数不是一个合法的 JSON 格式字符串！", function () {
					chrome.tabs.create({
						'url': ('options.html')
					});
				})
				console.error("Body请求参数不是一个合法的 JSON 格式字符串！")
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
			showNotification("盘络上传程序", "图片获取完成,正在执行上传;")
			let UrlImgNema = options_exe + '_' + MethodName + '_' + d.getTime() + '.png'
			const file = new File([blob], UrlImgNema, { type: 'image/png' });//将获取到的图片数据(blob)导入到file中
			const formData = new FormData();
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
				case 'UserDiy':
					optionsUrl = options_proxy_server + options_apihost;
					formData.append(options_parameter, file);
					optionHeaders = options_Headers;
					for (var key in options_Body) {
						formData.append(key, options_Body[key]);
					}
					break;
				case 'UserDiy':
					optionsUrl = options_proxy_server + options_apihost;
					formData.append(options_parameter, file);
					optionHeaders = options_Headers;
					for (var key in options_Body) {
						formData.append(key, options_Body[key]);
					}
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
							const options_return_success_value = res;
							options_return_success.split('.').forEach(function (prop) {
								if (options_return_success_value) {
									options_return_success_value = options_return_success_value[prop];
								}
							});
							imageUrl = options_return_success_value
							break;
					}
					chrome.storage.local.get('UploadLog', function (result) {
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
						generateRandomKey().then(key => {
							const UploadLogData = {
								key: key,
								url: imageUrl,
								uploadExe: options_exe + "-" + MethodName,
								upload_domain_name: options_host,
								original_file_name: UrlImgNema,
								img_file_size: "宽:不支持,高:不支持",
								uploadTime: getFullYear + "年" + getMonth + "月" + getDate + "日" + getHours + "时" + getMinutes + "分" + getSeconds + "秒"
							}
							if (typeof UploadLog !== 'object') {
								UploadLog = JSON.parse(UploadLog);
							}
							UploadLog.push(UploadLogData);
							chrome.storage.local.set({ 'UploadLog': UploadLog }, function () {
								showNotification("盘络上传程序", "图片上传成功，前往上传日志页面即可查看")
								chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
									let currentTabId = tabs[0].id;
									chrome.tabs.sendMessage(currentTabId, { AutoInsert_message: imageUrl }, function (response) {
										if (chrome.runtime.lastError) {
											//发送失败
											return;
										}
									});
								});
							})
						});
					});
				})
				.catch(error => {
					console.error(error);
				});
		}

		/**
		 * 在线图片请求
		 */
		if (MethodName == "GlobalUpload") {
			Img_Request_Success(data)
			return;
		}
		if (options_exe == "Tencent_COS") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				var currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { Tencent_COS_contextMenus: imgUrl })
			});
			return;
		}
		if (options_exe == "Aliyun_OSS") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				var currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { Aliyun_OSS_contextMenus: imgUrl })
			});
			return;
		}
		if (options_exe == "AWS_S3") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				var currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { AWS_S3_contextMenus: imgUrl })
			});
			return;
		}
		fetch(options_proxy_server + imgUrl)
			.then(res => res.blob())
			.then(blob => {
				Img_Request_Success(blob)
			})
			.catch(error => {
				console.log("获取失败，再次尝试...")
				fetch("https://cors-anywhere.pnglog.com/" + imgUrl)
					.then(res => res.blob())
					.then(blob => {
						Img_Request_Success(blob)
					})
					.catch(error => {
						console.log("很抱歉还是获取失败了，请按F12查看错误信息进行错误排除！")
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
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	//拖拽上传
	if (request.Loudspeaker) {
		showNotification("盘络上传程序", request.Loudspeaker)
	}
	//拖拽上传
	if (request.Circle_dragUpload) {
		const imgUrl = request.Circle_dragUpload;
		Fetch_Upload(imgUrl, null, "Circle_dragUpload")
	}
	//全局上传
	if (request.GlobalUpload) {
		request.GlobalUpload.forEach(function (base64String) {
			let binaryData = atob(base64String);
			// 将二进制数据转换为Blob对象
			let array = new Uint8Array(binaryData.length);
			for (var i = 0; i < binaryData.length; i++) {
				array[i] = binaryData.charCodeAt(i);
			}
			let blob = new Blob([array], { type: 'image/jpeg' });
			Fetch_Upload(null, blob, "GlobalUpload")
		});
	}

	// if (request.action === "openPopup") {
	// 	chrome.windows.create({
	// 		url: chrome.runtime.getURL("UploadLog.html"),
	// 		type: "popup",
	// 		width: 1024,
	// 		height: 730,
	// 	});
	// }
});


chrome.action.onClicked.addListener(function (tab) {
	chrome.storage.local.get(["browser_Open_with"], function (result) {
		browser_Open_with = result.browser_Open_with
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
				width: 1024,
				height: 730
			});
		}
		if (browser_Open_with === 3) {
			// 在内置页打开
			chrome.action.setPopup({
				popup: "popup.html"
			});
		}
	});

});
