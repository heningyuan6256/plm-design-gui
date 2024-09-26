@echo off

:: 定义 en_US 和 zh_CN 注册表路径
set "reg_path_en=HKEY_CURRENT_USER\SOFTWARE\ZWSOFT\ZW3D\ZW3D 29.00\zh_CN\Plugin_x64\PLMDesinFusion_ZW"
set "reg_path_cn=HKEY_CURRENT_USER\SOFTWARE\ZWSOFT\ZW3D\ZW3D 29.00\en_US\Plugin_x64\PLMDesinFusion_ZW"

set "current_dir=%CD%"

:: 新建 en_US 目录并添加相应的值
reg add "%reg_path_en%" /v Application /t REG_SZ /d "PLMDesinFusion_ZW.dll" /f
reg add "%reg_path_en%" /v Description /t REG_SZ /d "" /f
reg add "%reg_path_en%" /v Load /t REG_SZ /d "7" /f
reg add "%reg_path_en%" /v Location /t REG_SZ /d "%current_dir%" /f
reg add "%reg_path_en%" /v Resource /t REG_SZ /d "" /f

:: 新建 zh_CN 目录并添加相应的值
reg add "%reg_path_cn%" /v Application /t REG_SZ /d "PLMDesinFusion_ZW.dll" /f
reg add "%reg_path_cn%" /v Description /t REG_SZ /d "" /f
reg add "%reg_path_cn%" /v Load /t REG_SZ /d "7" /f
reg add "%reg_path_cn%" /v Location /t REG_SZ /d "%current_dir%" /f
reg add "%reg_path_cn%" /v Resource /t REG_SZ /d "" /f

echo Registry entries for en_US and zh_CN added successfully.
exit
