/*
Debugger listening on ws://127.0.0.1:9229/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
For help, see: https://nodejs.org/en/docs/inspector
*/

const fs = require('fs-extra');
const ws = require('ws');
const assert = require('assert');

void async function () {
  console.log('Parsing the web socket address from the output');
  const log = String(await fs.readFile('code.log'));
  const [url] = log.match(/ws:\/\/\d+.\d+.\d+.\d+:\d+\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g);

  console.log('Connecting to the web socket', url)
  const socket = new ws(url, { perMessageDeflate: false });
  await new Promise(resolve => socket.once('open', resolve));

  console.log('Subscribing to callbacks');
  socket.on('message', async data => {
    const json = JSON.parse(String(data));
    switch (json.id) {
      case 1: {
        console.log('Evaluating the expression');
        // Note that we are using `var` so that we can redeclare the variables on each run making the script reentrant
        // Note that we are sending a data URI of the image as we cannot send the `NativeImage` instance itself
        const expression = `
var electron = process.mainModule.require('electron');
var webContents = electron.webContents.getAllWebContents()[0] // [1] is the shared process
new Promise(resolve => webContents.capturePage(image => resolve(image.toDataURL())));
`;
        socket.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression, awaitPromise: true } }));
        break;
      }
      case 2: {
        assert.ok(json.result.result.value);
        const buffer = Buffer.from(json.result.result.value.substring('data:image/png;base64,'.length), 'base64');
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const screenshotPath = `screenshot-${process.platform}-${timestamp}.png`;
        console.log('Saving the screenshot buffer', screenshotPath);
        await fs.writeFile(screenshotPath, buffer);
        break;
      }
      case undefined: {
        // Ignore events
        break;
      }
      default: {
        throw new Error(`Unexpected ID.`);
      }
    }
  });

  console.log('Enabling the runtime agent');
  socket.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
}()
