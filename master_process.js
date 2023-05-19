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
    if (event.data.type === 'tinymce') {
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
            console.log(editor)
            console.log("ckeditor5")
            if (ckeditor_Element) {
                const content = ckeditor_Element.getData();
                ckeditor_Element.setData(content + event.data.data);
            }
        } catch (error) {
        }

    }
});

function plB(Element) {
    let item = document.createElement('div');
    item.className = "insertContentIntoEditorPrompt"
    item.innerText = "😍盘络"
    Element.appendChild(item)
}

//TinyMCE
try {
    let TinyMCE_Element = tinymce.activeEditor
    if (TinyMCE_Element) {
        let container = TinyMCE_Element.getContainer();
        plB(container)
    }
} catch (error) {
}
//wangeditor
try {
    let wangeditor_Element = editor.getEditableContainer()
    if (wangeditor_Element) {
        plB(wangeditor_Element)
    }
} catch (error) {
}
//ckeditor 4
try {
    let ckeditor_Element = Object.values(CKEDITOR.instances)[0];
    let ckeditor_Element_Node = ckeditor_Element.container.$
    if (ckeditor_Element_Node) {
        plB(ckeditor_Element_Node)
    }
} catch (error) {
}