const followLinkModeSameTab = 1;
const followLinkModeNewTab = 2;

var followLink = {
  mode: 0,
  currentPattern: null,
  currentPosition: 0,
  selectedLink: null,
  matchedLinks: null,
  unmatchedLinks: null,
  hint: null
};

function isVisible(element) {
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function eachElement(elements, callback) {
  for (var i = 0, len = elements.length; i < len; i++) {
    callback(elements[i]);
  }
}

function updateUi() {
  eachElement(followLink.unmatchedLinks, function (element) {
    element.classList.remove('follow-link-match');
    element.classList.remove('follow-link-selected');
  });
  eachElement(followLink.matchedLinks, function (element) {
    element.classList.add('follow-link-match');
    element.classList.remove('follow-link-selected');
  });

  if (followLink.mode > 0) {
    var modeString = followLink.mode == followLinkModeSameTab ? 'Follow Link' : 'Follow Link New Tab';

    if (followLink.selectedLink) {
      followLink.selectedLink.classList.remove('follow-link-match');
      followLink.selectedLink.classList.add('follow-link-selected');
      followLink.selectedLink.focus();
    }

    if (followLink.matchedLinks.length > 0) {
      followLink.hint.innerHTML = modeString + ' Pattern: ' + followLink.currentPattern + ' | Selected ' + (followLink.currentPosition + 1) + '/' + followLink.matchedLinks.length;
    } else if (followLink.currentPattern.length > 0) {
      followLink.hint.innerHTML = modeString + ' Pattern: ' + followLink.currentPattern + ' | Selected: 0';
    } else {
      followLink.hint.innerHTML = modeString + ' Pattern: ';
    }
    followLink.hint.classList.remove('follow-link-hidden');
  } else {
    followLink.hint.classList.add('follow-link-hidden');
  }
}

function matchLinks() {
  var re = followLink.mode && followLink.currentPattern ? new RegExp(followLink.currentPattern, 'i') : null;
  var allLinks = document.querySelectorAll("a");
  followLink.matchedLinks = Array();
  followLink.unmatchedLinks = Array();

  eachElement(allLinks, function (element) {
    if (re && element.innerHTML && element.innerHTML.match(re) && isVisible(element)) {
      followLink.matchedLinks.push(element);
    } else {
      followLink.unmatchedLinks.push(element);
    }
  });

  followLink.currentPosition = followLink.currentPosition % followLink.matchedLinks.length;

  if (followLink.matchedLinks.length > 0) {
    followLink.selectedLink = followLink.matchedLinks[followLink.currentPosition];
    if (followLink.selectedLink) {
      followLink.selectedLink.classList.remove('follow-link-matched');
      followLink.selectedLink.classList.add('follow-link-selected');
    }
  } else {
    followLink.selectedLink = null;
  }

  updateUi();
}

function navigateToSelectedLink() {
  if (followLink.selectedLink) {
    var url = followLink.selectedLink.href;
    chrome.runtime.sendMessage({url: url, newTab: followLink.mode == followLinkModeNewTab});
  }
}

function initMode(mode) {
  console.log('Entering follow link mode: ' + mode);
  followLink.mode = mode;
  followLink.currentPattern = '';
  followLink.currentPosition = 0;
  matchLinks();
}

function resetMode() {
  followLink.mode = 0;
  console.log('Leaving follow link mode');
  matchLinks();
}

function chgPosition(delta) {
  followLink.currentPosition += delta;
  matchLinks();
}

function removeLastCharFromPattern() {
  followLink.currentPosition = 0;
  followLink.currentPattern = followLink.currentPattern.slice(0, -1);
  matchLinks();
}

function addCharToPattern(char) {
  followLink.currentPosition = 0;
  followLink.currentPattern += char.toLocaleLowerCase();
  matchLinks();
}

function keyHandler(event) {
  if (!followLink.mode) {
    return;
  }

  if (event.code == 'Escape') {
    resetMode();
    event.preventDefault();
  } else if (event.code == 'Enter') {
    if (followLink.mode == followLinkModeNewTab) {
      navigateToSelectedLink();
      resetMode();
      event.preventDefault();
    } else {
      resetMode();
      // let the default event handler click on the link
    }
  } else if (event.code == 'Tab') {
    chgPosition(event.shiftKey ? -1 : +1);
    event.preventDefault();
  } else if (event.code == 'Backspace') {
    removeLastCharFromPattern();
    event.preventDefault();
  } else if (!event.ctrlKey && event.keyCode >= 32) {
    addCharToPattern(String.fromCharCode(event.keyCode));
    event.preventDefault();
  }
}

document.addEventListener('keydown', keyHandler);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.command == 'follow-link-same-tab') {
        initMode(followLinkModeSameTab);
      } else if (request.command == 'follow-link-new-tab') {
        initMode(followLinkModeNewTab);
      }
    });

followLink.hint = document.createElement('div');
followLink.hint.classList.add('follow-link-hint');
followLink.hint.classList.add('follow-link-hidden');
document.body.appendChild(followLink.hint);