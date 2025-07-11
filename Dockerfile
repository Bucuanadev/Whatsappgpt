FROM python:3.11-slim-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ src/
COPY whatsapp-gpt-vanilla-frontend/ whatsapp-gpt-vanilla-frontend/

EXPOSE 5000

CMD ["python", "src/main.py"]

