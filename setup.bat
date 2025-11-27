@echo off
TITLE Plataforma Kakoi - Iniciando...

:: 1. Inicia o Backend (Flask) em uma janela oculta ou minimizada
echo Iniciando o Servidor (Backend)...
cd backend
start /min cmd /k ".\venv\Scripts\activate && flask run --host=0.0.0.0"

:: Volta para a pasta raiz
cd ..

:: 2. Inicia o Frontend (React)
echo Iniciando a Interface (Frontend)...
cd frontend-react
start /min cmd /c "npm start"

:: 3. Espera uns segundos para tudo carregar e abre o navegador
timeout /t 10
start http://localhost:3000

echo.
echo ========================================================
echo   SISTEMA KAKOI ESTA RODANDO!
echo   NAO FECHE AS JANELAS PRETAS MINIMIZADAS.
echo   Para acessar de outros computadores, use o IP deste PC.
echo ========================================================
pause