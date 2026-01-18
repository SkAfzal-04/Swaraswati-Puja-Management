# Swaraswati Puja Member Management Backend

This is the backend API for the Swaraswati Puja Member Management system.  
It is built with **Node.js**, **Express**, and **MongoDB**, supporting user authentication, member management, and role-based access control.

---

## **Features**

- JWT-based authentication for Admin and Manager users.
- Role-based access control:
  - Admin: Full access (create/update/delete members, create users)
  - Manager: Can add/edit members
- Member management:
  - Add, edit, view, and delete members.
  - Automatically create a login for Managers.
- Password hashing using **bcrypt**.
- Clean database seeding with `seedAdmin.js`.
- Fully RESTful API.

---

## **Tech Stack**

- Node.js
- Express
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled
- Hosted on **Vercel**

---

## **Getting Started**

### **1. Clone the repo**
```bash
git clone <your-repo-url>
cd backend
