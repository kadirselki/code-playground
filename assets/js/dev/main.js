let htmlEditor = CodeMirror.fromTextArea(document.getElementById("html"), {
    mode: "html",
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
});
let cssEditor = CodeMirror.fromTextArea(document.getElementById("css"), {
    mode: "css",
    lineNumbers: true,
    lineWrapping: true,

});
let jsEditor = CodeMirror.fromTextArea(document.getElementById("js"), {
    mode: "js",
    lineNumbers: true,
    lineWrapping: true,

});

const createDom = () => {
    const html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();
    return `
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <style>
            body { margin: 0; font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
                ${css}
            </style>
        </head>
        <body>
            ${html}
            <script type="text/javascript">
                ${js}
            </script>
        </body>
    `;
}

const setIframe = async (data) => {
    const iframe = document.createElement('iframe');
    let DOM = data ?? createDom()

    if(document.querySelector('#content iframe')){
        document.querySelector('#content iframe').srcdoc = DOM;
        setTimeout(() => {
            updateVariables(DOM);
        }, 10);
        return
    }
    iframe.srcdoc = DOM;
    iframe.sandbox = 'allow-same-origin allow-scripts allow-modals';
    document.getElementById('content').appendChild(iframe);
    setTimeout(() => {
        updateVariables(DOM);
    }, 10);
    console.log('asd')
}

const updateVariables = (currentDom) => {
    const states = document.querySelector('#content iframe').contentWindow.STATES;
    const replaceDoubleBraces = (data,states) =>{
        return data.replace(/{{(.+?)}}/g, (_,matched) => states[matched] || matched)
    }
    const newDOM = replaceDoubleBraces(currentDom, states);
    document.querySelector('#content iframe').srcdoc = newDOM;
}

const setHistory = () => {
    const templates = JSON.parse(localStorage.getItem('templates'));
    if(templates){
        if(!Array.isArray(templates)) return;
        document.getElementById('history').innerHTML = `<option value="">Select template</option>`;
        templates.map((item,i) => {
            const optionDom = document.createElement('option')
            optionDom.value = i;
            optionDom.innerHTML = item.name
            document.getElementById('history').appendChild(optionDom)
        })
    }
}

const selectTemplate = (event) => {
    const id = event.target.value;
    if(!id) return;
    const templates = JSON.parse(localStorage.getItem('templates'));
    const selected = templates[id];

    if(selected.html) htmlEditor.setValue(selected.html);
    if(selected.css) cssEditor.setValue(selected.css);
    if(selected.js) jsEditor.setValue(selected.js);
    setIframe();
}

const save = () => {
    let templateName = prompt("Enter your template name");
    if(templateName){
        const oldValues = JSON.parse(localStorage.getItem('templates'));
        const item = {
            name: templateName,
            dom: createDom(),
            html: htmlEditor.getValue(),
            css: cssEditor.getValue(),
            js: jsEditor.getValue()
        };
        const items = oldValues && Array.isArray(oldValues) ? [...oldValues, item] : [item];
        localStorage.setItem('templates', JSON.stringify(items))
        setHistory();
    }
}

const run = () => {
    setIframe()
}

const saveChanges = () => {
    const handleChange = (editorComponent) => {
        editorComponent.on('change', editor => {
            const value = editor.doc.getValue();
            const type = editor.doc.modeOption;
            localStorage.setItem(`${type}_editor_value`, value)
        })
    }
    handleChange(htmlEditor);
    handleChange(cssEditor)
    handleChange(jsEditor)
}

const getLocalData = () => {
    const localHtml = localStorage.getItem('html_editor_value');
    const localCss = localStorage.getItem('css_editor_value');
    const localJs = localStorage.getItem('js_editor_value');
    if(localHtml) htmlEditor.setValue(localHtml)
    if(localCss) cssEditor.setValue(localCss)
    if(localJs) jsEditor.setValue(localJs)
}

const minimize = (e) => {
    const buttonTexts = {
        active: 'Expand',
        inactive: 'Minimize'
    }
    const main = document.getElementsByTagName('main')[0]
    const button = document.getElementById('minimizebutton');
    main.classList.toggle('compact');
    e.target.classList.toggle('active');
    if(main.classList.contains('compact')){
        button.innerText = buttonTexts.active
    }else{
        button.innerText = buttonTexts.inactive
    }

}

(() =>{
    saveChanges();
    getLocalData();
    setHistory();

    htmlEditor.on('focus', function() {
        document.getElementsByClassName('editors')[0].classList.add('htmlActive')
    });
    htmlEditor.on('blur', function() {
        document.getElementsByClassName('editors')[0].classList.remove('htmlActive')
    });
    cssEditor.on('focus', function() {
        document.getElementsByClassName('editors')[0].classList.add('cssActive')
    });
    cssEditor.on('blur', function() {
        document.getElementsByClassName('editors')[0].classList.remove('cssActive')
    });
    jsEditor.on('focus', function() {
        document.getElementsByClassName('editors')[0].classList.add('jsActive')
    });
    jsEditor.on('blur', function() {
        document.getElementsByClassName('editors')[0].classList.remove('jsActive')
    });
})();


document.getElementById('runButton').addEventListener('click', run);
document.getElementById('save').addEventListener('click', save);
document.getElementById('history').addEventListener('change', selectTemplate);
document.getElementById('minimizebutton').addEventListener('click', minimize);
document.getElementById('expandButton').addEventListener('click', ((e) => {
    e.target.classList.toggle('active');
    document.getElementsByClassName('editors')[0].classList.toggle('canChangeSize')
}));


document.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); run();
    }
});







