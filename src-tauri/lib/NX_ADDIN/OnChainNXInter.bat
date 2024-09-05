@echo off

:: Step 1: 获取环境变量 UGII_BASE_DIR
set "ugiiBaseDir=%UGII_BASE_DIR%"

if "%ugiiBaseDir%"=="" (
    echo ERROR: UGII_BASE_DIR environment variable is not set.
    exit /b 1
)

:: Step 2: 拼接 custom_dirs.dat 文件路径
set "datFilePath=%ugiiBaseDir%\UGII\menus\custom_dirs.dat"

:: Step 3: 获取注册表项中的地址
for /f "tokens=3*" %%A in ('reg query "HKEY_CURRENT_USER\SOFTWARE\ONCHAIN\OnChain-DesignFusion" /v "InstallDir" 2^>nul') do (
    set "regValue=%%A %%B"
)

if "%regValue%"=="" (
    echo ERROR: Failed to retrieve the registry value.
    exit /b 1
)

:: 拼接 DLL 文件路径
set "dllFolderPath=%regValue%lib\NX_ADDIN"
set "dllPath=%regValue%lib\NX_ADDIN\application\OnChainPLM.dll"

:: Step 4: 创建一个临时文件路径
set "tempFile=%TEMP%\custom_dirs_temp.dat"
set "foundOnChain=0"
set "replaceNextLine=0"
set "foundData=0"


:: 逐行读取 dat 文件内容，处理 #OnChain 的情况
(for /f "usebackq delims=" %%L in ("%datFilePath%") do (
    echo %%L | findstr /b /c:"#OnChain" >nul
    if not errorlevel 1 (
        echo %%L>> "%tempFile%"
        echo %dllFolderPath%>> "%tempFile%"
        set "foundOnChain=1"
    ) else (
        echo %%L>> "%tempFile%"
    )
)) 


:: 如果没有找到 #OnChain，则追加新内容
if "%foundOnChain%"=="0" (
    echo #OnChain>> "%tempFile%"
    echo %dllFolderPath%>> "%tempFile%"
)

:: 用临时文件替换原文件
move /y "%tempFile%" "%datFilePath%"

:: Step 6: 将 dllPath 写入新的环境变量
setx USER_STARTUP "%dllPath%" /m

echo Finished.
