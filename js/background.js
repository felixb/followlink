const followLinkModeSameTab = 1;
const followLinkModeNewTab = 2;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
      if (request.mode == followLinkModeNewTab) {
        chrome.tabs.create({url: request.url});
      } else {
        chrome.tabs.update({url: request.url});
      }
    });