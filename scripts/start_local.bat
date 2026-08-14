@echo off
cd /d C:\Users\PC\Downloads\PCSpec
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=1234
set DB_NAME=smart_pc_builder
set JWT_SECRET=pcspec_secret_k3y_2026_s3cur3_r4nd0m
set GEMINI_API_KEY=
start "PCSpec-Backend" /min cmd /k "node node-backend/server.js"
cd /d C:\Users\PC\Downloads\PCSpec\frontend
start "PCSpec-Frontend" /min cmd /k "npm run dev"
