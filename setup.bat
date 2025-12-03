@echo off
TITLE Plataforma Kakoi - Iniciando...
color 71

:: --- 1. EXIBIÇÃO DA ASCII ART ---
echo.
echo  oooo     oooo           oooo                    o8o  
echo  `888    .8P'            `888                    `"'  
echo   888   d8'     .oooo.    888  oooo   .ooooo.   oooo  
echo   88888[       `P  )88b   888 .8P'   d88' `88b  `888  
echo   888`88b.      .oP"888   888888.    888   888   888  
echo   888  `88b.   d8(  888   888 `88b.  888   888   888  
echo  o888o  o888o  `Y888""8o o888o o888o `Y8bod8P' o888o 
echo.
echo ========================================================
echo          INICIANDO SISTEMA KAKOI... POR FAVOR AGUARDE
echo ========================================================
echo.

:: --- 2. DETECÇÃO DO ENDEREÇO IP ---
:: Define localhost como padrão caso falhe
set IP_ADDR=localhost

:: Procura pelo endereço IPv4 na configuração de rede
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set IP_ADDR=%%a
)

:: Remove espaços em branco que o Windows deixa no começo do IP
set IP_ADDR=%IP_ADDR: =%

:: --- 3. INICIALIZAÇÃO DOS SERVIÇOS ---

:: Inicia o Backend (Flask) em uma janela oculta/minimizada
echo [1/3] Ligando o servidor Backend...
cd backend
start /min cmd /k ".\venv\Scripts\activate && flask run --host=0.0.0.0"

:: Volta para a pasta raiz
cd ..

:: Inicia o Frontend (React)
echo [2/3] Carregando a interface Frontend...
cd frontend-react
start /min cmd /c "npm start"

:: --- 4. FINALIZAÇÃO E EXIBIÇÃO DO LINK ---
echo [3/3] Sistema iniciado!
echo.
echo ========================================================
echo   O SISTEMA ESTA DISPONIVEL NO SEGUINTE ENDERECO:
echo.
echo   NETWORK (OUTROS PCS):  http://%IP_ADDR%:3000
echo   LOCAL:                 http://localhost:3000
echo.
echo   NAO FECHE ESTA JANELA ENQUANTO USAR O SISTEMA.
echo ========================================================

:: Abre o navegador automaticamente no link da rede (opcional)
timeout /t 5 >nul
start http://%IP_ADDR%:3000

pause