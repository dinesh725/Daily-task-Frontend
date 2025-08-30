# Task Manager Frontend

This is the frontend for the Daily Task Manager application, built with React, Vite, and Tailwind CSS.

## Features

- **Responsive Design**: Works on all device sizes
- **User Authentication**: Login and registration flows
- **Task Management**: Create, view, update, and delete tasks
- **Offline Support**: Works without internet connection
- **Real-time Updates**: Automatic synchronization when online
- **Task Categories**: Organize tasks with color-coded categories
- **Progress Tracking**: Visual indicators for task completion

## Prerequisites

- Node.js 16+ and npm 8+
- Backend server running (see backend README)

## Installation

1. Clone the repository (if not already done)
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
5. Update the `.env` file with your backend API URL

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run preview`

Serves the production build from the `dist` directory for testing.

## Project Structure

```
frontend/
├── public/            # Static files
└── src/
    ├── assets/        # Images, fonts, etc.
    ├── components/    # Reusable UI components
    │   ├── Auth/      # Authentication components
    │   ├── Dashboard/ # Dashboard components
    │   └── UI/        # Generic UI components
    ├── contexts/      # React contexts
    ├── hooks/         # Custom React hooks
    ├── utils/         # Utility functions
    ├── App.jsx        # Main App component
    └── main.jsx       # Application entry point
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling. The main configuration file is `tailwind.config.js`.

### Customization

- Theme colors and fonts can be customized in `tailwind.config.js`
- Global styles can be added to `src/index.css`
- Component-specific styles should use Tailwind's utility classes

## State Management

- **React Context API** for global state (authentication, theme, etc.)
- **Local State** for component-specific state
- **Local Storage** for persisting user preferences and offline data

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
VITE_API_URL=http://localhost:5000  # Your backend API URL
```

## Dependencies

- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.15.0
- axios: ^1.5.0
- react-hot-toast: ^2.4.1
- lucide-react: ^0.263.1
- date-fns: ^2.30.0
- @vitejs/plugin-react: ^4.0.3
- vite: ^4.4.5
- tailwindcss: ^3.3.3
- autoprefixer: ^10.4.15
- postcss: ^8.4.29

## Deployment

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the production build.

### Serving the Production Build

You can use any static file server to serve the production build. For example:

```bash
npm install -g serve
serve -s dist
```

Or with Vite's preview:

```bash
npm run preview
```

## Browser Support

The application supports all modern browsers, including:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
