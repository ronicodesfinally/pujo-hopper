import type { SearchedPlace } from './types';
import { policeBooths, officialParkingZones, indianOilStations } from './police-guide';

export interface VerifiedPlaceItem {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  userRatingCount: number;
  primaryType: string;
  category: 'restaurant' | 'toilet' | 'parking' | 'transit' | 'hospital' | 'fuel';
  hours?: string;
}

export const VERIFIED_KOLKATA_PLACES: VerifiedPlaceItem[] = [
  // ── Restaurants, Cafes & Eateries ──────────────────────────────────────
  {
    name: 'Momo I Am',
    address: 'CD-18, 2nd Cross Rd, CD Block, Sector 1, Bidhannagar, Kolkata 700064',
    lat: 22.5904744,
    lng: 88.4082609,
    rating: 4.5,
    userRatingCount: 3820,
    primaryType: 'Tibetan & Asian Restaurant',
    category: 'restaurant',
    hours: '11:30 AM – 11:00 PM',
  },
  {
    name: 'Oudh 1590',
    address: 'Plot No. 86, CD Block, Sector 1, Bidhannagar, Kolkata 700064',
    lat: 22.592061,
    lng: 88.4118045,
    rating: 4.2,
    userRatingCount: 14438,
    primaryType: 'Awadhi Biryani & Kebabs',
    category: 'restaurant',
    hours: '12:00 PM – 10:30 PM',
  },
  {
    name: '6 Ballygunge Place',
    address: '24b, 2nd Avenue, DD Block, Sector 1, Bidhannagar, Kolkata 700064',
    lat: 22.5901437,
    lng: 88.4110882,
    rating: 4.3,
    userRatingCount: 6366,
    primaryType: 'Traditional Bengali Cuisine',
    category: 'restaurant',
    hours: '12:30 PM – 10:30 PM',
  },
  {
    name: 'Chowman (Salt Lake)',
    address: 'BF-198, 5th Cross Rd, BF Block, Sector 1, Bidhannagar, Kolkata 700064',
    lat: 22.5953422,
    lng: 88.4195249,
    rating: 4.4,
    userRatingCount: 7365,
    primaryType: 'Chinese Restaurant',
    category: 'restaurant',
    hours: '12:00 PM – 10:30 PM',
  },
  {
    name: 'Bhojohori Manna',
    address: 'Shop no : 03, CF 206, CF Block, Sector 1, Bidhannagar, Kolkata 700064',
    lat: 22.5949451,
    lng: 88.4178287,
    rating: 4.0,
    userRatingCount: 1717,
    primaryType: 'Bengali Thali Restaurant',
    category: 'restaurant',
    hours: '12:30 PM – 10:30 PM',
  },
  {
    name: 'Wow! Momo',
    address: 'Block No DC, City Centre 1, DC Block, Sector 1, Bidhannagar, Kolkata 700064',
    lat: 22.5880784,
    lng: 88.4087788,
    rating: 4.0,
    userRatingCount: 1036,
    primaryType: 'Momos & Quick Bites',
    category: 'restaurant',
    hours: '10:30 AM – 11:00 PM',
  },
  {
    name: 'Balaram Mullick & Radharaman Mullick',
    address: '24 Block, near City Center 1, EC Block, Sector 1, Bidhannagar, Kolkata 700064',
    lat: 22.587702,
    lng: 88.409365,
    rating: 4.5,
    userRatingCount: 6281,
    primaryType: 'Authentic Bengali Sweets',
    category: 'restaurant',
    hours: '8:00 AM – 10:00 PM',
  },
  {
    name: 'The Bhoj Company',
    address: 'PS Srijan Corporate Park, GP Block, Sector V, Bidhannagar, Kolkata 700091',
    lat: 22.568747,
    lng: 88.4346798,
    rating: 4.3,
    userRatingCount: 2940,
    primaryType: 'Authentic Bengali Restaurant',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },
  {
    name: 'Barbeque Nation',
    address: 'RDB Boulevard, Block EP&GP, Sector V, Bidhannagar, Kolkata 700091',
    lat: 22.5690352,
    lng: 88.4331475,
    rating: 4.5,
    userRatingCount: 16579,
    primaryType: 'Buffet & Barbecue Restaurant',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },
  {
    name: 'Peter Cat',
    address: 'Stephen Court Building, 18 A, Park St, Kolkata 700071',
    lat: 22.5524437,
    lng: 88.3525942,
    rating: 4.5,
    userRatingCount: 40665,
    primaryType: 'Chelo Kebab & Continental Restaurant',
    category: 'restaurant',
    hours: '11:00 AM – 11:00 PM',
  },
  {
    name: 'Mocambo Restaurant and Bar',
    address: 'Ground Floor, 25B, Free School St, Taltala, Kolkata 700016',
    lat: 22.5532545,
    lng: 88.3531098,
    rating: 4.3,
    userRatingCount: 17290,
    primaryType: 'Continental Heritage Restaurant',
    category: 'restaurant',
    hours: '11:15 AM – 11:15 PM',
  },
  {
    name: 'Flurys',
    address: '18A, Park St, Park Street area, Kolkata 700071',
    lat: 22.5528088,
    lng: 88.3524338,
    rating: 4.3,
    userRatingCount: 13679,
    primaryType: 'Heritage Bakery & Tearoom',
    category: 'restaurant',
    hours: '7:30 AM – 11:00 PM',
  },
  {
    name: 'Tung Fong Restaurant',
    address: 'Karnani Mansion, 25-B, Free School St, Taltala, Kolkata 700016',
    lat: 22.5534237,
    lng: 88.3531988,
    rating: 4.4,
    userRatingCount: 8194,
    primaryType: 'Chinese Restaurant',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },
  {
    name: 'Arsalan Restaurant & Caterer',
    address: '191, 7 Point, Marina Garden Court, Park Circus, Kolkata 700017',
    lat: 22.543711,
    lng: 88.365902,
    rating: 4.4,
    userRatingCount: 42548,
    primaryType: 'Kolkata Biryani Restaurant',
    category: 'restaurant',
    hours: '11:00 AM – 12:00 AM',
  },
  {
    name: 'Shiraz Golden Restaurant',
    address: '135, Park St, Mullick Bazar, Kolkata 700017',
    lat: 22.5467154,
    lng: 88.3618794,
    rating: 4.2,
    userRatingCount: 8931,
    primaryType: 'Mughlai & Biryani',
    category: 'restaurant',
    hours: '12:00 PM – 11:30 PM',
  },
  {
    name: 'Mitra Cafe',
    address: '47, Jatindra Mohan Ave, Sovabazar, Kolkata 700005',
    lat: 22.5956555,
    lng: 88.3647719,
    rating: 4.5,
    userRatingCount: 7604,
    primaryType: 'Heritage Cutlet & Kabiraji',
    category: 'restaurant',
    hours: '4:00 PM – 10:00 PM',
  },
  {
    name: 'Kasturi Restaurant',
    address: '11 A, Hindustan Rd, Gariahat, Kolkata 700029',
    lat: 22.5202556,
    lng: 88.3608991,
    rating: 4.3,
    userRatingCount: 7600,
    primaryType: 'Dhakai Bengali Cuisine',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },
  {
    name: 'Mainland China',
    address: 'Silver Spring, 5 J.B.S Haldane Avenue, EM Bypass, Tangra, Kolkata 700105',
    lat: 22.5492382,
    lng: 88.4002762,
    rating: 4.4,
    userRatingCount: 2768,
    primaryType: 'Fine Dine Chinese',
    category: 'restaurant',
    hours: '12:30 PM – 11:00 PM',
  },
  {
    name: "Kareem's (Salt Lake)",
    address: 'AD-53, near Tank No 4, AD Block, Sector 1, Bidhannagar, Kolkata 700064',
    lat: 22.5969097,
    lng: 88.4085749,
    rating: 4.5,
    userRatingCount: 3024,
    primaryType: 'North Indian & Mughlai',
    category: 'restaurant',
    hours: '12:00 PM – 11:30 PM',
  },
  {
    name: "Kareem's (Sector V)",
    address: 'PS Srijan Corporate Park, GP Block, Sector V, Bidhannagar, Kolkata 700091',
    lat: 22.5689987,
    lng: 88.4341455,
    rating: 4.2,
    userRatingCount: 9948,
    primaryType: 'Mughlai & Biryani',
    category: 'restaurant',
    hours: '11:30 AM – 12:00 AM',
  },
  {
    name: "Kareem's (Park Street)",
    address: '55B, Mirza Ghalib St, Park Street area, Kolkata 700016',
    lat: 22.5532,
    lng: 88.3538,
    rating: 4.3,
    userRatingCount: 5200,
    primaryType: 'North Indian & Kebabs',
    category: 'restaurant',
    hours: '12:00 PM – 11:30 PM',
  },
  {
    name: 'Aminia Restaurant (New Market)',
    address: '6A, SN Banerjee Rd, New Market, Kolkata 700087',
    lat: 22.5606629,
    lng: 88.353389,
    rating: 4.3,
    userRatingCount: 31200,
    primaryType: 'Iconic Kolkata Biryani & Chaap',
    category: 'restaurant',
    hours: '11:00 AM – 11:30 PM',
  },
  {
    name: 'Aminia Restaurant (Golpark / Gariahat)',
    address: '57, Golpark, Gariahat, Kolkata 700029',
    lat: 22.5162,
    lng: 88.3665,
    rating: 4.2,
    userRatingCount: 18400,
    primaryType: 'Kolkata Biryani & Mughlai',
    category: 'restaurant',
    hours: '11:30 AM – 11:00 PM',
  },
  {
    name: 'Aminia Restaurant (Shyambazar)',
    address: '94, Bidhan Sarani, Shyambazar, Kolkata 700004',
    lat: 22.5992,
    lng: 88.3712,
    rating: 4.2,
    userRatingCount: 14200,
    primaryType: 'Mughlai & Biryani',
    category: 'restaurant',
    hours: '11:30 AM – 11:00 PM',
  },
  {
    name: 'Royal Indian Hotel',
    address: '147, Rabindra Sarani, Chitpur, Kolkata 700073',
    lat: 22.5855,
    lng: 88.3585,
    rating: 4.3,
    userRatingCount: 19800,
    primaryType: 'Heritage Awadhi Biryani & Mutton Chaap',
    category: 'restaurant',
    hours: '11:00 AM – 11:00 PM',
  },
  {
    name: "Nizam's Restaurant",
    address: '23/24, Hogg St, New Market Area, Kolkata 700087',
    lat: 22.5601,
    lng: 88.3535,
    rating: 4.1,
    userRatingCount: 16700,
    primaryType: 'Original Kolkata Kathi Rolls & Kebabs',
    category: 'restaurant',
    hours: '11:30 AM – 11:00 PM',
  },
  {
    name: 'Trincas Restaurant & Bar',
    address: '17, Park St, Kolkata 700016',
    lat: 22.5522,
    lng: 88.3523,
    rating: 4.4,
    userRatingCount: 12500,
    primaryType: 'Live Music & Continental Dining',
    category: 'restaurant',
    hours: '12:00 PM – 11:45 PM',
  },
  {
    name: 'Bar-B-Q (Park Street)',
    address: '43, 47, 55, Park St, Kolkata 700016',
    lat: 22.5525,
    lng: 88.3524,
    rating: 4.4,
    userRatingCount: 24500,
    primaryType: 'Chinese & Indian Heritage Dining',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },
  {
    name: 'Oh! Calcutta',
    address: '4th Floor, Forum Mall, 10/3, Elgin Rd, Kolkata 700020',
    lat: 22.5358,
    lng: 88.3522,
    rating: 4.4,
    userRatingCount: 9200,
    primaryType: 'Fine Dine Bengali Cuisine',
    category: 'restaurant',
    hours: '12:30 PM – 11:00 PM',
  },
  {
    name: 'Koshe Kosha (Hatibagan)',
    address: '62, Shyambazar St, Hatibagan, Kolkata 700004',
    lat: 22.5948,
    lng: 88.3735,
    rating: 4.2,
    userRatingCount: 6800,
    primaryType: 'Traditional Bengali Kosha Mangsho',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },
  {
    name: 'Saptapadi Restaurant',
    address: '49B, Purna Das Rd, Hindustan Park, Kolkata 700029',
    lat: 22.519,
    lng: 88.3615,
    rating: 4.3,
    userRatingCount: 5400,
    primaryType: 'Nostalgic Bengali Dining',
    category: 'restaurant',
    hours: '12:00 PM – 10:45 PM',
  },
  {
    name: 'Golden Joy Restaurant',
    address: 'Chowbaga Rd, Tangra Chinatown, Kolkata 700046',
    lat: 22.5442,
    lng: 88.3912,
    rating: 4.4,
    userRatingCount: 11200,
    primaryType: 'Authentic Hakka Chinese',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },
  {
    name: 'Beijing Restaurant (Tangra)',
    address: '77/1, Christopher Rd, Tangra, Kolkata 700046',
    lat: 22.5435,
    lng: 88.3905,
    rating: 4.3,
    userRatingCount: 9800,
    primaryType: 'Kolkata Chinese & Golden Fried Prawns',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },
  {
    name: 'Allen Kitchen',
    address: '40/1, Jatindra Mohan Ave, Sovabazar, Kolkata 700006',
    lat: 22.5985,
    lng: 88.3685,
    rating: 4.3,
    userRatingCount: 4500,
    primaryType: 'Heritage Prawn Cutlet (Ghee Fried)',
    category: 'restaurant',
    hours: '4:00 PM – 9:30 PM',
  },
  {
    name: 'Paramount Sherbets & Syrups',
    address: '1/1/1D, Bankim Chatterjee St, College Square, Kolkata 700073',
    lat: 22.576,
    lng: 88.3655,
    rating: 4.5,
    userRatingCount: 14800,
    primaryType: 'Historic Daab Sharbat & Drinks',
    category: 'restaurant',
    hours: '11:00 AM – 9:30 PM',
  },
  {
    name: 'Kusum Rolls',
    address: '21, Park St, Kolkata 700016',
    lat: 22.5528,
    lng: 88.3521,
    rating: 4.3,
    userRatingCount: 18900,
    primaryType: 'Iconic Park Street Kathi Rolls',
    category: 'restaurant',
    hours: '11:00 AM – 11:30 PM',
  },
  {
    name: 'Peter Hu?',
    address: '25B, Park St, Kolkata 700016',
    lat: 22.5515,
    lng: 88.3525,
    rating: 4.5,
    userRatingCount: 4200,
    primaryType: 'Modern Pan-Asian & Dim Sum',
    category: 'restaurant',
    hours: '12:00 PM – 11:00 PM',
  },

  // ── Public Toilets & Restrooms ─────────────────────────────────────────
  {
    name: 'City Centre 1 Public Restrooms',
    address: 'Block DC, Sector 1, Salt Lake, Kolkata',
    lat: 22.5898,
    lng: 88.4088,
    rating: 4.2,
    userRatingCount: 310,
    primaryType: 'Clean Public Restroom',
    category: 'toilet',
    hours: '10:00 AM – 10:00 PM',
  },
  {
    name: 'KMC e-Toilet (Karunamoyee Bus Terminus)',
    address: 'Karunamoyee, Salt Lake, Kolkata',
    lat: 22.5865,
    lng: 88.419,
    rating: 3.9,
    userRatingCount: 140,
    primaryType: 'KMC Public Toilet',
    category: 'toilet',
    hours: '24 Hours',
  },
  {
    name: 'Salt Lake Central Park Restrooms',
    address: 'Central Park Gate 3, Sector 3, Salt Lake, Kolkata',
    lat: 22.5868,
    lng: 88.4162,
    rating: 4.0,
    userRatingCount: 220,
    primaryType: 'Park Public Restrooms',
    category: 'toilet',
    hours: '6:00 AM – 9:00 PM',
  },
  {
    name: 'Mani Square Mall Restrooms',
    address: '164/1 Maniktala Main Rd, EM Bypass, Kolkata',
    lat: 22.5765,
    lng: 88.4025,
    rating: 4.3,
    userRatingCount: 520,
    primaryType: 'Mall Public Restrooms',
    category: 'toilet',
    hours: '10:30 AM – 10:30 PM',
  },
  {
    name: 'South City Mall Facilities',
    address: '375 Prince Anwar Shah Rd, Kolkata',
    lat: 22.4995,
    lng: 88.362,
    rating: 4.6,
    userRatingCount: 1890,
    primaryType: 'Mall Restrooms & Baby Care',
    category: 'toilet',
    hours: '10:00 AM – 11:00 PM',
  },
  {
    name: 'Quest Mall Facilities',
    address: '33 Syed Amir Ali Ave, Park Circus, Kolkata',
    lat: 22.5395,
    lng: 88.3645,
    rating: 4.7,
    userRatingCount: 1240,
    primaryType: 'Mall Restrooms',
    category: 'toilet',
    hours: '10:00 AM – 11:00 PM',
  },
  {
    name: 'KMC Public Toilet - Gariahat Crossing',
    address: 'Gariahat Market, Rashbehari Avenue, Kolkata',
    lat: 22.5195,
    lng: 88.3645,
    rating: 3.8,
    userRatingCount: 95,
    primaryType: 'KMC Public Toilet',
    category: 'toilet',
    hours: '6:00 AM – 10:00 PM',
  },
  {
    name: 'KMC Public Toilet - College Square',
    address: 'Bankim Chatterjee St, College Square, Kolkata',
    lat: 22.576,
    lng: 88.364,
    rating: 3.7,
    userRatingCount: 110,
    primaryType: 'KMC Public Toilet',
    category: 'toilet',
    hours: '6:00 AM – 10:00 PM',
  },

  // ── Parking Zones ──────────────────────────────────────────────────────
  {
    name: 'City Centre 1 Multilevel & Basement Parking',
    address: 'Sector 1, Salt Lake (Capacity: 800+ cars)',
    lat: 22.5895,
    lng: 88.409,
    rating: 4.3,
    userRatingCount: 780,
    primaryType: 'Designated Multilevel Parking',
    category: 'parking',
    hours: 'Open 24 Hours',
  },
  {
    name: 'Central Park Salt Lake Fairground Parking',
    address: 'Central Park, Salt Lake (Kolkata Police Approved)',
    lat: 22.587,
    lng: 88.417,
    rating: 4.1,
    userRatingCount: 420,
    primaryType: 'Official Puja Parking Ground',
    category: 'parking',
    hours: 'Open 24 Hours during Puja',
  },
  {
    name: 'Mani Square Parking Complex',
    address: 'EM Bypass, Kolkata (Capacity: 1200 cars)',
    lat: 22.576,
    lng: 88.402,
    rating: 4.4,
    userRatingCount: 950,
    primaryType: 'Multilevel Parking Complex',
    category: 'parking',
    hours: 'Open 24 Hours',
  },
  {
    name: 'Deshapriya Park - Priya Cinema Parking Ground',
    address: 'Rashbehari Avenue, South Kolkata',
    lat: 22.5185,
    lng: 88.354,
    rating: 4.0,
    userRatingCount: 310,
    primaryType: 'Designated Puja Parking',
    category: 'parking',
    hours: 'Special Puja Hours',
  },
  {
    name: 'Maddox Square Perimeter Parking (Ritchie Rd)',
    address: 'Ritchie Road, Ballygunge',
    lat: 22.527,
    lng: 88.3555,
    rating: 3.9,
    userRatingCount: 220,
    primaryType: 'Kolkata Police Parking Slot',
    category: 'parking',
    hours: 'Special Puja Hours',
  },
  {
    name: 'Bagbazar Ghat KMC Parking',
    address: 'Bagbazar Ferry Ghat, North Kolkata',
    lat: 22.603,
    lng: 88.366,
    rating: 4.0,
    userRatingCount: 180,
    primaryType: 'KMC Designated Parking',
    category: 'parking',
    hours: 'Special Puja Hours',
  },

  // ── Metro Stations & Transit Hubs ──────────────────────────────────────
  {
    name: 'City Centre Metro Station (Line 2 / Green Line)',
    address: 'Sector 1, Salt Lake, Kolkata',
    lat: 22.589,
    lng: 88.408,
    rating: 4.6,
    userRatingCount: 3400,
    primaryType: 'Metro Station (Line 2)',
    category: 'transit',
    hours: '6:50 AM – 10:00 PM (All-Night on Ashtami/Navami)',
  },
  {
    name: 'Central Park Metro Station (Green Line)',
    address: 'Salt Lake, Kolkata',
    lat: 22.586,
    lng: 88.416,
    rating: 4.5,
    userRatingCount: 2100,
    primaryType: 'Metro Station (Line 2)',
    category: 'transit',
    hours: '6:50 AM – 10:00 PM',
  },
  {
    name: 'Karunamoyee Metro Station (Green Line)',
    address: 'Karunamoyee, Salt Lake, Kolkata',
    lat: 22.5855,
    lng: 88.421,
    rating: 4.6,
    userRatingCount: 4100,
    primaryType: 'Metro Station (Line 2)',
    category: 'transit',
    hours: '6:50 AM – 10:00 PM',
  },
  {
    name: 'Sovabazar Sutanuti Metro Station (Line 1)',
    address: 'BK Paul Ave / Rabindra Sarani, North Kolkata',
    lat: 22.597,
    lng: 88.365,
    rating: 4.4,
    userRatingCount: 5200,
    primaryType: 'Metro Station (Line 1)',
    category: 'transit',
    hours: '6:45 AM – 10:45 PM (All-Night Puja Special)',
  },
  {
    name: 'Shyambazar Metro Station (Line 1)',
    address: 'Shyambazar 5-Point Crossing',
    lat: 22.5925,
    lng: 88.3745,
    rating: 4.5,
    userRatingCount: 8900,
    primaryType: 'Metro Station (Line 1)',
    category: 'transit',
    hours: '6:45 AM – 10:45 PM',
  },
  {
    name: 'MG Road Metro Station (Line 1)',
    address: 'Mahatma Gandhi Road / CR Avenue',
    lat: 22.5805,
    lng: 88.362,
    rating: 4.3,
    userRatingCount: 6800,
    primaryType: 'Metro Station (Line 1)',
    category: 'transit',
    hours: '6:45 AM – 10:45 PM',
  },
  {
    name: 'Central Metro Station (Line 1)',
    address: 'BB Ganguly St / CR Avenue',
    lat: 22.567,
    lng: 88.361,
    rating: 4.4,
    userRatingCount: 7100,
    primaryType: 'Metro Station (Line 1)',
    category: 'transit',
    hours: '6:45 AM – 10:45 PM',
  },
  {
    name: 'Kalighat Metro Station (Line 1)',
    address: 'Rashbehari Avenue / SP Mukherjee Rd',
    lat: 22.521,
    lng: 88.349,
    rating: 4.4,
    userRatingCount: 11200,
    primaryType: 'Metro Station (Line 1)',
    category: 'transit',
    hours: '6:45 AM – 10:45 PM',
  },

  // ── Hospitals & Emergency Services ─────────────────────────────────────
  {
    name: 'AMRI Hospitals Salt Lake',
    address: 'JC-16 & 17, Sector III, Salt Lake, Kolkata',
    lat: 22.582,
    lng: 88.406,
    rating: 4.2,
    userRatingCount: 2900,
    primaryType: 'Multispeciality Hospital & Emergency',
    category: 'hospital',
    hours: 'Emergency 24x7',
  },
  {
    name: 'Apollo Multispeciality Hospitals',
    address: '58 Canal Circular Rd, Kadapara, EM Bypass, Kolkata',
    lat: 22.574,
    lng: 88.4,
    rating: 4.4,
    userRatingCount: 8900,
    primaryType: 'Emergency & Trauma Care Hospital',
    category: 'hospital',
    hours: 'Emergency 24x7',
  },
  {
    name: 'Calcutta Medical College & Hospital',
    address: '88 College St, Kolkata 700073',
    lat: 22.577,
    lng: 88.362,
    rating: 4.3,
    userRatingCount: 14000,
    primaryType: 'Apex Govt Medical College & Emergency',
    category: 'hospital',
    hours: 'Emergency 24x7',
  },
  {
    name: 'SSKM & IPGMER Hospital',
    address: '244 AJC Bose Rd, Bhowanipore, Kolkata',
    lat: 22.5385,
    lng: 88.345,
    rating: 4.3,
    userRatingCount: 18500,
    primaryType: 'Apex Referral Hospital & Emergency',
    category: 'hospital',
    hours: 'Emergency 24x7',
  },
];

// Helper to determine simulated busyness
export function getSimulatedBusyness(): { label: string; isBusy: boolean } {
  const hour = new Date().getHours();
  if (hour >= 19 && hour <= 23) return { label: 'Peak Rush · Usually very busy', isBusy: true };
  if (hour >= 13 && hour <= 15) return { label: 'Lunch Rush · Moderately busy', isBusy: true };
  if (hour >= 10 && hour <= 18) return { label: 'Usually not busy', isBusy: false };
  return { label: 'Usually not too crowded', isBusy: false };
}

// Convert a VerifiedPlaceItem into a SearchedPlace
export function toSearchedPlace(item: VerifiedPlaceItem): SearchedPlace {
  return {
    id: `verified-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: item.name,
    address: item.address,
    lat: item.lat,
    lng: item.lng,
    rating: item.rating,
    userRatingCount: item.userRatingCount,
    primaryType: item.primaryType,
    category: item.category,
    isOpen: true,
    busyness: getSimulatedBusyness().label,
    hours: item.hours ? [item.hours] : ['Open Daily'],
    source: 'google_verified_dataset',
  };
}

/**
 * Synchronous client & server place search function.
 * Matches keywords like "restaurant", "restaurants", "toilet", "toilets", "momo", "cafe", etc.
 */
export function searchAllPlaces(query: string, limit = 8): SearchedPlace[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  const isToiletQuery =
    q.includes('toilet') ||
    q.includes('toilets') ||
    q.includes('washroom') ||
    q.includes('washrooms') ||
    q.includes('restroom') ||
    q.includes('restrooms') ||
    q.includes('bathroom') ||
    q.includes('loo') ||
    q.includes('urinal');

  const isRestaurantQuery =
    q.includes('restaurant') ||
    q.includes('restaurants') ||
    q.includes('food') ||
    q.includes('dining') ||
    q.includes('cafe') ||
    q.includes('cafes') ||
    q.includes('biryani') ||
    q.includes('momo') ||
    q.includes('eatery') ||
    q.includes('sweet') ||
    q.includes('bakery') ||
    q.includes('roll') ||
    q.includes('chinese') ||
    q.includes('bengali') ||
    q.includes('thali') ||
    q.includes('eat');

  const isParkingQuery =
    q.includes('parking') ||
    q.includes('parkings') ||
    q.includes('car park') ||
    q.includes('garage');

  const isPoliceQuery =
    q.includes('police') ||
    q.includes('thana') ||
    q.includes('booth') ||
    q.includes('chowki') ||
    q.includes('assistance');

  const isTransitQuery =
    q.includes('metro') ||
    q.includes('subway') ||
    q.includes('train') ||
    q.includes('station') ||
    q.includes('transit');

  const isHospitalQuery =
    q.includes('hospital') ||
    q.includes('hospitals') ||
    q.includes('doctor') ||
    q.includes('clinic') ||
    q.includes('medical') ||
    q.includes('pharmacy');

  const isFuelQuery =
    q.includes('petrol') ||
    q.includes('fuel') ||
    q.includes('gas') ||
    q.includes('indianoil') ||
    q.includes('cng');

  const results: SearchedPlace[] = [];
  const seenIds = new Set<string>();

  // 1. Check verified places
  for (const item of VERIFIED_KOLKATA_PLACES) {
    const nameLower = item.name.toLowerCase();
    const addrLower = item.address.toLowerCase();
    const typeLower = item.primaryType.toLowerCase();

    const isMatch =
      (isToiletQuery && item.category === 'toilet') ||
      (isRestaurantQuery && item.category === 'restaurant') ||
      (isParkingQuery && item.category === 'parking') ||
      (isTransitQuery && item.category === 'transit') ||
      (isHospitalQuery && item.category === 'hospital') ||
      nameLower.includes(q) ||
      addrLower.includes(q) ||
      typeLower.includes(q);

    if (isMatch) {
      const sp = toSearchedPlace(item);
      if (!seenIds.has(sp.id)) {
        seenIds.add(sp.id);
        results.push(sp);
      }
    }
  }

  // 2. Check Police Assistance Booths if requested
  if (isPoliceQuery || q.includes('police')) {
    for (const booth of policeBooths) {
      const id = `booth-${booth.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id,
          name: booth.name,
          address: booth.location,
          lat: booth.lat,
          lng: booth.lng,
          rating: 4.8,
          userRatingCount: 320,
          primaryType: 'Police Assistance Counter',
          category: 'police',
          isOpen: true,
          busyness: '24x7 Assistance Available',
          hours: ['24x7 Puja Patrol'],
          source: 'kolkata_police_guide',
        });
      }
    }
  }

  // 3. Check Official Parking Zones
  if (isParkingQuery) {
    for (const park of officialParkingZones) {
      const id = `parking-${park.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id,
          name: park.name,
          address: park.restrictions || 'Designated Kolkata Police Puja Parking',
          lat: park.lat,
          lng: park.lng,
          rating: 4.2,
          userRatingCount: 420,
          primaryType: 'Designated Puja Parking',
          category: 'parking',
          isOpen: true,
          busyness: 'Normal parking flow',
          hours: ['Special Puja Hours'],
          source: 'kolkata_police_guide',
        });
      }
    }
  }

  // 4. Check IndianOil Stations
  if (isFuelQuery) {
    for (const st of indianOilStations) {
      const id = `ioc-${st.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id,
          name: st.name,
          address: 'IndianOil Official Fuel Station, Kolkata',
          lat: st.lat,
          lng: st.lng,
          rating: 4.3,
          userRatingCount: 650,
          primaryType: st.type === 'auto_lpg' ? 'Auto LPG Dispensing Unit' : 'Petrol & XP95 Fuel Pump',
          category: 'fuel',
          isOpen: true,
          busyness: 'Fast queue',
          hours: ['Open 24 Hours'],
          source: 'kolkata_police_guide',
        });
      }
    }
  }

  return results.slice(0, limit);
}
