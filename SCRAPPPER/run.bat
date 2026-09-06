@echo off
title Oto Faik - Akbay Renault Web Scraper
cls
echo ===================================================
echo   OTO FAIK - VERI CEKME OTOMASYONU BASLATILIYOR
echo ===================================================
echo.

:: 1. Aşama: URL Toplama
python collector.py
if %ERRORLEVEL% NEQ 0 (
    echo [!] URL toplama aşamasında hata oluştu!
    pause
    exit /b %ERRORLEVEL%
)

:: 2. Aşama: Ürün Detaylarını Çekme
python scraper.py
if %ERRORLEVEL% NEQ 0 (
    echo [!] Veri çekme aşamasında hata oluştu!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo   TUM ISLEMLER BASARIYLA TAMAMLANDI!
echo ===================================================
pause