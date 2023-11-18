document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  const generateButton = document.getElementById('generateButton');
  const trashButton = document.getElementById('trash')
  const clipboardButton = document.getElementById('clipboard');

  trashButton.addEventListener('click', () => {
    chrome.storage.local.remove(['completionText', 'cost'], () => {
      // After removing the item, update the popup text
      updatePopupText('');
      updateCost('');
    });
  });

  clipboardButton.addEventListener('click', () => {
    chrome.storage.local.get(['completionText'], (result) => {
      const completionText = result.completionText;
      if (completionText) {
        const extractedText = extractTextFromHTML(completionText);
        
        // Use the Clipboard API to copy the text to the clipboard
        navigator.clipboard.writeText(extractedText)
          .then(() => {
            // Change the src attribute to images/check.png to indicate action
            const imgElement = clipboardButton.querySelector('img');
            imgElement.src = 'images/check.png';
            // Set a timeout to revert the src attribute after two seconds
            setTimeout(() => {
              imgElement.src = 'images/clipboard.png';
            }, 2000);
          })
          .catch((err) => {
            console.error('Unable to copy text to clipboard', err);
          });
      }
    });
  });

  function extractTextFromHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Get all text nodes within the document body
    const textNodes = document.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let extractedText = '';

    // Iterate through text nodes and concatenate their text content
    while (textNodes.nextNode()) {
      const nodeValue = textNodes.currentNode.nodeValue.trim();
      if (nodeValue !== '') {
        extractedText += nodeValue + '\n';
      }
    }
    return extractedText.trim();
}




  // Load the persisted text when the popup is opened
  chrome.storage.local.get(['completionText', 'cost'], (result) => {
    const completionText = result.completionText;
    const cost = result.cost;
    if (completionText) {
      updatePopupText(completionText);
    }
    if (cost) {
      updateCost(cost)
    }
  });



  generateButton.addEventListener('click', function() {
    const task = taskInput.value;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const videoId = extractVideoId(tabs[0].url);
      if (videoId && task) {
        // Send data to the API endpoint
        sendDataToAPI(videoId, task);
      } else {
        console.error('Failed to extract video ID from the YouTube page URL or no task defined');
      }
    });
  });

  function extractVideoId(url) {
    const videoIdMatch = url.match(/v=([A-Za-z0-9_\-]+)/);
    if (videoIdMatch) {
      return videoIdMatch[1];
    }
    return null;
  }

  function sendDataToAPI(videoId, task) {
    updatePopupText("")
    updateCost('')
    
    const generateButtonImg = generateButton.querySelector('img');

    // Change the src attribute to the loading indicator
    generateButtonImg.src = 'images/spinner-gap.png';
    generateButtonImg.classList.add('loading-spinner');

    fetch('http://127.0.0.1:8000/api/perform-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoId, task: task }),
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response from your server...
        console.log("response data:", data)
        const completionText = data.completion.text;
        
        const costString = data.completion.cost
        const cost = parseFloat(costString).toFixed(5)

        // Save the text to local storage
        chrome.storage.local.set({ 'completionText': completionText, 'cost': cost }, function() {
          updatePopupText(completionText);
          updateCost(cost)
        });
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        taskInput.value = "";
        // Revert the src attribute after fetch request complete
        generateButtonImg.classList.remove('loading-spinner');
        generateButtonImg.src = 'images/send.png'
      });
}


  // Function to update the text in your popup
  function updatePopupText(text) {
      // Assuming you have an element with the ID "popupText" to display the text
      const popupTextElement = document.getElementById('popupText');
      if (popupTextElement) {
      popupTextElement.innerHTML = text;
      }
  }

  // Function to update the cost indicator in your popup
  function updateCost(cost) {
    // Assuming you have an element with the ID "popupText" to display the text
    const popupCostElement = document.getElementById('cost');
    if (!cost){
      popupCostElement.innerText = '';
    } else {
      popupCostElement.innerText = ` Cost: $${cost} `;
    }
}

  });