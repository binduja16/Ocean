# init_db.py
from database import Base, engine
from models import Prediction

print("📦 Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
