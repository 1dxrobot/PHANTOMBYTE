from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
from PIL import Image
import base64, os, re, random, string, io, datetime, json
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'phantombyte-super-secret-key-2024')

# ── Database ──────────────────────────────────────────────────────────────────
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///phantombyte.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ── Mail (configure with your SMTP) ──────────────────────────────────────────
app.config['MAIL_SERVER']   = 'smtp.gmail.com'
app.config['MAIL_PORT']     = 587
app.config['MAIL_USE_TLS']  = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'idrenemdiyaagirbek@gmail.com')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', 'apav kyot azog lagw')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME', 'idrenemdiyaagirbek@gmail.com')
mail = Mail(app)

# ── Encryption key (store securely in production) ────────────────────────────
KEY_FILE = "secret.key"

if not os.path.exists(KEY_FILE):
    with open(KEY_FILE, "wb") as f:
        f.write(Fernet.generate_key())

with open(KEY_FILE, "rb") as f:
    FERNET_KEY = f.read()

fernet = Fernet(FERNET_KEY)

# ══════════════════════════════════════════════════════════════════════════════
# MODEL
# ══════════════════════════════════════════════════════════════════════════════
class User(db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80),  unique=True, nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_verified   = db.Column(db.Boolean, default=False)
    is_new_user   = db.Column(db.Boolean, default=True)
    otp           = db.Column(db.String(6))
    otp_expiry    = db.Column(db.DateTime)
    created_at    = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_otp(self):
        self.otp = ''.join(random.choices(string.digits, k=6))
        self.otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        db.session.commit()
        return self.otp

    def verify_otp(self, otp):
        if self.otp == otp and datetime.datetime.utcnow() < self.otp_expiry:
            return True
        return False

# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════
def validate_password(password):
    errors = []
    if not re.search(r'[A-Z]', password):   errors.append('at least 1 uppercase letter')
    if not re.search(r'[a-z]', password):   errors.append('at least 1 lowercase letter')
    if not re.search(r'[0-9]', password):   errors.append('at least 1 number')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>\[\]\\/_\-+=~`]', password):
        errors.append('at least 1 special character')
    if len(password) < 8:                   errors.append('minimum 8 characters')
    return errors

def send_otp_email(email, otp, purpose='verification'):
    try:
        subject = f'PhantomByte — Your OTP for {purpose}'
        body = f'''
        <div style="background:#0a0a0f;color:#00f5ff;font-family:monospace;padding:30px;border:1px solid #00f5ff;">
            <h2 style="color:#00f5ff;">⬡ PHANTOMBYTE</h2>
            <p style="color:#ccc;">Your One-Time Password for <b>{purpose}</b>:</p>
            <div style="font-size:36px;letter-spacing:12px;color:#39ff14;padding:20px 0;">{otp}</div>
            <p style="color:#666;font-size:12px;">This OTP expires in 10 minutes. Do not share it.</p>
        </div>
        '''
        msg = Message(subject, recipients=[email], html=body)
        mail.send(msg)
        return True
    except Exception as e:
        print(f'Mail error: {e}')
        return False

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login_page'))
        return f(*args, **kwargs)
    return decorated

# ══════════════════════════════════════════════════════════════════════════════
# PAGE ROUTES
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return redirect(url_for('login_page'))

@app.route('/login')
def login_page():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return render_template('login.html')

@app.route('/signup')
def signup_page():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return render_template('signup.html')

@app.route('/otp')
def otp_page():
    if 'otp_email' not in session and 'reset_email' not in session:
        return redirect(url_for('login_page'))
    return render_template('otp.html')

@app.route('/forgot-password')
def forgot_page():
    return render_template('forgot_password.html')

@app.route('/reset-password')
def reset_page():
    if 'reset_email' not in session:
        return redirect(url_for('forgot_page'))
    return render_template('reset_password.html')

@app.route('/home')
@login_required
def home():
    user = User.query.get(session['user_id'])
    welcome = 'welcome_back' if not user.is_new_user else 'new_user'
    if user.is_new_user:
        user.is_new_user = False
        db.session.commit()
    return render_template('index.html', username=user.username, welcome=welcome)

# ══════════════════════════════════════════════════════════════════════════════
# API — AUTH
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    username = data.get('username', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm  = data.get('confirm_password', '')

    if not all([username, email, password, confirm]):
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already taken.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already registered.'}), 400

    errors = validate_password(password)
    if errors:
        return jsonify({'success': False, 'message': 'Password must contain: ' + ', '.join(errors)}), 400

    if password != confirm:
        return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    otp = user.generate_otp()
    sent = send_otp_email(email, otp, 'Account Verification')

    session['otp_email'] = email
    session['otp_purpose'] = 'signup'

    return jsonify({
        'success': True,
        'message': 'OTP sent to your email.' if sent else 'Account created. OTP: ' + otp + ' (mail not configured)',
        'redirect': '/otp'
    })

@app.route('/api/verify-otp', methods=['POST'])
def api_verify_otp():
    data    = request.get_json()
    otp_in  = data.get('otp', '').strip()
    purpose = session.get('otp_purpose', 'signup')
    email   = session.get('otp_email') or session.get('reset_email')

    if not email:
        return jsonify({'success': False, 'message': 'Session expired. Try again.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    if not user.verify_otp(otp_in):
        return jsonify({'success': False, 'message': 'Invalid or expired OTP.'}), 400

    if purpose == 'signup':
        user.is_verified = True
        db.session.commit()
        session.pop('otp_email', None)
        session.pop('otp_purpose', None)
        return jsonify({'success': True, 'message': 'Email verified! Please login.', 'redirect': '/login'})

    elif purpose == 'reset':
        session['reset_verified'] = True
        session.pop('otp_email', None)
        return jsonify({'success': True, 'message': 'OTP verified.', 'redirect': '/reset-password'})

    return jsonify({'success': False, 'message': 'Unknown purpose.'}), 400

@app.route('/api/login', methods=['POST'])
def api_login():
    data       = request.get_json()
    identifier = data.get('identifier', '').strip()
    password   = data.get('password', '')

    user = User.query.filter(
        (User.email == identifier.lower()) | (User.username == identifier)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

    if not user.is_verified:
        otp = user.generate_otp()
        send_otp_email(user.email, otp, 'Account Verification')
        session['otp_email']   = user.email
        session['otp_purpose'] = 'signup'
        return jsonify({'success': False, 'message': 'Please verify your email first. OTP resent.', 'redirect': '/otp'}), 403

    session['user_id'] = user.id
    welcome = 'new_user' if user.is_new_user else 'welcome_back'

    return jsonify({'success': True, 'welcome': welcome, 'username': user.username, 'redirect': '/home'})

@app.route('/api/logout')
def api_logout():
    session.clear()
    return redirect(url_for('login_page'))

@app.route('/api/forgot-password', methods=['POST'])
def api_forgot_password():
    data  = request.get_json()
    email = data.get('email', '').strip().lower()

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'Email not registered.'}), 404

    otp = user.generate_otp()
    sent = send_otp_email(email, otp, 'Password Reset')

    session['reset_email']  = email
    session['otp_purpose']  = 'reset'

    return jsonify({
        'success': True,
        'message': 'OTP sent to your email.' if sent else 'OTP: ' + otp + ' (mail not configured)',
        'redirect': '/otp'
    })

@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    if not session.get('reset_verified'):
        return jsonify({'success': False, 'message': 'Unauthorized.'}), 403

    data     = request.get_json()
    email    = session.get('reset_email')
    password = data.get('password', '')
    confirm  = data.get('confirm_password', '')

    errors = validate_password(password)
    if errors:
        return jsonify({'success': False, 'message': 'Password must contain: ' + ', '.join(errors)}), 400

    if password != confirm:
        return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

    user = User.query.filter_by(email=email).first()
    user.set_password(password)
    db.session.commit()

    session.pop('reset_email', None)
    session.pop('reset_verified', None)
    session.pop('otp_purpose', None)

    return jsonify({'success': True, 'message': 'Password reset successful!', 'redirect': '/login'})

# ══════════════════════════════════════════════════════════════════════════════
# API — ENCRYPTION / DECRYPTION
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/encrypt', methods=['POST'])
@login_required
def api_encrypt():
    mode = request.form.get('mode', 'text')

    if mode == 'text':
        text = request.form.get('text', '')
        if not text:
            return jsonify({'success': False, 'message': 'No text provided.'}), 400
        encrypted = fernet.encrypt(text.encode()).decode()
        return jsonify({'success': True, 'result': encrypted, 'type': 'text'})

    elif mode in ('file', 'image'):
        f = request.files.get('file')
        if not f:
            return jsonify({'success': False, 'message': 'No file provided.'}), 400

        data = f.read()
        encrypted = fernet.encrypt(data)

        import io
        from flask import send_file

        return send_file(
            io.BytesIO(encrypted),
            as_attachment=True,
            download_name=f.filename + ".enc",
            mimetype="application/octet-stream"
        )

    return jsonify({'success': False, 'message': 'Invalid mode.'}), 400


@app.route('/api/decrypt', methods=['POST'])
@login_required
def api_decrypt():
    mode = request.form.get('mode', 'text')

    try:
        if mode == 'text':
            text = request.form.get('text', '')
            if not text:
                return jsonify({'success': False, 'message': 'No text provided.'}), 400
            decrypted = fernet.decrypt(text.encode()).decode()
            return jsonify({'success': True, 'result': decrypted, 'type': 'text'})

        elif mode in ('file', 'image'):
            f = request.files.get('file')
            if not f:
                return jsonify({'success': False, 'message': 'No file provided.'}), 400

            encrypted_data = f.read()
            decrypted = fernet.decrypt(encrypted_data)

            import io
            from flask import send_file

            original_name = f.filename.replace(".enc", "")

            return send_file(
                io.BytesIO(decrypted),
                as_attachment=True,
                download_name=original_name,
                mimetype="application/octet-stream"
            )

    except Exception:
        return jsonify({'success': False, 'message': 'Decryption failed. Invalid token or wrong key.'}), 400

    return jsonify({'success': False, 'message': 'Invalid mode.'}), 400      

# ══════════════════════════════════════════════════════════════════════════════
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
