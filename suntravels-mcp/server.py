import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from mcp.server.fastmcp import FastMCP

# Initialize the FastMCP Server
mcp = FastMCP("SunTravels-DB-Gateway")

def get_db_connection():
    """Establishes a safe connection to your Neon PostgreSQL database."""
    # Reads from the environment variable passed by Spring Boot
    db_url = os.environ.get("DB_URL")
    if not db_url:
        # Fallback error mapping for debug visibility
        raise ValueError("Database connection URL (DB_URL) is missing from environment setup.")
    return psycopg2.connect(db_url, cursor_factory=RealDictCursor)

@mcp.tool(description="Searches the Sun Travels database for available hotel rooms based on check-in date (YYYY-MM-DD), number of nights, and total adults.")
def search_hotel_contracts(check_in_date: str, no_of_nights: int, total_adults: int) -> str:
    try:
        # 1. Parse operational variables
        start_date = datetime.strptime(check_in_date, "%Y-%m-%d").date()
        end_date = start_date + timedelta(days=no_of_nights)
        
        # 2. Connect to your live Neon database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 3. This is the exact native SQL query your repository used, optimized for raw PostgreSQL execution
        query = """
            SELECT 
                h.name AS "hotelName", 
                rt.type_name AS "roomType", 
                (c.markup_percentage + 100) / 100.0 * rtp.price_per_adult AS "price",
                'Available' AS "availabilityStatus"
            FROM contracts c
            JOIN hotels h ON c.hotel_id = h.id
            JOIN room_types rt ON rt.hotel_id = h.id
            JOIN room_type_prices rtp ON rtp.contract_id = c.id AND rtp.room_type_id = rt.id
            WHERE c.start_date <= %s 
              AND c.end_date >= %s
              AND rtp.max_adults >= %s
            ORDER BY "price" ASC
            LIMIT 5;
        """
        
        cursor.execute(query, (start_date, end_date, total_adults))
        records = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # 4. Format and process data outputs for LLM ingestion
        if not records:
            return f"No available room contracts found matching these criteria: Dates {start_date} to {end_date} for {total_adults} adults."
            
        response_lines = ["Available Options found in Sun Travels Database:"]
        for row in records:
            response_lines.append(
                f"- {row['hotelName']}, Room: {row['roomType']}, Price: ${float(row['price']):.2f} ({row['availabilityStatus']})"
            )
            
        return "\n".join(response_lines)
        
    except Exception as e:
        return f"Error querying local MCP database engine: {str(e)}"

if __name__ == "__main__":
    # Launch the server utilizing standard input/output stream communication layers
    mcp.run(transport="stdio")