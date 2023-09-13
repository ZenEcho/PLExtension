window.addEventListener('message', function (event) {
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
            console.log(TinyMCEs)
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
            console.log(ckeditor_Element)
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
            console.log(ckeditor_Element)
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
});

function plB(Element) {
    let item = document.createElement('div');
    item.className = "insertContentIntoEditorPrompt"
    item.innerText = "😍盘络"
    item.addEventListener('click', function () {
        window.postMessage({ type: 'insertContentIntoEditorPrompt_Click', data: true }, '*');
    });
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