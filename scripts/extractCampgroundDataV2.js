const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Revised campground extractor based on actual PDF structure
class CampgroundExtractorV2 {
  constructor() {
    this.extractedCampgrounds = [];
    this.currentState = null;
    this.stateMapping = {
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
    
    // US state capitals as default coordinates (approximations)
    this.stateCoordinates = {
      'Alabama': { latitude: 32.361538, longitude: -86.279118 },
      'Alaska': { latitude: 58.301935, longitude: -134.419740 },
      'Arizona': { latitude: 33.448457, longitude: -112.073844 },
      'Arkansas': { latitude: 34.736009, longitude: -92.331122 },
      'California': { latitude: 38.576668, longitude: -121.493629 },
      'Colorado': { latitude: 39.739236, longitude: -104.990251 },
      'Connecticut': { latitude: 41.767, longitude: -72.677 },
      'Delaware': { latitude: 39.161921, longitude: -75.526755 },
      'Florida': { latitude: 30.4518, longitude: -84.27277 },
      'Georgia': { latitude: 33.76, longitude: -84.39 },
      'Hawaii': { latitude: 21.30895, longitude: -157.826182 },
      'Idaho': { latitude: 43.613739, longitude: -116.237651 },
      'Illinois': { latitude: 39.78325, longitude: -89.650373 },
      'Indiana': { latitude: 39.790942, longitude: -86.147685 },
      'Iowa': { latitude: 41.590939, longitude: -93.620866 },
      'Kansas': { latitude: 39.04, longitude: -95.69 },
      'Kentucky': { latitude: 38.197274, longitude: -84.86311 },
      'Louisiana': { latitude: 30.45809, longitude: -91.140229 },
      'Maine': { latitude: 44.323535, longitude: -69.765261 },
      'Maryland': { latitude: 38.972945, longitude: -76.501157 },
      'Massachusetts': { latitude: 42.2352, longitude: -71.0275 },
      'Michigan': { latitude: 42.354558, longitude: -84.955255 },
      'Minnesota': { latitude: 44.95, longitude: -93.094 },
      'Mississippi': { latitude: 32.320, longitude: -90.207 },
      'Missouri': { latitude: 38.572954, longitude: -92.189283 },
      'Montana': { latitude: 46.595805, longitude: -112.027031 },
      'Nebraska': { latitude: 40.809868, longitude: -96.675345 },
      'Nevada': { latitude: 39.161921, longitude: -119.767403 },
      'New Hampshire': { latitude: 43.220093, longitude: -71.549896 },
      'New Jersey': { latitude: 40.221741, longitude: -74.756138 },
      'New Mexico': { latitude: 35.667231, longitude: -105.964575 },
      'New York': { latitude: 42.659829, longitude: -73.781339 },
      'North Carolina': { latitude: 35.771, longitude: -78.638 },
      'North Dakota': { latitude: 46.813343, longitude: -100.779004 },
      'Ohio': { latitude: 39.961176, longitude: -82.998794 },
      'Oklahoma': { latitude: 35.482309, longitude: -97.534994 },
      'Oregon': { latitude: 44.931109, longitude: -123.029159 },
      'Pennsylvania': { latitude: 40.269789, longitude: -76.875613 },
      'Rhode Island': { latitude: 41.82355, longitude: -71.422132 },
      'South Carolina': { latitude: 34.000, longitude: -81.035 },
      'South Dakota': { latitude: 44.367966, longitude: -100.336378 },
      'Tennessee': { latitude: 36.165, longitude: -86.784 },
      'Texas': { latitude: 30.266667, longitude: -97.75 },
      'Utah': { latitude: 40.777477, longitude: -111.888237 },
      'Vermont': { latitude: 44.26639, longitude: -72.580536 },
      'Virginia': { latitude: 37.54, longitude: -77.46 },
      'Washington': { latitude: 47.042418, longitude: -122.893077 },
      'West Virginia': { latitude: 38.349497, longitude: -81.633294 },
      'Wisconsin': { latitude: 43.074722, longitude: -89.384444 },
      'Wyoming': { latitude: 41.145548, longitude: -104.802042 }
    };
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Extract campground type and name from the "Campground:" line
  parseCampgroundLine(line) {
    // Pattern: "Campground: [type]. [name]"
    const campgroundPattern = /Campground:\s*\.?\s*([^.]+)\.\s*(.+)/i;
    const match = line.match(campgroundPattern);
    
    if (match) {
      return {
        type: match[1].trim(),
        name: match[2].trim()
      };
    }
    
    // Alternative pattern without type
    const simplePattern = /Campground:\s*\.?\s*(.+)/i;
    const simpleMatch = line.match(simplePattern);
    
    if (simpleMatch) {
      return {
        type: 'Campground',
        name: simpleMatch[1].trim()
      };
    }
    
    return null;
  }

  // Extract trail information from "Trail:" lines
  parseTrailLine(line) {
    const trailPattern = /Trail:\s*\.?\s*(.+)/i;
    const match = line.match(trailPattern);
    
    if (match) {
      return match[1].trim();
    }
    
    return null;
  }

  // Parse city and state from location line
  parseLocationLine(line) {
    // Pattern: "City, ST (B)" or "City, ST"
    const locationPattern = /([^,]+),\s*([A-Z]{2})\s*(?:\([AB]\))?/;
    const match = line.match(locationPattern);
    
    if (match) {
      return {
        city: match[1].trim(),
        state: this.stateMapping[match[2]] || match[2]
      };
    }
    
    return null;
  }

  // Parse amenities from text
  parseAmenities(text) {
    const lowerText = text.toLowerCase();
    
    return {
      restrooms: this.hasAmenity(lowerText, ['restroom', 'bathroom', 'toilet', 'facilities']),
      showers: this.hasAmenity(lowerText, ['shower', 'bath']),
      drinkingWater: this.hasAmenity(lowerText, ['water', 'drinking water', 'potable water']),
      electricHookups: this.hasAmenity(lowerText, ['electric', 'electrical', 'hookup', 'hook up', 'full hookup', '30 amp', '50 amp']),
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
  parseTrailAccess(trailDescription) {
    if (!trailDescription) {
      return {
        hasDirectAccess: false,
        trailTypes: [],
        difficulty: 'beginner',
        distanceToTrailhead: null
      };
    }

    const lowerText = trailDescription.toLowerCase();
    const trailTypes = [];
    
    // Detect trail types based on description
    if (this.hasTrailType(lowerText, ['mountain bike', 'mountain biking', 'mtb'])) {
      trailTypes.push('mountain_biking');
    }
    if (this.hasTrailType(lowerText, ['paved', 'asphalt', 'road', 'bike path'])) {
      trailTypes.push('road_cycling');
    }
    if (this.hasTrailType(lowerText, ['rail trail', 'rail-trail', 'converted railroad'])) {
      trailTypes.push('rail_trail');
    }
    if (this.hasTrailType(lowerText, ['gravel', 'gravel road', 'unpaved'])) {
      trailTypes.push('gravel');
    }
    if (this.hasTrailType(lowerText, ['multi-use', 'mixed use', 'shared'])) {
      trailTypes.push('mixed_use');
    }
    
    // Default to mixed_use for paved trails if no specific type
    if (trailTypes.length === 0 && (lowerText.includes('paved') || lowerText.includes('trail'))) {
      trailTypes.push('mixed_use');
    }

    // Determine access distance
    let distanceToTrailhead = 0; // Default to direct access
    const distanceMatch = trailDescription.match(/(\d+(?:\.\d+)?)\s*mile[s]?\s*(?:from|to|away)/i);
    if (distanceMatch) {
      distanceToTrailhead = parseFloat(distanceMatch[1]) * 1609.34; // Convert miles to meters
    } else if (lowerText.includes('adjacent') || lowerText.includes('direct access') || lowerText.includes('in the park')) {
      distanceToTrailhead = 0;
    }

    return {
      hasDirectAccess: distanceToTrailhead <= 500, // Within 500 meters considered direct access
      trailTypes,
      difficulty: 'beginner', // Default difficulty
      distanceToTrailhead
    };
  }

  hasTrailType(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  // Parse capacity information
  parseCapacity(text) {
    const capacity = {
      maxOccupancy: null,
      totalSites: null,
      reservationRequired: false
    };

    // Look for site count patterns
    const sitesPattern = /(\d+)\s*(?:full\s*hookup\s*)?(?:camp)?sites?/i;
    const sitesMatch = text.match(sitesPattern);
    if (sitesMatch) {
      capacity.totalSites = parseInt(sitesMatch[1]);
    }

    // Check for reservation requirements
    if (text.toLowerCase().includes('reservation')) {
      capacity.reservationRequired = true;
    }

    return capacity;
  }

  // Get approximate coordinates for a state
  getStateCoordinates(state) {
    return this.stateCoordinates[state] || { latitude: 39.8283, longitude: -98.5795 }; // Center of US
  }

  // Process the extracted PDF text to find campground entries
  extractCampgrounds(text) {
    const lines = text.split('\n').map(line => line.trim());
    let currentState = null;
    let currentCampground = null;
    let campgroundLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and headers
      if (!line || line.includes('RVingwithBikes') || line.includes('Page ') || line.length < 3) {
        continue;
      }
      
      // Check if this is a state header
      if (this.isStateHeader(line)) {
        // Process any pending campground
        if (currentCampground) {
          this.finalizeCampground(currentCampground, campgroundLines, currentState);
          campgroundLines = [];
        }
        
        currentState = this.normalizeStateName(line);
        currentCampground = null;
        continue;
      }
      
      // Check if this is a campground line
      const campgroundInfo = this.parseCampgroundLine(line);
      if (campgroundInfo) {
        // Process any pending campground
        if (currentCampground) {
          this.finalizeCampground(currentCampground, campgroundLines, currentState);
        }
        
        // Start new campground
        currentCampground = campgroundInfo;
        campgroundLines = [line];
        continue;
      }
      
      // If we're in a campground, collect related lines
      if (currentCampground) {
        campgroundLines.push(line);
        
        // Check if this line indicates the end of this campground entry
        if (this.isEndOfEntry(line, i, lines)) {
          this.finalizeCampground(currentCampground, campgroundLines, currentState);
          currentCampground = null;
          campgroundLines = [];
        }
      }
    }
    
    // Process final campground if any
    if (currentCampground) {
      this.finalizeCampground(currentCampground, campgroundLines, currentState);
    }
    
    return this.extractedCampgrounds;
  }

  isStateHeader(line) {
    // Check if line is a state name
    const stateNames = Object.values(this.stateMapping);
    return stateNames.some(state => line.toLowerCase() === state.toLowerCase()) ||
           Object.keys(this.stateMapping).some(abbr => line.toUpperCase() === abbr);
  }

  normalizeStateName(line) {
    const stateNames = Object.values(this.stateMapping);
    const foundState = stateNames.find(state => line.toLowerCase() === state.toLowerCase());
    if (foundState) return foundState;
    
    const stateAbbr = Object.keys(this.stateMapping).find(abbr => line.toUpperCase() === abbr);
    if (stateAbbr) return this.stateMapping[stateAbbr];
    
    return line;
  }

  isEndOfEntry(line, index, lines) {
    // Check if the next line starts a new campground or is a location line
    if (index + 1 < lines.length) {
      const nextLine = lines[index + 1];
      return this.parseCampgroundLine(nextLine) !== null || 
             this.parseLocationLine(nextLine) !== null ||
             this.isStateHeader(nextLine);
    }
    return false;
  }

  finalizeCampground(campgroundInfo, lines, state) {
    if (!campgroundInfo || !state) return;
    
    const fullText = lines.join(' ');
    const trailLines = lines.filter(line => this.parseTrailLine(line));
    const trailDescription = trailLines.map(line => this.parseTrailLine(line)).join(' ');
    
    // Look for city/state in the lines
    let city = 'Unknown';
    let finalState = state;
    
    for (const line of lines) {
      const locationInfo = this.parseLocationLine(line);
      if (locationInfo) {
        city = locationInfo.city;
        finalState = locationInfo.state;
        break;
      }
    }
    
    // Get coordinates for the state (approximate)
    const coordinates = this.getStateCoordinates(finalState);
    
    const campground = {
      id: this.generateId(),
      name: campgroundInfo.name,
      description: trailDescription || `${campgroundInfo.type} in ${city}, ${finalState}`,
      location: {
        latitude: coordinates.latitude + (Math.random() - 0.5) * 0.1, // Add small random offset
        longitude: coordinates.longitude + (Math.random() - 0.5) * 0.1,
        address: `${city}, ${finalState}`,
        city: city,
        state: finalState,
        zipCode: null
      },
      contact: {
        phone: null,
        email: null,
        website: null
      },
      amenities: this.parseAmenities(fullText),
      trailAccess: this.parseTrailAccess(trailDescription),
      pricing: {
        basePrice: null,
        currency: 'USD',
        priceType: 'per_night'
      },
      capacity: this.parseCapacity(fullText),
      images: [],
      lastUpdated: new Date().toISOString()
    };
    
    this.extractedCampgrounds.push(campground);
  }

  async extractFromPDF(pdfPath) {
    try {
      console.log('Reading PDF file...');
      const dataBuffer = fs.readFileSync(pdfPath);
      
      console.log('Parsing PDF content...');
      const data = await pdf(dataBuffer);
      
      console.log(`Extracted ${data.text.length} characters from PDF`);
      
      const campgrounds = this.extractCampgrounds(data.text);
      
      console.log(`Successfully extracted ${campgrounds.length} campgrounds`);
      return campgrounds;
      
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      throw error;
    }
  }

  // Save extracted data to JSON file
  saveToFile(filename = 'extracted_campgrounds_v2.json') {
    const outputPath = path.join(__dirname, filename);
    fs.writeFileSync(outputPath, JSON.stringify(this.extractedCampgrounds, null, 2));
    console.log(`Saved ${this.extractedCampgrounds.length} campgrounds to ${outputPath}`);
    return outputPath;
  }
}

// Main execution
async function main() {
  const extractor = new CampgroundExtractorV2();
  const pdfPath = path.join(__dirname, '..', 'eBook for reference', 'RVingwithBikes4142025.pdf');
  
  try {
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at ${pdfPath}`);
    }
    
    console.log('Starting campground data extraction (V2)...');
    console.log(`PDF file: ${pdfPath}`);
    
    const campgrounds = await extractor.extractFromPDF(pdfPath);
    
    if (campgrounds.length > 0) {
      const outputFile = extractor.saveToFile();
      console.log('\n=== Extraction Summary ===');
      console.log(`Total campgrounds extracted: ${campgrounds.length}`);
      console.log(`Output file: ${outputFile}`);
      console.log('\nFirst 3 campgrounds:');
      campgrounds.slice(0, 3).forEach((camp, i) => {
        console.log(`\n${i + 1}. ${camp.name}`);
        console.log(`   Location: ${camp.location.city}, ${camp.location.state}`);
        console.log(`   Trail Access: ${camp.trailAccess.hasDirectAccess ? 'Direct' : 'Nearby'}`);
        console.log(`   Trail Types: ${camp.trailAccess.trailTypes.join(', ')}`);
      });
    } else {
      console.log('No campgrounds were extracted. Please check the extraction logic.');
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

module.exports = { CampgroundExtractorV2 }; 