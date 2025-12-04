@echo off
TITLE Instalador Automatico - Plataforma Kakoi
color 0A

echo ========================================================
echo      INSTALADOR AUTOMATICO - PLATAFORMA KAKOI
echo ========================================================
echo.

:: --- 1. VERIFICAÇÕES PRÉVIAS ---
echo [1/4] Verificando requisitos do sistema...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale o Python e marque a opcao "Add to PATH".
    echo Baixe em: python.org
    pause
    exit
)
echo   - Python: OK

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js.
    echo Baixe em: nodejs.org
    pause
    exit
)
echo   - Node.js: OK
echo.

:: --- 2. CONFIGURANDO O BACKEND ---
echo [2/4] Configurando o servidor (Backend)...
cd backend

if not exist .env (
    echo   - Criando arquivo de seguranca (.env)...
    echo SECRET_KEY=chave_secreta_gerada_pelo_instalador_automatico > .env
)

if exist venv (
    echo   - Limpando instalacao antiga...
    rmdir /s /q venv
)

echo   - Criando ambiente virtual Python...
python -m venv venv

echo   - Ativando ambiente e instalando bibliotecas...
call .\venv\Scripts\activate
python -m pip install --upgrade pip >nul
pip install -r requirements.txt >nul
pip install waitress >nul

echo   - Criando o Banco de Dados...
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('   - Banco de dados criado com sucesso!')"

:: Desativa o venv para voltar ao terminal normal
call .\venv\Scripts\deactivate
cd ..
echo.

:: --- 3. CONFIGURANDO O FRONTEND ---
echo [3/4] Configurando a interface (Frontend)...
echo   - Isso pode demorar alguns minutos. Por favor, aguarde...
cd frontend-react

:: O flag --silent reduz o texto na tela para nao assustar o usuario
call npm install --silent

cd ..
echo.

:: --- 4. CONCLUSÃO ---
echo ========================================================
echo [4/4] INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================================
echo.
echo Agora voce pode usar o atalho na area de trabalho.
echo Pode fechar esta janela.
echo.
pause