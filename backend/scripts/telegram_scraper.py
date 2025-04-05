from telethon.sync import TelegramClient
import datetime
import pandas as pd
import configparser
import os
from pymongo import MongoClient

# Get absolute paths
script_dir = os.path.dirname(os.path.abspath(__file__))  # scripts/ directory
config_path = os.path.join(script_dir, "telethon.config")

# Load API credentials from config file
config = configparser.ConfigParser()
config.read(config_path)

api_id = config["telethon_credentials"]["api_id"]
api_hash = config["telethon_credentials"]["api_hash"]

# Define chat/group name
chats = ["InternFreak"]

# Output directories
save_dir = os.path.join(script_dir, "images")  # Save images inside backend/scripts/images
output_excel = os.path.join(script_dir, f"data_{datetime.date.today()}.xlsx")  # Save data inside backend/scripts/

# Create directory if not exists
os.makedirs(save_dir, exist_ok=True)

# Initialize an empty DataFrame
df = pd.DataFrame()

# Connect to Telegram Client
with TelegramClient('test', api_id, api_hash) as client:
    for chat in chats:
        for message in client.iter_messages(chat, limit=20, reverse=True):
            # Initialize image path as None
            image_path = None

            # Check if message has a photo and download it
            if message.photo:
                image_path = os.path.join(save_dir, f"{message.id}.jpg")
                client.download_media(message, file=image_path)

            # Store message data
            data = {
                # Map Telegram fields to your unified job schema
                "title": f"Message from {chat}",               # Default title
                "company": str(message.sender_id),             # Use sender as company
                "text": message.text if message.text else "",  # Message text
                "date": message.date,                          # Message date
                "group": chat,                                 # For Telegram source
                "sender": str(message.sender_id),              # For Telegram source
                "image_path": image_path,                      # Image from Telegram
                "source": "Telegram",                          # Source identifier
                "createdAt": datetime.datetime.now(datetime.timezone.utc)
            }

            # 🔍 Pretty print message info
            print("\n📝 Telegram Message")
            print("-" * 50)
            print(f"Chat Title   : {chat}")
            print(f"Message ID   : {message.id}")
            print(f"Sender ID    : {message.sender_id}")
            print(f"Date         : {message.date}")
            print(f"Text         : {message.text or '[No Text]'}")
            print(f"Image Saved  : {'Yes' if message.photo else 'No'}")
            print("-" * 50 + "\n")

            # Add to DataFrame
            temp_df = pd.DataFrame([data])  # Create a DataFrame from dictionary
            df = pd.concat([df, temp_df], ignore_index=True)  # Use concat instead of append

# Remove timezone information from 'date' column
df['date'] = df['date'].dt.tz_localize(None)

# Connect to MongoDB
mongo_client = MongoClient("mongodb+srv://bkbajpay0609:uv52KtpB09m1maFN@cluster0.xflo7xo.mongodb.net/")
db = mongo_client["test"]
collection = db["telegram"]  # Changed to match Mongoose model's default collection

# Convert DataFrame to dictionary & insert into MongoDB
data_dict = df.to_dict(orient="records")

if data_dict:
    result = collection.insert_many(data_dict)  # Save to MongoDB
    print(f"\n✅ {len(result.inserted_ids)} Telegram job records saved to MongoDB (telegram collection)\n")
else:
    print("\n⚠ No Telegram messages found, nothing inserted into MongoDB.\n")

# Optional: Export to Excel
df.to_excel(output_excel, index=False)
print(f"📁 Data exported to Excel at: {output_excel}")
