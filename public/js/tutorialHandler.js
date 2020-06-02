function fillTutorial() {
    let url = window.location.pathname;
    let filePath = url.split('/').slice(-3).join('/');
    let mdFilePath = filePath.split('.')[0] + '.md';
    fetch(mdFilePath)
        .then(Response => Response.text())
        .then(mdText => {
        let converter = new showdown.Converter();
        let html = converter.makeHtml(mdText);
        document.getElementById('tutorialDiv').innerHTML = html;
    });
}
//# sourceMappingURL=tutorialHandler.js.map