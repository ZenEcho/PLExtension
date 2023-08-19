// 拥有完整dom权限
window.addEventListener('message', function (event) {
    console.log("盘络上传postMessage监听: " + event.data.type);
    if (event.data.type === 'CodeMirror') {
        let editorElement = document.querySelector(".CodeMirror");
        if (editorElement) {
            const content = editorElement.CodeMirror.getValue();
            const newContent = content + event.data.data;
            editorElement.CodeMirror.setValue(newContent);
        }
    }
    if (event.data.type === 'Gutenberg') {
        try {
            let Gutenberg = wp.data.dispatch('core/block-editor');
            if (Gutenberg) {
                const imageBlock = wp.blocks.createBlock('core/image', { url: event.data.data });
                Gutenberg.insertBlock(imageBlock);
            }
        } catch (err) {
        }

    }
    if (event.data.type === 'TinyMCE') {
        try {
            let TinyMCEs = tinymce.activeEditor;
            if (TinyMCEs) {
                tinymce.activeEditor.execCommand('mceInsertContent', false, event.data.data);
            }
        } catch (error) {
        }
    }
    if (event.data.type === 'wangeditor') {
        try {
            let wangeditor_Element = editor.getEditableContainer()
            if (wangeditor_Element) {
                editor.dangerouslyInsertHtml(event.data.data)
            }
        } catch (error) {
        }

    }
    if (event.data.type === 'ckeditor') {
        try {
            let ckeditor_Element = Object.values(CKEDITOR.instances)[0];
            if (ckeditor_Element) {
                ckeditor_Element.insertHtml(event.data.data);
            }
            return;
        } catch (error) {
        }
        try {
            let ckeditor_Element = editor;
            if (ckeditor_Element) {
                const content = ckeditor_Element.getData();
                ckeditor_Element.setData(content + event.data.data);
            }
            return;
        } catch (error) {
        }
    }
    if (event.data.type === 'ckeditor4') {
        try {
            let ckeditor_Element = Object.values(CKEDITOR.instances)[0];
            if (ckeditor_Element) {
                ckeditor_Element.insertHtml(event.data.data);
            }
        } catch (error) {
        }

    }
    if (event.data.type === 'ckeditor5') {
        try {
            let ckeditor_Element = editor;
            if (ckeditor_Element) {
                const content = ckeditor_Element.getData();
                ckeditor_Element.setData(content + event.data.data);
            }
        } catch (error) {
        }

    }
    if (event.data.type === 'ueditor') {
        try {
            let ueditor_Element = UE.getEditor("editor_content");
            if (ueditor_Element) {
                ueditor_Element.execCommand('insertimage', {
                    src: event.data.data,
                });
            }
        } catch (error) {
        }

    }
    //自动复制
    if (event.data.type === 'AutoCopy') {
        let value = event.data.data;
        // 使用 Clipboard API 复制文本内容到剪贴板
        navigator.clipboard.writeText(value)
            .then(() => {
                console.log("已复制到剪贴板：" + value);
            })
            .catch(error => {
                console.error("复制到剪贴板失败：" + error);
            });
    }
    if (event.data.type === 'Progress_bar') {
        ProgressBar()
        StatusProgressBar(event.data.data.filename, event.data.data.status);
    }
});
let progressBars = []; // 保存创建的进度条元素
function ProgressBar() {

}
// function progressBox(filename) {

// }
function removeProgressBar(filename) {
    const index = progressBars.findIndex(item => item.filename === filename);
    if (index !== -1) {
        const progressBar = progressBars[index].element;
        progressBar.remove();
        progressBars.splice(index, 1);
    }
}
function StatusProgressBar(filename, Status) {
    let progressBar = document.createElement('div');
    progressBar.className = 'PLprogress';
    if (!document.getElementsByClassName("PLprogress").length) {
        document.body.appendChild(progressBar);
    }
    
    const index = progressBars.findIndex(item => item.filename === filename);
    if (index !== -1) {
        let countdownInterval; // 用于存储倒计时的 setInterval 返回值
        let remainingTime = 5000; // 初始倒计时时间，单位是毫秒
        const progressBar = progressBars[index].element;
        if (Status == 2) { //成功
            progressBar.innerHTML = ` <div>` + filename + `</div><svg t="1692415044921" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4316" width="48" height="48"><path d="M511.950005 512.049995m-447.956254 0a447.956254 447.956254 0 1 0 895.912508 0 447.956254 447.956254 0 1 0-895.912508 0Z" fill="#20B759" p-id="4317"></path><path d="M458.95518 649.636559L289.271751 479.95313c-11.698858-11.698858-30.697002-11.698858-42.39586 0s-11.698858 30.697002 0 42.395859l169.683429 169.68343c11.698858 11.698858 30.697002 11.698858 42.39586 0 11.798848-11.598867 11.798848-30.597012 0-42.39586z" fill="#FFFFFF" p-id="4318"></path><path d="M777.62406 332.267552c-11.698858-11.698858-30.697002-11.698858-42.39586 0L424.158578 643.437164c-11.698858 11.698858-11.698858 30.697002 0 42.39586s30.697002 11.698858 42.39586 0l311.069622-311.069622c11.798848-11.798848 11.798848-30.796992 0-42.49585z" fill="#FFFFFF" p-id="4319"></path></svg>
            <button class="progressBoxRemove" onclick="removeProgressBar('` + filename + `')">X</button>
            <span style=" position: absolute; left: 5px; bottom: 0; "></span>
            `
            progressBar.style.background = "#33CC66"
        }
        if (Status == 0) { //失败
            progressBar.innerHTML = ` 
            <div>` + filename + `</div>
            <svg t="1692431664801" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1808" width="48" height="48"><path d="M512.8 512m-423 0a423 423 0 1 0 846 0 423 423 0 1 0-846 0Z" fill="#FF7575" p-id="1809"></path><path d="M481.3 590.7c5.3 15.8 15.8 26.2 31.5 26.2 15.8 0 26.2-10.5 31.5-26.2l21-288.7c0-31.5-26.2-52.5-52.5-52.5-31.5 0-52.5 26.2-52.5 57.8l21 283.4z m31.5 78.8c-31.5 0-52.5 21-52.5 52.5s21 52.5 52.5 52.5 52.5-21 52.5-52.5-21-52.5-52.5-52.5z m0 0" fill="#FFFFFF" p-id="1810"></path></svg>
            <button class="progressBoxRemove" onclick="removeProgressBar('` + filename + `')">X</button>
            <span style=" position: absolute; left: 5px; bottom: 0; "></span>
            `
            progressBar.style.background = "#cc0000"
        }

        let timeSpan = progressBar.querySelector('span');
        function updateRemainingTimeDisplay() {
            timeSpan.textContent = remainingTime / 1000; // 更新倒计时显示，将毫秒转换为秒
        }
        function startCountdown() {
            countdownInterval = setInterval(function () {
                updateRemainingTimeDisplay();
                if (remainingTime <= 0) {
                    clearInterval(countdownInterval);
                    progressBar.remove();
                    progressBars.splice(index, 1);
                } else {
                    remainingTime -= 1000; // 减去一秒
                }
            }, 1000);
        }

        // 当窗口获得焦点时开始倒计时
        window.addEventListener('focus', function () {
            startCountdown();
        });

        // 当窗口失去焦点时暂停倒计时
        window.addEventListener('blur', function () {
            clearInterval(countdownInterval);
        });

        // 初始化时开始倒计时
        startCountdown();
    } else {
        if (progressBars.length >= 6) { //限制数量
            const oldestFilename = progressBars[0].filename;
            removeProgressBar(oldestFilename);
        }
        let progressBox = document.createElement('div');
        progressBox.className = 'PLprogress-box';
        progressBox.innerHTML = `
            <div>${filename}</div>
            <div class="PL-loading"></div>
            <button class="progressBoxRemove" onclick="removeProgressBar('`+ filename + `')">X</button>
        `;
        progressBars.push({ filename, element: progressBox });
        progressBar.appendChild(progressBox);
    }
}


// ProgressBar('image.png', 'Converting');
// ProgressBar('image.png1', 'Converting');
// ProgressBar('image.png2', 'Converting');
// ProgressBar('image.png3', 'Converting');
// ProgressBar('image.png4', 'Converting');
// ProgressBar('image.png5', 'Converting');
// ProgressBar('image.png6', 'Converting');
// ProgressBar('image.png7', 'Converting');
// ProgressBar('image.png8', 'Converting');
// ProgressBar('image.png9', 'Converting');

// setTimeout(function () {
//     StatusProgressBar('image.png8', 2); // 删除指定文件名的进度条
//     StatusProgressBar('image.png9', 0); // 删除指定文件名的进度条
// }, 3000);
function plB(Element) {
    let item = document.createElement('div');
    item.className = "insertContentIntoEditorPrompt"
    item.innerText = "😍盘络"
    Element.appendChild(item)
}

//TinyMCE 5/6
try {
    let TinyMCE_Elements = tinymce.activeEditor
    if (TinyMCE_Elements) {
        let container = TinyMCE_Elements.getContainer();
        plB(container)
    }
} catch (error) {
}

try {
    let wangeditor_Elements = editor.getEditableContainer()
    if (wangeditor_Elements) {
        plB(wangeditor_Elements)
    }
} catch (error) {
}
//ckeditor 4
try {
    let ckeditor_Elements = Object.values(CKEDITOR.instances)[0];
    let ckeditor_Element_Node = ckeditor_Elements.container.$
    if (ckeditor_Element_Node) {
        plB(ckeditor_Element_Node)
    }
} catch (error) {
}
//ueditor
try {
    let ueditor_Elements = UE.getEditor("editor_content");
    let ueditor_Elements_Node = ueditor_Elements.container
    if (ueditor_Elements_Node) {
        plB(ueditor_Elements_Node)
    }
} catch (error) {
}