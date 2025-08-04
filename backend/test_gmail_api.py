#!/usr/bin/env python3
"""
Test script to verify Gmail API functionality, PDF consumption extraction, and Supabase database integration
"""

from email_listener import process_email_attachments
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    print("Testing Gmail API + PDF Consumption Extraction + Supabase Integration...")
    print("=" * 80)
    
    # Check if environment variables are set
    email = os.getenv("EMAIL")
    password = os.getenv("EMAIL_PASSWORD")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not email or not password:
        print("ERROR: EMAIL or EMAIL_PASSWORD environment variables not set!")
        print("Please check your .env file")
        return
    
    if not supabase_url or not supabase_key:
        print("⚠️  WARNING: SUPABASE_URL or SUPABASE_ANON_KEY not set!")
        print("Database operations will be skipped. Add these to your .env file:")
        print("SUPABASE_URL=your_supabase_url")
        print("SUPABASE_ANON_KEY=your_supabase_anon_key")
        print()
    
    print(f"Using email: {email}")
    print("Attempting to connect to Gmail and process PDFs...")
    print("🔍 Looking for water (M3) and electricity (kWh) consumption patterns...")
    print("📅 Also extracting dates from 'TRH Saneamento Dom' (water) and 'De: DD de month YYYY' (electricity)...")
    print("💾 Data will be saved to Supabase database (without PDF filenames)")
    print()
    
    # Test the integrated Gmail API + PDF processing + Supabase
    results = process_email_attachments()
    
    if results:
        print(f"\n✅ Successfully processed {len(results)} PDF(s) with consumption data!")
        
        # Count by utility type
        water_count = sum(1 for r in results if r.get('utility_type') == 'water')
        electricity_count = sum(1 for r in results if r.get('utility_type') == 'electricity')
        
        print(f"📊 Consumption breakdown:")
        print(f"  💧 Water: {water_count} PDF(s)")
        print(f"  ⚡ Electricity: {electricity_count} PDF(s)")
        print(f"  📈 Total consumption values extracted: {len(results)}")
        
        if supabase_url and supabase_key:
            print(f"💾 Data saved to Supabase database")
        else:
            print(f"⚠️  Data not saved to database (Supabase not configured)")
    else:
        print(f"\n⚠️  No consumption values found in any PDF attachments")
        print("This could mean:")
        print("  - No PDF attachments in recent emails")
        print("  - PDFs don't contain the expected consumption patterns:")
        print("    • Water: '10,00 M3' format with 'TRH Saneamento Dom' date range")
        print("    • Electricity: 'IEC 123 kWh' or '123 kWh' format with 'De: DD de month YYYY' date")
        print("  - PDFs are in a different format than expected")

if __name__ == "__main__":
    main() 



