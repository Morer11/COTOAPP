# COTOAPP - Website to APK Converter

A powerful web application that converts websites into functional Android APKs using Capacitor technology with SQLite storage and comprehensive admin management.

## Features

### User Features
- **Upload ZIP Files**: Convert zipped website files into Android APKs
- **Website URL Conversion**: Enter any website URL to generate APKs
- **App Customization**: Add custom app names and choose online/offline modes
- **Download & Share**: Download completed APKs and share them easily
- **User Dashboard**: Track APK creation progress and download statistics

### Admin Features
- **User Management**: View, edit, and manage user accounts
- **APK Management**: Monitor all APK conversions and manage files
- **Analytics Dashboard**: Track user engagement and system performance
- **Ad Management**: Configure and manage advertising placements
- **Revenue Tracking**: Monitor ad revenue and system metrics

### Technical Features
- **SQLite Database**: Local storage for all application data
- **Capacitor Integration**: Professional APK generation using Capacitor CLI
- **Session Management**: Secure user authentication with SQLite sessions
- **Real-time Progress**: Live conversion progress tracking
- **Material Design**: Modern, responsive user interface
- **Google AdSense Ready**: Pre-configured ad placement system

## Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- SQLite3

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cotoapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize Capacitor**
   ```bash
   npx cap init
   npx cap add android
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5000 in your browser
   - The application serves both frontend and backend on port 5000

## Database

The application uses SQLite for local storage with the following structure:

- **Users**: User accounts and authentication
- **APKs**: Generated application metadata and files
- **Conversion Jobs**: APK generation progress tracking
- **Analytics**: User interaction and download statistics
- **Ads**: Advertisement management and revenue tracking

Database files are stored in the `./data/` directory:
- `./data/cotoapp.sqlite` - Main application database
- `./data/sessions.sqlite` - User session storage

## Default Admin Account

```
Email: admin@cotoapp.com
Password: admin123
```

## APK Generation Process

1. **User Input**: Upload ZIP file or provide website URL
2. **Job Creation**: System creates conversion job with progress tracking
3. **Capacitor Processing**: Uses Capacitor CLI to generate Android APK
4. **File Management**: Stores generated APK and metadata
5. **Download Ready**: User receives download link when complete

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### APK Management
- `GET /api/apks` - Get user's APKs
- `POST /api/apks` - Create new APK conversion
- `GET /api/apks/:id` - Get specific APK
- `DELETE /api/apks/:id` - Delete APK
- `POST /api/apks/:id/download` - Download APK

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/apks` - Get all APKs
- `GET /api/admin/stats` - Get system statistics
- `POST /api/admin/ads` - Create advertisement

### Analytics
- `POST /api/analytics` - Record user action
- `GET /api/conversion-jobs/:apkId` - Get conversion status

## Configuration

### Environment Variables
- `SESSION_SECRET` - Secret key for session encryption (default: auto-generated)
- `NODE_ENV` - Environment mode (development/production)

### Capacitor Configuration
The `capacitor.config.ts` file contains APK generation settings:
- App ID: `com.cotoapp.webapp`
- App Name: `COTOAPP`
- Android scheme and security settings

## File Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility libraries
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Storage interface
│   └── database.ts       # SQLite implementation
├── shared/               # Shared TypeScript schemas
├── data/                 # SQLite database files
└── uploads/              # Temporary file uploads
```

## Development

### Running in Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Testing APK Generation
1. Sign up for a new account or use admin credentials
2. Navigate to the conversion form on the homepage
3. Upload a ZIP file containing HTML/CSS/JS or enter a website URL
4. Configure app name and mode (online/offline)
5. Monitor progress in the dashboard
6. Download completed APK

## Ad Revenue Integration

The application supports Google AdSense integration:

1. **Update HTML**: Replace placeholder in `client/index.html`
2. **Configure Ads**: Use admin panel to manage ad placements
3. **Track Revenue**: Monitor earnings through admin dashboard

## Security Features

- **Session Management**: Secure SQLite-based sessions
- **Input Validation**: Zod schema validation for all inputs
- **File Upload Limits**: 50MB maximum file size
- **Admin Protection**: Role-based access control
- **SQL Injection Prevention**: Prepared statements

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `./data/` directory exists and is writable
2. **File Uploads**: Check upload directory permissions
3. **Capacitor Errors**: Verify Android SDK and Java installation
4. **Session Issues**: Clear browser cookies and restart server

### Logs
Server logs include:
- API request/response details
- APK generation progress
- Error messages and stack traces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or feature requests, please contact the development team or create an issue in the repository.
