# AlumniConn 🎓✨

**A multi-tenant networking platform connecting students and alumni within college-specific boundaries**

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0+-green.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0+-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)

---

## 🚀 Overview

AlumniConn is a comprehensive networking platform designed to connect students with alumni from their respective colleges. Built with a **multi-tenant architecture**, it allows each college to operate as an isolated network, maintaining clear boundaries between different educational institutions.

### Key Features:
✅ **Multi-Tenant Architecture** - Each college operates as a separate tenant
✅ **Role-Based Access** - Students, Alumni, College Admins, and Super Admins with distinct permissions
✅ **College Onboarding** - Super Admins review and approve college registration requests
✅ **Alumni Role Upgrade** - Students can apply to become alumni with admin approval
✅ **Social Feed** - Posts, likes, comments, and opportunity posts (Alumni-only)
✅ **Connections** - Send, accept, and reject connection requests within your college
✅ **Real-Time Messaging** - WebSocket-based one-to-one chat with image support
✅ **Profile Management** - Career details with Cloudinary-hosted profile pictures

### Who This Project Is For:
- **Developers** looking to build a scalable social networking platform
- **Educational Institutions** wanting to create alumni networks
- **Students & Alumni** seeking to connect with peers and former classmates

---

## ✨ Features in Detail

### Core Functionality:
- **Multi-Tenant System**: Each college has its own isolated network with distinct users and data
- **Role-Based Permissions**: Fine-grained control over what users can do based on their role
- **Real-Time Communication**: WebSocket-based messaging for instant conversations
- **Social Features**: Posts, likes, comments, and connections between users

### Advanced Features:
- **College Onboarding**: Super Admins can approve new college registrations
- **Alumni Upgrade**: Students can apply to become alumni with admin approval
- **Profile Customization**: Users can create detailed profiles with career information
- **Image Uploads**: Cloudinary integration for profile pictures and post images

### Technical Implementation:
- **Frontend**: React 19 with TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI with PostgreSQL, SQLAlchemy, Alembic
- **Authentication**: JWT with role-based access control
- **Real-Time**: WebSocket connections for instant messaging

---

## 🛠️ Tech Stack

### Frontend:
- **Framework**: React 19
- **TypeScript**: Type-safe JavaScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Client**: Axios
- **Testing**: Vitest, Testing Library

### Backend:
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT
- **Real-Time**: WebSockets
- **Image Storage**: Cloudinary

### Infrastructure:
- **Deployment**: Render (backend) + Vite (frontend)
- **Environment**: Cloudinary for media storage

### Development Tools:
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Pytest (backend), Vitest (frontend)

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** 15+
- **Git** (for version control)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Noman-Ahmad25/AlumniConn.git
   cd AlumniConn
   ```

2. **Set up the backend**:
   ```bash
   cd server
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `server` directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/alumniconn
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_HOURS=24
   SUPER_ADMIN_EMAIL=superadmin@example.com
   SUPER_ADMIN_USERNAME=superadmin
   SUPER_ADMIN_PASSWORD=your-strong-password
   FRONTEND_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

5. **Start the backend server**:
   ```bash
   uvicorn app:app --reload
   ```

6. **Set up the frontend**:
   ```bash
   cd ../client
   npm install
   ```

7. **Configure frontend environment variables**:
   Create a `.env` file in the `client` directory:
   ```
   VITE_API_URL=http://localhost:8000
   ```

8. **Start the development server**:
   ```bash
   npm run dev
   ```

### Alternative Installation Methods

#### Using Docker (Backend Only)
1. Create a `docker-compose.yml` file:
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:15
       environment:
         POSTGRES_DB: alumniconn
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

     backend:
       build: ./server
       command: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
       volumes:
         - ./server:/app
       ports:
         - "8000:8000"
       environment:
         DATABASE_URL: postgresql://postgres:postgres@db:5432/alumniconn
         SECRET_KEY: your-secret-key-here
       depends_on:
         - db

   volumes:
     postgres_data:
   ```

2. Run the services:
   ```bash
   docker-compose up --build
   ```

#### Development Setup
- Install VSCode with recommended extensions (ESLint, Prettier, TypeScript)
- Configure your IDE to use the project's ESLint and Prettier configurations

---

## 🎯 Usage

### Basic Usage Examples

#### Creating a Post
```typescript
import { createPost } from './api/post';

// Create a text post
const textPost = await createPost({
  content: "Hello everyone! I'm excited to be part of this platform.",
  is_opportunity: false,
});

// Create a post with an image
const imageFile = document.getElementById('file-input').files[0];
const imagePost = await createPost({
  content: "Check out my project!",
  is_opportunity: false,
  image_file: imageFile
});
```

#### Sending a Connection Request
```typescript
import { sendRequest } from './api/connection';

const userId = 123; // ID of the user you want to connect with
const connectionResponse = await sendRequest(userId);
console.log(connectionResponse);
```

#### Real-Time Messaging
```typescript
import { createMessagesSocket } from './api/message';

const socket = createMessagesSocket();
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'new_msg') {
    console.log('New message:', data.payload);
  }
};
```

### Advanced Usage

#### Customizing the UI
AlumniConn uses Tailwind CSS for styling. You can easily customize the design by modifying the `client/src/index.css` file or adding new styles to your component files.

#### Extending the Backend API
To add new endpoints or modify existing ones:

1. Create a new route file in `server/src/routes/`
2. Define your Pydantic schemas in `server/src/schemas/`
3. Add business logic in `server/src/services/`
4. Update the FastAPI app in `server/app.py`

#### Implementing New Features
1. **Add a new feature type** (e.g., events):
   - Create a new model in `server/src/models/`
   - Add a new schema in `server/src/schemas/`
   - Create a new route in `server/src/routes/`
   - Add service logic in `server/src/services/`
   - Implement the frontend components in `client/src/components/`

2. **Example: Adding Events**
   ```typescript
   // server/src/schemas/event.py
   from pydantic import BaseModel

   class EventCreate(BaseModel):
       title: str
       description: str
       start_time: datetime
       end_time: datetime
       location: str
       is_public: bool = True

   ```

---

## 📁 Project Structure

```
AlumniConn/
├── client/                  # Frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── api/             # API service layer
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Entry point
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.ts       # Vite configuration
│
├── server/                  # Backend application
│   ├── app.py               # FastAPI application entry point
│   ├── src/
│   │   ├── database/        # Database configuration
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routes/          # API route definitions
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── websocket.py     # WebSocket handler
│   ├── migrations/          # Database migrations
│   ├── requirements.txt     # Python dependencies
│   └── alembic.ini          # Alembic configuration
│
├── .gitignore               # Files to ignore in version control
├── README.md                # Project documentation
└── render.yaml              # Render deployment configuration
```

---

## 🔧 Configuration

### Environment Variables

#### Backend Configuration (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/alumniconn` |
| `SECRET_KEY` | JWT signing key | `your-secret-key-here` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_HOURS` | Token expiration time | `24` |
| `SUPER_ADMIN_EMAIL` | Super admin email | `superadmin@example.com` |
| `SUPER_ADMIN_USERNAME` | Super admin username | `superadmin` |
| `SUPER_ADMIN_PASSWORD` | Super admin password | `your-strong-password` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |

#### Frontend Configuration (`client/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the FastAPI backend | `http://localhost:8000` |

### Customization Options

1. **Theming**: Modify the Tailwind CSS variables in `client/src/index.css`
2. **Branding**: Update the logo and color scheme in the `brand-mark` components
3. **Features**: Enable/disable features by modifying the role-based access in the backend

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can get involved:

### Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies:
   ```bash
   cd server && pip install -r requirements.txt
   cd ../client && npm install
   ```
4. Set up your environment variables
5. Run the development servers:
   ```bash
   cd server && uvicorn app:app --reload
   cd ../client && npm run dev
   ```

### Code Style Guidelines

1. **TypeScript**: Use strict type checking and interfaces
2. **React**: Follow functional components with hooks
3. **Python**: Follow PEP 8 guidelines
4. **Testing**: Write comprehensive tests for all new features

### Pull Request Process

1. Create a new branch for your feature or bugfix
2. Make your changes and ensure they pass all tests
3. Update documentation if necessary
4. Submit a pull request with a clear description of your changes

### Code of Conduct

Please review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for guidelines on how to interact with our community.

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

### Core Team:
- **Maintainer**: [Noman Ahmad](https://github.com/Noman-Ahmad25)
- **Contributors**: [List of contributors](https://github.com/Noman-Ahmad25/AlumniConn/graphs/contributors)

### Special Thanks:
- [Cloudinary](https://cloudinary.com/) for media storage
- [Render](https://render.com/) for hosting
- The open-source community for their invaluable contributions

---

## 🐛 Issues & Support

### Reporting Issues
If you encounter any problems or have feature requests, please:
1. Check the [GitHub Issues](https://github.com/Noman-Ahmad25/AlumniConn/issues) for existing reports
2. Open a new issue with a clear description of the problem
3. Include relevant code snippets, error messages, and steps to reproduce

### Getting Help
- Ask questions on the [GitHub Discussions](https://github.com/Noman-Ahmad25/AlumniConn/discussions)

### FAQ

**Q: Can I customize the branding?**
A: Yes! Modify the `brand-mark` components in the React application and update the Tailwind CSS variables.

---

## 🗺️ Roadmap

### Planned Features:
- [ ] **Mobile App**: iOS and Android applications
- [ ] **Advanced Analytics**: User engagement metrics
- [ ] **Event Calendar**: College events and alumni gatherings
- [ ] **Job Board**: Alumni job postings and opportunities
- [ ] **AI Recommendations**: Smart connection suggestions


### Future Improvements:
- **Performance**: Optimize database queries and API responses
- **Security**: Implement additional security measures
- **Accessibility**: Improve accessibility compliance
- **Internationalization**: Add support for multiple languages

---

## 🚀 Getting Started with Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Noman-Ahmad25/AlumniConn.git
   cd AlumniConn
   ```

2. **Set up the development environment**:
   ```bash
   # Backend
   cd server
   pip install -r requirements.txt

   # Frontend
   cd ../client
   npm install
   ```

3. **Run the application**:
   ```bash
   # In one terminal (backend)
   cd server
   uvicorn app:app --reload

   # In another terminal (frontend)
   cd ../client
   npm run dev
   ```

4. **Start coding!** Make changes, add features, and submit pull requests.

---

## 🎉 Join the Community

We'd love to have you join our community! Here's how you can get involved:

- **Star the repository** to show your support
- **Contribute to the project**: Check out our [open issues](https://github.com/Noman-Ahmad25/AlumniConn/issues)

Together, we can make AlumniConn even better! 🚀
```

This README.md provides a comprehensive, engaging, and professional overview of the AlumniConn project. It follows modern GitHub README best practices, includes practical code examples, and encourages contributions from the developer community. The structure is clear, visually appealing, and organized to make it easy for new contributors to understand and get started with the project.
