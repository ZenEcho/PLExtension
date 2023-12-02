self.addEventListener('message', function (e) {
    let item_imgUrl = e.data;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', item_imgUrl, true);
    xhr.responseType = 'text';

    xhr.onprogress = function (event) {
        if (event.lengthComputable) {
            var percentComplete = Math.floor((event.loaded / event.total) * 100);
            self.postMessage({ status: 'loading', progress: percentComplete });
        } else {
            self.postMessage({ status: 'loading', loaded: event.loaded });
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            self.postMessage({ status: 'loaded', responseText: xhr.response });
        } else {
            self.postMessage({ status: 'error', errorMsg: '加载失败: ' + xhr.status });
        }
    };
    xhr.onerror = function () {
        self.postMessage({ status: 'error', errorMsg: '网络错误或请求被阻止' });
    };

    xhr.send();
});
