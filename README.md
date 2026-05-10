# Matrioska de Palavras - DBW 2026 G36

Welcome to the Matrioska de Palavras project repository. This is a university project for the Web Development course (2025-2026).

## Getting Started

To run this project locally, follow these steps:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Configuration & Database
This project requires a connection to a MongoDB database (MongoDB Atlas is recommended).
Create a `.env` file in the root of the project and add your MongoDB connection string:
```env
MONGO_URI="mongodb+srv://<user>:<password>@<cluster-url>/?appName=<database>&retryWrites=true&w=majority"
```
*(If no `.env` file is provided, the application will attempt to connect to a local MongoDB instance at `mongodb://127.0.0.1:27017/matrioska` or use a temporary local fallback for testing purposes).*

### 3. Installation
Clone the repository and install the dependencies:
```bash
git clone <repository-url>
cd <repository-folder>
npm install
```

### 3. Running the Application
To start the development server with hot-reload (using nodemon):
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Technology Stack
- **Backend**: Node.js & Express
- **Frontend**: EJS (Embedded JavaScript templates)
- **Styling**: Vanilla CSS
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io

## Project Structure
- `/controllers`: Logic for handling requests.
- `/public`: Static assets (CSS, Images, SVGs).
- `/routes`: Definition of application routes.
- `/views`: EJS templates for the UI.
- `index.js`: Main entry point.
- `/diagrams`: Functional architecture diagram and componenents' fluxograms

---
**Figma Prototype**: [View](https://www.figma.com/proto/B7jb7sNmMkYPDb3Mc2gU8o/Sem-t%C3%ADtulo?node-id=16-3&starting-point-node-id=16%3A3&t=NbMfYbF0ABfhTmP7-1)
