// 拥有完整dom权限
window.addEventListener('message', function (event) {
    console.log("postMessage监听: ", event.data);
    if (event.data.type === 'CodeMirror5') {
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
    if (event.data.type === 'tinymce_5or6') {
        try {
            let TinyMCEs = tinymce.activeEditor;
            if (TinyMCEs) {
                tinymce.activeEditor.execCommand('mceInsertContent', false, event.data.data);
                window.postMessage({ type: 'TinyMCEResponse', status: 'success', data: 'true' }, '*');
            }
        } catch (error) {
            window.postMessage({ type: 'TinyMCEResponse', status: 'error', data: 'false', "error": error }, '*');
        }
    }
    if (event.data.type === 'wangeditor') {
        try {
            let wangeditor_Element = editor.getEditableContainer()
            if (wangeditor_Element) {
                editor.dangerouslyInsertHtml(event.data.data)
                window.postMessage({ type: 'WangeditorResponse', status: 'success', data: 'true' }, '*');
            }
        } catch (error) {
            window.postMessage({ type: 'WangeditorResponse', status: 'error', data: 'false', "error": error }, '*');
        }

    }
    if (event.data.type === 'ckeditor_4or5') {
        try {
            let ckeditor_Element = Object.values(CKEDITOR.instances)[0];
            if (ckeditor_Element) {
                ckeditor_Element.insertHtml(event.data.data);
                window.postMessage({ type: 'ckeditorResponse', status: 'success', data: 'true' }, '*');
            }
            return;
        } catch (error) {
            window.postMessage({ type: 'ckeditorResponse', status: 'error', data: 'false', "error": error }, '*');
        }
        try {
            let ckeditor_Element = editor;
            if (ckeditor_Element) {
                const content = ckeditor_Element.getData();
                ckeditor_Element.setData(content + event.data.data);
                window.postMessage({ type: 'ckeditorResponse', status: 'success', data: 'true' }, '*');
            }
            return;
        } catch (error) {
            window.postMessage({ type: 'ckeditorResponse', status: 'error', data: 'false', "error": error }, '*');
        }
    }
    if (event.data.type === 'ckeditor_4') {
        try {
            let ckeditor_Element = Object.values(CKEDITOR.instances)[0];
            if (ckeditor_Element) {
                ckeditor_Element.insertHtml(event.data.data);
                window.postMessage({ type: 'ckeditor4Response', status: 'success', data: 'true' }, '*');
            }
        } catch (error) {
            window.postMessage({ type: 'ckeditor4Response', status: 'error', data: 'false', "error": error }, '*');
        }

    }
    if (event.data.type === 'ckeditor_5') {
        try {
            let ckeditor_Element = editor;
            if (ckeditor_Element) {
                const content = ckeditor_Element.getData();
                ckeditor_Element.setData(content + event.data.data);
                window.postMessage({ type: 'ckeditor5Response', status: 'success', data: 'true' }, '*');
            }
        } catch (error) {
            window.postMessage({ type: 'ckeditor5Response', status: 'error', data: 'false', "error": error }, '*');
        }

    }
    if (event.data.type === 'ueditor') {
        try {
            let ueditor_Element = UE.getEditor("editor_content");
            if (ueditor_Element) {
                ueditor_Element.execCommand('insertimage', {
                    src: event.data.data,
                });
                window.postMessage({ type: 'ueditorResponse', status: 'success', data: 'true' }, '*');
            }
        } catch (error) {
            window.postMessage({ type: 'ueditorResponse', status: 'error', data: 'false', "error": error }, '*');
        }

    }
    if (event.data.type === 'phpbbForum') {
        try {
            let phpbbForum = phpbb;
            if (phpbbForum) {
                let phpbbEditor = document.getElementById("message")
                phpbbEditor.value += event.data.data;
                event.source.postMessage({ type: 'phpbbForumResponse', data: true }, event.origin);
            }
        } catch (error) {
            event.source.postMessage({ type: 'phpbbForumResponse', data: false }, event.origin);
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
    //刷新
    if (event.data.type === 'pageRefresh') {
        window.location.reload();
    }
});
function detectEncoding() {
    const charsetMeta = document.querySelector('meta[charset]');
    if (charsetMeta) {
        return charsetMeta.getAttribute('charset').toLowerCase();
    }
    return 'unknown';
}

function insertImageDiv(element, link, CssName) {
    const imgDiv = document.createElement('div');
    const imgElement = document.createElement('img');
    imgElement.src = link;
    if (CssName) {
        imgElement.className = CssName;
    }
    imgElement.loading = "lazy";

    imgDiv.appendChild(imgElement);
    element.appendChild(imgDiv);
    imgElement.onload = function () {
        imgDiv.className = `position-relative PL-ImgMark`;
        imgElement.alt = "转换";
        imgElement.title = link;

        if (!CssName) {
            // 如果图片宽度大于父元素宽度，将图片宽度设置为100%
            if (imgElement.width > element.clientWidth) {
                imgElement.style.width = "100%";
            }
        }

    };
    imgElement.onerror = function () {
        imgDiv.remove()
    };
}

function FullDomAutoInsert() {
    let item = document.createElement('div');
    item.className = "insertContentIntoEditorPrompt"
    item.innerText = "😍上传"
    item.addEventListener('click', function () {
        window.postMessage({ type: 'insertContentIntoEditorPrompt_Click', data: true }, '*');
    });
    const supportedImageFormats = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico'];
    const detectedEncoding = detectEncoding();
    if (detectedEncoding !== 'utf-8') {
        // 不是utf-8
        item.innerText = "Upload"
    }

    let success = false;
    let pageText = document.body.innerText;
    let currentURL = window.location.href;
    //Discuz
    if (pageText.toLowerCase().includes("discuz") || pageText.toLowerCase().includes("论坛") == true) {
        let DiscuzReply = document.getElementById("fastpostmessage")
        let Discuz_ReplyAdvanced = document.getElementById("e_textarea")
        if (DiscuzReply) {
            let fastpostsubmit = document.getElementById("fastpostsubmit")
            fastpostsubmit.parentNode.appendChild(item)
            success = "Discuz"
        }
        if (Discuz_ReplyAdvanced) {
            Discuz_ReplyAdvanced.parentNode.parentNode.appendChild(item)
            success = "Discuz"
        }
        // url转图片
        const topicContentElements = Array.from(document.querySelectorAll('.t_f'));
        ContentElements(topicContentElements);
        function ContentElements(ContentElements) {
            if (ContentElements.length < 1) {
                return;
            }
            for (const replyContent of ContentElements) {
                const clonedParagraph = replyContent.cloneNode(true);
                const imgElements = Array.from(clonedParagraph.querySelectorAll('img'));
                for (const imgElement of imgElements) {
                    imgElement.remove();
                }

                const text = clonedParagraph.textContent;
                const imageLinks = text.match(/https?:\/\/[^\s]+/g) || [];
                // 去除屁股的html标签
                const cleanedImageLinks = imageLinks.map(link => link.replace(/<\/?[^>]+(>|$)/g, ''));
                cleanedImageLinks.forEach(link => {
                    insertImageDiv(replyContent, link);
                });
            }
        }


    }
    //v2exReply
    if (currentURL.toLowerCase().includes("v2ex.com")) {
        if (success != false) {
            return success;
        }
        let topic_content = document.getElementById("topic_content")
        if (pageText.toLowerCase().includes("主题创建指南")) {
            if (topic_content) {
                topic_content.parentNode.appendChild(item)
                success = true
            }
        }
        let reply_content = document.getElementById("reply_content")
        if (reply_content) {
            reply_content.parentNode.appendChild(item)
            item.title = "v2ex提示:非imgur图床,未安装用户无法预览"
            success = true
        }
        // url转图片
        const topicContentElements = Array.from(document.querySelectorAll('.topic_content'));
        ContentElements(topicContentElements)
        const replyContentElements = Array.from(document.querySelectorAll('.reply_content'));
        ContentElements(replyContentElements)
        function ContentElements(ContentElements) {
            if (ContentElements.length < 1) {
                return
            }
            for (const replyContent of ContentElements) {
                const anchorElements = Array.from(replyContent.querySelectorAll('a'));
                for (const anchorElement of anchorElements) {
                    const imgElements = Array.from(anchorElement.querySelectorAll('img'));
                    if (imgElements.length === 0) {
                        const href = anchorElement.getAttribute('href');
                        insertImageDiv(anchorElement, href, "embedded_image");
                    }
                }
            }
        }

    }
    //nodeseek
    if (currentURL.toLowerCase().includes("nodeseek.com")) {
        if (success != false) {
            return success;
        }
        let nodeseek = document.getElementById("markdown-input")
        if (nodeseek) {
            nodeseek.parentNode.parentNode.appendChild(item)
            success = "nodeseek"
        }

        const topicContentElements = Array.from(document.querySelectorAll('.post-content'));
        ContentElements(topicContentElements);
        function ContentElements(ContentElements) {
            if (ContentElements.length < 1) {
                return;
            }
            for (const replyContent of ContentElements) {
                const anchorElements = Array.from(replyContent.querySelectorAll('p'));
                for (const anchorElement of anchorElements) {
                    const clonedParagraph = anchorElement.cloneNode(true);
                    const imgElements = Array.from(clonedParagraph.querySelectorAll('img'));
                    for (const imgElement of imgElements) {
                        imgElement.remove();
                    }
                    const text = clonedParagraph.textContent;
                    const imageLinks = text.match(/https?:\/\/[^\s]+/g) || [];
                    // 去除屁股的html标签
                    const cleanedImageLinks = imageLinks.map(link => link.replace(/<\/?[^>]+(>|$)/g, ''));
                    cleanedImageLinks.forEach(link => {
                        insertImageDiv(anchorElement, link);
                    });
                }
            }
        }

        setTimeout(function () {
            let element = document.querySelector(".insertContentIntoEditorPrompt");
            if (element) {
                let parent = element.parentNode;
                for (let i = 0; i < 2; i++) {
                    let br = document.createElement("br");
                    parent.insertBefore(br, element);
                }
            }

        }, 1000);

    }
    //Xiuno
    if (pageText.toLowerCase().includes("xiuno")) {
        if (success != false) {
            return success;
        }
        if (pageText.toLowerCase().includes("粗体") || pageText.toLowerCase().includes("回帖")) {
            let Xiuno = document.getElementById("message")
            if (Xiuno) {
                Xiuno.parentNode.parentNode.appendChild(item)
                success = "Xiuno"
            }
        }
        if (pageText.toLowerCase().includes("回复") || pageText.toLowerCase().includes("楼主")) {
            item.innerText = "😭上传"
        }
    }
    //hostevaluate
    if (currentURL.toLowerCase().includes("hostevaluate.com")) {
        if (success != false) {
            return success;
        }
        let new_topic = document.getElementById("new_topic")
        if (new_topic) {
            new_topic.parentNode.appendChild(item)
            success = "hostevaluate"
        }
    }
    //typecho
    if (pageText.toLowerCase().includes("typecho")) {
        if (success != false) {
            return success;
        }
        let Typecho = document.getElementById("btn-submit")
        if (Typecho) {
            Typecho.parentNode.appendChild(item)
            success = "typecho"
        }
    }
    //lowendtalk
    if (currentURL.toLowerCase().includes("lowendtalk.com")) {
        if (success != false) {
            return success;
        }
        let lowendtalkEditor = document.getElementById("Form_Body")
        if (lowendtalkEditor) {
            lowendtalkEditor.parentNode.appendChild(item)
            success = "lowendtalk"
        }
    }
    //CodeMirror Editor
    let editorElement = document.querySelector(".CodeMirror");
    if (editorElement) {
        if (success != false) {
            return success;
        }
        editorElement.parentNode.appendChild(item)
        success = "CodeMirror"
    }
    //Gutenberg Editor
    let Gutenberg = document.getElementById("wpbody-content")
    if (Gutenberg) {
        if (success != false) {
            return success;
        }
        let wpfooter = document.getElementsByClassName("interface-interface-skeleton__footer")
        if (wpfooter.length) {
            wpfooter[wpfooter.length - 1].appendChild(item)
            success = "Gutenberg"
        }

    }
    //halo
    let HaloEditorElement = document.getElementsByClassName("halo-rich-text-editor")
    if (HaloEditorElement.length) {
        if (success != false) {
            return success;
        }
        let HaloEditorHeader = HaloEditorElement[0].querySelector('.editor-header');
        HaloEditorHeader.appendChild(item)
        success = "halo"
    }
    let CodeMirror6 = document.querySelector(".cm-editor");
    if (CodeMirror6) {
        if (success != false) {
            return success;
        }
        CodeMirror6.parentNode.appendChild(item)
        success = "CodeMirror6"
    }
    //tinymce
    try {
        if (success != false) {
            return success;
        }
        let TinyMCE_Elements = tinymce.activeEditor
        if (TinyMCE_Elements) {
            let container = TinyMCE_Elements.getContainer();
            container.appendChild(item)
            success = "tinymce";
        }
    } catch (error) {
    }
    //wangeditor
    try {
        if (success != false) {
            return success;
        }
        let wangeditor_Elements = editor.getEditableContainer()
        if (wangeditor_Elements) {
            wangeditor_Elements.appendChild(item)
            success = "wangeditor";
        }
    } catch (error) {

    }
    //ckeditor 4
    try {
        if (success != false) {
            return success;
        }
        let ckeditor_Elements = Object.values(CKEDITOR.instances)[0];
        let ckeditor_Element_Node = ckeditor_Elements.container.$
        if (ckeditor_Element_Node) {
            ckeditor_Element_Node.appendChild(item)
            success = "ckeditor4";
        }
    } catch (error) {
    }
    //ueditor
    try {
        if (success != false) {
            return success;
        }
        let ueditor_Elements = UE.getEditor("editor_content");
        let ueditor_Elements_Node = ueditor_Elements.container
        if (ueditor_Elements_Node) {
            ueditor_Elements_Node.appendChild(item)
            success = "ueditor";
        }
    } catch (error) {

    }
    // phpbb
    try {
        if (success != false) {
            return success;
        }
        let phpbbForum = phpbb;
        if (phpbbForum) {
            let phpbbEditor = document.getElementById("message").parentElement
            phpbbEditor.appendChild(item)
            success = "phpbb";
        }
    } catch (error) {
    }

    let iframe = document.querySelector('iframe');
    if (iframe) {
        if (success != false) {
            return success;
        }
        try {
            let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            let editableElement = iframeDocument.querySelector('[contenteditable="true"]');

            if (editableElement) {
                iframe.parentNode.appendChild(item)
                success = "iframe";
            }
        } catch (error) {
            console.error(error)
        }
    }
    return success;
}
setTimeout(() => {
    let AutoInsert = FullDomAutoInsert()
    if (AutoInsert != false) {
        window.postMessage({ type: 'insertContentIntoEditorState', data: true }, '*');
    }
}, 800);

