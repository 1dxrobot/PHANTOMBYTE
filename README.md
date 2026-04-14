
```markdown
# ⬡ PhantomByte — Secure Encryption System

A full-stack web application for encrypting and decrypting text, files, and images using Fernet (AES-128-CBC + HMAC-SHA256). Includes user authentication with OTP-based email verification.

---

## Overview

PhantomByte enables secure handling of sensitive data through authenticated access and symmetric encryption. It supports multiple input types (text, files, images) and provides downloadable encrypted/decrypted outputs.

---

## Project Structure

PhantomByte/
├── app.py                    # Flask backend (routes, logic, authentication, encryption)
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variable template
├── templates/
│   ├── login.html
│   ├── signup.html
│   ├── otp.html
│   ├── forgot_password.html
│   ├── reset_password.html
│   └── index.html            # Main dashboard
└── static/
    ├── css/
    │   └── style.css         # UI styling
    └── js/
        └── main.js           # Frontend logic
---

## Setup

### 1. Install Dependencies
```bash
cd PhantomByte
pip install -r requirements.txt
````

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Update `.env` with:

* `MAIL_USERNAME` (your Gmail)
* `MAIL_PASSWORD` (Gmail App Password)
* `FERNET_KEY`
* `SECRET_KEY`

#### Generate Fernet Key

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

#### Gmail App Password Setup

1. Enable 2-Step Verification
2. Go to App Passwords
3. Generate a password for Mail
4. Use it as `MAIL_PASSWORD`

---

### 3. Run the Application

```bash
python app.py
```

Open in browser:

```
http://localhost:5000
```

---

## Features

### Authentication

* User registration with OTP email verification
* Login via username or email
* Password reset via OTP
* Session-based authentication

### Encryption

* Text encryption and decryption
* File encryption and decryption
* Image encryption and decryption
* Downloadable output files

### UI

* Dark-themed interface
* Responsive layout
* Dynamic welcome messages

---

## Security

* Password hashing: PBKDF2-SHA256 (`werkzeug.security`)
* Encryption: Fernet (AES-128-CBC + HMAC authentication)
* OTP expiration: 10 minutes
* Protected routes via authentication decorators
* Server-side session handling

---

## Tech Stack

* **Backend:** Flask, SQLAlchemy, Flask-Mail
* **Database:** SQLite (use PostgreSQL for production)
* **Encryption:** cryptography (Fernet)
* **Frontend:** HTML, CSS, JavaScript

---

## Limitations / Improvements

* Replace SQLite with PostgreSQL for production use
* Add rate limiting to prevent OTP abuse
* Implement CSRF protection
* Enforce file size limits
* Add logging and monitoring
* Containerize with Docker
* Add automated tests
* Provide API documentation

---

```

If you're trying to impress reviewers or recruiters, this version is acceptable—but still basic. If you want something that actually stands out (badges, demo link, screenshots, deployment, architecture), that’s the next step.
```
