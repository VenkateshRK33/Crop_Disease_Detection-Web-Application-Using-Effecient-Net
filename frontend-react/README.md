# Plant Disease AI Assistant - React Frontend

This is the React frontend for the Plant Disease AI Assistant application.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm test`

Launches the test runner in interactive watch mode.

## Project Structure

```
frontend-react/
├── public/           # Static files
├── src/
│   ├── components/   # React components
│   ├── services/     # API service calls
│   ├── styles/       # Shared CSS files
│   ├── App.js        # Main app component
│   ├── App.css       # App styles
│   ├── index.js      # Entry point
│   └── index.css     # Global styles
└── package.json
```

## Backend Proxy

The app is configured to proxy API requests to `http://localhost:4000` where the Node.js backend runs.

## Dependencies

- React 19.2.0
- React DOM 19.2.0
- React Scripts 5.0.1
- Axios 1.13.2
