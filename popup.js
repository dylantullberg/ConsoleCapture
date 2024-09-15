// popup.js

let currentTabId = null;

// Define grouped copy options
const groupedCopyOptions = {
  copyAllErrors: ["ERROR", "EXCEPTION", "NETWORKERROR", "CORSERROR"],
  copyAllWarnings: ["WARNING", "DEPRECATIONWARNING", "SECURITYWARNING"]
};

document.addEventListener('DOMContentLoaded', function() {
  // Toggle Capture Button
  document.getElementById('toggleCapture').addEventListener('click', toggleCapture);

  // Original Copy Buttons
  document.getElementById('btnErrors').addEventListener('click', function() {
    copyFilteredLogs(['ERROR', 'EXCEPTION', 'NETWORKERROR', 'CORSERROR'], 'Errors');
  });
  document.getElementById('btnWarnings').addEventListener('click', function() {
    copyFilteredLogs(['WARNING', 'DEPRECATIONWARNING', 'SECURITYWARNING'], 'Warnings');
  });
  document.getElementById('btnLogs').addEventListener('click', function() {
    copyFilteredLogs(['LOG'], 'Logs');
  });
  document.getElementById('btnInfo').addEventListener('click', function() {
    copyFilteredLogs(['INFO'], 'Info');
  });
  document.getElementById('btnDebug').addEventListener('click', function() {
    copyFilteredLogs(['DEBUG'], 'Debug');
  });

  // Additional Copy Buttons
  document.getElementById('btnDeprecationWarnings').addEventListener('click', function() {
    copyFilteredLogs(['DEPRECATIONWARNING'], 'Deprecation Warnings');
  });
  document.getElementById('btnNetworkErrors').addEventListener('click', function() {
    copyFilteredLogs(['NETWORKERROR'], 'Network Errors');
  });
  document.getElementById('btnCORSErrors').addEventListener('click', function() {
    copyFilteredLogs(['CORSERROR'], 'CORS Errors');
  });
  document.getElementById('btnSecurityWarnings').addEventListener('click', function() {
    copyFilteredLogs(['SECURITYWARNING'], 'Security Warnings');
  });
  document.getElementById('btnExceptions').addEventListener('click', function() {
    copyFilteredLogs(['EXCEPTION'], 'Exceptions');
  });

  // Grouped Copy Buttons
  document.getElementById('btnCopyAllErrors').addEventListener('click', function() {
    copyGroupedLogs('copyAllErrors', 'All Errors');
  });
  document.getElementById('btnCopyAllWarnings').addEventListener('click', function() {
    copyGroupedLogs('copyAllWarnings', 'All Warnings');
  });

  // Get current active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    currentTabId = tabs[0].id;
    chrome.runtime.sendMessage({action: 'getStatus', tabId: currentTabId}, function(response) {
      if (response.isCapturing) {
        document.getElementById('toggleCaptureLabel').textContent = 'Stop Capturing';
        document.getElementById('toggleCapture').classList.remove('btn-start');
        document.getElementById('toggleCapture').classList.add('btn-stop');
      }
      updateLogsDisplay();
    });
  });
});

function toggleCapture() {
  chrome.runtime.sendMessage({action: 'toggleCapture', tabId: currentTabId}, function(response) {
    const buttonLabel = document.getElementById('toggleCaptureLabel');
    const captureButton = document.getElementById('toggleCapture');

    if (response.isCapturing) {
      buttonLabel.textContent = 'Stop Capturing';
      captureButton.classList.remove('btn-start');  // Remove the start class
      captureButton.classList.add('btn-stop');      // Add the stop class
      showNotification('Capturing logs...');
    } else {
      buttonLabel.textContent = 'Start Capturing';
      captureButton.classList.remove('btn-stop');   // Remove the stop class
      captureButton.classList.add('btn-start');     // Add the start class
      showNotification('Stopped capturing logs.');

      // Reset the badge counts when stopping capture
      resetBadgeCounts();
    }
    updateLogsDisplay();
  });
}

function resetBadgeCounts() {
  const badgeIds = [
    'countErrors',
    'countWarnings',
    'countLogs',
    'countInfo',
    'countDebug',
    'countDeprecationWarnings',
    'countNetworkErrors',
    'countCORSErrors',
    'countSecurityWarnings',
    'countExceptions',
    'countCopyAllErrors',
    'countCopyAllWarnings'
  ];

  badgeIds.forEach(id => {
    document.getElementById(id).textContent = 0;
    toggleBadgeDisplay(id, 0);
  });
}

function updateLogsDisplay() {
  chrome.runtime.sendMessage({action: 'getLogs', tabId: currentTabId}, function(response) {
    const logsElement = document.getElementById('logs');
    logsElement.textContent = '';
    if (response.logs) {
      const allLogs = response.logs.map(log => log.message);
      logsElement.textContent = allLogs.join('\n');
      logsElement.scrollTop = logsElement.scrollHeight;
      updateLogCounts(response.logs);
    }
  });
}

function updateLogCounts(logs) {
  const counts = {
    'ERROR': 0,
    'WARNING': 0,
    'LOG': 0,
    'INFO': 0,
    'DEBUG': 0,
    'DEPRECATIONWARNING': 0,
    'NETWORKERROR': 0,
    'CORSERROR': 0,
    'SECURITYWARNING': 0,
    'EXCEPTION': 0
  };

  logs.forEach(log => {
    const level = log.level.toUpperCase();
    if (counts.hasOwnProperty(level)) {
      counts[level]++;
    }
  });

  // Update individual counts
  document.getElementById('countErrors').textContent = counts['ERROR'] + counts['EXCEPTION'] + counts['NETWORKERROR'] + counts['CORSERROR'];
  document.getElementById('countWarnings').textContent = counts['WARNING'] + counts['DEPRECATIONWARNING'] + counts['SECURITYWARNING'];
  document.getElementById('countLogs').textContent = counts['LOG'];
  document.getElementById('countInfo').textContent = counts['INFO'];
  document.getElementById('countDebug').textContent = counts['DEBUG'];
  document.getElementById('countDeprecationWarnings').textContent = counts['DEPRECATIONWARNING'];
  document.getElementById('countNetworkErrors').textContent = counts['NETWORKERROR'];
  document.getElementById('countCORSErrors').textContent = counts['CORSERROR'];
  document.getElementById('countSecurityWarnings').textContent = counts['SECURITYWARNING'];
  document.getElementById('countExceptions').textContent = counts['EXCEPTION'];

  // Update grouped copy buttons badges
  document.getElementById('countCopyAllErrors').textContent = counts['ERROR'] + counts['EXCEPTION'] + counts['NETWORKERROR'] + counts['CORSERROR'];
  document.getElementById('countCopyAllWarnings').textContent = counts['WARNING'] + counts['DEPRECATIONWARNING'] + counts['SECURITYWARNING'];

  // Show or hide badges based on count
  // Individual badges
  toggleBadgeDisplay('countErrors', counts['ERROR'] + counts['EXCEPTION'] + counts['NETWORKERROR'] + counts['CORSERROR']);
  toggleBadgeDisplay('countWarnings', counts['WARNING'] + counts['DEPRECATIONWARNING'] + counts['SECURITYWARNING']);
  toggleBadgeDisplay('countLogs', counts['LOG']);
  toggleBadgeDisplay('countInfo', counts['INFO']);
  toggleBadgeDisplay('countDebug', counts['DEBUG']);
  toggleBadgeDisplay('countDeprecationWarnings', counts['DEPRECATIONWARNING']);
  toggleBadgeDisplay('countNetworkErrors', counts['NETWORKERROR']);
  toggleBadgeDisplay('countCORSErrors', counts['CORSERROR']);
  toggleBadgeDisplay('countSecurityWarnings', counts['SECURITYWARNING']);
  toggleBadgeDisplay('countExceptions', counts['EXCEPTION']);

  // Grouped badges
  toggleBadgeDisplay('countCopyAllErrors', counts['ERROR'] + counts['EXCEPTION'] + counts['NETWORKERROR'] + counts['CORSERROR']);
  toggleBadgeDisplay('countCopyAllWarnings', counts['WARNING'] + counts['DEPRECATIONWARNING'] + counts['SECURITYWARNING']);
}

function toggleBadgeDisplay(badgeId, count) {
  const badge = document.getElementById(badgeId);
  if (count > 0) {
    badge.classList.add('show');
    badge.textContent = count;
  } else {
    badge.classList.remove('show');
    badge.textContent = 0;
  }
}

function copyFilteredLogs(levels, categoryName) {
  chrome.runtime.sendMessage({action: 'getLogs', tabId: currentTabId}, function(response) {
    if (response.logs && response.logs.length > 0) {
      const filteredLogs = response.logs.filter(log => levels.includes(log.level.toUpperCase()));
      if (filteredLogs.length === 0) {
        showNotification(`No ${categoryName} to copy.`);
        return;
      }
      // Structure the logs into categorized JSON
      const categorizedLogs = {
        [categoryName]: filteredLogs.map(log => ({
          timestamp: log.timestamp,
          message: log.message
        }))
      };
      const jsonOutput = JSON.stringify(categorizedLogs, null, 2);
      navigator.clipboard.writeText(jsonOutput).then(() => {
        showNotification(`${categoryName} copied to clipboard!`);
      }).catch((err) => {
        showNotification('Failed to copy logs: ' + err);
      });
    } else {
      showNotification('No logs to copy.');
    }
  });
}

function copyGroupedLogs(groupName, displayName) {
  if (!groupedCopyOptions[groupName]) {
    showNotification('Invalid copy option.');
    return;
  }

  const levels = groupedCopyOptions[groupName];
  
  chrome.runtime.sendMessage({action: 'getLogs', tabId: currentTabId}, function(response) {
    if (response.logs && response.logs.length > 0) {
      const filteredLogs = response.logs.filter(log => levels.includes(log.level.toUpperCase()));
      if (filteredLogs.length === 0) {
        showNotification(`No logs found for ${displayName}.`);
        return;
      }

      // Structure the logs into categorized JSON
      const categorizedLogs = {
        [displayName]: filteredLogs.map(log => ({
          timestamp: log.timestamp,
          level: log.level,
          message: log.message
        }))
      };

      const jsonOutput = JSON.stringify(categorizedLogs, null, 2);
      navigator.clipboard.writeText(jsonOutput).then(() => {
        showNotification(`${displayName} copied to clipboard!`);
      }).catch((err) => {
        showNotification('Failed to copy logs: ' + err);
      });
    } else {
      showNotification('No logs to copy.');
    }
  });
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}
