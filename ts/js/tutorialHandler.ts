declare let showdown;

function fillTutorial() {
  let url: string = window.location.pathname;
  let filePath: string = url.split('/').slice(-3).join('/');
  let mdFilePath: string = filePath.split('.')[0] + '.md';
  fetch(mdFilePath)
  .then(Response => Response.text())
  .then(mdText => {
    let converter = new showdown.Converter();
    let html: string = converter.makeHtml(mdText);
    document.getElementById('tutorialDiv').innerHTML = html;
  });
}

