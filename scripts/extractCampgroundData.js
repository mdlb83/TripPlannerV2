const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Campground data extraction script for RVingwithBikes eBook
class CampgroundExtractor {
  constructor() {
    this.extractedCampgrounds = [];
    this.currentState = null;
    this.stateMapping = {
      // Common state abbreviations and variations
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
      'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
      'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
      'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
      'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
      'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
      'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
      'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Parse coordinates from text
  parseCoordinates(text) {
    // Look for latitude/longitude patterns
    const coordPattern = /(\d+\.?\d*)\s*[°]?\s*([NS])\s*,?\s*(\d+\.?\d*)\s*[°]?\s*([EW])/i;
    const match = text.match(coordPattern);
    
    if (match) {
      let lat = parseFloat(match[1]);
      let lng = parseFloat(match[3]);
      
      // Convert to negative if South or West
      if (match[2].toUpperCase() === 'S') lat = -lat;
      if (match[4].toUpperCase() === 'W') lng = -lng;
      
      return { latitude: lat, longitude: lng };
    }
    
    // Alternative decimal format
    const decimalPattern = /(-?\d+\.?\d+)\s*,\s*(-?\d+\.?\d+)/;
    const decimalMatch = text.match(decimalPattern);
    
    if (decimalMatch) {
      const lat = parseFloat(decimalMatch[1]);
      const lng = parseFloat(decimalMatch[2]);
      
      // Basic validation for US coordinates
      if (lat >= 24 && lat <= 71 && lng >= -180 && lng <= -66) {
        return { latitude: lat, longitude: lng };
      }
    }
    
    return null;
  }

  // Extract contact information
  parseContact(text) {
    const contact = {};
    
    // Phone patterns
    const phonePattern = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      contact.phone = phoneMatch[1].replace(/[^\d]/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    
    // Email patterns
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) {
      contact.email = emailMatch[1];
    }
    
    // Website patterns
    const websitePattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|gov))/i;
    const websiteMatch = text.match(websitePattern);
    if (websiteMatch) {
      let website = websiteMatch[1];
      if (!website.startsWith('http')) {
        website = 'https://' + website;
      }
      contact.website = website;
    }
    
    return contact;
  }

  // Extract pricing information
  parsePricing(text) {
    const pricing = {
      currency: 'USD',
      priceType: 'per_night'
    };
    
    // Look for price patterns
    const pricePattern = /\$(\d+(?:\.\d{2})?)/;
    const priceMatch = text.match(pricePattern);
    
    if (priceMatch) {
      pricing.basePrice = parseFloat(priceMatch[1]);
    }
    
    // Check for per person pricing
    if (text.toLowerCase().includes('per person')) {
      pricing.priceType = 'per_person';
    } else if (text.toLowerCase().includes('varies')) {
      pricing.priceType = 'varies';
    }
    
    return pricing;
  }

  // Parse amenities from text
  parseAmenities(text) {
    const lowerText = text.toLowerCase();
    
    return {
      restrooms: this.hasAmenity(lowerText, ['restroom', 'bathroom', 'toilet']),
      showers: this.hasAmenity(lowerText, ['shower', 'bath']),
      drinkingWater: this.hasAmenity(lowerText, ['water', 'drinking water', 'potable']),
      electricHookups: this.hasAmenity(lowerText, ['electric', 'electrical', 'hookup', '30 amp', '50 amp']),
      wifiAvailable: this.hasAmenity(lowerText, ['wifi', 'wi-fi', 'internet', 'wireless']),
      petFriendly: this.hasAmenity(lowerText, ['pet', 'dog', 'pet-friendly', 'pets welcome']),
      bikeRepair: this.hasAmenity(lowerText, ['bike repair', 'bicycle repair', 'bike maintenance', 'bike shop']),
      laundry: this.hasAmenity(lowerText, ['laundry', 'washing', 'washer', 'dryer'])
    };
  }

  hasAmenity(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  // Parse trail access information
  parseTrailAccess(text) {
    const lowerText = text.toLowerCase();
    const trailTypes = [];
    
    // Detect trail types
    if (this.hasTrailType(lowerText, ['mountain bike', 'mountain biking', 'mtb', 'single track'])) {
      trailTypes.push('mountain_biking');
    }
    if (this.hasTrailType(lowerText, ['road bike', 'road cycling', 'paved', 'road'])) {
      trailTypes.push('road_cycling');
    }
    if (this.hasTrailType(lowerText, ['rail trail', 'rail-trail', 'converted railroad'])) {
      trailTypes.push('rail_trail');
    }
    if (this.hasTrailType(lowerText, ['gravel', 'gravel road', 'unpaved'])) {
      trailTypes.push('gravel');
    }
    if (this.hasTrailType(lowerText, ['mixed use', 'multi-use', 'shared'])) {
      trailTypes.push('mixed_use');
    }
    
    // Default to mixed_use if no specific type found but trail access mentioned
    if (trailTypes.length === 0 && (lowerText.includes('trail') || lowerText.includes('bike'))) {
      trailTypes.push('mixed_use');
    }

    // Determine difficulty
    let difficulty = 'beginner';
    if (this.hasTrailType(lowerText, ['advanced', 'difficult', 'challenging', 'expert'])) {
      difficulty = 'advanced';
    } else if (this.hasTrailType(lowerText, ['intermediate', 'moderate'])) {
      difficulty = 'intermediate';
    }

    return {
      hasDirectAccess: trailTypes.length > 0,
      trailTypes,
      difficulty,
      distanceToTrailhead: 0 // Will be updated if distance information is found
    };
  }

  hasTrailType(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  // Main extraction method
  extractCampgroundFromText(text, index) {
    // Skip if text is too short to be a campground entry
    if (text.length < 50) return null;

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) return null;

    // First non-empty line is likely the campground name
    const name = lines[0];
    
    // Skip if name looks like a header or contains common non-campground text
    if (this.isHeaderOrNonCampground(name)) return null;

    const fullText = lines.join(' ');
    const coordinates = this.parseCoordinates(fullText);
    
    // Skip if no coordinates found (likely not a campground entry)
    if (!coordinates) return null;

    const contact = this.parseContact(fullText);
    const pricing = this.parsePricing(fullText);
    const amenities = this.parseAmenities(fullText);
    const trailAccess = this.parseTrailAccess(fullText);

    // Extract location information
    let city = 'Unknown';
    let state = this.currentState || 'Unknown';
    let address = '';

    // Try to find city and state information
    const locationPattern = /([A-Za-z\s]+),\s*([A-Z]{2})\b/;
    const locationMatch = fullText.match(locationPattern);
    if (locationMatch) {
      city = locationMatch[1].trim();
      state = this.stateMapping[locationMatch[2]] || locationMatch[2];
    }

    return {
      id: this.generateId(),
      name: name,
      description: lines.slice(1, 3).join(' '), // Use next 1-2 lines as description
      location: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address: address || `${city}, ${state}`,
        city: city,
        state: state,
        zipCode: null
      },
      contact,
      amenities,
      trailAccess,
      pricing,
      capacity: {
        maxOccupancy: null,
        totalSites: null,
        reservationRequired: fullText.toLowerCase().includes('reservation')
      },
      images: [],
      lastUpdated: new Date().toISOString()
    };
  }

  isHeaderOrNonCampground(text) {
    const lowerText = text.toLowerCase();
    const skipPatterns = [
      'table of contents', 'index', 'chapter', 'introduction', 'preface',
      'rvingwithbikes', 'page', 'copyright', 'isbn', 'published',
      'state', 'region', 'area', 'section'
    ];
    
    return skipPatterns.some(pattern => lowerText.includes(pattern)) || 
           text.length < 3 || 
           /^\d+$/.test(text) || // Just a number
           text.length > 100; // Too long to be a campground name
  }

  async extractFromPDF(pdfPath) {
    try {
      console.log('Reading PDF file...');
      const dataBuffer = fs.readFileSync(pdfPath);
      
      console.log('Parsing PDF content...');
      const data = await pdf(dataBuffer);
      
      console.log(`Extracted ${data.text.length} characters from PDF`);
      
      // Split text into potential campground entries
      // Look for patterns that indicate new campground entries
      const entries = this.splitIntoEntries(data.text);
      
      console.log(`Found ${entries.length} potential campground entries`);
      
      let validCampgrounds = 0;
      
      for (let i = 0; i < entries.length; i++) {
        const campground = this.extractCampgroundFromText(entries[i], i);
        if (campground) {
          this.extractedCampgrounds.push(campground);
          validCampgrounds++;
          
          if (validCampgrounds % 10 === 0) {
            console.log(`Processed ${validCampgrounds} campgrounds...`);
          }
        }
      }
      
      console.log(`Successfully extracted ${this.extractedCampgrounds.length} campgrounds`);
      return this.extractedCampgrounds;
      
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      throw error;
    }
  }

  splitIntoEntries(text) {
    // Split by common patterns that indicate new campground entries
    // This is a heuristic approach and may need adjustment based on actual PDF structure
    
    // Try splitting by double line breaks first
    let entries = text.split(/\n\s*\n/);
    
    // If that doesn't work well, try other patterns
    if (entries.length < 10) {
      // Try splitting by state headers or numbered entries
      entries = text.split(/(?=\d+\.\s*[A-Z])|(?=[A-Z]{2,}\s*STATE)|(?=State of [A-Z])/i);
    }
    
    return entries.filter(entry => entry.trim().length > 20);
  }

  // Save extracted data to JSON file
  saveToFile(filename = 'extracted_campgrounds.json') {
    const outputPath = path.join(__dirname, filename);
    fs.writeFileSync(outputPath, JSON.stringify(this.extractedCampgrounds, null, 2));
    console.log(`Saved ${this.extractedCampgrounds.length} campgrounds to ${outputPath}`);
    return outputPath;
  }
}

// Main execution
async function main() {
  const extractor = new CampgroundExtractor();
  const pdfPath = path.join(__dirname, '..', 'eBook for reference', 'RVingwithBikes4142025.pdf');
  
  try {
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at ${pdfPath}`);
    }
    
    console.log('Starting campground data extraction...');
    console.log(`PDF file: ${pdfPath}`);
    
    const campgrounds = await extractor.extractFromPDF(pdfPath);
    
    if (campgrounds.length > 0) {
      const outputFile = extractor.saveToFile();
      console.log('\n=== Extraction Summary ===');
      console.log(`Total campgrounds extracted: ${campgrounds.length}`);
      console.log(`Output file: ${outputFile}`);
      console.log('\nSample campground:');
      console.log(JSON.stringify(campgrounds[0], null, 2));
    } else {
      console.log('No campgrounds were extracted. Please check the PDF structure.');
    }
    
  } catch (error) {
    console.error('Extraction failed:', error.message);
    process.exit(1);
  }
}

// Run the extraction
if (require.main === module) {
  main();
}

module.exports = { CampgroundExtractor }; 