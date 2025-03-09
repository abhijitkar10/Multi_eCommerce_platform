# E-Commerce Platform Setup Guide

## Prerequisites
Before setting up the project, ensure you have the following installed:
- Python 3
- Flask
- MariaDB
- Git

## Installation Steps

### 1. Clone the Repository
```sh
git clone https://github.com/abhijitkar10/Multi_eCommerce_platform.git
cd Multi_eCommerce_platform
```

### 2. Set Up a Virtual Environment (Recommended)
#### On Linux/macOS:
```sh
python -m venv venv
source venv/bin/activate
```
#### On Windows:
```sh
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
Since dependencies are not listed, install Flask manually:
```sh
pip install flask
```

### 4. Set Up the Database
#### On Linux/macOS:
```sh
mysql -u root -p -e "CREATE DATABASE ecommerce_db;"
mysql -u root -p ecommerce_db < database.sql
```
#### On Windows:
1. Open **Command Prompt** or **PowerShell**.
2. Log into MariaDB:
   ```sh
   mysql -u root -p
   ```
3. Create the database:
   ```sql
   CREATE DATABASE ecommerce_db;
   USE ecommerce_db;
   SOURCE database.sql;
   EXIT;
   ```

### 5. Run the Application
#### On Linux/macOS:
```sh
python app.py
```
#### On Windows:
```sh
python app.py
```

Visit **http://127.0.0.1:5000/** in your browser.

## Notes
- Ensure MariaDB is running before setting up the database.
- If additional dependencies are required, list them in `requirements.txt` and install with:
  ```sh
  pip install -r requirements.txt
  ```

For any issues, feel free to raise an issue on the GitHub repository!

