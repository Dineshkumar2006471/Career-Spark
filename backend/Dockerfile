FROM python:3.12-slim

ENV PYTHONUNBUFFERED=True
ENV PORT=8080

WORKDIR /app

# Install dependencies first for better caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the rest
COPY . ./

# Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
