chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.newTab) {
    chrome.tabs.create({url: request.url});
  } else {
    chrome.tabs.update({url: request.url});
  }
});

chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {command: command});
  });
});