from pymongo import MongoClient

client = MongoClient('mongodb+srv://bkbajpay0609:uv52KtpB09m1maFN@cluster0.xflo7xo.mongodb.net/')

db = client['test']
collection = db['dummyPythonDB']

document = {
    "name": "dummy",
    "city": "dummy city"
}

inserted_document = collection.insert_one(document)
print(f"Inserted Document ID: {inserted_document}")
client.close()