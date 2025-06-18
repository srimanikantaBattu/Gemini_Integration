# Gemini API Integration

This project demonstrates how to integrate Google's Gemini API using React and JavaScript.

---

## Gemini API Key Generation Guide

Follow the steps below to generate your Gemini API Key and configure it in the project:

### Step 1: Create a Google Cloud Project
Visit the following link to create a new project:  
[https://developers.google.com/workspace/guides/create-project](https://developers.google.com/workspace/guides/create-project)

### Step 2: Generate an API Key
Navigate to the following URL:  
[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)  
Click on the **"Create API Key"** button.

### Step 3: Select Your Project
From the dropdown, select the project you created in Step 1.  
Once selected, an API key will be generated. Copy this key for later use.

### Step 4: Add the API Key to the Code
Open the file `Gemini.jsx` in the project directory.  
Locate the placeholder for the API key and replace it with the key you copied:

```javascript
const API_KEY = "YOUR_API_KEY_HERE";
```
