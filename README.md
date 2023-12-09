## AskYouTube
A simple Chrome extension that enables users to leverage the OpenAI Chat Completions endpoint on any YouTube video.

<p align="center" width="100%">
    <img width="33%" src="/askyoutube.png">
</p>

This extension simply pulls down a transcript for the video you are currently viewing and sends this to the OpenAI API with your task request. 

"Generate a vegetarian version of this recipe."

"Extract the materials list for this project."

"What was the book they recommended?"

This extension does **not** use a speech to text model to transcribe the video or an image recognition model to actually pass along information about what took place in the video. Automatically generated YouTube transcripts are not great quality, but they tend to be totally fine for the lightweight use cases when you just have a simple question on a video.  

gpt-3.5-turbo-1106 with the 16k token context window is used by default for videos under about ten minutes. For longer videos, the gpt-4-1106-preview model with a 128k context window is automatically selected. You should be able to use this for videos of to about four hours in length, but this is highly dependent on the volume of dialogue. 


## Demo Video

[![AskYouTube demo](/demo%20screenhot.png 'AskYouTube demo')](https://youtu.be/M1zq9NKIcbw?t=54)

## How to Run the Project

1. Download the Repository
- Clone or download the entire repository to your local machine.

2. Install the Chrome Extension
- Open your Chrome browser and go to "chrome://extensions."
- Toggle the "developer mode" switch to ON.
- Click "Load unpacked" on the upper left and select the "chrome-extension" folder from the local repository.
- The AskYouTube extension should now appear in your list of 'All Extensions.' Copy the displayed ID (a string of random lower-case letters).

3. Run the FastAPI Server
- Open main.py in the fastapi-server folder.
- Paste the extension ID into the allow_origins middleware:

```allow_origins=["chrome-extension://PASTE_ID_HERE"],  # Use correct extension ID```

- Save the main.py file.

- Navigate to the fastapi-server folder. Create a virtual environment inside the fastapi-server folder, activate it, and install dependencies:
```
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
```

4. Use the extension
- To use the extension locally, you will need to first start the FastAPI server. Ensure the server is running for the extension to send requests to the API.

- For regular use, consider deploying the FastAPI server and updating the code to securely access your API endpoint.


