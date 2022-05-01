// Strange Flesh © 2017 by Greatest Bear Studios
// 
// Strange Flesh is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
//
// This sourcecode has not been minified or obfuscated in any way. Enjoy.
//

const {app, BrowserWindow} = require('electron')
const path = require('path')
require('@electron/remote/main').initialize();

function createWindow () 
{
  win = new BrowserWindow({     width: 680,
    							height: 420,
    							minWidth: 680,
    							minHeight: 420,
                                webPreferences: {
                                    sandbox: false,
                                    nodeIntegration: true,
                                    contextIsolation: false,
                                    devTools: false,
                                    disableDialogs: true
                                  },
    							show: false,
                                autoHideMenuBar: true});
  
  require("@electron/remote/main").enable(win.webContents);

  win.loadFile('index.html');
  
  win.once('ready-to-show', () => 
	{
	  win.show()
	});
}

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    app.quit()
})
