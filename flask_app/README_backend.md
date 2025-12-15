# EduLibrary — Flask + SQLite backend (college demo)

Quick backend that pairs with the frontend or runs standalone for demonstration.

Run (recommended in a virtualenv):

```bash
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000 in your browser. Default credentials: `admin` / `1234`.

Notes for viva:

- Database: `library.db` (SQLite) created automatically on first run.
- Tables: `users(id,username,password)` and `books(id,title,author,status)`.
- Authentication: session-based; plain text passwords for simplicity (explain security improvements in viva).
- To reset DB: delete `flask_app/library.db` and restart the app.
