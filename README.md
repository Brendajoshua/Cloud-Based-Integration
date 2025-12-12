# E-Commerce Email Integration Project

##  Description
A simple cloud-integrated e-commerce system that sends automated email confirmations when orders are placed.

##  Features
- Product selection interface
- Order form with validation
- Real-time email notifications
- Order history logging
- RESTful API backend

##  Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Email: Nodemailer with Gmail
- Cloud: Zapier integration (optional)

##  Project Structure
Cloud-Based integration/
├── frontend/
│ ├── index.html
│ ├── style.css
│ └── app.js
├── backend/
│ ├── server.js
│ ├── package.json
│ └── .env
└── README.md


##  Quick Start
1. Clone repository
2. Install backend dependencies: `cd backend && npm install`
3. Configure `.env` file with Gmail credentials
4. Start server: `npm start`
5. Open `frontend/index.html` in browser

##  Configuration
Create `.env` file in backend folder:

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=3000

text

## API Endpoints
- `GET /api/health` - Server status
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders

