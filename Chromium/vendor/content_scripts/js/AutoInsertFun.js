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
    }
})
/**
     * @param {url} AutoInsert_message_content 上传成功后返回的url
     */
function AutoInsertFun(AutoInsert_message_content, FocusInsert) {
    chrome.storage.local.get(["AutoInsert"], function (result) {
        if (result.AutoInsert != "AutoInsert_on") { return; }
        let Find_Editor = false
        let pageText = document.body.innerText;
        let pageHtml = document.documentElement.innerHTML;
        let scripts = document.querySelectorAll('script');
        let currentURL = window.location.href;
        if (FocusInsert == true) {
            //焦点插入
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                if (Find_Editor == true) { return; }
                const range = selection.getRangeAt(0);
                const commonAncestor = range.commonAncestorContainer;
                if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
                    const inputElements = commonAncestor.querySelectorAll('input');
                    const textareaElements = commonAncestor.querySelectorAll('textarea');
                    const contentEditableElements = commonAncestor.querySelectorAll('[contenteditable="true"]');
                    if (inputElements.length > 0) {
                        // 方法1: 处理input元素
                        document.execCommand('insertText', false, AutoInsert_message_content);
                        Find_Editor = true
                    } else if (textareaElements.length > 0) {
                        // 方法2: 处理textarea元素
                        document.execCommand('insertText', false, AutoInsert_message_content);
                        Find_Editor = true
                    } else if (contentEditableElements.length > 0) {
                        // 方法3: 处理具有contenteditable属性的元素
                        const imgElement = document.createElement('img');
                        imgElement.src = AutoInsert_message_content; // 替换成你的图片URL
                        imgElement.alt = '图片';
                        contentEditableElements[0].appendChild(imgElement);
                        Find_Editor = true
                    }
                } else if (commonAncestor.nodeType === Node.TEXT_NODE && commonAncestor.parentElement && commonAncestor.parentElement.hasAttribute('contenteditable')) {
                    // commonAncestor.textContent += AutoInsert_message_content
                    document.execCommand('insertText', false, AutoInsert_message_content);
                    Find_Editor = true
                }


            }
            return
        }

        if (pageText.toLowerCase().includes("discuz") || pageHtml.toLowerCase().indexOf('discuz') !== -1) {
            let Discuz = document.getElementById("fastpostmessage")
            let Discuz_Interactive_reply = document.getElementById("postmessage")
            let Discuz_Advanced = document.getElementById("e_textarea")
            if (Discuz_Interactive_reply) {
                if (Find_Editor == true) { return; }
                //回复楼层
                Discuz_Interactive_reply.value += '[img]' + AutoInsert_message_content + '[/img]'
                Find_Editor = true
            } else if (Discuz) {
                if (Find_Editor == true) { return; }
                //回复楼主
                Discuz.value += '[img]' + AutoInsert_message_content + '[/img]'
                Find_Editor = true
            }
            if (Discuz_Advanced) {
                //高级回复
                if (Find_Editor == true) { return; }
                let Discuz_Advanced_iframe
                try {
                    Discuz_Advanced_iframe = Discuz_Advanced.parentNode.querySelector("iframe")
                    if (Discuz_Advanced_iframe) {
                        let bodyElement = Discuz_Advanced_iframe.contentDocument.body
                        let img = document.createElement('img')
                        img.src = AutoInsert_message_content
                        bodyElement.appendChild(img)
                        Find_Editor = true
                    }
                    else {
                        Discuz_Advanced.value += '[img]' + AutoInsert_message_content + '[/img]'
                        Find_Editor = true
                    }
                } catch (error) {
                }
            }

        }
        //v2exReply
        if (currentURL.toLowerCase().includes("v2ex.com")) {
            if (Find_Editor == true) { return; }
            let reply_content_Advanced = document.getElementById("topic_content")
            if (reply_content_Advanced && reply_content_Advanced.type != "hidden") {
                reply_content_Advanced.value += '![' + "图片" + '](' + AutoInsert_message_content + ')'
                let inputEvent = new Event('input', { bubbles: true });
                reply_content_Advanced.dispatchEvent(inputEvent);
                Find_Editor = true
            }
            if (pageText.toLowerCase().includes("请尽量让自己的回复能够对别人有帮助")) {
                if (Find_Editor == true) { return; }
                let reply_content = document.getElementById("reply_content")
                if (reply_content) {
                    reply_content.value += AutoInsert_message_content
                    let inputEvent = new Event('input', { bubbles: true });
                    reply_content.dispatchEvent(inputEvent);
                    Find_Editor = true
                }
            }
        }
        //nodeseek
        if (currentURL.toLowerCase().includes("nodeseek.com")) {
            if (Find_Editor == true) { return; }
            let nodeseek = document.getElementById("markdown-input")
            if (nodeseek) {
                nodeseek.value += '![' + "图片" + '](' + AutoInsert_message_content + ')'
                Find_Editor = true
                let inputEvent = new Event('input', { bubbles: true });
                nodeseek.dispatchEvent(inputEvent);
            }

        }
        //hostevaluate
        if (currentURL.toLowerCase().includes("hostevaluate.com")) {
            if (Find_Editor == true) { return; }
            let hostevaluate = document.getElementsByClassName("write-container")
            if (hostevaluate.length) {
                let write = hostevaluate[hostevaluate.length - 1].querySelector(".write")
                write.value += '![' + "图片" + '](' + AutoInsert_message_content + ')'
                let inputEvent = new Event('input', { bubbles: true });
                write.dispatchEvent(inputEvent);
                Find_Editor = true
            }
        }
        if (currentURL.toLowerCase().includes("lowendtalk.com")) {
            if (Find_Editor == true) { return; }
            let lowendtalkEditor = document.getElementById("Form_Body")
            if (lowendtalkEditor) {
                lowendtalkEditor.value += '![' + "图片" + '](' + AutoInsert_message_content + ')';
                Find_Editor = true
            }
        }
        //Typecho
        if (pageText.toLowerCase().includes("typecho")) {
            if (Find_Editor == true) { return; }
            let text = document.getElementById("text")
            if (text) {
                text.value += '![' + "图片" + '](' + AutoInsert_message_content + ')'
                let inputEvent = new Event('input', { bubbles: true });
                text.dispatchEvent(inputEvent);
                Find_Editor = true
            }
        }
        // phpbb
        let phpbbForum = document.getElementById("phpbb")
        if (phpbbForum) {
            if (Find_Editor == true) { return; }
            window.postMessage({ type: 'phpbbForum', data: '[img]' + AutoInsert_message_content + '[/img]' }, '*');
            Find_Editor = true
        }
        //CodeMirror5
        let CodeMirror = document.querySelector(".CodeMirror");
        if (CodeMirror) {
            if (Find_Editor == true) { return; }
            window.postMessage({ type: 'CodeMirror5', data: '![' + "描述" + '](' + AutoInsert_message_content + ')' }, '*');
            Find_Editor = true
        }
        //CodeMirror6
        let CodeMirror6 = document.querySelector(".cm-content");
        if (CodeMirror6) {
            if (Find_Editor == true) { return; }
            let item = document.createElement('div');
            item.className = "cm-line"
            item.dir = "auto"
            item.innerText = '![' + "描述" + '](' + AutoInsert_message_content + ')'
            CodeMirror6.appendChild(item)
            console.log(CodeMirror6);
            Find_Editor = true
        }
        //Gutenberg Editor
        let Gutenberg = document.getElementById("wpbody-content")
        if (Gutenberg) {
            if (Find_Editor == true) { return; }
            window.postMessage({ type: 'Gutenberg', data: AutoInsert_message_content }, '*');
            Find_Editor = true
        }


        for (let i = 0; i < scripts.length; i++) {
            if (Find_Editor == true) { return; }
            let src = scripts[i].getAttribute('src');

            // TinyMCE 5/6 Editor
            if (src && src.includes('tinymce')) {
                window.postMessage({ type: 'TinyMCE', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                Find_Editor = true
                break; // 终止整个循环
            }
            // wangeditor
            if (src && src.includes('wangeditor')) {
                window.postMessage({ type: 'wangeditor', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                Find_Editor = true
                break;
            }
            // ckeditor4
            if (src && src.includes('ckeditor4')) {
                window.postMessage({ type: 'ckeditor4', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                Find_Editor = true
                break;
            }
            // ckeditor5
            if (src && src.includes('ckeditor5')) {
                window.postMessage({ type: 'ckeditor5', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                Find_Editor = true
                break;
            }
            // ckeditor4/5
            if (src && src.includes('ckeditor')) {
                // 当不是4和5的时候，执行这条命令然后使用4的方法注入
                window.postMessage({ type: 'ckeditor', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                Find_Editor = true
                break;
            }
            // Halo
            if (src && src.includes('halo')) {
                let HaloEditor_Element = document.querySelector('.ProseMirror');
                if (HaloEditor_Element) {
                    HaloEditor_Element.focus();
                    document.execCommand('insertImage', false, AutoInsert_message_content);
                    Find_Editor = true
                }
                break;
            }
            // ueditor 百度
            if (src && src.includes('ueditor')) {
                window.postMessage({ type: 'ueditor', data: AutoInsert_message_content }, '*');
                Find_Editor = true
                break;
            }
        }

        // iframe套娃编辑器插入
        let iframe = document.querySelector('iframe');
        if (iframe) {
            if (Find_Editor == true) { return; }
            let iframeStyles = window.getComputedStyle(iframe);
            if (iframeStyles.display === 'none') {
                let textarea = document.querySelector('textarea')
                let textareaStyles = window.getComputedStyle(textarea);
                if (textareaStyles.display === 'none') {
                    return;
                }
                textarea.value += '[img]' + AutoInsert_message_content + '[/img]'
                Find_Editor = true
            }

            let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            let editableElement = iframeDocument.querySelector('[contenteditable="true"]');

            if (editableElement) {
                // 创建图片元素并设置属性
                let imgElement = document.createElement('img');
                imgElement.src = AutoInsert_message_content;
                imgElement.alt = '图片';
                // 插入图片元素
                editableElement.appendChild(imgElement);
                Find_Editor = true
            }
        }
    })
}

