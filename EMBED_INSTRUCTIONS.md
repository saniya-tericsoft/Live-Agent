# Embedding Janoo AI Chatbot

The chatbot can be embedded in any website or application using one of the following methods:

## Method 1: Iframe Embed (Recommended - Simplest)

This is the easiest way to embed the chatbot. Just add this code to any HTML page:

```html
<!-- Add this anywhere in your HTML -->
<iframe 
  src="http://localhost:3001/embed.html" 
  style="position: fixed; bottom: 0; right: 0; width: 500px; height: 600px; border: none; z-index: 9999; pointer-events: auto; background: transparent; overflow: visible;"
  allow="microphone"
  id="janoo-chatbot-iframe"
  scrolling="no">
</iframe>

<!-- Optional: JavaScript to make iframe clickable -->
<script>
  // Make the iframe interactive when chatbot is expanded
  const iframe = document.getElementById('janoo-chatbot-iframe');
  let isExpanded = false;
  
  // Listen for messages from iframe (if needed)
  window.addEventListener('message', (event) => {
    if (event.data.type === 'janoo-chatbot-expanded') {
      isExpanded = event.data.expanded;
      iframe.style.pointerEvents = isExpanded ? 'auto' : 'none';
    }
  });
  
  // Or simply make it always interactive (remove pointer-events: none from style)
</script>
```

### Production URL
Replace `http://localhost:3001/embed.html` with your production URL after deploying:
- Example: `https://yourdomain.com/embed.html`

## Method 2: Direct Script Embed

For more control, you can include the chatbot directly in your page:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="importmap">
  {
    "imports": {
      "react/": "https://aistudiocdn.com/react@^19.2.0/",
      "react": "https://aistudiocdn.com/react@^19.2.0",
      "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
      "@google/genai": "https://aistudiocdn.com/@google/genai@^1.24.0"
    }
  }
  </script>
</head>
<body>
  <!-- Your website content -->
  
  <!-- Chatbot will be mounted here -->
  <div id="janoo-chatbot-root"></div>
  
  <!-- Load chatbot script -->
  <script type="module">
    // Import and mount the chatbot
    // Note: You'll need to build the chatbot as a standalone bundle
    // or use the iframe method instead
  </script>
</body>
</html>
```

## Method 3: React Component Integration

If you're building a React application, you can import the component directly:

```jsx
import { LiveAgentPlugin } from './path/to/components/LiveAgentPlugin';

function MyApp() {
  const handleStartLiveAgent = () => {
    console.log('Chatbot activated');
  };

  return (
    <div>
      {/* Your app content */}
      <LiveAgentPlugin onStartLiveAgent={handleStartLiveAgent} />
    </div>
  );
}
```

## Configuration

### API Key Setup
The chatbot requires a Gemini API key. Set it in one of these ways:

1. **Environment Variable** (for development):
   ```bash
   # Create .env.local file
   GEMINI_API_KEY=your_api_key_here
   ```

2. **Build-time Configuration** (for production):
   - Set the API key in your build process
   - Or configure it in your deployment platform

### Customization

The chatbot widget has these default characteristics:
- **Position**: Fixed bottom-right corner
- **Button Size**: 64x64px (w-16 h-16)
- **Chat Window**: 320x384px (w-80 h-96) when expanded
- **Z-index**: 50 (appears above most content)

You can customize these by modifying the `LiveAgentPlugin` component.

## Browser Requirements

- Modern browser with Web Audio API support
- Microphone permissions (for voice chat)
- HTTPS or localhost (required for microphone access)

## Troubleshooting

### Chatbot not appearing
- Check browser console for errors
- Ensure the dev server is running
- Verify the iframe/src URL is correct

### Microphone not working
- Ensure HTTPS or localhost
- Check browser permissions
- Verify microphone is not in use by another app

### API errors
- Verify GEMINI_API_KEY is set correctly
- Check API key has proper permissions
- Ensure API quota is not exceeded

## Example: Complete HTML Page with Embed

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p>This is a sample page with the Janoo chatbot embedded.</p>
  
  <!-- Embed the chatbot -->
  <iframe 
    src="http://localhost:3001/embed.html" 
    style="position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; border: none; z-index: 9999; pointer-events: none;"
    allow="microphone"
    id="janoo-chatbot-iframe">
  </iframe>
  
  <script>
    // Make iframe interactive
    const iframe = document.getElementById('janoo-chatbot-iframe');
    // Remove pointer-events: none to make it always clickable
    // Or implement logic to toggle based on chatbot state
  </script>
</body>
</html>
```

## Deployment

To deploy the chatbot for production:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder and `embed.html` to your hosting service

3. Update the iframe `src` URL to point to your production domain

4. Ensure HTTPS is enabled (required for microphone access)

## Security Notes

- Never expose your API key in client-side code
- Use environment variables or secure server-side configuration
- Consider implementing rate limiting for production use
- Use HTTPS in production for secure microphone access

