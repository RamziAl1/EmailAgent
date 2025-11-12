from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import joblib
import re
from typing import Optional
# Create FastAPI instance
app = FastAPI(title="My API", version="1.0.0")

model = joblib.load("logistic_fraud_model.joblib")        # replace with your saved model file
vectorizer = joblib.load("tfidf_vectorizer.joblib")  # replace with your saved vectorizer file

class Post(BaseModel):
    id: int                          
    user_id: int                    
    is_bot: bool                     
    is_response: bool                
    is_email: bool               
    message: str                    
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

def clean_text(text):
    text = str(text).lower()  # lowercase
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)  # remove punctuation
    text = re.sub(r'\s+', ' ', text).strip()  # remove extra spaces
    return text

MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["massage"]       
collection = db["posts"] 



@app.get("/")
def read_root():
    return {"message": "Welcome to My API"}

@app.post("/api/posts/massage")
def create_post(post: Post):
    try:
        post_dict = post.dict()
        result = collection.insert_one(post_dict)
        return {"message": "Post saved successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat_with_bot(post: Post):
    try:
        user_post = post.dict()
        collection.insert_one(user_post)
        # Clean input message
        cleaned_message = clean_text(post.message)

        # Vectorize the cleaned message
        text_vector = vectorizer.transform([cleaned_message])

        # Make prediction
        prediction = model.predict(text_vector)[0]

        # Determine spam or ham
        if prediction == "spam":
            spam_status = "spam"
            bot_reply = "⚠️ This message seems to be spam. Please be cautious."
        else:
            spam_status = "ham"
            bot_reply = "✅ Your message looks fine."

        # Optional: save bot reply to MongoDB
        bot_post = Post(
            id=post.id + 1,
            user_id=post.user_id,
            is_bot=True,
            is_response=True,
            is_email=False,
            message=bot_reply,
            datetime = datetime.now()
        )
        collection.insert_one(bot_post.dict())

        return {
            "user_message": post.message,
            "spam_status": spam_status,
            "bot_reply": bot_reply,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))