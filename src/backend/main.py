from fastapi import FastAPI

# Create FastAPI instance
app = FastAPI(title="My API", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to My API"}

