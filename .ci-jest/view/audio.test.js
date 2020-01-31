/**
 * Attribution
 *
 * https://stackoverflow.com/questions/55616119/testing-and-mocking-with-jest-audiocontext
 * https://stackoverflow.com/questions/12709074/how-do-you-explicitly-set-a-new-property-on-window-in-typescript/38964459#38964459
 */
window.AudioContext = jest.fn().mockImplementation(() => {
    return {}
});

require('../../public/view/audio.js');

function test_getCellMaxDistance() {
  test('Does 1 === 1', () => {
    expect(1).toStrictEqual(1);
  });
}


test_getCellMaxDistance();

/**

 */
