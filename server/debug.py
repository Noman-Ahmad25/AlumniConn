import uvicorn

print("========== DEBUG START ==========")

uvicorn.run(
    "app:app",
    host="0.0.0.0",
    port=10000,
    log_level="debug",
)
