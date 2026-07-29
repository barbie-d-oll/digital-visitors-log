# 🚪 Digital Visitors Log

<p align="center">
  <img src="./public/logo.png" alt="Digital Visitors Log" width="150"/>
</p>

<p align="center">
A modern, secure, and intelligent visitor management system built with <strong>Next.js</strong> and <strong>Firebase</strong> to streamline visitor registration, tracking, and notifications.
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

</p>

---

## 🌐 Live Demo

**Application:** https://digital-visitors-log.vercel.app/

---

# 📖 Table of Contents

- Overview
- Features
- Technology Stack
- System Architecture
- Screenshots
- Installation
- Environment Variables
- Running the Project
- Project Structure
- SMS Integration
- Deployment
- Troubleshooting
- Contributing
- Future Improvements
- License

---

# 📌 Overview

Digital Visitors Log is a cloud-based visitor management application designed to replace traditional paper visitor books.

The platform enables organisations to securely register visitors, generate unique visitor codes, notify visitors via SMS, monitor visitor activity in real-time, and maintain an auditable history of all visitor interactions.

The application is built with scalability, security, and ease of use in mind, making it ideal for:

- Corporate Offices
- Schools
- Government Institutions
- NGOs
- Co-working Spaces
- Hospitals
- Reception Desks

---

# ✨ Features

## Visitor Management

- Visitor Registration
- Visitor Check-in
- Visitor Check-out
- Visitor History
- Temporary Visitor Code Generation
- Visitor Status Tracking

---

## Dashboard

- Reception Dashboard
- Visitor Statistics
- Recent Visitors
- Daily Reports
- Search Visitors
- Filter Records

---

## Notifications

- SMS Notification
- Visitor Code Delivery
- Ghana Number Formatting
- SMS Error Logging

---

## Security

- Firebase Authentication
- Firestore Database
- Secure API Routes
- Environment Variable Protection
- Server-side SMS Integration

---

## User Experience

- Responsive Design
- Mobile Friendly
- Fast Navigation
- Clean Modern Interface
- Accessible Components

---

# 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js App Router | Full-stack Framework |
| React 19 | User Interface |
| TypeScript | Type Safety |
| Firebase Authentication | User Authentication |
| Firebase Firestore | Database |
| Axios | HTTP Requests |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Vercel | Hosting |
| SMS Online GH | SMS Delivery |

---

# 🏗 System Architecture

```
Visitor
      │
      ▼
Next.js Frontend
      │
      ▼
API Routes
      │
      ├────────────► Firebase Firestore
      │
      ├────────────► Firebase Authentication
      │
      └────────────► SMS Online GH API
```

---

# 📷 Screenshots



Example:

```
/screenshots

![alt text](image.png)

![alt text](image-2.png)

![alt text](image-1.png)

```

---

# 🚀 Installation

## Prerequisites

Before running the project ensure you have:

- Node.js 18+
- npm / pnpm / yarn
- Firebase Project
- Firestore Enabled
- Firebase Authentication Enabled
- SMS Online GH Account
- API Key

---

## Clone Repository

```bash
git clone https://github.com/yourusername/digital-visitors-log.git

cd digital-visitors-log
```

---

## Install Dependencies

```bash
npm install
```

---

# ⚙ Environment Variables

Create a file named:

```bash
.env.local
```

Example:

```env
# SMS

SMS_TOKEN=your_sms_api_key

SMS_SENDER=HWSTECH

# Firebase

FIREBASE_API_KEY=

FIREBASE_AUTH_DOMAIN=

FIREBASE_PROJECT_ID=

FIREBASE_STORAGE_BUCKET=

FIREBASE_MESSAGING_SENDER_ID=

FIREBASE_APP_ID=
```

> Never commit `.env.local` to GitHub.

---

# ▶ Running the Project

Development

```bash
npm run dev
```

Application runs at

```
http://localhost:3000
```

Production Build

```bash
npm run build

npm run start
```

Lint

```bash
npm run lint
```

---

# 📂 Project Structure

```
digital-visitors-log/

│

├── app/

│ ├── api/

│ ├── dashboard/

│ └── ...

│

├── components/

│ ├── home/

│ ├── dashboard/

│ └── ui/

│

├── lib/

│ ├── firebase.ts

│ └── sms/

│

├── public/

├── styles/

├── hooks/

├── types/

└── README.md
```

---

# 📱 SMS Integration

The application currently integrates with **SMS Online GH**.

### SMS Flow

```
Visitor Registers

↓

Generate Visitor Code

↓

Format Phone Number

↓

API Route

↓

SMS Online GH

↓

Visitor Receives SMS
```

---

## API Location

```
app/api/sms/visitor-code/route.ts
```

---

## SMS Helper

```
lib/sms/sms-config.ts
```

---

## Common SMS Errors

### Missing API Key

```
SMS_TOKEN not found
```

Solution

- Verify `.env.local`
- Restart server

---

### Invalid Sender

```
HSHK_ERR_UA_INVALID_SENDER
```

Solution

Use an approved sender ID from your SMS provider.

---

### Insufficient Credit

```
HSHK_ERR_UA_INSUFF_CREDIT
```

Solution

Recharge your SMS account.

---

### Invalid Phone Number

Ensure numbers are formatted correctly:

```
0241234567

↓

233241234567
```

---

# ☁ Deployment

The project is deployed on **Vercel**.

Deployment Steps

```bash
npm run build
```

Push to GitHub

Connect repository to Vercel

Add Environment Variables

Deploy

---

# 🔍 Troubleshooting

### SMS Not Sending

- Check SMS_TOKEN
- Verify sender ID
- Check SMS credits
- Restart server
- Inspect server logs

---

### Firebase Errors

Verify:

- API Key
- Project ID
- Authentication
- Firestore Rules

---

### Build Errors

Delete cache

```bash
rm -rf .next
```

Reinstall packages

```bash
npm install
```

Build again

```bash
npm run build
```

---

# 📈 Future Improvements

- QR Code Visitor Passes
- Email Notifications
- Visitor Photo Capture
- ID Card Scanning
- Appointment Scheduling
- Host Approval Workflow
- Visitor Badge Printing
- Analytics Dashboard
- Multi-Branch Support
- Offline Support (PWA)

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 🙏 Acknowledgements

This project was built using:

- Next.js
- React
- Firebase
- Tailwind CSS
- shadcn/ui
- Axios
- SMS Online GH
- Vercel

---

# 💙 Author

**Digital Visitors Log**

Built with ❤️ using Next.js and Firebase.

---

<p align="center">
If you found this project helpful, consider giving it a ⭐ on GitHub!
</p>