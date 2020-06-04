function fillTutorial() {
    initLanguage();
    let url = window.location.pathname;
    let filePath = getFilePath(url);
    let mdFilePath = filePath.split('.')[0] + '.md';
    fetch(mdFilePath)
        .then(Response => Response.text())
        .then(mdText => {
        let converter = new showdown.Converter();
        let html = converter.makeHtml(mdText);
        document.getElementById('tutorialDiv').innerHTML = html;
    });
    document.title = filePathToTitle[filePath];
    document.getElementsByTagName('html')[0].setAttribute('lang', findDocumentLanguage(filePath));
    document.getElementsByTagName('h1')[0].innerHTML = filePathToHeading[filePath];
}
function getFilePath(url) {
    return url.split('/').slice(-3).join('/');
}
function findDocumentLanguage(filePath) {
    let tutorialLanguage = filePath.split('_')[0];
    if (tutorialLanguage === '/hebrew') {
        return 'he';
    }
    else if (tutorialLanguage === '/english') {
        return 'en';
    }
    else {
        return '';
    }
}
const filePathToTitle = {
    '/english_guides/tutorial_braille_en.html': 'Braille tutorial - Sensory interface',
    '/english_guides/usage_tutorial_en.html': 'Basic Sensory Interface guide',
    '/hebrew_guides/tutorial_braille_he.html': 'אודות השימוש בשיטת הברייל במערכת Sensory interface',
    '/hebrew_guides/usage_tutorial_he.html': 'מדריך התנסות במערכת Sensory interface'
};
const filePathToHeading = {
    '/english_guides/tutorial_braille_en.html': 'Sensory interface braille tutorial',
    '/english_guides/usage_tutorial_en.html': 'Sensory Interface basic guide',
    '/hebrew_guides/tutorial_braille_he.html': 'אודות השימוש בשיטת הברייל במערכת Sensory interface',
    '/hebrew_guides/usage_tutorial_he.html': 'מדריך למערכת Sensory Interface'
};
//# sourceMappingURL=tutorialHandler.js.map