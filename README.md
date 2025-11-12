# Email Agent

## Backend Setup
## Run these commands in the root directory to setup the project properly

```
python -m venv .venv
source .venv/Scripts/activate
```

## Run these commands in the src/backend directory to setup the project properly

```
pip install -r requirements.txt
```

## DB Setup

```
pip install motor pymongo python-dotenv
python -m pip install "pymongo[srv]==3.12"
```

## Run this command after every pull to ensure you have all the latest dependencies 

```
pip install -r requirements.txt
```

## If you need to install new packages in python then run this command after isntalling it to save the dependencies

```
pip freeze > requirements.txt
```

## Use this command to run the backend application
```
uvicorn main:app --reload --port 8000
```


