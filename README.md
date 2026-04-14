```markdown
# ⬡ PhantomByte — Secure Encryption System

> A full-stack encryption platform for securely handling text, files, and images using Fernet (AES-128-CBC + HMAC-SHA256), with OTP-based authentication.

---

## Live Demo
 https://your-live-app-link.com  

> *(If this is missing, your project instantly loses credibility. Deploy it.)*

---

##  Preview

| Dashboard | Encryption | Authentication |
|----------|------------|----------------|
| *(Add screenshot)* | *(Add screenshot)* | *(Add screenshot)* |

---

##  Key Features

### Authentication System
- Secure user registration with OTP email verification
- Login via username or email
- Password reset using OTP flow
- Session-based authentication

###  Encryption Engine
- Text encryption and decryption
- File encryption and decryption
- Image encryption and decryption
- Downloadable encrypted/decrypted outputs

###  User Interface
- Cyberpunk-inspired dark theme
- Responsive layout
- Dynamic user greetings

---

##  How It Works

1. User authenticates via OTP-based email verification  
2. Server validates session and grants access  
3. Input (text/file/image) is encrypted using Fernet  
4. Encrypted data can be downloaded or decrypted on demand  

---

##  Architecture Overview

```

Client (Browser)
↓
Flask Backend (API + Auth)
↓
Encryption Layer (Fernet)
↓
Database (SQLite)

````

---

##  Project Structure

```plaintext
PhantomByte/
├── app.py                    # Flask backend (routes, auth, encryption)
├── requirements.txt
├── .env.example
├── templates/
│   ├── login.html
│   ├── signup.html
│   ├── otp.html
│   ├── forgot_password.html
│   ├── reset_password.html
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
````

---

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/PhantomByte.git
cd PhantomByte
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Update `.env`:

```
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
FERNET_KEY=your_generated_key
SECRET_KEY=your_secret_key
```

#### Generate Fernet Key

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

### 4. Run the App

```bash
python app.py
```

Open:

```
http://localhost:5000
```

---

##  Security Design

* Password hashing: PBKDF2-SHA256 (`werkzeug.security`)
* Encryption: Fernet (AES-128-CBC + HMAC authentication)
* OTP expiration: 10 minutes
* Protected routes via authentication decorators
* Server-side session management

---

##  Known Limitations

* SQLite is not suitable for production-scale systems
* No rate limiting → OTP brute-force risk
* No CSRF protection implemented
* No file size validation
* Limited logging and monitoring

---

##  Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Backend    | Flask, SQLAlchemy, Flask-Mail |
| Database   | SQLite                        |
| Encryption | cryptography (Fernet)         |
| Frontend   | HTML, CSS, JavaScript         |

---

##  Future Improvements

* Deploy to cloud (Render / AWS / Railway)
* Add PostgreSQL support
* Implement rate limiting and CSRF protection
* Add Docker support
* Build REST API + Swagger docs
* Add unit and integration tests

---

##  Author

**Your Name**
GitHub: [https://github.com/1dxrobot](https://ithub.com/1dxrobot)

---

## 📄 License

This project is licensed under the MIT License.

```

If you want next level:
- I can **deploy this on Render step-by-step**
- Or add **badges + animations + screenshots that actually convert recruiters**

Pick one.
```
