let tabsInfo = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const tabId = request.tabId;

  switch (request.action) {
    case 'toggleCapture':
      if (tabsInfo[tabId] && tabsInfo[tabId].isCapturing) {
        stopCapturing(tabId);
        sendResponse({isCapturing: false});
      } else {
        startCapturing(tabId);
        sendResponse({isCapturing: true});
      }
      break;

    case 'getStatus':
      sendResponse({isCapturing: tabsInfo[tabId] && tabsInfo[tabId].isCapturing});
      break;

    case 'getLogs':
      sendResponse({logs: tabsInfo[tabId] ? tabsInfo[tabId].logs : []});
      break;

    case 'clearLogs':
      if (tabsInfo[tabId]) {
        tabsInfo[tabId].logs = [];
      }
      sendResponse({});
      break;
  }
});

function startCapturing(tabId) {
  if (!tabsInfo[tabId]) {
    tabsInfo[tabId] = {logs: [], isCapturing: false};
  }

  chrome.debugger.attach({tabId: tabId}, "1.3", function() {
    if (chrome.runtime.lastError) {
      console.error('Debugger attach failed: ' + chrome.runtime.lastError.message);
      return;
    }

    chrome.debugger.sendCommand({tabId: tabId}, "Log.enable");
    chrome.debugger.sendCommand({tabId: tabId}, "Console.enable");
    chrome.debugger.sendCommand({tabId: tabId}, "Runtime.enable");
    chrome.debugger.sendCommand({tabId: tabId}, "Network.enable");

    tabsInfo[tabId].isCapturing = true;

    chrome.debugger.onEvent.addListener(onEvent);
  });
}

function stopCapturing(tabId) {
  if (tabsInfo[tabId] && tabsInfo[tabId].isCapturing) {
    chrome.debugger.detach({tabId: tabId}, function() {
      if (chrome.runtime.lastError) {
        console.error('Debugger detach failed: ' + chrome.runtime.lastError.message);
        return;
      }

      tabsInfo[tabId].isCapturing = false;
      chrome.debugger.onEvent.removeListener(onEvent);
    });
  }
}

function onEvent(debuggeeId, message, params) {
  const tabId = debuggeeId.tabId;
  if (!tabsInfo[tabId] || !tabsInfo[tabId].isCapturing) return;

  let logEntry = null;

  if (message === "Log.entryAdded") {
    logEntry = formatLogEntry(params.entry);
  } else if (message === "Console.messageAdded") {
    logEntry = formatConsoleMessage(params.message);
  } else if (message === "Runtime.exceptionThrown") {
    const exception = params.exceptionDetails;
    logEntry = formatException(exception);
  }

  if (logEntry) {
    tabsInfo[tabId].logs.push(logEntry);
  }
}

function formatLogEntry(entry) {
  const timestamp = new Date(entry.timestamp * 1000).toISOString();
  const level = entry.level.toUpperCase();
  const text = entry.text || '';
  return {
    timestamp: timestamp,
    level: level,
    message: `[${timestamp}] [${level}] ${text}`
  };
}

function formatConsoleMessage(message) {
  const timestamp = message.timestamp ? new Date(message.timestamp * 1000).toISOString() : new Date().toISOString();
  const level = message.level.toUpperCase();
  const text = getMessageText(message);
  return {
    timestamp: timestamp,
    level: level,
    message: `[${timestamp}] [${level}] ${text}`
  };
}

function getMessageText(message) {
  if (message.parameters) {
    return message.parameters.map(param => formatRemoteObject(param)).join(' ');
  }
  return message.text || '';
}

function formatRemoteObject(obj) {
  if (obj.type === 'string') {
    return obj.value;
  } else if (obj.type === 'object' && obj.subtype === 'null') {
    return 'null';
  } else if (obj.type === 'undefined') {
    return 'undefined';
  } else if (obj.type === 'object' || obj.type === 'function') {
    return obj.description || obj.className || obj.type;
  } else {
    return String(obj.value);
  }
}

function formatException(exception) {
  const timestamp = new Date().toISOString();
  const level = 'ERROR';
  const text = exception.exception ? exception.exception.description : exception.text;
  return {
    timestamp: timestamp,
    level: level,
    message: `[${timestamp}] [${level}] ${text}`
  };
}
