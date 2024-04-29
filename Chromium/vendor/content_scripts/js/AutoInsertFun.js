/**
* 编辑器的初始识别和状态
*/
function insertContentIntoEditorState() {
    function FullDomPermissionsCSS(file) {
        let link = document.createElement('link');
        link.href = chrome.runtime.getURL(file);
        link.rel = 'stylesheet';
        (document.head || document.documentElement).appendChild(link);
    }
    FullDomPermissionsCSS('vendor/content_scripts/css/FullDomPermissions.css');
    function FullDomPermissionsJs(file) {
        let script = document.createElement('script');
        script.src = chrome.runtime.getURL(file);
        script.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
    }
    FullDomPermissionsJs('vendor/content_scripts/js/FullDomPermissions.js');

}
window.addEventListener('message', function (event) {
    if (event.data.type === 'insertContentIntoEditorState') {
        mainLogic(document.querySelector(".insertContentIntoEditorPrompt"));
        chrome.storage.local.get(["FuncDomain"], function (result) {
            if (result.FuncDomain.EditPasteUpload == "on") {
                handlePasteEventOnFocus()
            }
        })
    }
})
chrome.runtime.onMessage.addListener(function (request) {
    if (request.AutoInsertFun) {
        AutoInsertFun(request.AutoInsertFun, false)
    }
});

function transformUpUrl(AutoInsert_message_content, ImageProxy) {
    let UpUrl = AutoInsert_message_content;
    switch (ImageProxy) {
        case "1":
            let index = parseInt(Math.random() * 3);
            UpUrl = `https://i` + index + `.wp.com/` + UpUrl.replace(/^https:\/\//, '')
            break;
        case "2":
            UpUrl = `https://images.weserv.nl/?url=` + UpUrl
            break;
        case "3":
            UpUrl = `https://imageproxy.pimg.tw/resize?url=` + UpUrl
            break;
        case "4":
            UpUrl = `https://pic1.xuehuaimg.com/proxy/` + UpUrl
            break;
        case "5":
            UpUrl = `https://cors.zme.ink/` + UpUrl
            break;
    }
    return UpUrl;
}

function insertIntoFocusEditor(UpUrl) {
    // 将图片插入到当前焦点的编辑器中
    //焦点插入
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const commonAncestor = range.commonAncestorContainer;
        if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
            const inputElements = commonAncestor.querySelectorAll('input');
            const textareaElements = commonAncestor.querySelectorAll('textarea');
            const contentEditableElements = commonAncestor.querySelectorAll('[contenteditable="true"]');
            if (inputElements.length > 0) {
                // 方法1: 处理input元素
                document.execCommand('insertText', false, UpUrl);

            } else if (textareaElements.length > 0) {
                // 方法2: 处理textarea元素
                document.execCommand('insertText', false, UpUrl);

            } else if (contentEditableElements.length > 0) {
                // 方法3: 处理具有contenteditable属性的元素
                const imgElement = document.createElement('img');
                imgElement.src = UpUrl; // 替换成你的图片URL
                imgElement.alt = '图片';
                contentEditableElements[0].appendChild(imgElement);

            }
        } else if (commonAncestor.nodeType === Node.TEXT_NODE && commonAncestor.parentElement && commonAncestor.parentElement.hasAttribute('contenteditable')) {
            // commonAncestor.textContent += UpUrl
            document.execCommand('insertText', false, UpUrl);
        }
    }

}

function determineEditorType(excludedTypes = [], UpUrl) {
    let currentURL = window.location.href.toLowerCase();
    let webScripts = Array.from(document.querySelectorAll('script'));
    let matchedEditors = [];
    function isExcluded(type) {
        return excludedTypes.includes(type);
    }
    const scriptTypeMapping = {
        'tinymce_5or6': 'tinymce',
        'wangeditor': 'wangeditor',
        'ckeditor_4': 'ckeditor4',
        'ckeditor_5': 'ckeditor5',
        'ckeditor_4or5': 'ckeditor',
        'halo': 'halo',
        'ueditor': 'ueditor'
    };

    webScripts.forEach(script => {
        let src = script.getAttribute('src');
        if (src) {
            Object.entries(scriptTypeMapping).forEach(([type, keyword]) => {
                if (!isExcluded(type) && src.includes(keyword) && !matchedEditors.includes(type)) {
                    matchedEditors.push(type);
                }
            });
        }
    });

    const editorChecks = [
        { type: "discuz", condition: () => document.body.innerText.toLowerCase().includes("discuz") || document.documentElement.innerHTML.toLowerCase().includes('discuz') },
        { type: "v2ex", condition: () => currentURL.includes("v2ex.com") },
        { type: "nodeseek", condition: () => currentURL.includes("nodeseek.com") },
        { type: "hostevaluate", condition: () => currentURL.includes("hostevaluate.com") },
        { type: "lowendtalk", condition: () => currentURL.includes("lowendtalk.com") },
        { type: "typecho", condition: () => document.body.innerText.toLowerCase().includes("typecho") },
        { type: "phpbb", condition: () => !!document.getElementById("phpbb") },
        { type: "codeMirror_5", condition: () => !!document.querySelector(".CodeMirror") },
        { type: "codeMirror_6", condition: () => !!document.querySelector(".cm-content") },
        { type: "gutenberg", condition: () => !!document.getElementById("wpbody-content") },
        { type: "iframe", condition: () => matchedEditors.length < 1 && !!document.querySelector('iframe') }
    ];

    for (const check of editorChecks) {
        if (!isExcluded(check.type) && check.condition()) {
            matchedEditors.push(check.type);
        }
    }

    return matchedEditors;

}


async function insertIntoSpecificEditor(editorType, UpUrl) {
    const editorHandlers = {
        'discuz': () => handleDiscuz(UpUrl),
        'v2ex': () => handleV2exReply(UpUrl),
        'nodeseek': () => handleCodeMirror5(UpUrl),
        'hostevaluate': () => handleHostEvaluate(UpUrl),
        'lowendtalk': () => handleLowEndTalk(UpUrl),
        'typecho': () => handleTypecho(UpUrl),
        'phpbb': () => handlePHPBB(UpUrl),
        'codeMirror_5': () => handleCodeMirror5(UpUrl),
        'codeMirror_6': () => handleCodeMirror6(UpUrl),
        'gutenberg': () => handleGutenberg(UpUrl),
        'tinymce_5or6': () => handleScriptEditor(editorType, UpUrl),
        'wangeditor': () => handleScriptEditor(editorType, UpUrl),
        'ckeditor_4': () => handleScriptEditor(editorType, UpUrl),
        'ckeditor_5': () => handleScriptEditor(editorType, UpUrl),
        'ckeditor_4or5': () => handleScriptEditor(editorType, UpUrl),
        'halo': () => handleHalo(UpUrl),
        'ueditor': () => handleScriptEditor(editorType, UpUrl),
        'iframe': () => handleIframe(UpUrl),
    };

    let handler = editorHandlers[editorType];
    if (handler) {
        return await handler()
    } else {
        return false;
    }
}

let excludedEditorTypes = [];
function AutoInsertFun(AutoInsert_message_content, FocusInsert) {
    chrome.storage.local.get(["FuncDomain"], function (result) {
        if (result.FuncDomain.AutoInsert != "on") { return; }
        let ImageProxy = result.FuncDomain.ImageProxy || 0

        let UpUrl = transformUpUrl(AutoInsert_message_content, ImageProxy);

        // 表情的聚焦插入
        if (FocusInsert) {
            insertIntoFocusEditor(UpUrl);
            return;
        }

        // 然后处理特定编辑器
        attemptInsertion(UpUrl);

    })
}
function getDomainFromURL() {
    return window.location.hostname;
}
function getStoredInsertionEditorTypes(callback) {
    chrome.storage.local.get(['InsertionEditorType'], function (result) {
        callback(result.InsertionEditorType ? result.InsertionEditorType : {});
    });
}

// 保存域名和对应的editorType到本地数据库
function saveEditorTypeForDomain(editorType) {
    let currentDomain = getDomainFromURL()
    getStoredInsertionEditorTypes(function (storedEditorTypes) {
        storedEditorTypes[currentDomain] = editorType;
        chrome.storage.local.set({ 'InsertionEditorType': storedEditorTypes });
    });
}

// 尝试从本地数据库获取当前域名的editorType
function getEditorTypeForCurrentDomain(callback) {
    let currentDomain = getDomainFromURL();
    getStoredInsertionEditorTypes(function (storedEditorTypes) {
        callback(storedEditorTypes[currentDomain]);
    });
}

function attemptInsertion(UpUrl) {
    getEditorTypeForCurrentDomain(async function (savedEditorType) {
        if (savedEditorType) {
            let success = await insertIntoSpecificEditor(savedEditorType, UpUrl);
            if (!success) {
                if (confirm("发现了错误的插入类型,是否修正？")) {
                    excludedEditorTypes.push(savedEditorType);
                    let editorType = determineEditorType(excludedEditorTypes, UpUrl);
                    if (editorType) {
                        let success = await insertIntoSpecificEditor(editorType, UpUrl);
                        if (!success) {
                            excludedEditorTypes.push(editorType);
                            attemptInsertion(UpUrl);
                        } else {
                            saveEditorTypeForDomain(editorType);
                        }
                    }

                }
            }
            return;
        }
        let editorType = determineEditorType(excludedEditorTypes, UpUrl);
        console.log(editorType);
        if (editorType.length === 1) {
            let success = await insertIntoSpecificEditor(editorType[0], UpUrl);
            if (!success) {
                // 如果插入失败，将该编辑器类型添加到排除列表中
                excludedEditorTypes.push(editorType[0]);
                console.log("发现错误插入类型：" + editorType[0] + "</br>错误URL:" + window.location.href);
                attemptInsertion(UpUrl);
            } else {
                saveEditorTypeForDomain(editorType[0]);
            }
        }
        if (editorType.length > 1) {
            let buttons = editorType.map(editor => {
                return {
                    text: "尝试使用：" + editor + " 方法",
                    style: "padding: 2px;width: 100%;border: none;border-radius: 10px; margin-bottom: 5px;",
                    init: function (close) {
                        this.addEventListener("click", function () {
                            insertIntoSpecificEditor(editor, UpUrl)
                            // 延迟1秒钟
                            setTimeout(() => {
                                if (confirm(editor + " 可以插入吗？按下确认键以后将使用该方法！\n修改插入方法：配置信息→自动插入→插入管理")) {
                                    saveEditorTypeForDomain(editor);
                                    close();
                                }
                            }, 1200);
                        });
                    }
                };
            });

            let data = {
                type: "warning",
                content: "检测到多种编辑器,请手动选择正确的编辑器！",
                duration: 0,
                button: buttons
            };
            PLNotification(data);
        }
        if (editorType.length === 0) {
            console.log("找不到合适的编辑器类型，或者所有类型都失败了" + "</br>失效地址:" + window.location.href + "</br>如果需要适配请上报该错误！");
        }

    })
}
function handleDiscuz(UpUrl) {
    let Discuz = document.getElementById("fastpostmessage")
    let Discuz_Interactive_reply = document.getElementById("postmessage")
    let Discuz_Advanced = document.getElementById("e_textarea")
    if (Discuz_Interactive_reply) {
        //回复楼层
        Discuz_Interactive_reply.value += '[img]' + UpUrl + '[/img]'
        return true;
    } else if (Discuz) {
        //回复楼主
        Discuz.value += '[img]' + UpUrl + '[/img]'
        return true;
    }
    if (Discuz_Advanced) {
        //高级回复
        let Discuz_Advanced_iframe
        try {
            Discuz_Advanced_iframe = Discuz_Advanced.parentNode.querySelector("iframe")
            if (Discuz_Advanced_iframe) {
                let bodyElement = Discuz_Advanced_iframe.contentDocument.body
                let img = document.createElement('img')
                img.src = UpUrl
                bodyElement.appendChild(img)
                return true;
            }
            else {
                Discuz_Advanced.value += '[img]' + UpUrl + '[/img]'
                return true;
            }
        } catch (error) {
        }
    }
    return false;
}

function handleV2exReply(UpUrl) {
    let reply_content_Advanced = document.getElementById("topic_content")
    if (reply_content_Advanced && reply_content_Advanced.type != "hidden") {
        reply_content_Advanced.value += '![' + "图片" + '](' + UpUrl + ')'
        let inputEvent = new Event('input', { bubbles: true });
        reply_content_Advanced.dispatchEvent(inputEvent);
        return true;
    }
    if (document.body.innerText.toLowerCase().includes("请尽量让自己的回复能够对别人有帮助")) {
        let reply_content = document.getElementById("reply_content")
        if (reply_content) {
            reply_content.value += UpUrl
            let inputEvent = new Event('input', { bubbles: true });
            reply_content.dispatchEvent(inputEvent);
            return true;
        }
    }
    return false;
}

function handleNodeSeek(UpUrl) {
    let nodeseek = document.getElementById("markdown-input")
    if (nodeseek) {
        nodeseek.value += '![' + "图片" + '](' + UpUrl + ')'
        let inputEvent = new Event('input', { bubbles: true });
        nodeseek.dispatchEvent(inputEvent);
        return true;
    }
    return false;
}

function handleHostEvaluate(UpUrl) {
    let hostevaluate = document.getElementsByClassName("write-container")
    if (hostevaluate.length) {
        let write = hostevaluate[hostevaluate.length - 1].querySelector(".write")
        write.value += '![' + "图片" + '](' + UpUrl + ')'
        let inputEvent = new Event('input', { bubbles: true });
        write.dispatchEvent(inputEvent);
        return true;
    }
    return false;
}

function handleLowEndTalk(UpUrl) {
    let lowendtalkEditor = document.getElementById("Form_Body")
    if (lowendtalkEditor) {
        lowendtalkEditor.value += '![' + "图片" + '](' + UpUrl + ')';
        return true;
    }
    return false;
}
function handleTypecho(UpUrl) {
    let text = document.getElementById("text")
    if (text) {
        text.value += '![' + "图片" + '](' + UpUrl + ')'
        let inputEvent = new Event('input', { bubbles: true });
        text.dispatchEvent(inputEvent);
        return true;
    }
    return false;
}
function handlePHPBB(UpUrl) {
    let phpbbForum = document.getElementById("phpbb")
    if (phpbbForum) {
        window.postMessage({ type: 'phpbbForum', data: '[img]' + UpUrl + '[/img]' }, '*');
        return true;
    }
    return false;
}
function handleCodeMirror5(UpUrl) {
    let CodeMirror = document.querySelector(".CodeMirror");
    if (CodeMirror) {
        window.postMessage({ type: 'CodeMirror5', data: '![' + "描述" + '](' + UpUrl + ')' }, '*');
        return true;
    }
    return false;
}
function handleCodeMirror6(UpUrl) {
    let CodeMirror6 = document.querySelector(".cm-content");
    if (CodeMirror6) {
        let item = document.createElement('div');
        item.className = "cm-line"
        item.dir = "auto"
        item.innerText = '![' + "描述" + '](' + UpUrl + ')'
        CodeMirror6.appendChild(item)
        return true;
    }
    return false;
}
function handleGutenberg(UpUrl) {
    if (document.querySelector('.block-editor') || document.querySelector('.editor-styles-wrapper')) {
        window.postMessage({ type: 'Gutenberg', data: UpUrl }, '*');
        return true;
    }
    return false;
}
function handleHalo(UpUrl) {
    let HaloEditor_Element = document.querySelector('.ProseMirror');
    if (HaloEditor_Element) {
        HaloEditor_Element.focus();
        document.execCommand('insertImage', false, UpUrl);
        return true;
    }
    return false;
}
function handleIframe(UpUrl) {
    let iframes = document.querySelectorAll('iframe:not(.PL-iframe)');
    for (let iframe of iframes) {
        try {
            let iframeStyles = window.getComputedStyle(iframe);
            if (iframeStyles.display === 'none') {
                let textarea = document.querySelector('textarea');
                let textareaStyles = window.getComputedStyle(textarea);
                if (textareaStyles.display != 'none') {
                    textarea.value += '[img]' + UpUrl + '[/img]';
                    return true;
                }
            }

            let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            let editableElement = iframeDocument.querySelector('[contenteditable="true"]');
            if (editableElement) {
                // 创建图片元素并设置属性
                let imgElement = document.createElement('img');
                imgElement.src = UpUrl;
                imgElement.alt = '图片';
                // 插入图片元素
                editableElement.appendChild(imgElement);
                return true;
            }
        } catch (error) {
            return false;
        }
    }
    return false;
}

async function handleScriptEditor(editorType, UpUrl) {
    const messageTypes = {
        'tinymce_5or6': 'TinyMCEResponse',
        'wangeditor': 'WangeditorResponse',
        'ckeditor_4': 'ckeditor4Response',
        'ckeditor_5': 'ckeditor5Response',
        'ckeditor_4or5': 'ckeditorResponse',
        'ueditor': 'ueditorResponse',
    };

    function postMessageAndWaitForResponse() {
        return new Promise((resolve, reject) => {
            // 监听来自注入脚本的消息
            const messageListener = (event) => {
                if (event.source != window) return;
                if (event.data.type === messageTypes[editorType]) {
                    resolve(event.data);
                    window.removeEventListener('message', messageListener);
                }
            };

            window.addEventListener('message', messageListener);

            // 发送消息到注入脚本
            window.postMessage({ type: editorType, data: `<img src="${UpUrl}">` }, '*');
        });
    }

    const response = await postMessageAndWaitForResponse();
    if (response.data === "true") {
        return true;
    } else {
        return false;
    }
}

//编辑框粘贴
function handlePasteEventOnFocus() {
    function pasteHandler(e) {
        const focusedElement = document.activeElement;
        if (!focusedElement) {
            return;
        }
        // 检查focusedElement是否不是可输入的元素
        if (
            !(focusedElement instanceof HTMLInputElement) &&
            !(focusedElement instanceof HTMLTextAreaElement) &&
            !focusedElement.isContentEditable
        ) {
            console.log("Input", focusedElement instanceof HTMLInputElement);
            console.log("TextArea", focusedElement instanceof HTMLTextAreaElement);
            console.log("contentEditable", focusedElement.isContentEditable);
            return;
        }

        const copyFileItems = e.clipboardData.items;
        const filesToSend = [];

        for (let i = 0; i < copyFileItems.length; i++) {
            const copyFileItem = copyFileItems[i];
            if (copyFileItem.kind == "file") {
                if (copyFileItem.type.indexOf("image") != -1) {
                    const file = copyFileItem.getAsFile();
                    filesToSend.push(file);
                }
            }
        }
        if (filesToSend.length > 0) {
            content_scripts_CheckUploadModel(filesToSend, false, true)
        }
    }
    document.addEventListener("paste", pasteHandler);
}
