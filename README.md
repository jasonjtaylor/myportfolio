# Jason Taylor Portfolio

Portfolio website with an AI chatbot powered by OpenAI.

## Running Locally

### Option 1: Using Netlify Dev (Recommended)

This is the best option as it will run both the static site and the Netlify Functions locally.

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Install function dependencies**:
   ```bash
   cd netlify/functions
   npm install
   cd ../..
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```bash
   echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
   ```
   Replace `your-openai-api-key-here` with your actual OpenAI API key.

4. **Start the development server**:
   ```bash
   netlify dev
   ```

   The site will be available at `http://localhost:8888`

### Option 2: Simple HTTP Server (Limited)

If you just want to view the static site without the chatbot functionality:

```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js http-server (install with: npm install -g http-server)
http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

**Note:** The chatbot will not work with this option as it requires Netlify Functions.

## Project Structure

- `index.html` - Main HTML file
- `styles.css` - Stylesheet
- `script.js` - Main JavaScript
- `src/chatbot.js` - Chatbot client-side code
- `netlify/functions/chat.js` - Serverless function for OpenAI API
- `netlify.toml` - Netlify configuration

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required for chatbot functionality)
