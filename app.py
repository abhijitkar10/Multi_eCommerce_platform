from flask import Flask, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_dance.contrib.google import make_google_blueprint, google
import os

app = Flask(__name__)

# Configure MySQL Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:password@localhost/ecommerce'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = "google.login"

# Google OAuth Configuration
app.config["GOOGLE_OAUTH_CLIENT_ID"] = "your-google-client-id"
app.config["GOOGLE_OAUTH_CLIENT_SECRET"] = "your-google-client-secret"
google_bp = make_google_blueprint(client_id=app.config["GOOGLE_OAUTH_CLIENT_ID"],
                                  client_secret=app.config["GOOGLE_OAUTH_CLIENT_SECRET"],
                                  offline=True, scope=["profile", "email"])
app.register_blueprint(google_bp, url_prefix="/login")

# Define User Model
class Customer(db.Model, UserMixin):
    CustomerId = db.Column(db.Integer, primary_key=True)
    FirstName = db.Column(db.String(50))
    Email = db.Column(db.String(100), unique=True, nullable=False)
    GoogleId = db.Column(db.String(255), unique=True, nullable=True)
    Role = db.Column(db.Enum('Admin', 'Seller', 'Customer'), default='Customer')

    def get_id(self):
        return self.CustomerId

@login_manager.user_loader
def load_user(user_id):
    return Customer.query.get(int(user_id))

# Google Login Route
@app.route("/google-login")
def google_login():
    if not google.authorized:
        return redirect(url_for("google.login"))
    
    resp = google.get("/oauth2/v2/userinfo")
    if resp.ok:
        user_info = resp.json()
        email = user_info["email"]
        google_id = user_info["id"]
        user = Customer.query.filter_by(Email=email).first()

        if not user:
            user = Customer(FirstName=user_info["name"], Email=email, GoogleId=google_id)
            db.session.add(user)
            db.session.commit()

        login_user(user)
        return redirect(url_for("dashboard"))
    return "Login Failed", 400

@app.route("/dashboard")
@login_required
def dashboard():
    return f"Welcome, {current_user.FirstName}! You are logged in as {current_user.Role}"

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("google_login"))

if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)

