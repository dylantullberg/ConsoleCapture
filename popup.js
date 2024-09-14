let currentTabId = null;

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('toggleCapture').addEventListener('click', toggleCapture);

  // Icon buttons
  document.getElementById('btnErrors').addEventListener('click', function() {
    copyFilteredLogs('ERROR');
  });
  document.getElementById('btnWarnings').addEventListener('click', function() {
    copyFilteredLogs('WARNING');
  });
  document.getElementById('btnLogs').addEventListener('click', function() {
    copyFilteredLogs('LOG');
  });
  document.getElementById('btnInfo').addEventListener('click', function() {
    copyFilteredLogs('INFO');
  });
  document.getElementById('btnDebug').addEventListener('click', function() {
    copyFilteredLogs('DEBUG');
  });

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
  document.getElementById('countErrors').textContent = 0;
  document.getElementById('countWarnings').textContent = 0;
  document.getElementById('countLogs').textContent = 0;
  document.getElementById('countInfo').textContent = 0;
  document.getElementById('countDebug').textContent = 0;
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
    'DEBUG': 0
  };

  logs.forEach(log => {
    if (counts.hasOwnProperty(log.level)) {
      counts[log.level]++;
    }
  });

  document.getElementById('countErrors').textContent = counts['ERROR'];
  document.getElementById('countWarnings').textContent = counts['WARNING'];
  document.getElementById('countLogs').textContent = counts['LOG'];
  document.getElementById('countInfo').textContent = counts['INFO'];
  document.getElementById('countDebug').textContent = counts['DEBUG'];
}

function copyFilteredLogs(level) {
  chrome.runtime.sendMessage({action: 'getLogs', tabId: currentTabId}, function(response) {
    if (response.logs && response.logs.length > 0) {
      const filteredLogs = response.logs.filter(log => log.level === level).map(log => log.message);
      if (filteredLogs.length === 0) {
        showNotification(`No ${level.toLowerCase()}s to copy.`);
        return;
      }
      const logsText = filteredLogs.join('\n');
      navigator.clipboard.writeText(logsText).then(() => {
        showNotification(`${level}s copied to clipboard!`);
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
