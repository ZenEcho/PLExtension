/**
    * 编辑器的初始识别和状态
    */
function insertContentIntoEditorState() {
    let pageText = document.body.innerText;
    let item = document.createElement('div');
    item.className = "insertContentIntoEditorPrompt"
    item.innerText = "😍盘络"
    //Discuz
    if (pageText.toLowerCase().includes("discuz") || pageText.toLowerCase().includes("论坛") == true) {
        let DiscuzReply = document.getElementById("fastpostmessage")
        let Discuz_ReplyAdvanced = document.getElementById("e_textarea")

        if (DiscuzReply) {
            let fastpostsubmit = document.getElementById("fastpostsubmit")
            fastpostsubmit.parentNode.appendChild(item)
        }
        if (Discuz_ReplyAdvanced) {

            Discuz_ReplyAdvanced.parentNode.parentNode.appendChild(item)
        }

    }
    //v2exReply
    if (pageText.toLowerCase().includes("v2ex")) {
        let reply_content_Advanced = document.getElementById("topic_content")
        if (pageText.toLowerCase().includes("主题创建指南")) {
            if (reply_content_Advanced) {
                reply_content_Advanced.parentNode.appendChild(item)
            }
        }
    }
    //nodeseek
    if (pageText.toLowerCase().includes("nodeseek")) {
        let nodeseek = document.getElementById("markdown-input")
        if (nodeseek) {
            nodeseek.parentNode.parentNode.appendChild(item)
        }
    }
    //Xiuno
    if (pageText.toLowerCase().includes("xiuno")) {
        if (pageText.toLowerCase().includes("粗体") || pageText.toLowerCase().includes("回帖")) {
            let Xiuno = document.getElementById("message")
            if (Xiuno) {
                Xiuno.parentNode.parentNode.appendChild(item)
            }
        }
        if (pageText.toLowerCase().includes("回复") || pageText.toLowerCase().includes("楼主")) {
            item.innerText = "😭盘络"
        }


    }
    //hostevaluate
    if (pageText.toLowerCase().includes("hostevaluate")) {
        let new_topic = document.getElementById("new_topic")
        if (new_topic) {
            new_topic.parentNode.appendChild(item)
        }
    }
    //typecho
    if (pageText.toLowerCase().includes("typecho")) {
        let Typecho = document.getElementById("btn-submit")
        if (Typecho) {
            Typecho.parentNode.appendChild(item)
        }
    }
    //lowendtalk
    if (pageText.toLowerCase().includes("lowendtalk")) {
        let lowendtalkEditor = document.getElementById("Form_Body")
        if (lowendtalkEditor) {
            lowendtalkEditor.parentNode.appendChild(item)
        }
    }
    //CodeMirror Editor
    let editorElement = document.querySelector(".CodeMirror");
    if (editorElement) {
        editorElement.parentNode.appendChild(item)
    }
    //Gutenberg Editor
    let Gutenberg = document.getElementById("wpbody-content")
    if (Gutenberg) {
        let wpfooter = document.getElementsByClassName("interface-interface-skeleton__footer")
        if (wpfooter.length) {
            wpfooter[wpfooter.length - 1].appendChild(item)
        }

    }
    //halo
    let HaloEditorElement = document.getElementsByClassName("halo-rich-text-editor")
    if (HaloEditorElement.length) {
        let HaloEditorHeader = HaloEditorElement[0].querySelector('.editor-header');
        HaloEditorHeader.appendChild(item)
    }


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
/**
     * @param {url} AutoInsert_message_content 上传成功后返回的url
     */
function AutoInsertFun(AutoInsert_message_content, Start_URL) {
    chrome.storage.local.get(["AutoInsert"], function (result) {
        if (result.AutoInsert != "AutoInsert_on") { return; }
        let Find_Editor = false
        let pageText = document.body.innerText;
        let pageHtml = document.documentElement.innerHTML;
        let scripts = document.querySelectorAll('script');
        //Discuz
        if (pageText.toLowerCase().includes("discuz") || pageHtml.toLowerCase().indexOf('discuz') !== -1) {
            let Discuz = document.getElementById("fastpostmessage")
            let Discuz_Interactive_reply = document.getElementById("postmessage")
            let Discuz_Advanced = document.getElementById("e_textarea")
            let Discuz_Advanced_iframe
            try {
                Discuz_Advanced_iframe = Discuz_Advanced.parentNode.querySelector("iframe")
            } catch (error) {

            }
            if (Discuz_Interactive_reply) {
                if (Find_Editor == true) { return; }
                //如果是回复楼层
                let originalContent = Discuz_Interactive_reply.value;
                if (Start_URL == 0) {
                    Discuz_Interactive_reply.value = originalContent + "\n" + '[img]' + AutoInsert_message_content + '[/img]'
                } else {
                    Discuz_Interactive_reply.value = originalContent + "\n" + AutoInsert_message_content
                }
                Find_Editor = true
            } else if (Discuz) {
                if (Find_Editor == true) { return; }
                //如果是回复楼主

                let originalContent = Discuz.value;
                if (Start_URL == 0) {
                    Discuz.value = originalContent + "\n" + '[img]' + AutoInsert_message_content + '[/img]'
                } else {
                    Discuz.value = originalContent + "\n" + AutoInsert_message_content
                }
                Find_Editor = true
            }
            if (Discuz_Advanced) {
                if (Find_Editor == true) { return; }
                if (Discuz_Advanced_iframe) {
                    let bodyElement = Discuz_Advanced_iframe.contentDocument.body
                    let img = document.createElement('img')
                    img.src = AutoInsert_message_content
                    bodyElement.appendChild(img)
                    Find_Editor = true
                } else {
                    let originalContent = Discuz_Advanced.value;
                    if (Start_URL == 0) {
                        Discuz_Advanced.value = originalContent + "\n" + '[img]' + AutoInsert_message_content + '[/img]';
                    } else {
                        Discuz_Advanced.value = originalContent + "\n" + AutoInsert_message_content
                    }
                    Find_Editor = true
                }
            }

        }
        //v2exReply
        if (pageText.toLowerCase().includes("v2ex")) {
            if (pageText.toLowerCase().includes("主题创建指南")) {
                if (Find_Editor == true) { return; }
                let reply_content_Advanced = document.getElementById("topic_content")
                if (reply_content_Advanced) {
                    let originalContent = reply_content_Advanced.value;
                    if (Start_URL == 0) {
                        reply_content_Advanced.value = originalContent + "\n" + '![' + "请输入内容来激活本次插入" + '](' + AutoInsert_message_content + ')'
                    } else {
                        reply_content_Advanced.value = originalContent + "\n" + AutoInsert_message_content
                    }
                    let inputEvent = new Event('input', { bubbles: true });
                    reply_content_Advanced.dispatchEvent(inputEvent);
                    Find_Editor = true
                }
            }

        }
        //nodeseek
        if (pageText.toLowerCase().includes("nodeseek")) {
            if (Find_Editor == true) { return; }
            let nodeseek = document.getElementById("markdown-input")
            if (nodeseek) {
                let originalContent = nodeseek.value;
                if (Start_URL == 0) {
                    nodeseek.value = originalContent + "\n" + '![' + "图片" + '](' + AutoInsert_message_content + ')'
                } else {
                    nodeseek.value = originalContent + "\n" + AutoInsert_message_content
                }
                Find_Editor = true
                let inputEvent = new Event('input', { bubbles: true });
                nodeseek.dispatchEvent(inputEvent);
            }

        }
        //hostevaluate
        if (pageText.toLowerCase().includes("hostevaluate")) {
            if (Find_Editor == true) { return; }
            let hostevaluate = document.getElementsByClassName("write-container")
            if (hostevaluate.length) {
                let write = hostevaluate[hostevaluate.length - 1].querySelector(".write")
                let originalContent = write.value;
                if (Start_URL == 0) {
                    write.value = originalContent + "\n" + '![' + "图片" + '](' + AutoInsert_message_content + ')'
                } else {
                    write.value = originalContent + "\n" + AutoInsert_message_content
                }
                let inputEvent = new Event('input', { bubbles: true });
                write.dispatchEvent(inputEvent);
                Find_Editor = true
            }
        }
        //lowendtalk
        if (pageText.toLowerCase().includes("lowendtalk")) {
            if (Find_Editor == true) { return; }
            let lowendtalkEditor = document.getElementById("Form_Body")
            if (lowendtalkEditor) {
                if (Start_URL == 0) {
                    lowendtalkEditor.value += '![' + "图片" + '](' + AutoInsert_message_content + ')';
                } else {
                    lowendtalkEditor.value += AutoInsert_message_content;
                }
                Find_Editor = true
            }
        }
        //Typecho
        if (pageText.toLowerCase().includes("typecho")) {
            if (Find_Editor == true) { return; }
            let text = document.getElementById("text")
            if (text) {
                let originalContent = text.value;
                if (Start_URL == 0) {
                    text.value = originalContent + "\n" + '![' + "图片" + '](' + AutoInsert_message_content + ')'
                } else {
                    text.value = originalContent + "\n" + AutoInsert_message_content
                }
                let inputEvent = new Event('input', { bubbles: true });
                text.dispatchEvent(inputEvent);
                Find_Editor = true
            }
        }
        // phpbb
        let phpbbForum = document.getElementById("phpbb")
        if (phpbbForum) {
            if (Find_Editor == true) { return; }
            if (Start_URL == 0) {
                window.postMessage({ type: 'phpbbForum', data: '[img]' + AutoInsert_message_content + '[/img]' }, '*');
            } else {
                window.postMessage({ type: 'phpbbForum', data: AutoInsert_message_content }, '*');
            }

            Find_Editor = true
        }
        //CodeMirror
        let CodeMirror = document.querySelector(".CodeMirror");
        if (CodeMirror) {
            if (Find_Editor == true) { return; }
            if (Start_URL == 0) {
                window.postMessage({ type: 'CodeMirror', data: '![' + "描述" + '](' + AutoInsert_message_content + ')' }, '*');
            } else {
                window.postMessage({ type: 'CodeMirror', data: AutoInsert_message_content }, '*');
            }
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
                if (Start_URL == 0) {
                    window.postMessage({ type: 'TinyMCE', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                } else {
                    window.postMessage({ type: 'TinyMCE', data: AutoInsert_message_content }, '*');
                }
                Find_Editor = true
                break; // 终止整个循环
            }
            // wangeditor
            if (src && src.includes('wangeditor')) {
                if (Start_URL == 0) {
                    window.postMessage({ type: 'wangeditor', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                } else {
                    window.postMessage({ type: 'wangeditor', data: AutoInsert_message_content }, '*');
                }
                Find_Editor = true
                break;
            }
            // ckeditor4
            if (src && src.includes('ckeditor4')) {
                if (Start_URL == 0) {
                    window.postMessage({ type: 'ckeditor4', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                } else {
                    window.postMessage({ type: 'ckeditor4', data: AutoInsert_message_content }, '*');
                }

                Find_Editor = true
                break;
            }
            // ckeditor5
            if (src && src.includes('ckeditor5')) {
                if (Start_URL == 0) {
                    window.postMessage({ type: 'ckeditor5', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                } else {
                    window.postMessage({ type: 'ckeditor5', data: AutoInsert_message_content }, '*');
                }
                Find_Editor = true
                break;
            }
            // ckeditor4/5
            if (src && src.includes('ckeditor')) {
                // 当不是4和5的时候，执行这条命令然后使用4的方法注入
                if (Start_URL == 0) {
                    window.postMessage({ type: 'ckeditor', data: `<img src="` + AutoInsert_message_content + `">` }, '*');
                } else {
                    window.postMessage({ type: 'ckeditor', data: AutoInsert_message_content }, '*');
                }
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
    })
}

