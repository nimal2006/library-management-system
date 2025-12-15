# DEPLOYMENT INSTRUCTIONS
# This is a self-contained Flask application that includes both a backend and a frontend.
# The 'web-project' directory in the parent folder is a separate, standalone frontend demo and is not used by this application.
#
# To deploy this application, run the following command in your terminal:
# python app.py
#
# The application will be available at http://localhost:5000

from flask import Flask, render_template, request, redirect, url_for, session, g, flash
import sqlite3
import os

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, 'library.db')

app = Flask(__name__)
app.secret_key = 'dev_secret_for_demo'
app.debug = True


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


def init_db():
    db = sqlite3.connect(DB_PATH)
    cur = db.cursor()
    # Create users table
    cur.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
    )''')
    # Create books table
    cur.execute('''CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY,
        title TEXT,
        author TEXT,
        status TEXT
    )''')
    # Ensure an admin user exists (admin / 1234)
    cur.execute('SELECT COUNT(1) FROM users WHERE username = ?', ('admin',))
    if cur.fetchone()[0] == 0:
        cur.execute('INSERT INTO users (username, password) VALUES (?, ?)', ('admin', '1234'))
    # Seed sample books if none
    cur.execute('SELECT COUNT(1) FROM books')
    if cur.fetchone()[0] == 0:
        sample = [
            ('Introduction to Java','K. Thomas','Available'),
            ('Data Structures','S. Yadav','Available'),
            ('Operating Systems','A. Tanenbaum','Available'),
        ]
        cur.executemany('INSERT INTO books (title, author, status) VALUES (?, ?, ?)', sample)
    db.commit()
    db.close()


@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def login_required(fn):
    def wrapper(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('index'))
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper


@app.route('/')
def index():
    # show login page
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username','').strip()
    password = request.form.get('password','').strip()
    db = get_db()
    cur = db.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = cur.fetchone()
    if user:
        session['user'] = user['username']
        return redirect(url_for('dashboard'))
    flash('Invalid username or password')
    return redirect(url_for('index'))


@app.route('/dashboard')
@login_required
def dashboard():
    db = get_db()
    cur = db.execute('SELECT COUNT(*) total FROM books')
    total = cur.fetchone()['total']
    cur = db.execute("SELECT COUNT(*) issued FROM books WHERE status = 'Issued'")
    issued = cur.fetchone()['issued']
    available = total - issued
    return render_template('dashboard.html', total=total, issued=issued, available=available, user=session.get('user'))


@app.route('/books')
@login_required
def books():
    db = get_db()
    cur = db.execute('SELECT * FROM books ORDER BY id DESC')
    items = cur.fetchall()
    return render_template('books.html', books=items)


@app.route('/add_book', methods=['POST'])
@login_required
def add_book():
    title = request.form.get('title','').strip()
    author = request.form.get('author','').strip()
    if not title:
        flash('Title is required')
        return redirect(url_for('books'))
    db = get_db()
    db.execute('INSERT INTO books (title, author, status) VALUES (?, ?, ?)', (title, author, 'Available'))
    db.commit()
    return redirect(url_for('books'))


@app.route('/issue/<int:book_id>')
@login_required
def issue(book_id):
    db = get_db()
    cur = db.execute('SELECT status FROM books WHERE id = ?', (book_id,))
    r = cur.fetchone()
    if r and r['status'] == 'Available':
        db.execute("UPDATE books SET status = 'Issued' WHERE id = ?", (book_id,))
        db.commit()
    return redirect(url_for('books'))


@app.route('/return/<int:book_id>')
@login_required
def return_book(book_id):
    db = get_db()
    cur = db.execute('SELECT status FROM books WHERE id = ?', (book_id,))
    r = cur.fetchone()
    if r and r['status'] == 'Issued':
        db.execute("UPDATE books SET status = 'Available' WHERE id = ?", (book_id,))
        db.commit()
    return redirect(url_for('books'))


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))


import waitress

if __name__ == '__main__':
    # ensure DB exists and run
    init_db()
    waitress.serve(app, host='0.0.0.0', port=5000)
