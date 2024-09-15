// background.js

let tabsInfo = {};

// Listener for incoming messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // If the message is from content script
  if (request.source === 'ConsoleCapture') {
    handleContentMessage(sender.tab.id, request);
    sendResponse({success: true});
    return;
  }

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

// Handle messages from content scripts
function handleContentMessage(tabId, message) {
  if (!tabsInfo[tabId]) {
    tabsInfo[tabId] = {logs: [], isCapturing: false};
  }

  // Only capture logs if capturing is active
  if (!tabsInfo[tabId].isCapturing) return;

  let logEntry = null;

  switch (message.type) {
    case 'log':
    case 'info':
    case 'warn':
    case 'error':
      logEntry = formatContentLog(message.type, message.args);
      break;
    case 'unhandledPromiseRejection':
      logEntry = formatUnhandledRejection(message.reason);
      break;
    case 'exception':
      logEntry = formatContentException(message);
      break;
    default:
      // Unknown type
      break;
  }

  if (logEntry) {
    tabsInfo[tabId].logs.push(logEntry);
  }
}

// Format logs from content scripts
function formatContentLog(type, args) {
  const timestamp = new Date().toISOString();
  let category = type.toUpperCase();

  // Further categorize if needed
  if (category === 'ERROR') {
    const text = args.map(arg => formatArgument(arg)).join(' ');
    if (text.includes('Unhandled Promise Rejection')) {
      category = 'EXCEPTION'; // Grouping under 'EXCEPTION'
    } else if (text.includes('Exception')) {
      category = 'EXCEPTION';
    } else if (text.includes('Failed to load resource') || text.includes('Network Error')) {
      category = 'NETWORKERROR';
    } else if (text.includes('CORS policy')) {
      category = 'CORSERROR';
    }
  } else if (category === 'WARNING') {
    const text = args.map(arg => formatArgument(arg)).join(' ');
    if (text.toLowerCase().includes('deprecated')) {
      category = 'DEPRECATIONWARNING';
    } else if (text.toLowerCase().includes('mixed content') || text.toLowerCase().includes('csp')) {
      category = 'SECURITYWARNING';
    }
  }

  const messageText = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');

  return {
    timestamp: timestamp,
    level: category,
    message: `[${timestamp}] [${category}] ${messageText}`
  };
}

// Format unhandled promise rejections
function formatUnhandledRejection(reason) {
  const timestamp = new Date().toISOString();
  let messageText = '';
  if (typeof reason === 'object') {
    messageText = JSON.stringify(reason);
  } else {
    messageText = String(reason);
  }
  return {
    timestamp: timestamp,
    level: 'EXCEPTION', // Grouping under 'EXCEPTION'
    message: `[${timestamp}] [EXCEPTION] Unhandled Promise Rejection: ${messageText}`
  };
}

// Format exceptions
function formatContentException(message) {
  const timestamp = new Date().toISOString();
  const text = message.message || '';
  return {
    timestamp: timestamp,
    level: 'EXCEPTION',
    message: `[${timestamp}] [EXCEPTION] ${text}`
  };
}

// Helper to format arguments
function formatArgument(arg) {
  if (typeof arg === 'string') {
    return arg;
  } else if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg);
    } catch (e) {
      return String(arg);
    }
  } else {
    return String(arg);
  }
}

// Start capturing logs using the debugger API
function startCapturing(tabId) {
  if (!tabsInfo[tabId]) {
    tabsInfo[tabId] = {logs: [], isCapturing: false};
  }

  // Attach debugger
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

    // Inject content script into the tab
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Script injection failed: ' + chrome.runtime.lastError.message);
      }
    });
  });
}

// Stop capturing logs using the debugger API
function stopCapturing(tabId) {
  if (tabsInfo[tabId] && tabsInfo[tabId].isCapturing) {
    // Detach debugger
    chrome.debugger.detach({tabId: tabId}, function() {
      if (chrome.runtime.lastError) {
        console.error('Debugger detach failed: ' + chrome.runtime.lastError.message);
        return;
      }

      tabsInfo[tabId].isCapturing = false;
      chrome.debugger.onEvent.removeListener(onEvent);

      // Remove content script from the tab
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          // Function to remove the injected script
          window.removeEventListener('message', null);
          const script = document.querySelector('script[src="content.js"]');
          if (script) script.remove();
        }
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Script removal failed: ' + chrome.runtime.lastError.message);
        }
      });
    });
  }
}

// Handle events from the debugger API
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
    // Optionally, notify the popup or update badge counts here
  }
}

// Format logs from the debugger API
function formatLogEntry(entry) {
  const timestamp = new Date(entry.timestamp * 1000).toISOString();
  const level = entry.level.toUpperCase();
  const text = entry.text || '';
  
  // Categorize additional error types based on the level or text
  let category = level;
  
  if (level === 'ERROR') {
    if (text.includes('Unhandled Promise Rejection')) {
      category = 'EXCEPTION'; // Grouping under 'EXCEPTION'
    } else if (text.includes('Exception')) {
      category = 'EXCEPTION';
    } else if (text.includes('Failed to load resource') || text.includes('Network Error')) {
      category = 'NETWORKERROR';
    } else if (text.includes('CORS policy')) {
      category = 'CORSERROR';
    }
  } else if (level === 'WARNING') {
    if (text.toLowerCase().includes('deprecated')) {
      category = 'DEPRECATIONWARNING';
    } else if (text.toLowerCase().includes('mixed content') || text.toLowerCase().includes('csp')) {
      category = 'SECURITYWARNING';
    }
  }

  // Additional categorization for Network Errors and CORS Errors
  if (level === 'ERROR') {
    if (text.includes('Failed to load resource') || text.includes('Network Error')) {
      category = 'NETWORKERROR';
    }
    if (text.includes('CORS policy')) {
      category = 'CORSERROR';
    }
  }

  return {
    timestamp: timestamp,
    level: category, // Use category instead of level
    message: `[${timestamp}] [${category}] ${text}`
  };
}

// Format console messages from the debugger API
function formatConsoleMessage(message) {
  const timestamp = message.timestamp ? new Date(message.timestamp * 1000).toISOString() : new Date().toISOString();
  let level = message.level.toUpperCase();
  const text = getMessageText(message);
  
  // Categorize additional error types based on the level or text
  let category = level;
  
  if (level === 'ERROR') {
    if (text.includes('Unhandled Promise Rejection')) {
      category = 'EXCEPTION'; // Grouping under 'EXCEPTION'
    } else if (text.includes('Exception')) {
      category = 'EXCEPTION';
    } else if (text.includes('Failed to load resource') || text.includes('Network Error')) {
      category = 'NETWORKERROR';
    } else if (text.includes('CORS policy')) {
      category = 'CORSERROR';
    }
  } else if (level === 'WARNING') {
    if (text.toLowerCase().includes('deprecated')) {
      category = 'DEPRECATIONWARNING';
    } else if (text.toLowerCase().includes('mixed content') || text.toLowerCase().includes('csp')) {
      category = 'SECURITYWARNING';
    }
  }

  return {
    timestamp: timestamp,
    level: category, // Use category instead of level
    message: `[${timestamp}] [${category}] ${text}`
  };
}

// Helper to extract message text
function getMessageText(message) {
  if (message.parameters) {
    return message.parameters.map(param => formatRemoteObject(param)).join(' ');
  }
  return message.text || '';
}

// Helper to format remote objects
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

// Format exceptions from the debugger API
function formatException(exception) {
  const timestamp = new Date().toISOString();
  const level = 'EXCEPTION';
  const text = exception.exception ? exception.exception.description : exception.text;
  return {
    timestamp: timestamp,
    level: level,
    message: `[${timestamp}] [${level}] ${text}`
  };
}
