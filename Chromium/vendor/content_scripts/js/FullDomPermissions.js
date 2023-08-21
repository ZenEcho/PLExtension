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
});
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


// function insertTextAtCursor(url) {
//     const textarea = document.activeElement;
//     const value = textarea.value;

//     const newValue = value + url
//     console.log(newValue);
//     textarea.value = newValue;
//     console.log(textarea.value);
//     textarea.dispatchEvent(new Event('input', { bubbles: true }));
// }