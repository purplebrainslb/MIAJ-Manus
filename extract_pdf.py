import PyPDF2

try:
    pdf = PyPDF2.PdfReader('/home/ubuntu/upload/MIAJ PRD.pdf')
    text = ''
    for page in pdf.pages:
        text += page.extract_text() + '\n\n'
    
    with open('/home/ubuntu/miaj_project/prd_content.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    
    print("PDF content extracted successfully!")
except Exception as e:
    print(f"Error extracting PDF: {e}")
