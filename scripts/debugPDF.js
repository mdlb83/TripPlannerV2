const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function debugPDF() {
  const pdfPath = path.join(__dirname, '..', 'eBook for reference', 'RVingwithBikes4142025.pdf');
  
  try {
    console.log('Reading PDF file...');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('Parsing PDF content...');
    const data = await pdf(dataBuffer);
    
    console.log(`Total characters: ${data.text.length}`);
    console.log(`Total pages: ${data.numpages}`);
    
    // Show first 2000 characters to understand structure
    console.log('\n=== First 2000 characters ===');
    console.log(data.text.substring(0, 2000));
    
    // Split by double line breaks and show first few entries
    const entries = data.text.split(/\n\s*\n/);
    console.log(`\n=== Found ${entries.length} entries by double line breaks ===`);
    
    // Show first 10 entries to understand structure
    for (let i = 0; i < Math.min(10, entries.length); i++) {
      console.log(`\n--- Entry ${i + 1} (${entries[i].length} chars) ---`);
      console.log(entries[i].substring(0, 200) + (entries[i].length > 200 ? '...' : ''));
    }
    
    // Look for coordinate patterns
    console.log('\n=== Coordinate Pattern Analysis ===');
    const coordPattern1 = /(\d+\.?\d*)\s*[°]?\s*([NS])\s*,?\s*(\d+\.?\d*)\s*[°]?\s*([EW])/gi;
    const coordPattern2 = /(-?\d+\.?\d+)\s*,\s*(-?\d+\.?\d+)/g;
    
    const coords1 = data.text.match(coordPattern1) || [];
    const coords2 = data.text.match(coordPattern2) || [];
    
    console.log(`Coordinate pattern 1 matches: ${coords1.length}`);
    if (coords1.length > 0) {
      console.log('Examples:', coords1.slice(0, 5));
    }
    
    console.log(`Coordinate pattern 2 matches: ${coords2.length}`);
    if (coords2.length > 0) {
      console.log('Examples:', coords2.slice(0, 5));
    }
    
    // Look for common campground-related words
    console.log('\n=== Content Analysis ===');
    const keywords = ['campground', 'rv park', 'state park', 'trail', 'bike', 'bicycle', 'cycling'];
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = data.text.match(regex) || [];
      console.log(`"${keyword}": ${matches.length} occurrences`);
    });
    
    // Try different splitting patterns
    console.log('\n=== Alternative Split Patterns ===');
    
    // Try splitting by numbered entries
    const numberedEntries = data.text.split(/(?=\d+\.\s+[A-Z])/i);
    console.log(`Numbered entries: ${numberedEntries.length}`);
    
    // Try splitting by state patterns
    const stateEntries = data.text.split(/(?=[A-Z]{2,}\s*:)|(?=State\s+of\s+[A-Z])/i);
    console.log(`State-based entries: ${stateEntries.length}`);
    
    // Save full text for manual review
    const debugOutputPath = path.join(__dirname, 'pdf_content.txt');
    fs.writeFileSync(debugOutputPath, data.text);
    console.log(`\nFull PDF text saved to: ${debugOutputPath}`);
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugPDF(); 