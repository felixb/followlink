chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.newTab) {
    chrome.tabs.create({url: request.url});
  } else {
    chrome.tabs.update({url: request.url});
  }
});