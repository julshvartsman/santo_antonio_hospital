import imaplib
import email
from email.header import decode_header
import os
from pathlib import Path
from datetime import datetime
import pdfplumber
import re
from supabase import create_client, Client

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("EMAIL_PASSWORD")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
HOSPITAL_ID = 1  # Hardcoded hospital ID for now

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️  Supabase credentials not found. Database operations will be skipped.")

IMAP_SERVER = "imap.gmail.com"
SAVE_DIR = "temp"

# Create folder if not exists
Path(SAVE_DIR).mkdir(parents=True, exist_ok=True)

def save_to_supabase(consumption_results):
    """Save consumption data to Supabase database"""
    if not supabase:
        print("❌ Supabase client not initialized. Skipping database save.")
        return
    
    try:
        for result in consumption_results:
            # Prepare data for database insertion (without source_file)
            data = {
                'hospital_id': HOSPITAL_ID,
                'billing_period': result.get('invoice_date'),
                'gas': None,  # Not implemented yet
                'water': result.get('consumption_numeric') if result.get('utility_type') == 'water' else None,
                'electricity': result.get('consumption_numeric') if result.get('utility_type') == 'electricity' else None,
                'scraped_at': datetime.now().isoformat()
            }
            
            # Insert data into the table
            response = supabase.table('scraped_emails').insert(data).execute()
            
            print(f"✅ Saved to database: {result.get('utility_type')} consumption = {result.get('consumption_value')}")
            
    except Exception as e:
        print(f"❌ Error saving to Supabase: {e}")

def extract_consumption_value(file_path):
    """Extract consumption values from PDFs, distinguishing between water and electricity"""
    
    consumption_value = None
    utility_type = None
    invoice_date = None
    
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            
            # First, try to detect water consumption (M3 pattern)
            water_matches = re.findall(r'(\d+,\d+)\s*M3', text, re.IGNORECASE)
            if water_matches:
                consumption_value = water_matches[0]
                utility_type = "water"
                
                # Extract invoice date for water PDFs
                # Look for "TRH Saneamento Dom" followed by date range in YYYY-MM-DD format
                date_matches = re.findall(r'TRH Saneamento Dom\s*(\d{4}-\d{2}-\d{2})\s*(\d{4}-\d{2}-\d{2})', text, re.IGNORECASE)
                if date_matches:
                    # Take the first date from the range as the invoice date
                    invoice_date = date_matches[0][0]
                
                break
            
            # Then, try to detect electricity consumption (kWh pattern)
            # Look for IEC followed by kWh pattern
            electricity_matches = re.findall(r'IEC\s+(\d+(?:,\d+)?)\s*kWh', text, re.IGNORECASE)
            if electricity_matches:
                consumption_value = electricity_matches[0]
                utility_type = "electricity"
                
                # Extract date for electricity PDFs
                # Look for "De: DD de month YYYY" format
                date_matches = re.findall(r'De:\s*(\d{1,2})\s+de\s+(\w+)\s+(\d{4})', text, re.IGNORECASE)
                if date_matches:
                    day, month, year = date_matches[0]
                    # Convert Portuguese month names to numbers
                    month_map = {
                        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
                        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
                        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
                    }
                    month_num = month_map.get(month.lower(), '01')
                    invoice_date = f"{year}-{month_num}-{day.zfill(2)}"
                
                break
            
            # Alternative electricity patterns (more flexible)
            # Look for any kWh pattern if IEC pattern not found
            if not electricity_matches:
                alt_electricity_matches = re.findall(r'(\d+(?:,\d+)?)\s*kWh', text, re.IGNORECASE)
                if alt_electricity_matches:
                    consumption_value = alt_electricity_matches[0]
                    utility_type = "electricity"
                    
                    # Extract date for electricity PDFs (alternative pattern)
                    # Look for "De: DD de month YYYY" format
                    date_matches = re.findall(r'De:\s*(\d{1,2})\s+de\s+(\w+)\s+(\d{4})', text, re.IGNORECASE)
                    if date_matches:
                        day, month, year = date_matches[0]
                        # Convert Portuguese month names to numbers
                        month_map = {
                            'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
                            'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
                            'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
                        }
                        month_num = month_map.get(month.lower(), '01')
                        invoice_date = f"{year}-{month_num}-{day.zfill(2)}"
                    
                    break

    return consumption_value, utility_type, invoice_date

def process_email_attachments():
    """Process emails, extract PDF attachments, and get consumption values"""
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL, PASSWORD)
        mail.select("inbox")

        # Fetch ALL emails
        status, messages = mail.search(None, "ALL")
        email_ids = messages[0].split()
        
        print(f"Total emails found: {len(email_ids)}")
        print("=" * 80)
        
        # Get the 3 most recent emails
        recent_ids = email_ids[-3:] if len(email_ids) >= 3 else email_ids
        
        consumption_results = []
        
        for i, eid in enumerate(reversed(recent_ids), 1):
            print(f"\n--- Processing Email #{i} ---")
            
            _, msg_data = mail.fetch(eid, "(RFC822)")
            raw_email = msg_data[0][1]
            message = email.message_from_bytes(raw_email)
            
            # Extract email details
            subject = message.get("Subject", "No Subject")
            sender = message.get("From", "Unknown Sender")
            date = message.get("Date", "Unknown Date")
            
            # Decode headers if needed
            if subject:
                decoded_subject, encoding = decode_header(subject)[0]
                if isinstance(decoded_subject, bytes):
                    subject = decoded_subject.decode(encoding or "utf-8")
            
            if sender:
                decoded_sender, encoding = decode_header(sender)[0]
                if isinstance(decoded_sender, bytes):
                    sender = decoded_sender.decode(encoding or "utf-8")
            
            print(f"Subject: {subject}")
            print(f"From: {sender}")
            print(f"Date: {date}")
            
            # Process attachments
            attachments = []
            for part in message.walk():
                content_disposition = part.get("Content-Disposition", "")
                if "attachment" in content_disposition:
                    filename = part.get_filename()
                    if filename:
                        # Decode the filename
                        decoded_name, encoding = decode_header(filename)[0]
                        if isinstance(decoded_name, bytes):
                            filename = decoded_name.decode(encoding or "utf-8")

                        filepath = os.path.join(SAVE_DIR, filename)

                        with open(filepath, "wb") as f:
                            f.write(part.get_payload(decode=True))

                        attachments.append(filepath)
                        print(f"📎 Saved attachment: {filename}")
            
            if not attachments:
                print("📎 No attachments found")
            
            # Process PDF attachments for consumption values
            for attachment_path in attachments:
                if attachment_path.lower().endswith('.pdf'):
                    print(f"🔍 Processing PDF: {os.path.basename(attachment_path)}")
                    
                    try:
                        consumption, utility_type, invoice_date = extract_consumption_value(attachment_path)
                        
                        if consumption:
                            consumption_float = float(consumption.replace(",", "."))
                            result = {
                                'email_subject': subject,
                                'email_sender': sender,
                                'email_date': date,
                                'pdf_filename': os.path.basename(attachment_path),
                                'consumption_value': consumption,
                                'consumption_numeric': consumption_float,
                                'utility_type': utility_type,
                                'invoice_date': invoice_date
                            }
                            consumption_results.append(result)
                            
                            # Display appropriate icon and unit based on utility type
                            if utility_type == "water":
                                date_info = f" 📅 Invoice Date: {invoice_date}" if invoice_date else ""
                                print(f"💧 Water consumption found: {consumption} M3 ({consumption_float} m³){date_info}")
                            elif utility_type == "electricity":
                                date_info = f" 📅 Invoice Date: {invoice_date}" if invoice_date else ""
                                print(f"⚡ Electricity consumption found: {consumption} kWh ({consumption_float} kWh){date_info}")
                            else:
                                print(f"📊 Consumption found: {consumption} ({consumption_float})")
                        else:
                            print(f"❌ No consumption value found in PDF")
                            
                    except Exception as e:
                        print(f"❌ Error processing PDF: {e}")
            
            print("-" * 40)
        
        mail.logout()
        
        # Print summary of consumption results
        if consumption_results:
            print(f"\n📊 CONSUMPTION SUMMARY:")
            print("=" * 60)
            for i, result in enumerate(consumption_results, 1):
                print(f"\nResult #{i}:")
                print(f"  📧 Email: {result['email_subject']}")
                print(f"  📄 PDF: {result['pdf_filename']}")
                
                # Display utility type and appropriate unit
                if result['utility_type'] == "water":
                    print(f"  💧 Water Consumption: {result['consumption_value']} M3")
                    print(f"  📈 Numeric: {result['consumption_numeric']} m³")
                    if result.get('invoice_date'):
                        print(f"  📅 Invoice Date: {result['invoice_date']}")
                elif result['utility_type'] == "electricity":
                    print(f"  ⚡ Electricity Consumption: {result['consumption_value']} kWh")
                    print(f"  📈 Numeric: {result['consumption_numeric']} kWh")
                    if result.get('invoice_date'):
                        print(f"  📅 Invoice Date: {result['invoice_date']}")
                else:
                    print(f"  📊 Consumption: {result['consumption_value']}")
                    print(f"  📈 Numeric: {result['consumption_numeric']}")
        else:
            print(f"\n❌ No consumption values found in any PDFs")
        
        print(f"\n✅ Gmail API connection successful! Processed {len(recent_ids)} emails.")
        
        # Save data to Supabase if we have results
        if consumption_results:
            print(f"\n💾 Saving data to Supabase database...")
            save_to_supabase(consumption_results)
        
        return consumption_results
        
    except Exception as e:
        print(f"Error connecting to Gmail API: {e}")
        return []
