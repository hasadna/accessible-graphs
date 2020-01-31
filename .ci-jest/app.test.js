require('../public/app.js');


/**
* Stuff and things
*/
function test_populateTtsList() {
  document.body.innerHTML = [
    '<div class="container-fluid">',
      '<select id="ttsVoice">',
      '</select>',
    '</div>',
  ].join('');

  test('Can ttsVoice be populated', () => {
    const ttsVoiceSelect = document.getElementById('ttsVoice');
    const select_node = document.createElement('select');
    select_node.id = "ttsVoice";

    expect(ttsVoiceSelect).toStrictEqual(select_node);
  });

}

test_populateTtsList();

/**
 * Attribution
 *
 * https://stackoverflow.com/questions/45200395/jest-mock-window-or-document-object
 * https://jestjs.io/docs/en/tutorial-jquery
 */
