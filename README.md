# 🏙️ Improve My City

**Improve My City** is a web platform that allows citizens to raise complaints, track their progress, and help the administration improve city services.  
Built using **React (Frontend)** and **Node.js + Express (Backend)**, with **MongoDB** as the database.

---

## 🚀 Live Links

- **Frontend:** [https://improve-my-city-frontend.vercel.app](https://improve-my-city-frontend.vercel.app)  
- **Backend:** [https://improve-my-city-backend.onrender.com](https://improve-my-city-backend.onrender.com)

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|--------|-----------|
| 🧑‍💼 Admin | mcaprojecttestemail@imcity.com | admin1234 |
| 👨‍🔧 Employee | employee@imcity.com | admin1234 |
| 👷 Sub-Employee | subemployee@imcity.com | admin1234 |

> ⚠️ **Note:** These accounts are for testing/demo purposes only.

---

## 🧩 Important — User Creation Rules

When creating **new users** (Admin, Employee, Sub-Employee), please follow these rules to ensure the system recognizes the correct role:

| Role | Email Must Start With | Example |
|------|-----------------------|----------|
| Admin | `admin` | `admin_john@imcity.com` |
| Employee | `employee` | `employee_raj@imcity.com` |
| Sub-Employee | `subemployee` | `subemployee_kumar@imcity.com` |

> 💡 This naming rule is **required** because the system identifies user roles based on the email prefix during registration and login.

---

## ✨ Features

- Citizen complaint submission with photo upload  
- Category and subcategory-based complaint routing  
- Real-time complaint tracking and status updates  
- Role-based dashboards (Admin, Employee, Sub-Employee)  
- Complaint review and feedback system  
- Analytics and report view for admin users  

---

## 🧠 Tech Stack

- **Frontend:** React, Axios, CSS  
- **Backend:** Node.js, Express.js, MongoDB  
- **Authentication:** JWT  
- **Deployment:** Render (Backend), Vercel (Frontend)

---

## ⚙️ Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/improve-my-city.git

# Move to project folder
cd improve-my-city

# Install dependencies
npm install

# Run backend
cd backend
npm start

# Run frontend
cd frontend
npm start
