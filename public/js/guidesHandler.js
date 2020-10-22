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
    else if (tutorialLanguage === '/arabic') {
        return 'ar';
    }
    else {
        return '';
    }
}
const filePathToTitle = {
    '/english_guides/tutorial_braille_en.html': 'Braille tutorial - Accessible Graphs',
    '/english_guides/usage_tutorial_en.html': 'Basic Accessible Graphs guide',
    '/english_guides/learnMore-en.html': 'Accessible Graphs for Visually Impaired and Blind Users',
    '/english_guides/guidelines-en.html': 'Design guidelines for accessible graphs',
    '/hebrew_guides/tutorial_braille_he.html': 'אודות השימוש בשיטת הברייל במערכת Accessible Graphs',
    '/hebrew_guides/usage_tutorial_he.html': 'מדריך התנסות במערכת Accessible Graphs',
    '/hebrew_guides/guidelines-he.html': 'הנחיות לעיצוב גרפים נגישים',
    '/hebrew_guides/learnMore-he.html': 'גרפים נגישים למשתמשים עם לקות ראייה ועיוורון',
    '/arabic_guides/tutorial_braille_ar.html': 'حول استعمال طريقة برايل في نظام Accessible Graphs',
    '/arabic_guides/usage_tutorial_ar.html': 'دليل لمنظومة Accessible Graphs',
    '/arabic_guides/guidelines-ar.html': 'قواعد وارشادات لأنشاء رسم بياني متاح',
    '/arabic_guides/learnMore-ar.html': 'Accessible Graphs للأشخاص ضعاف البصر والمكفوفين'
};
const filePathToHeading = {
    '/english_guides/tutorial_braille_en.html': 'Accessible Graphs braille tutorial',
    '/english_guides/usage_tutorial_en.html': 'Accessible Graphs basic guide',
    '/english_guides/learnMore-en.html': 'Accessible Graphs for Visually Impaired and Blind Users',
    '/english_guides/guidelines-en.html': 'Design guidelines for accessible graphs',
    '/hebrew_guides/tutorial_braille_he.html': 'אודות השימוש בשיטת הברייל במערכת Accessible Graphs',
    '/hebrew_guides/usage_tutorial_he.html': 'מדריך למערכת Accessible Graphs',
    '/hebrew_guides/guidelines-he.html': 'הנחיות לעיצוב גרפים נגישים',
    '/hebrew_guides/learnMore-he.html': 'גרפים נגישים למשתמשים עם לקות ראייה ועיוורון',
    '/arabic_guides/tutorial_braille_ar.html': 'حول استعمال طريقة برايل في نظام Accessible Graphs',
    '/arabic_guides/usage_tutorial_ar.html': 'دليل لمنظومة Accessible Graphs',
    '/arabic_guides/guidelines-ar.html': 'قواعد وارشادات لأنشاء رسم بياني متاح',
    '/arabic_guides/learnMore-ar.html': 'Accessible Graphs للأشخاص ضعاف البصر والمكفوفين'
};
//# sourceMappingURL=guidesHandler.js.map