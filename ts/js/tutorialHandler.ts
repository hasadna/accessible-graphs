declare let showdown;


function fillTutorial() {
  initLanguage();
  let url: string = window.location.pathname;
  let filePath: string = getFilePath(url);
  let mdFilePath: string = filePath.split('.')[0] + '.md';
  fetch(mdFilePath)
    .then(Response => Response.text())
    .then(mdText => {
      let converter = new showdown.Converter();
      let html: string = converter.makeHtml(mdText);
      document.getElementById('tutorialDiv').innerHTML = html;
    });
  document.title = filePathToTitle[filePath];
  document.getElementsByTagName('html')[0].setAttribute('lang', findDocumentLanguage(filePath));
  document.getElementsByTagName('h1')[0].innerHTML = filePathToHeading[filePath];
}


function getFilePath(url: string): string {
  return url.split('/').slice(-3).join('/');
}


function findDocumentLanguage(filePath: string): string {
  let tutorialLanguage: string = filePath.split('_')[0];
  if (tutorialLanguage === '/hebrew') {
    return 'he';
  } else if (tutorialLanguage === '/english') {
    return 'en';
  } else {
    return '';
  }
}


const filePathToTitle: Record<string, string> = {
  '/english_guides/tutorial_braille_en.html': 'Braille tutorial - Accessible Graphs',
  '/english_guides/usage_tutorial_en.html': 'Basic Accessible Graphs guide',
  '/hebrew_guides/tutorial_braille_he.html': 'אודות השימוש בשיטת הברייל במערכת Accessible Graphs',
  '/hebrew_guides/usage_tutorial_he.html': 'מדריך התנסות במערכת Accessible Graphs'
}


const filePathToHeading: Record<string, string> = {
  '/english_guides/tutorial_braille_en.html': 'Accessible Graphs braille tutorial',
  '/english_guides/usage_tutorial_en.html': 'Accessible Graphs basic guide',
  '/hebrew_guides/tutorial_braille_he.html': 'אודות השימוש בשיטת הברייל במערכת Accessible Graphs',
  '/hebrew_guides/usage_tutorial_he.html': 'מדריך למערכת Accessible Graphs'
}