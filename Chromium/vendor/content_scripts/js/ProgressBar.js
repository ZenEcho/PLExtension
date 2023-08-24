let progressBars = []; // 保存创建的进度条元素
function ProgressBar() {
    let progressBar = document.createElement('div');
    progressBar.className = 'PLprogress';
    if (!document.getElementsByClassName("PLprogress").length) {
        document.body.appendChild(progressBar);
    }
}
ProgressBar()

function removeProgressBar(filename) {
    const index = progressBars.findIndex(item => item.filename === filename);
    if (index !== -1) {
        const progressBar = progressBars[index].element;
        progressBar.remove();
        progressBars.splice(index, 1);
    }
}
function StatusProgressBar(filename, Status, IsID) {
    ProgressBar()
    if (Status == 1) {
        if (progressBars.length >= 6) { //限制数量
            const oldestFilename = progressBars[0].filename;
            removeProgressBar(oldestFilename);
        }

        let progressBox = document.createElement('div');
        progressBox.className = 'PLprogress-box';
        progressBox.innerHTML = `
            <div>${filename}</div>
            <div class="PL-loading"></div>
            <button class="progressBoxRemove" data-filename="${filename}">X</button>
        `;
        progressBox.querySelector('.progressBoxRemove').addEventListener('click', function (event) {
            const filename = event.target.dataset.filename; // 获取按钮的data属性值
            removeProgressBar(filename);
        });
        progressBars.push({ filename, element: progressBox });
        document.getElementsByClassName("PLprogress")[0].appendChild(progressBox);
    }

    if (Status == 2 || Status == 0) {
        let countdownInterval; // 用于存储倒计时的 setInterval 返回值
        let remainingTime = 10000; // 初始倒计时时间，单位是毫秒

        const successHTML = ` 
        <div>` + filename + `</div><svg t="1692415044921" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4316" width="48" height="48"><path d="M511.950005 512.049995m-447.956254 0a447.956254 447.956254 0 1 0 895.912508 0 447.956254 447.956254 0 1 0-895.912508 0Z" fill="#20B759" p-id="4317"></path><path d="M458.95518 649.636559L289.271751 479.95313c-11.698858-11.698858-30.697002-11.698858-42.39586 0s-11.698858 30.697002 0 42.395859l169.683429 169.68343c11.698858 11.698858 30.697002 11.698858 42.39586 0 11.798848-11.598867 11.798848-30.597012 0-42.39586z" fill="#FFFFFF" p-id="4318"></path><path d="M777.62406 332.267552c-11.698858-11.698858-30.697002-11.698858-42.39586 0L424.158578 643.437164c-11.698858 11.698858-11.698858 30.697002 0 42.39586s30.697002 11.698858 42.39586 0l311.069622-311.069622c11.798848-11.798848 11.798848-30.796992 0-42.49585z" fill="#FFFFFF" p-id="4319"></path></svg>
        <button class="progressBoxRemove" data-filename="`+ filename + `">X</button>
        <span style=" position: absolute; left: 5px; bottom: 0; "></span>`
        const errorHTML = `<div>` + filename + `</div>
        <svg t="1692431664801" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1808" width="48" height="48"><path d="M512.8 512m-423 0a423 423 0 1 0 846 0 423 423 0 1 0-846 0Z" fill="#FF7575" p-id="1809"></path><path d="M481.3 590.7c5.3 15.8 15.8 26.2 31.5 26.2 15.8 0 26.2-10.5 31.5-26.2l21-288.7c0-31.5-26.2-52.5-52.5-52.5-31.5 0-52.5 26.2-52.5 57.8l21 283.4z m31.5 78.8c-31.5 0-52.5 21-52.5 52.5s21 52.5 52.5 52.5 52.5-21 52.5-52.5-21-52.5-52.5-52.5z m0 0" fill="#FFFFFF" p-id="1810"></path></svg>
        <button class="progressBoxRemove" data-filename="`+ filename + `">X</button>
        <span style=" position: absolute; left: 5px; bottom: 0; "></span>`
        const index = progressBars.findIndex(item => item.filename === filename);
        if (index !== -1) {
            const progressBar = progressBars[index].element;
            if (Status == 2) { //成功
                progressBar.innerHTML = successHTML
                progressBar.style.background = "#33CC66"
            }
            if (Status == 0) { //失败
                progressBar.innerHTML = errorHTML
                progressBar.style.background = "#cc0000"
            }
            progressBar.querySelector('.progressBoxRemove').addEventListener('click', function (event) {
                progressBar.remove();
            });
            document.addEventListener('visibilitychange', handleVisibilityChange(progressBar));
        } else {
            if (progressBars.length >= 6) { //限制数量
                const oldestFilename = progressBars[0].filename;
                removeProgressBar(oldestFilename);
            }

            let progressBar = document.createElement('div');
            progressBar.className = 'PLprogress-box';
            if (Status == 2) { //成功
                progressBar.innerHTML = successHTML;
                progressBar.style.background = "#33CC66"
            }
            if (Status == 0) { //成功
                progressBar.innerHTML = errorHTML;
                progressBar.style.background = "#cc0000"
            }
            progressBar.querySelector('.progressBoxRemove').addEventListener('click', function (event) {
                progressBar.remove();
                progressBars.splice(index, 1);

            });
            progressBars.push({ filename, element: progressBar });
            document.getElementsByClassName("PLprogress")[0].appendChild(progressBar);
            document.addEventListener('visibilitychange', handleVisibilityChange(progressBar));
        }
        function startCountdown(progressBar) {
            const timeSpan = progressBar.querySelector('span'); // 获取 <span> 元素
            countdownInterval = setInterval(function () {
                timeSpan.textContent = remainingTime / 1000;
                if (remainingTime <= 0) {
                    progressBar.remove();
                    progressBars.splice(index, 1);
                    clearInterval(countdownInterval);
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                } else {
                    remainingTime -= 1000; // 减去一秒
                }
            }, 1000);
        }

        function stopCountdown() {
            clearInterval(countdownInterval);
        }
        function handleVisibilityChange(progressBar) {
            if (document.visibilityState === 'visible') {
                startCountdown(progressBar);
            } else {
                stopCountdown();
            }
        }
    }

}
