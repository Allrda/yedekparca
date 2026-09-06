import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))

pdf_path = r"C:\Users\BUYUKSEHIR\Desktop\oto faik tüm arşiv\otofaik_finansal_analiz_guncel.pdf"
pdf_path_alt = r"C:\Users\BUYUKSEHIR\Desktop\oto faik tüm arşiv\yedekparca-main\otofaik_finansal_analiz_guncel.pdf"

doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
story = []

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'TitleStyle',
    fontName='Arial-Bold',
    fontSize=18,
    leading=22,
    textColor=colors.HexColor('#1E293B'),
    spaceAfter=15,
    alignment=1
)

h1_style = ParagraphStyle(
    'H1Style',
    fontName='Arial-Bold',
    fontSize=13,
    leading=16,
    textColor=colors.HexColor('#0F172A'),
    spaceBefore=12,
    spaceAfter=6
)

normal_style = ParagraphStyle(
    'NormalStyle',
    fontName='Arial',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#334155'),
    spaceAfter=6
)

table_text = ParagraphStyle(
    'TableText',
    fontName='Arial',
    fontSize=9,
    leading=12,
    textColor=colors.HexColor('#1E293B')
)

table_header = ParagraphStyle(
    'TableHeader',
    fontName='Arial-Bold',
    fontSize=9,
    leading=12,
    textColor=colors.white
)

story.append(Paragraph("OTO FAİK E-TİCARET PROJESİ", title_style))
story.append(Paragraph("Finansal Maliyet, Muhasebe ve Bütçe Planı Raporu", ParagraphStyle('Sub', fontName='Arial', fontSize=12, leading=16, textColor=colors.HexColor('#64748B'), alignment=1, spaceAfter=20)))

story.append(Paragraph("1. Kullanıcının Belirttiği Başlangıç Kalemleri ve Analizi", h1_style))
user_items_data = [
    [Paragraph("Kalem", table_header), Paragraph("Detay / Özellik", table_header), Paragraph("Tahmini / Beyan Edilen Fiyat", table_header), Paragraph("Değerlendirme", table_header)],
    [Paragraph("Domain", table_text), Paragraph("otofaik.com (Hostinger)", table_text), Paragraph("1.509 TL (3 Yıllık)", table_text), Paragraph("Çok uygun (Yıllık ~500 TL)", table_text)],
    [Paragraph("VDS Server", table_text), Paragraph("150GB SSD, 10GB RAM, 6 Core Xeon E5", table_text), Paragraph("3.448 TL (Yıllık)", table_text), Paragraph("Fiyat/performans açısından çok ekonomik", table_text)],
    [Paragraph("Firebase", table_text), Paragraph("Firestore, Auth, Hosting", table_text), Paragraph("Yazılmamış (Kullandıkça Öde)", table_text), Paragraph("Aylık 10$ - 40$ (~350 TL - 1.400 TL)", table_text)],
    [Paragraph("Kurumsal Mail", table_text), Paragraph("Yandex Mail (~5000 mail)", table_text), Paragraph("~$15 (Aylık)", table_text), Paragraph("Standart ve ekonomik", table_text)]
]

t1 = Table(user_items_data, colWidths=[80, 140, 110, 200])
t1.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2563EB')),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
]))
story.append(t1)
story.append(Spacer(1, 15))

story.append(Paragraph("2. Sistemi Tam Anlamıyla Ayağa Kaldırmak İçin Eklenen Ekstra Kalemler", h1_style))
extra_items_data = [
    [Paragraph("Ekstra Kalem", table_header), Paragraph("Açıklama / Zorunluluk Nedeni", table_header), Paragraph("Tahmini Maliyet", table_header)],
    [Paragraph("SMS / WhatsApp", table_text), Paragraph("Sipariş onay, kargo takip ve bilgilendirme mesajları", table_text), Paragraph("Aylık ~300 TL - 1.000 TL", table_text)],
    [Paragraph("E-Fatura / E-Arşiv", table_text), Paragraph("Yasal satış faturası kesebilmek için entegratör (Paraşüt vb.)", table_text), Paragraph("~2.500 TL / Yıl", table_text)],
    [Paragraph("Sanal POS Komisyonu", table_text), Paragraph("Kredi kartı tahsilatları (PayTR / iyzico)", table_text), Paragraph("Cironun %2 - %3.5'i", table_text)],
    [Paragraph("Şirket ve Muhasebe", table_text), Paragraph("Şahıs şirketi aylık muhasebe ve müşavirlik bedeli", table_text), Paragraph("Aylık ~3.000 TL", table_text)],
    [Paragraph("Sunucu Yedekleme", table_text), Paragraph("VDS verilerinin güvenliği için snapshot / yedek", table_text), Paragraph("Aylık ~200 TL", table_text)]
]

t2 = Table(extra_items_data, colWidths=[110, 230, 190])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
]))
story.append(t2)
story.append(Spacer(1, 15))

story.append(Paragraph("3. Dönemsel Toplam Gider Analizi (Kümülatif Maliyet Tablosu)", h1_style))
summary_data = [
    [Paragraph("Dönem", table_header), Paragraph("Açıklama / Dahil Olan Ödemeler", table_header), Paragraph("Toplam Tutar (Şirket Dahil)", table_header), Paragraph("Toplam Tutar (Şirket Hariç)", table_header)],
    [Paragraph("1. Ay", table_text), Paragraph("Domain (3 Yıl) + VDS (1 Yıl) + E-Fatura (1 Yıl) + Şirket Kuruluş (~4.000 TL) + 1. Ay Sabit Giderler (Firebase, Mail, SMS, Muhasebe)", table_text), Paragraph("~16.207 TL", table_text), Paragraph("~12.207 TL", table_text)],
    [Paragraph("3. Ay Sonu", table_text), Paragraph("1. Ay Başlangıç Maliyeti + 2. ve 3. Ayların Sabit Operasyon Giderleri (9.500 TL)", table_text), Paragraph("~25.707 TL", table_text), Paragraph("~21.707 TL", table_text)],
    [Paragraph("12. Ay Sonu", table_text), Paragraph("1. Ay Başlangıç ve Yıllık Peşinler + Kalan 11 Ayın Sabit Giderleri (52.250 TL)", table_text), Paragraph("~68.457 TL", table_text), Paragraph("~64.457 TL", table_text)]
]

t3 = Table(summary_data, colWidths=[65, 230, 105, 100])
t3.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#047857')),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
]))
story.append(t3)
story.append(Spacer(1, 15))

doc.build(story)

# Also save copy to alt path
import shutil
shutil.copy(pdf_path, pdf_path_alt)
print("PDF successfully generated.")
