import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Popular brands that should appear first
const popularBrands = [
  'CATERPILLAR',
  'KOMATSU',
  'VOLVO',
  'JOHN DEERE',
  'HITACHI',
  'LIEBHERR',
  'JCB',
  'BOBCAT',
  'CASE',
  'KUBOTA',
  'HYUNDAI',
  'DOOSAN',
];

// Comprehensive brand list from machinerytrader.com
const allBrands = [
  // Popular brands
  'CATERPILLAR',
  'KOMATSU',
  'VOLVO',
  'JOHN DEERE',
  'HITACHI',
  'LIEBHERR',
  'JCB',
  'BOBCAT',
  'CASE',
  'KUBOTA',
  'HYUNDAI',
  'DOOSAN',
  // A
  'AICHI', 'AIRMAN', 'AKERMAN', 'ALAMO', 'ALLIS CHALMERS', 'ALLMAND', 'ALTEC', 'AMMANN',
  'ASTRA', 'ATLAS', 'ATLAS COPCO', 'AUSTIN WESTERN',
  // B
  'BADGER', 'BARKO', 'BEELINE', 'BELL', 'BENDI', 'BENFORD', 'BERJAC', 'BESSER',
  'BLAW-KNOX', 'BLOUNT', 'BOMAG', 'BOXER', 'BROCE', 'BRODERSON', 'BUCYRUS ERIE',
  'BUSH HOG', 'BUTLER',
  // C
  'CARELIFT', 'CARLSON', 'CEDAR RAPIDS', 'CEMCO', 'CHAMPION', 'CLARK', 'CMI',
  'COLMAR', 'COMBILIFT', 'CONTREE', 'CROWN', 'CRUSADER',
  // D
  'DAIHATSU', 'DITCH WITCH', 'DRESSER', 'DRESSTA', 'DROTT', 'DYNAPAC',
  // E
  'EAGLE', 'EARTHFORCE', 'EL JAY', 'ELGIN', 'ETNYRE', 'EUCLID', 'EXTEC',
  // F
  'FABTEK', 'FAIRCHILD', 'FALCON', 'FIAT', 'FIAT ALLIS', 'FIAT KOBELCO',
  'FIATALLIS', 'FORD', 'FRUEHAUF', 'FURUKAWA',
  // G
  'GALION', 'GEHL', 'GENIE', 'GERLINGER', 'GRADALL', 'GROVE', 'GUZZLER',
  // H
  'HAMM', 'HARLO', 'HARVESTEC', 'HAWKER SIDDELEY', 'HEATHFIELD', 'HERCULES',
  'HIGHLAND', 'HINO', 'HITATCHI', 'HOIST', 'HUBER', 'HUSQVARNA', 'HYDRA',
  // I
  'IHIMER', 'INGERSOLL RAND', 'ISUZU', 'ITC',
  // J
  'JARP', 'JI CASE', 'JLG', 'JOHNSON',
  // K
  'KALMAR', 'KAMATSU', 'KEENAN', 'KENWORTH', 'KEYTOWER', 'KIOTI', 'KOBELCO', 'KOBOTA',
  // L
  'LABOUNTY', 'LANDOLL', 'LAYHER', 'LEE BOY', 'LEROI', 'LIFTALL', 'LIFTKING',
  'LIMA', 'LINK-BELT', 'LITTLE GIANT', 'LORAIN', 'LRT', 'LULL',
  // M
  'MACK', 'MAGNUM', 'MANATOU', 'MANITOU', 'MANITOWOC', 'MARKLIFT', 'MASSEY FERGUSON',
  'MAULDIN', 'MCM', 'MICHIGAN', 'MIDLAND', 'MIDSOUTH', 'MISSION', 'MITSUBISHI',
  'MOROOKA', 'MULTIQUIP',
  // N
  'NAVISTAR', 'NEW HOLLAND', 'NISSAN', 'NORDBERG', 'NORTHWESTERN', 'NPK',
  // O
  'OKADA', 'OSHKOSH', 'OTTAWA', 'OWATONNA',
  // P
  'P&H', 'PALFINGER', 'PARKER', 'PECK', 'PEERLESS', 'PENDARVIS', 'PETERSON',
  'PETTIBONE', 'PIONEER', 'PITMAN', 'POTAIN', 'POWERSCREEN', 'PRIME MOVER',
  'PUTZMEISTER',
  // R
  'RAMCAR', 'RAYMOND', 'REEDRILL', 'REXWORKS', 'RICHIER', 'ROAD MACHINERY',
  'ROADTEC', 'ROSCO', 'ROYAL', 'RUSTON BUCYRUS',
  // S
  'SAKAI', 'SAMSUNG', 'SANY', 'SAVAGE', 'SCHRAMM', 'SELLICK', 'SHUTTLE WAGON',
  'SIMON', 'SKYJACK', 'SNORKEL', 'SOMERO', 'SOUTHWIND', 'SPERRY NEW HOLLAND',
  'STAMFORD', 'STONE', 'SULLIVAN', 'SUMITOMO', 'SUPERIOR', 'SWINGER', 'SYMONS',
  // T
  'TADANO', 'TAKEUCHI', 'TAYLOR', 'TELELECT', 'TELESMITH', 'TEREX', 'TEXOMA',
  'THERN', 'THUNDERBIRD', 'TIGER', 'TIMBCO', 'TIMBERJACK', 'TIGERCAT', 'TORO',
  'TOYOTA', 'TRAIL KING', 'TRAILMOBILE', 'TRAVERSE', 'TRENCOR', 'TUCKER',
  // U
  'ULTRA', 'UNIT', 'UNIVERSAL',
  // V
  'VACON', 'VERMEER', 'VICON', 'VIPER', 'VOGELE',
  // W
  'WABASH', 'WACKER', 'WACKER NEUSON', 'WALDON', 'WALKER', 'WARREN', 'WASHINGTON',
  'WESTERN STAR', 'WHITE', 'WIRTGEN', 'WOODS',
  // X
  'XCMG', 'XGMA', 'XO',
  // Y
  'YALE', 'YANMAR', 'YOKOHAMA',
  // Z
  'ZOOMLION', 'ZWEIWEG',
  // Additional Forklift Brands
  'HYSTER', 'LINDE', 'JUNGHEINRICH', 'STILL', 'TCM', 'HANGCHA', 'HELI', 'BYD', 'EP EQUIPMENT',
];

// Machine categories from machinerytrader.com
const categories = [
  // Main categories
  { name: 'Excavators', nameEn: 'Excavators', nameTr: 'Ekskavatörler', slug: 'excavators', parent: null },
  { name: 'Dozers', nameEn: 'Dozers', nameTr: 'Dozerler', slug: 'dozers', parent: null },
  { name: 'Loaders', nameEn: 'Loaders', nameTr: 'Yükleyiciler', slug: 'loaders', parent: null },
  { name: 'Cranes', nameEn: 'Cranes', nameTr: 'Vinçler', slug: 'cranes', parent: null },
  { name: 'Lifts', nameEn: 'Lifts', nameTr: 'Asansörler', slug: 'lifts', parent: null },
  { name: 'Trucks', nameEn: 'Trucks', nameTr: 'Kamyonlar', slug: 'trucks', parent: null },
  { name: 'Trailers', nameEn: 'Trailers', nameTr: 'Römorklar', slug: 'trailers', parent: null },
  { name: 'Skid Steers', nameEn: 'Skid Steers', nameTr: 'Mini Yükleyiciler', slug: 'skid-steers', parent: null },
  { name: 'Forklifts', nameEn: 'Forklifts', nameTr: 'Forkliftler', slug: 'forklifts', parent: null },
  { name: 'Graders', nameEn: 'Graders', nameTr: 'Greyderler', slug: 'graders', parent: null },
  { name: 'Rollers', nameEn: 'Rollers', nameTr: 'Silindirler', slug: 'rollers', parent: null },
  { name: 'Backhoes', nameEn: 'Backhoes', nameTr: 'Kazıcı Yükleyiciler', slug: 'backhoes', parent: null },
  { name: 'Compactors', nameEn: 'Compactors', nameTr: 'Kompaktörler', slug: 'compactors', parent: null },
  { name: 'Scrapers', nameEn: 'Scrapers', nameTr: 'Kazıyıcılar', slug: 'scrapers', parent: null },
  { name: 'Pavers', nameEn: 'Pavers', nameTr: 'Asfalt Makineleri', slug: 'pavers', parent: null },
  { name: 'Trenchers', nameEn: 'Trenchers', nameTr: 'Hendek Açma Makineleri', slug: 'trenchers', parent: null },
  { name: 'Drills', nameEn: 'Drills', nameTr: 'Delme Makineleri', slug: 'drills', parent: null },
  { name: 'Generators', nameEn: 'Generators', nameTr: 'Jeneratörler', slug: 'generators', parent: null },
  { name: 'Compressors', nameEn: 'Compressors', nameTr: 'Kompresörler', slug: 'compressors', parent: null },
  { name: 'Concrete Equipment', nameEn: 'Concrete Equipment', nameTr: 'Beton Ekipmanları', slug: 'concrete-equipment', parent: null },

  // Excavator subcategories
  { name: 'Crawler Excavators', nameEn: 'Crawler Excavators', nameTr: 'Paletli Ekskavatörler', slug: 'crawler-excavators', parent: 'excavators' },
  { name: 'Wheeled Excavators', nameEn: 'Wheeled Excavators', nameTr: 'Tekerlekli Ekskavatörler', slug: 'wheeled-excavators', parent: 'excavators' },
  { name: 'Mini Excavators', nameEn: 'Mini Excavators', nameTr: 'Mini Ekskavatörler', slug: 'mini-excavators', parent: 'excavators' },
  { name: 'Long Reach Excavators', nameEn: 'Long Reach Excavators', nameTr: 'Uzun Bomlu Ekskavatörler', slug: 'long-reach-excavators', parent: 'excavators' },

  // Loader subcategories
  { name: 'Wheel Loaders', nameEn: 'Wheel Loaders', nameTr: 'Tekerlekli Yükleyiciler', slug: 'wheel-loaders', parent: 'loaders' },
  { name: 'Track Loaders', nameEn: 'Track Loaders', nameTr: 'Paletli Yükleyiciler', slug: 'track-loaders', parent: 'loaders' },
  { name: 'Compact Track Loaders', nameEn: 'Compact Track Loaders', nameTr: 'Kompakt Paletli Yükleyiciler', slug: 'compact-track-loaders', parent: 'loaders' },

  // Crane subcategories
  { name: 'Crawler Cranes', nameEn: 'Crawler Cranes', nameTr: 'Paletli Vinçler', slug: 'crawler-cranes', parent: 'cranes' },
  { name: 'Rough Terrain Cranes', nameEn: 'Rough Terrain Cranes', nameTr: 'Arazi Vinçleri', slug: 'rough-terrain-cranes', parent: 'cranes' },
  { name: 'All Terrain Cranes', nameEn: 'All Terrain Cranes', nameTr: 'Çok Amaçlı Vinçler', slug: 'all-terrain-cranes', parent: 'cranes' },
  { name: 'Truck Cranes', nameEn: 'Truck Cranes', nameTr: 'Kamyon Vinçler', slug: 'truck-cranes', parent: 'cranes' },
  { name: 'Tower Cranes', nameEn: 'Tower Cranes', nameTr: 'Kule Vinçler', slug: 'tower-cranes', parent: 'cranes' },

  // Lift subcategories
  { name: 'Boom Lifts', nameEn: 'Boom Lifts', nameTr: 'Bomlu Platformlar', slug: 'boom-lifts', parent: 'lifts' },
  { name: 'Scissor Lifts', nameEn: 'Scissor Lifts', nameTr: 'Makaslı Platformlar', slug: 'scissor-lifts', parent: 'lifts' },
  { name: 'Telehandlers', nameEn: 'Telehandlers', nameTr: 'Teleskopik Yükleyiciler', slug: 'telehandlers', parent: 'lifts' },
  { name: 'Personnel Lifts', nameEn: 'Personnel Lifts', nameTr: 'Personel Platformları', slug: 'personnel-lifts', parent: 'lifts' },
];

// Common machine models per brand and category
const machineModels: { brand: string; category: string; models: string[] }[] = [
  // CATERPILLAR
  { brand: 'CATERPILLAR', category: 'excavators', models: ['320', '320D', '320E', '320F', '320GC', '323', '325', '325D', '325F', '329E', '330', '330D', '330F', '336', '336D', '336E', '336F', '349', '349D', '349E', '349F', '352', '374', '374F', '390F'] },
  { brand: 'CATERPILLAR', category: 'mini-excavators', models: ['300.9D', '301.5', '301.7D', '302.5', '302.7D', '303', '303.5E', '304', '305', '305.5E', '306', '307', '308', '308E', '309', '310'] },
  { brand: 'CATERPILLAR', category: 'wheel-loaders', models: ['906', '908', '910K', '914', '918K', '920', '924K', '926M', '930', '930K', '938K', '938M', '950', '950GC', '950K', '950M', '962', '962K', '962M', '966', '966K', '966M', '972', '972K', '972M', '980', '980K', '980M', '982M', '988', '988K', '990K', '992', '992K', '994K'] },
  { brand: 'CATERPILLAR', category: 'dozers', models: ['D3K', 'D4K', 'D5', 'D5K', 'D6', 'D6K', 'D6N', 'D6R', 'D6T', 'D7', 'D7E', 'D7R', 'D8', 'D8R', 'D8T', 'D9', 'D9R', 'D9T', 'D10', 'D10T', 'D11', 'D11T'] },
  { brand: 'CATERPILLAR', category: 'graders', models: ['120', '120K', '120M', '12M', '140', '140K', '140M', '14M', '160', '160K', '160M', '16M', '24', '24M'] },
  { brand: 'CATERPILLAR', category: 'skid-steers', models: ['226D', '232D', '236D', '239D', '242D', '246D', '249D', '259D', '262D', '272D', '277D', '287D', '289D', '297D', '299D'] },
  { brand: 'CATERPILLAR', category: 'backhoes', models: ['416', '416E', '416F', '420', '420E', '420F', '420XE', '430E', '430F', '432F', '434F', '444F', '450E', '450F'] },
  { brand: 'CATERPILLAR', category: 'rollers', models: ['CB1.7', 'CB2.5', 'CB2.7', 'CB7', 'CB10', 'CB13', 'CB14', 'CB15', 'CB22', 'CB24', 'CB32', 'CB34', 'CB44', 'CB46', 'CB54', 'CB64', 'CC24', 'CS44', 'CS54', 'CS56', 'CS64', 'CS66', 'CS68', 'CS74', 'CS76', 'CS78', 'CP44', 'CP54', 'CP56', 'CP64', 'CP66', 'CP68', 'CP74', 'CP76', 'CP78'] },
  { brand: 'CATERPILLAR', category: 'cranes', models: ['TL642', 'TL943', 'TL1055', 'TL1255', 'TH255C', 'TH306C', 'TH407C', 'TH514C'] },
  { brand: 'CATERPILLAR', category: 'telehandlers', models: ['TH255', 'TH306', 'TH357', 'TH407', 'TH408', 'TH514', 'TH460B', 'TL642', 'TL943', 'TL1055', 'TL1255'] },
  { brand: 'CATERPILLAR', category: 'pavers', models: ['AP300F', 'AP355F', 'AP500F', 'AP555F', 'AP600F', 'AP655F', 'AP1000F', 'AP1055F'] },
  { brand: 'CATERPILLAR', category: 'trenchers', models: ['TL4', 'TL6', 'TL8', 'TL10', 'TL12'] },
  { brand: 'CATERPILLAR', category: 'compactors', models: ['815F', '816F', '825K', '826K', '836K'] },
  { brand: 'CATERPILLAR', category: 'scrapers', models: ['613K', '621K', '623K', '627K', '631K', '637K', '651E'] },
  { brand: 'CATERPILLAR', category: 'generators', models: ['C1.1', 'C1.5', 'C2.2', 'C3.3', 'C4.4', 'C7.1', 'C9.3', 'C13', 'C15', 'C18', 'C27', 'C32', 'G3412', 'G3508', 'G3512', 'G3516', 'G3520'] },
  { brand: 'CATERPILLAR', category: 'compact-track-loaders', models: ['239D', '249D', '259D', '279D', '289D', '299D', '239D3', '249D3', '259D3', '279D3', '289D3', '299D3'] },
  { brand: 'CATERPILLAR', category: 'concrete-equipment', models: ['TC30B', 'TC45B', 'TC60B', 'TC80B'] },

  // KOMATSU
  { brand: 'KOMATSU', category: 'excavators', models: ['PC78', 'PC88', 'PC138', 'PC160', 'PC170', 'PC200', 'PC200-8', 'PC210', 'PC220', 'PC228', 'PC240', 'PC270', 'PC290', 'PC300', 'PC350', 'PC360', 'PC400', 'PC450', 'PC490', 'PC600', 'PC650', 'PC700', 'PC800', 'PC850', 'PC1250', 'PC2000', 'PC3000', 'PC4000', 'PC5500', 'PC8000'] },
  { brand: 'KOMATSU', category: 'mini-excavators', models: ['PC09', 'PC12', 'PC14', 'PC18', 'PC20', 'PC22', 'PC26', 'PC27', 'PC30', 'PC35', 'PC40', 'PC45', 'PC50', 'PC55', 'PC56', 'PC58', 'PC78'] },
  { brand: 'KOMATSU', category: 'wheel-loaders', models: ['WA100', 'WA150', 'WA200', 'WA250', 'WA270', 'WA320', 'WA380', 'WA430', 'WA450', 'WA470', 'WA480', 'WA500', 'WA600', 'WA700', 'WA800', 'WA900', 'WA1200'] },
  { brand: 'KOMATSU', category: 'dozers', models: ['D21', 'D31', 'D37', 'D39', 'D41', 'D51', 'D61', 'D65', 'D85', 'D155', 'D275', 'D355', 'D375', 'D475', 'D575'] },
  { brand: 'KOMATSU', category: 'graders', models: ['GD505', 'GD511', 'GD521', 'GD525', 'GD555', 'GD655', 'GD675', 'GD825'] },
  { brand: 'KOMATSU', category: 'rollers', models: ['JV25CW', 'JV25DW', 'JV40CW', 'JV40DW', 'JV100WA', 'BW144', 'BW200', 'BW211', 'BW213'] },
  { brand: 'KOMATSU', category: 'compactors', models: ['WF450', 'WF550', 'WF600'] },
  { brand: 'KOMATSU', category: 'cranes', models: ['LW250', 'LW300', 'LW500', 'PC78MR', 'PC138US'] },
  { brand: 'KOMATSU', category: 'backhoes', models: ['WB93R', 'WB97R', 'WB97S'] },
  { brand: 'KOMATSU', category: 'skid-steers', models: ['SK714', 'SK815', 'SK820', 'SK1020', 'SK1026'] },
  { brand: 'KOMATSU', category: 'generators', models: ['EG30BS', 'EG45BS', 'EG65BS', 'EG85BS', 'EG100BS', 'EG125BS', 'EG150BS', 'EG200BS', 'EG300BS', 'EG400BS', 'EG500BS'] },
  { brand: 'KOMATSU', category: 'telehandlers', models: ['WH613', 'WH714', 'WH816'] },

  // VOLVO
  { brand: 'VOLVO', category: 'excavators', models: ['EC140', 'EC160', 'EC180', 'EC200', 'EC210', 'EC220', 'EC250', 'EC290', 'EC300', 'EC340', 'EC350', 'EC380', 'EC460', 'EC480', 'EC700', 'EC750'] },
  { brand: 'VOLVO', category: 'mini-excavators', models: ['EC15', 'EC17', 'EC18', 'EC20', 'EC25', 'EC27', 'EC35', 'EC55', 'EC60', 'ECR25', 'ECR35', 'ECR40', 'ECR50', 'ECR58', 'ECR88'] },
  { brand: 'VOLVO', category: 'wheel-loaders', models: ['L20', 'L25', 'L30', 'L35', 'L45', 'L50', 'L60', 'L70', 'L90', 'L110', 'L120', 'L150', 'L180', 'L220', 'L250', 'L350'] },
  { brand: 'VOLVO', category: 'graders', models: ['G900', 'G930', 'G940', 'G946', 'G960', 'G970', 'G976', 'G990'] },
  { brand: 'VOLVO', category: 'dozers', models: ['SD110', 'SD115', 'SD130', 'SD150', 'SD160'] },
  { brand: 'VOLVO', category: 'rollers', models: ['DD25', 'DD31HF', 'DD38HF', 'DD90HF', 'DD100HF', 'DD105HF', 'DD110HF', 'DD120', 'DD140HF', 'SD25', 'SD45', 'SD70D', 'SD75', 'SD100D', 'SD105', 'SD110D', 'SD115', 'SD122', 'SD130', 'SD135', 'SD160D', 'SD160F', 'SD200DX'] },
  { brand: 'VOLVO', category: 'pavers', models: ['ABG2820', 'ABG4361', 'ABG5820', 'ABG6870', 'ABG7820', 'ABG8820', 'P4370B', 'P5320B', 'P5370B', 'P6820D', 'P6870D', 'P7110B', 'P7170B', 'P7820D', 'P8820D'] },
  { brand: 'VOLVO', category: 'compact-track-loaders', models: ['MCT85C', 'MCT110C', 'MCT125C', 'MCT135C', 'MCT145C'] },
  { brand: 'VOLVO', category: 'skid-steers', models: ['MC60C', 'MC70C', 'MC85C', 'MC95C', 'MC110C', 'MC115C', 'MC125C', 'MC135C', 'MC145C'] },
  { brand: 'VOLVO', category: 'backhoes', models: ['BL60B', 'BL61B', 'BL70B', 'BL71B'] },
  { brand: 'VOLVO', category: 'cranes', models: ['EC210D', 'EC250D', 'EC300D', 'EC380D', 'EC480D'] },
  { brand: 'VOLVO', category: 'telehandlers', models: ['LF190', 'LF240', 'LF440', 'LF480', 'LF570'] },

  // HITACHI
  { brand: 'HITACHI', category: 'excavators', models: ['ZX120', 'ZX130', 'ZX135', 'ZX160', 'ZX180', 'ZX200', 'ZX210', 'ZX225', 'ZX240', 'ZX250', 'ZX270', 'ZX290', 'ZX300', 'ZX330', 'ZX350', 'ZX370', 'ZX450', 'ZX470', 'ZX490', 'ZX520', 'ZX670', 'ZX870', 'EX1200', 'EX1900', 'EX2500', 'EX3600', 'EX5600', 'EX8000'] },
  { brand: 'HITACHI', category: 'mini-excavators', models: ['ZX10', 'ZX14', 'ZX17', 'ZX19', 'ZX26', 'ZX27', 'ZX29', 'ZX33', 'ZX35', 'ZX38', 'ZX48', 'ZX50', 'ZX55', 'ZX60', 'ZX65', 'ZX75', 'ZX80', 'ZX85'] },
  { brand: 'HITACHI', category: 'wheel-loaders', models: ['ZW100', 'ZW140', 'ZW150', 'ZW180', 'ZW220', 'ZW250', 'ZW310', 'ZW370', 'ZW550'] },
  { brand: 'HITACHI', category: 'dozers', models: ['D41', 'D51', 'D65', 'D85', 'D155'] },
  { brand: 'HITACHI', category: 'cranes', models: ['SCX400', 'SCX550', 'SCX700', 'SCX800', 'SCX900', 'SCX1200', 'SCX1500', 'SCX2800', 'SCX3500'] },
  { brand: 'HITACHI', category: 'rollers', models: ['ZC35', 'ZC50'] },
  { brand: 'HITACHI', category: 'forklifts', models: ['FD15', 'FD18', 'FD20', 'FD25', 'FD30', 'FD35', 'FD40', 'FD45', 'FD50'] },

  // JOHN DEERE
  { brand: 'JOHN DEERE', category: 'excavators', models: ['50G', '60G', '75G', '85G', '130G', '160G', '180G', '200G', '210G', '245G', '300G', '350G', '380G', '470G', '670G', '870G'] },
  { brand: 'JOHN DEERE', category: 'wheel-loaders', models: ['204L', '244L', '304L', '324L', '344L', '444L', '524L', '544L', '624L', '644L', '724L', '744L', '824L', '844L', '944L'] },
  { brand: 'JOHN DEERE', category: 'dozers', models: ['450', '550', '650', '700', '750', '850'] },
  { brand: 'JOHN DEERE', category: 'graders', models: ['622G', '670G', '672G', '770G', '772G', '870G', '872G'] },
  { brand: 'JOHN DEERE', category: 'skid-steers', models: ['312', '314', '316', '318', '320', '324', '326', '328', '330', '332'] },
  { brand: 'JOHN DEERE', category: 'backhoes', models: ['310L', '310SL', '315SL', '410L', '710L'] },
  { brand: 'JOHN DEERE', category: 'forklifts', models: ['488G', '544K', '544K-II', '624K', '644K', '724K', '824K'] },
  { brand: 'JOHN DEERE', category: 'compact-track-loaders', models: ['317G', '319G', '325G', '329G', '331G', '333G'] },
  { brand: 'JOHN DEERE', category: 'rollers', models: ['622GP', '670G', '672G', '770G', '772G'] },
  { brand: 'JOHN DEERE', category: 'cranes', models: ['210G LC', '245G LC', '290G LC', '345G LC'] },
  { brand: 'JOHN DEERE', category: 'trenchers', models: ['TC54H', 'TC62H'] },
  { brand: 'JOHN DEERE', category: 'telehandlers', models: ['TL432', 'TL433', 'TL443', 'TL943', 'TL1043', 'TL1055C'] },

  // LIEBHERR
  { brand: 'LIEBHERR', category: 'excavators', models: ['R900', 'R906', 'R914', 'R918', 'R920', 'R922', 'R924', 'R926', 'R930', 'R934', 'R936', 'R938', 'R944', 'R946', 'R950', 'R954', 'R956', 'R960', 'R966', 'R970', 'R976', 'R980', 'R984', 'R988', 'R992', 'R996', 'R9100', 'R9150', 'R9200', 'R9250', 'R9350', 'R9400', 'R9800'] },
  { brand: 'LIEBHERR', category: 'wheel-loaders', models: ['L506', 'L507', 'L509', 'L514', 'L518', 'L522', 'L524', 'L528', 'L538', 'L542', 'L546', 'L550', 'L556', 'L566', 'L576', 'L580', 'L586'] },
  { brand: 'LIEBHERR', category: 'dozers', models: ['PR716', 'PR726', 'PR736', 'PR746', 'PR756', 'PR766', 'PR776'] },
  { brand: 'LIEBHERR', category: 'cranes', models: ['LTM1030', 'LTM1040', 'LTM1050', 'LTM1055', 'LTM1060', 'LTM1070', 'LTM1090', 'LTM1095', 'LTM1100', 'LTM1110', 'LTM1130', 'LTM1150', 'LTM1160', 'LTM1200', 'LTM1220', 'LTM1230', 'LTM1250', 'LTM1300', 'LTM1350', 'LTM1400', 'LTM1450', 'LTM1500', 'LTM1750'] },
  { brand: 'LIEBHERR', category: 'telehandlers', models: ['TL432-7', 'TL435-10', 'TL441-10', 'TL451-10', 'TL536-10', 'TL538-10', 'TL542-13'] },
  { brand: 'LIEBHERR', category: 'concrete-equipment', models: ['HTM 504', 'HTM 604', 'HTM 704', 'HTM 804', 'HTM 904', 'HTM 1004', 'HTM 1204'] },
  { brand: 'LIEBHERR', category: 'forklifts', models: ['T1H', 'T2H', 'T3H', 'T4H', 'T5H', 'T6H'] },
  { brand: 'LIEBHERR', category: 'mini-excavators', models: ['A904', 'A910', 'A914', 'A918', 'A920', 'A922', 'A924', 'A926'] },
  { brand: 'LIEBHERR', category: 'graders', models: ['GR200'] },

  // JCB
  { brand: 'JCB', category: 'excavators', models: ['JS115', 'JS130', 'JS145', 'JS160', 'JS175', 'JS200', 'JS210', 'JS220', 'JS240', 'JS260', 'JS290', 'JS300', 'JS330', 'JS360', 'JS370', 'JS450', 'JS500'] },
  { brand: 'JCB', category: 'mini-excavators', models: ['8008', '8010', '8014', '8016', '8018', '8020', '8025', '8026', '8030', '8035', '8040', '8045', '8050', '8055', '8060', '8065', '8080', '8085', '86C', '100C'] },
  { brand: 'JCB', category: 'wheel-loaders', models: ['406', '407', '409', '411', '413S', '417', '419S', '427', '432', '437', '457'] },
  { brand: 'JCB', category: 'telehandlers', models: ['505-20', '506-36', '507-42', '509-42', '510-40', '510-42', '510-56', '525-60', '530-70', '535-95', '540-140', '540-170', '540-200', '540-300'] },
  { brand: 'JCB', category: 'backhoes', models: ['1CX', '2CX', '3CX', '3CX-14', '3CX-15', '4CX', '4CX-14', '5CX'] },
  { brand: 'JCB', category: 'skid-steers', models: ['135', '155', '175', '190', '205', '210', '215', '225', '260', '280', '300', '320', '330'] },
  { brand: 'JCB', category: 'forklifts', models: ['TLT25', 'TLT25D', 'TLT30', 'TLT30D', 'TLT35', 'TLT35D', '926', '930', '940', '950'] },
  { brand: 'JCB', category: 'dozers', models: ['1CX', '3CX', '4CX'] },
  { brand: 'JCB', category: 'compact-track-loaders', models: ['225T', '260T', '300T', '320T'] },
  { brand: 'JCB', category: 'cranes', models: ['JCB 520-40', 'JCB 524-50', 'JCB 531-70', 'JCB 535-95', 'JCB 540-170', 'JCB 550-80'] },
  { brand: 'JCB', category: 'rollers', models: ['VMT160', 'VMT260', 'VMT380', 'VMT430', 'VMT860'] },
  { brand: 'JCB', category: 'generators', models: ['G13QX', 'G17QX', 'G20QX', 'G27QX', 'G45QX', 'G65QX', 'G91QX', 'G115QX', 'G140QX'] },

  // BOBCAT
  { brand: 'BOBCAT', category: 'excavators', models: ['E10', 'E17', 'E19', 'E20', 'E26', 'E32', 'E34', 'E35', 'E42', 'E45', 'E50', 'E55', 'E60', 'E62', 'E85', 'E88', 'E145', 'E165'] },
  { brand: 'BOBCAT', category: 'skid-steers', models: ['S70', 'S100', 'S130', 'S150', 'S160', 'S175', 'S185', 'S205', 'S220', 'S250', 'S300', 'S330', 'S450', 'S510', 'S530', 'S550', 'S570', 'S590', 'S595', 'S630', 'S650', 'S740', 'S750', 'S770', 'S850'] },
  { brand: 'BOBCAT', category: 'compact-track-loaders', models: ['T110', 'T140', 'T180', 'T190', 'T200', 'T250', 'T300', 'T320', 'T450', 'T550', 'T590', 'T595', 'T630', 'T650', 'T740', 'T750', 'T770', 'T870'] },
  { brand: 'BOBCAT', category: 'wheel-loaders', models: ['L23', 'L28', 'L65', 'L85'] },
  { brand: 'BOBCAT', category: 'telehandlers', models: ['T35.105', 'T35.130', 'T35.140', 'T36.120', 'T40.140', 'T40.180', 'TL26.60', 'TL30.60', 'TL30.70', 'TL35.70', 'TL38.70', 'TL43.80', 'V519', 'V723', 'VR519', 'VR723'] },
  { brand: 'BOBCAT', category: 'forklifts', models: ['G10N', 'G15N', 'G18N', 'G20N', 'G25N', 'G30N', 'G35N', 'GC15N', 'GC18N', 'GC20N', 'GC25N', 'GC30N', 'GC35N', 'MC15N', 'MC18N', 'MC20N', 'MC25N', 'MC30N', 'MC35N'] },
  { brand: 'BOBCAT', category: 'backhoes', models: ['B730', 'B750', 'B780'] },
  { brand: 'BOBCAT', category: 'dozers', models: ['T450', 'T550', 'T590', 'T595', 'T630', 'T650', 'T740', 'T770', 'T870'] },
  { brand: 'BOBCAT', category: 'rollers', models: ['BC48', 'BC66', 'BC88'] },
  { brand: 'BOBCAT', category: 'trenchers', models: ['LT112', 'LT113', 'LT213', 'LT313', 'LT414'] },
  { brand: 'BOBCAT', category: 'drills', models: ['30C Auger', '50C Auger', '70C Auger', '15C Post Hole'] },

  // CASE
  { brand: 'CASE', category: 'excavators', models: ['CX130D', 'CX145D', 'CX160D', 'CX180D', 'CX210D', 'CX220D', 'CX235D', 'CX245D', 'CX250D', 'CX300D', 'CX350D', 'CX370D', 'CX490D', 'CX500D', 'CX750D', 'CX800D'] },
  { brand: 'CASE', category: 'mini-excavators', models: ['CX15B', 'CX17B', 'CX18B', 'CX20B', 'CX25', 'CX26B', 'CX27B', 'CX30B', 'CX31B', 'CX33', 'CX35B', 'CX36B', 'CX37B', 'CX50B', 'CX55B', 'CX57B', 'CX60C', 'CX75C', 'CX80C'] },
  { brand: 'CASE', category: 'wheel-loaders', models: ['21F', '121F', '221F', '321F', '521F', '621F', '721F', '821F', '921F', '1021F', '1121F', '1221F'] },
  { brand: 'CASE', category: 'dozers', models: ['550M', '650M', '750M', '850M', '1150M', '1650M', '2050M'] },
  { brand: 'CASE', category: 'backhoes', models: ['580N', '580SN', '580 Super N', '590SN', '590 Super N', '695SN', '695 Super N'] },
  { brand: 'CASE', category: 'skid-steers', models: ['SR130', 'SR160', 'SR175', 'SR200', 'SR210', 'SR240', 'SR270', 'SV185', 'SV250', 'SV280', 'SV300', 'SV340'] },
  { brand: 'CASE', category: 'forklifts', models: ['586G', '586H', '588G', '588H', '686G', '686H', '688G', '688H'] },
  { brand: 'CASE', category: 'graders', models: ['845', '845B', '865', '865B', '885', '885B'] },
  { brand: 'CASE', category: 'compact-track-loaders', models: ['TV370', 'TV380', 'TV450', 'TR270', 'TR310', 'TR340', 'TR380'] },
  { brand: 'CASE', category: 'rollers', models: ['SV208', 'SV210', 'SV212', 'SV216', 'DV23', 'DV26', 'DV36', 'DV45'] },
  { brand: 'CASE', category: 'cranes', models: ['9030B', '9040B', '9050B', '9060B'] },
  { brand: 'CASE', category: 'telehandlers', models: ['TH407C', 'TH408C', 'TH508C', 'TH509C', 'TH612C', 'TH615C', 'TH816C', 'TH920C', 'TH1020C'] },

  // KUBOTA
  { brand: 'KUBOTA', category: 'mini-excavators', models: ['K008', 'KX008', 'U10', 'KX015', 'KX016', 'U15', 'KX018', 'U17', 'U20', 'KX027', 'KX033', 'KX040', 'KX057', 'KX060', 'KX71', 'KX080', 'KX91', 'KX121', 'KX155', 'KX161', 'KX185', 'U25', 'U27', 'U35', 'U48', 'U55'] },
  { brand: 'KUBOTA', category: 'wheel-loaders', models: ['R065', 'R082', 'R090', 'R420', 'R430', 'R520', 'R530', 'R540', 'R630'] },
  { brand: 'KUBOTA', category: 'skid-steers', models: ['SSV65', 'SSV75', 'SVL65', 'SVL75', 'SVL95', 'SVL97'] },
  { brand: 'KUBOTA', category: 'compact-track-loaders', models: ['SVL65-2', 'SVL75-2', 'SVL95-2', 'SVL97-2'] },
  { brand: 'KUBOTA', category: 'backhoes', models: ['B26', 'BX23S', 'BX25D', 'L39', 'L45', 'L47', 'L48', 'M62'] },
  { brand: 'KUBOTA', category: 'dozers', models: ['SVL65-2', 'SVL75-2C', 'SVL95-2S'] },
  { brand: 'KUBOTA', category: 'trenchers', models: ['K008-3', 'KX018-4', 'KX033-4'] },

  // DOOSAN/DAEWOO
  { brand: 'DOOSAN', category: 'excavators', models: ['DX140', 'DX160', 'DX180', 'DX190', 'DX210', 'DX220', 'DX225', 'DX235', 'DX255', 'DX260', 'DX300', 'DX340', 'DX350', 'DX380', 'DX420', 'DX480', 'DX490', 'DX520', 'DX530', 'DX560', 'DX700', 'DX800'] },
  { brand: 'DOOSAN', category: 'mini-excavators', models: ['DX10', 'DX14', 'DX17', 'DX18', 'DX19', 'DX25', 'DX27', 'DX30', 'DX35', 'DX42', 'DX50', 'DX55', 'DX60', 'DX62', 'DX63', 'DX80', 'DX85'] },
  { brand: 'DOOSAN', category: 'wheel-loaders', models: ['DL150', 'DL200', 'DL220', 'DL250', 'DL280', 'DL300', 'DL350', 'DL400', 'DL420', 'DL450', 'DL500', 'DL550'] },
  { brand: 'DOOSAN', category: 'dozers', models: ['DD100', 'DD130', 'DD160', 'DD220'] },
  { brand: 'DOOSAN', category: 'cranes', models: ['DC100', 'DC130', 'DC150', 'DC200', 'DC250'] },
  { brand: 'DOOSAN', category: 'skid-steers', models: ['DSL200', 'DSL250', 'DSL300'] },
  { brand: 'DOOSAN', category: 'compact-track-loaders', models: ['DTL200', 'DTL250', 'DTL300'] },
  { brand: 'DOOSAN', category: 'generators', models: ['G25', 'G30', 'G40', 'G50', 'G70', 'G100', 'G150', 'G200', 'G300', 'G400', 'G500'] },
  { brand: 'DOOSAN', category: 'compressors', models: ['7/20', '7/31', '7/41', '7/51', '7/71', '7/120', '10/105', '12/135', '12/170', '14/115', '17/105'] },

  // NEW HOLLAND
  { brand: 'NEW HOLLAND', category: 'excavators', models: ['E17', 'E18', 'E26', 'E27', 'E33', 'E35', 'E37', 'E55', 'E57', 'E60', 'E80', 'E85', 'E145', 'E175', 'E215', 'E245', 'E265', 'E305', 'E385', 'E485'] },
  { brand: 'NEW HOLLAND', category: 'wheel-loaders', models: ['W50B', 'W60B', 'W70B', 'W80B', 'W110B', 'W130B', 'W170B', 'W190B', 'W230B', 'W270B', 'W300B'] },
  { brand: 'NEW HOLLAND', category: 'dozers', models: ['D95', 'D125', 'D150', 'D180'] },
  { brand: 'NEW HOLLAND', category: 'skid-steers', models: ['L213', 'L215', 'L218', 'L220', 'L223', 'L225', 'L228', 'L230', 'L234'] },
  { brand: 'NEW HOLLAND', category: 'compact-track-loaders', models: ['C232', 'C234', 'C237', 'C238', 'C245'] },
  { brand: 'NEW HOLLAND', category: 'backhoes', models: ['B95', 'B95B', 'B95C', 'B100B', 'B100C', 'B110B', 'B110C', 'B115B', 'B115C'] },
  { brand: 'NEW HOLLAND', category: 'telehandlers', models: ['LM5.25', 'LM6.28', 'LM7.35', 'LM7.42', 'LM9.35', 'TH6.32', 'TH7.37', 'TH7.42', 'TH9.35'] },
  { brand: 'NEW HOLLAND', category: 'graders', models: ['F106.6', 'F106.7', 'F156.7'] },
  { brand: 'NEW HOLLAND', category: 'forklifts', models: ['F15', 'F18', 'F20', 'F25', 'F30', 'F35', 'F40', 'F50', 'F60', 'F70'] },

  // HYUNDAI
  { brand: 'HYUNDAI', category: 'excavators', models: ['HX130', 'HX140', 'HX145', 'HX160', 'HX180', 'HX210', 'HX220', 'HX235', 'HX260', 'HX290', 'HX300', 'HX330', 'HX380', 'HX430', 'HX480', 'HX520', 'HX900'] },
  { brand: 'HYUNDAI', category: 'mini-excavators', models: ['HX10', 'HX15', 'HX17', 'HX20', 'HX25', 'HX27', 'HX30', 'HX35', 'HX40', 'HX48', 'HX55', 'HX60', 'HX80', 'HX85'] },
  { brand: 'HYUNDAI', category: 'wheel-loaders', models: ['HL730', 'HL740', 'HL757', 'HL760', 'HL770', 'HL780', 'HL940', 'HL955', 'HL960', 'HL970', 'HL975', 'HL980'] },
  { brand: 'HYUNDAI', category: 'forklifts', models: ['HBF15-7', 'HBF18-7', 'HBF20-7', 'HBF25-7', 'HBF30-7', 'HDF15-5', 'HDF18-5', 'HDF20-5', 'HDF25-5', 'HDF30-5', 'HDF35-5', 'HDF40-5', 'HDF50-7', 'HDF70-7', 'HLF15-5', 'HLF18-5', 'HLF20-5', 'HLF25-5', 'HLF30-5'] },
  { brand: 'HYUNDAI', category: 'dozers', models: ['HD78', 'HD110', 'HD170', 'HD270', 'HD370'] },
  { brand: 'HYUNDAI', category: 'backhoes', models: ['HX55S', 'HX60A', 'HX85A'] },
  { brand: 'HYUNDAI', category: 'rollers', models: ['HR70C', 'HR110C', 'HR120C'] },
  { brand: 'HYUNDAI', category: 'skid-steers', models: ['HSL650-7A', 'HSL850-7A'] },

  // GENIE
  { brand: 'GENIE', category: 'boom-lifts', models: ['S-40', 'S-45', 'S-60', 'S-60X', 'S-65', 'S-80', 'S-80X', 'S-85', 'S-100', 'S-105', 'S-120', 'S-125', 'Z-30/20N', 'Z-33/18', 'Z-34/22', 'Z-40/23N', 'Z-45/25', 'Z-51/30', 'Z-60/34', 'Z-62/40', 'Z-80/60', 'ZX-135/70'] },
  { brand: 'GENIE', category: 'scissor-lifts', models: ['GS-1530', 'GS-1532', 'GS-1930', 'GS-1932', 'GS-2032', 'GS-2046', 'GS-2632', 'GS-2646', 'GS-2669', 'GS-3232', 'GS-3246', 'GS-3268', 'GS-3369', 'GS-3384', 'GS-4047', 'GS-4069', 'GS-4390', 'GS-5390'] },
  { brand: 'GENIE', category: 'telehandlers', models: ['GTH-636', 'GTH-644', 'GTH-842', 'GTH-844', 'GTH-1056', 'GTH-1256', 'GTH-2506', 'GTH-3007', 'GTH-4014', 'GTH-4017', 'GTH-4018', 'GTH-5519'] },

  // JLG
  { brand: 'JLG', category: 'boom-lifts', models: ['340AJ', '400S', '450A', '450AJ', '460SJ', '510AJ', '520AJ', '600A', '600AJ', '600S', '600SJ', '660SJ', '740AJ', '800A', '800AJ', '800S', '860SJ', '1000AJ', '1100SJ', '1200SJP', '1350SJP', '1500SJ', '1850SJ'] },
  { brand: 'JLG', category: 'scissor-lifts', models: ['1532R', '1930ES', '1932RS', '2030ES', '2032ES', '2046ES', '2630ES', '2632ES', '2646ES', '2658ES', '3246ES', '3248RS', '3369LE', '3394RT', '4045R', '4069LE', '4394RT', '5394RT'] },
  { brand: 'JLG', category: 'telehandlers', models: ['G5-18A', 'G6-42A', 'G9-43A', 'G10-43A', 'G10-55A', 'G12-55A', '1055', '1255', '1644', '2505H', '2733', '3013', '3507H', '3614RS', '4009PS', '4013PS', '4014PS', '4017PS'] },

  // SKYJACK
  { brand: 'SKYJACK', category: 'scissor-lifts', models: ['SJ3215', 'SJ3219', 'SJ3220', 'SJ3226', 'SJ4626', 'SJ4632', 'SJ4740', 'SJ6826RT', 'SJ6832RT', 'SJ7127RT', 'SJ7135RT', 'SJ8243RT', 'SJ8250RT', 'SJ8841RT', 'SJ8850RT', 'SJ9250RT'] },
  { brand: 'SKYJACK', category: 'boom-lifts', models: ['SJ30ARJE', 'SJ45T', 'SJ46AJ', 'SJ51AJ', 'SJ61T', 'SJ63AJ', 'SJ66T', 'SJ66T+', 'SJ80T', 'SJ82T+', 'SJ85AJ'] },
  { brand: 'SKYJACK', category: 'telehandlers', models: ['SJ519TH', 'SJ643TH', 'SJ679TH', 'SJ843TH', 'SJ1044TH', 'SJ1056TH'] },

  // TEREX
  { brand: 'TEREX', category: 'cranes', models: ['RT35', 'RT45', 'RT55', 'RT100', 'RT130', 'RT230', 'RT335', 'RT345', 'RT555', 'RT670', 'RT780', 'RT1080', 'RT1120'] },
  { brand: 'TEREX', category: 'excavators', models: ['TC16', 'TC20', 'TC29', 'TC35', 'TC37', 'TC48', 'TC50', 'TC75', 'TC85', 'TC125', 'TXC140', 'TXC180', 'TXC225', 'TXC300', 'TXC340', 'TXC470'] },

  // TADANO
  { brand: 'TADANO', category: 'cranes', models: ['GR150', 'GR250', 'GR300', 'GR350', 'GR500', 'GR600', 'GR750', 'GR800', 'GR1000', 'GR1200', 'GR1450', 'GR1600', 'ATF40G', 'ATF60G', 'ATF70G', 'ATF100G', 'ATF130G', 'ATF160G', 'ATF220G', 'ATF400G'] },

  // GROVE
  { brand: 'GROVE', category: 'cranes', models: ['RT530E', 'RT540E', 'RT550E', 'RT700E', 'RT760E', 'RT765E', 'RT770E', 'RT800E', 'RT880E', 'RT890E', 'RT990E', 'GMK2035', 'GMK3050', 'GMK3055', 'GMK3060', 'GMK4080', 'GMK4100', 'GMK5095', 'GMK5120', 'GMK5150', 'GMK5180', 'GMK5250', 'GMK6300', 'GMK6400'] },

  // LINK-BELT
  { brand: 'LINK-BELT', category: 'cranes', models: ['RTC-8030', 'RTC-8050', 'RTC-8065', 'RTC-8080', 'RTC-80100', 'RTC-80110', 'RTC-80130', 'RTC-80150', 'HTC-8640', 'HTC-8650', 'HTC-8660', 'HTC-8670', 'HTC-8690', 'HTC-86100', 'HTC-86110', 'ATC-3200'] },

  // MANITOWOC
  { brand: 'MANITOWOC', category: 'cranes', models: ['MLC100', 'MLC165', 'MLC300', 'MLC650', 'MLC800', 'M250', 'M16000', '999', '888', '777', '555', '444', '333', '222', '111'] },

  // TAKEUCHI
  { brand: 'TAKEUCHI', category: 'mini-excavators', models: ['TB108', 'TB110', 'TB014', 'TB016', 'TB210', 'TB215', 'TB216', 'TB219', 'TB225', 'TB228', 'TB230', 'TB235', 'TB240', 'TB250', 'TB257', 'TB260', 'TB280', 'TB285', 'TB290', 'TB295', 'TB2150'] },
  { brand: 'TAKEUCHI', category: 'compact-track-loaders', models: ['TL6', 'TL8', 'TL10', 'TL12', 'TL130', 'TL140', 'TL150', 'TL230', 'TL240', 'TL250'] },
  { brand: 'TAKEUCHI', category: 'skid-steers', models: ['TS50', 'TS60', 'TS70', 'TS80'] },

  // SANY
  { brand: 'SANY', category: 'excavators', models: ['SY16', 'SY18', 'SY26', 'SY35', 'SY50', 'SY55', 'SY60', 'SY75', 'SY80', 'SY95', 'SY135', 'SY155', 'SY195', 'SY205', 'SY215', 'SY235', 'SY265', 'SY305', 'SY335', 'SY365', 'SY395', 'SY465', 'SY500', 'SY750', 'SY870', 'SY950'] },
  { brand: 'SANY', category: 'wheel-loaders', models: ['SW305', 'SW405', 'SW505', 'SW605', 'SW655', 'SW755', 'SW905', 'SW955'] },
  { brand: 'SANY', category: 'cranes', models: ['STC250', 'STC500', 'STC750', 'STC800', 'STC1000', 'STC1250', 'STC1600', 'SAC1100', 'SAC1300', 'SAC1600', 'SAC2200', 'SAC2600', 'SAC3000', 'SCC500', 'SCC750', 'SCC1000', 'SCC1500', 'SCC2500', 'SCC3200', 'SCC6500'] },
  { brand: 'SANY', category: 'dozers', models: ['SD16', 'SD22', 'SD32', 'SD42'] },
  { brand: 'SANY', category: 'graders', models: ['SG16', 'SG18', 'SG21', 'SG24'] },
  { brand: 'SANY', category: 'rollers', models: ['SSR120', 'SSR180', 'SSR200', 'SSR220', 'STR100', 'STR130', 'STR160', 'STR200'] },
  { brand: 'SANY', category: 'forklifts', models: ['SCP15', 'SCP18', 'SCP20', 'SCP25', 'SCP30', 'SCP35', 'SCP50', 'SCP70', 'SCP100', 'SCP160'] },
  { brand: 'SANY', category: 'concrete-equipment', models: ['SY5180THB', 'SY5190THB', 'SY5230THB', 'SY5280THB', 'SY5313THB', 'SY5360THB', 'SY5400THB', 'SYM5250THB', 'SYM5313THB', 'SYM5365THB'] },
  { brand: 'SANY', category: 'telehandlers', models: ['STH634', 'STH844', 'STH1056', 'STH1256'] },
  { brand: 'SANY', category: 'skid-steers', models: ['SW105', 'SW155', 'SW165'] },
  { brand: 'SANY', category: 'compact-track-loaders', models: ['STL105C', 'STL155C', 'STL165C'] },

  // XCMG
  { brand: 'XCMG', category: 'excavators', models: ['XE15', 'XE35', 'XE55', 'XE60', 'XE75', 'XE80', 'XE85', 'XE135', 'XE150', 'XE200', 'XE210', 'XE215', 'XE235', 'XE265', 'XE305', 'XE335', 'XE370', 'XE400', 'XE470', 'XE490', 'XE700', 'XE900'] },
  { brand: 'XCMG', category: 'wheel-loaders', models: ['LW156', 'LW180K', 'LW300F', 'LW300K', 'LW400K', 'LW500F', 'LW500K', 'LW600K', 'LW700K', 'LW800K', 'LW900K', 'LW1100K', 'LW1200K'] },
  { brand: 'XCMG', category: 'dozers', models: ['TY160', 'TY165', 'TY220', 'TY230', 'TY320', 'TY420', 'TY520'] },
  { brand: 'XCMG', category: 'cranes', models: ['QY8B', 'QY12B', 'QY16B', 'QY20B', 'QY25K', 'QY30K', 'QY35K', 'QY50K', 'QY55K', 'QY70K', 'QY75K', 'QY80K', 'QY100K', 'QY130K', 'QY160K', 'QY200K', 'QY300K', 'QAY400', 'QAY500', 'QAY650', 'QAY800', 'QAY1000', 'QAY1200', 'QAY2000'] },
  { brand: 'XCMG', category: 'graders', models: ['GR100', 'GR135', 'GR165', 'GR180', 'GR215'] },
  { brand: 'XCMG', category: 'rollers', models: ['XS122', 'XS142J', 'XS162J', 'XS182J', 'XS202J', 'XS222J', 'XS262J', 'XS302', 'XS333', 'XS363'] },
  { brand: 'XCMG', category: 'forklifts', models: ['XCF15', 'XCF18', 'XCF20', 'XCF25', 'XCF30', 'XCF35', 'XCF50', 'XCF70', 'XCF100', 'XCF160'] },
  { brand: 'XCMG', category: 'skid-steers', models: ['XT740', 'XT750', 'XT760'] },
  { brand: 'XCMG', category: 'backhoes', models: ['XT860', 'XT870', 'XT873'] },
  { brand: 'XCMG', category: 'pavers', models: ['RP403', 'RP451', 'RP451L', 'RP452', 'RP600', 'RP602', 'RP603', 'RP756', 'RP902', 'RP953', 'RP1203', 'RP1253', 'RP1356'] },
  { brand: 'XCMG', category: 'concrete-equipment', models: ['HB37K', 'HB40K', 'HB43K', 'HB46K', 'HB48K', 'HB52K', 'HB56K', 'HB58K', 'HB62K', 'HB67K'] },

  // ZOOMLION
  { brand: 'ZOOMLION', category: 'excavators', models: ['ZE60', 'ZE75', 'ZE85', 'ZE135', 'ZE150', 'ZE205', 'ZE215', 'ZE230', 'ZE260', 'ZE330', 'ZE360', 'ZE480', 'ZE700', 'ZE950'] },
  { brand: 'ZOOMLION', category: 'wheel-loaders', models: ['ZL30F', 'ZL40F', 'ZL50F', 'ZL50GN', 'ZL60F'] },
  { brand: 'ZOOMLION', category: 'cranes', models: ['QY25V', 'QY35V', 'QY50V', 'QY70V', 'QY90V', 'QY100V', 'QY130V', 'QY160V', 'QY200V', 'QY260V', 'QY350V', 'QY500V', 'QY650V', 'QAY800', 'QAY1000', 'QAY1200', 'QAY1600', 'QAY2000'] },
  { brand: 'ZOOMLION', category: 'dozers', models: ['ZD160', 'ZD220', 'ZD320'] },
  { brand: 'ZOOMLION', category: 'rollers', models: ['YZ18', 'YZ20', 'YZC12', 'YZC14', 'YZC18'] },
  { brand: 'ZOOMLION', category: 'forklifts', models: ['FD15', 'FD18', 'FD20', 'FD25', 'FD30', 'FD35', 'FD50', 'FD70', 'FD100', 'FD160'] },
  { brand: 'ZOOMLION', category: 'concrete-equipment', models: ['37X-5RZ', '40X-5RZ', '43X-5RZ', '47X-5RZ', '49X-5RZ', '52X-5RZ', '56X-5RZ', '60X-5RZ', '63X-5RZ', '67X-5RZ'] },
  { brand: 'ZOOMLION', category: 'boom-lifts', models: ['ZA14J', 'ZA16J', 'ZA18J', 'ZA20J', 'ZA22J', 'ZA26J', 'ZA30J'] },
  { brand: 'ZOOMLION', category: 'scissor-lifts', models: ['ZS0608', 'ZS0808', 'ZS1012', 'ZS1212', 'ZS1412', 'ZS1612'] },

  // KOBELCO
  { brand: 'KOBELCO', category: 'excavators', models: ['SK17', 'SK25', 'SK30', 'SK35', 'SK45', 'SK55', 'SK75', 'SK85', 'SK140', 'SK170', 'SK210', 'SK230', 'SK260', 'SK300', 'SK330', 'SK350', 'SK380', 'SK480', 'SK500', 'SK850'] },
  { brand: 'KOBELCO', category: 'mini-excavators', models: ['SK008', 'SK10', 'SK15', 'SK17SR', 'SK25SR', 'SK26', 'SK30SR', 'SK35SR', 'SK45SRX', 'SK55SRX', 'SK75SR', 'SK85CS'] },
  { brand: 'KOBELCO', category: 'cranes', models: ['CK850G', 'CK1000G', 'CK1200G', 'CK1600G', 'CK2000G', 'CK2500G', 'CK2750G', 'SL4500', 'SL6000', 'SL16000'] },

  // WACKER NEUSON
  { brand: 'WACKER NEUSON', category: 'mini-excavators', models: ['803', '1404', '1703', '2003', '2503', '2803', '3003', '3503', '5003', '5503', '6003', '6503', '8003', '9503', '14504', '28Z3', '38Z3', '50Z3', '58Z3', '75Z3', '85Z3'] },
  { brand: 'WACKER NEUSON', category: 'wheel-loaders', models: ['WL20', 'WL25', 'WL28', 'WL32', 'WL34', 'WL36', 'WL38', 'WL44', 'WL50', 'WL52', 'WL60', 'WL70'] },
  { brand: 'WACKER NEUSON', category: 'skid-steers', models: ['SW16', 'SW20', 'SW21', 'SW24', 'SW28', 'SW32'] },
  { brand: 'WACKER NEUSON', category: 'compact-track-loaders', models: ['ST28', 'ST31', 'ST35', 'ST45'] },

  // YANMAR
  { brand: 'YANMAR', category: 'mini-excavators', models: ['SV08', 'SV15', 'SV17', 'SV22', 'SV26', 'VIO17', 'VIO20', 'VIO25', 'VIO27', 'VIO30', 'VIO33', 'VIO35', 'VIO38', 'VIO45', 'VIO50', 'VIO55', 'VIO57', 'VIO80', 'VIO82'] },
  { brand: 'YANMAR', category: 'wheel-loaders', models: ['V4-7', 'V8', 'V10', 'V12', 'V80', 'V100'] },

  // BOMAG
  { brand: 'BOMAG', category: 'rollers', models: ['BW55', 'BW65', 'BW75', 'BW90', 'BW100', 'BW120', 'BW124', 'BW138', 'BW145', 'BW151', 'BW154', 'BW161', 'BW170', 'BW177', 'BW190', 'BW203', 'BW211', 'BW213', 'BW216', 'BW219', 'BW226'] },
  { brand: 'BOMAG', category: 'compactors', models: ['BMP8500', 'BPH80/65S', 'BPR25/50', 'BPR30/38', 'BPR35/60', 'BPR40/60', 'BPR45/55', 'BPR50/55', 'BPR55/65', 'BPR60/65', 'BPR70/70'] },

  // HAMM
  { brand: 'HAMM', category: 'rollers', models: ['HD8', 'HD10', 'HD12', 'HD13', 'HD70', 'HD75', 'HD90', 'HD99', 'HD110', 'HD120', 'HD128', 'HD138', 'HD140', 'H5', 'H7', 'H10', 'H11', 'H13', 'H16', 'H18', 'H20', '3205', '3307', '3410', '3411', '3412', '3516', '3520', '3625'] },

  // DYNAPAC
  { brand: 'DYNAPAC', category: 'rollers', models: ['CA1300', 'CA1500', 'CA2500', 'CA2800', 'CA3500', 'CA4000', 'CA4600', 'CA5000', 'CA6000', 'CC1000', 'CC1100', 'CC1200', 'CC1300', 'CC2000', 'CC2200', 'CC3000', 'CC3200', 'CC4000', 'CC4200', 'CC5000', 'CC5200', 'CC6200'] },
  { brand: 'DYNAPAC', category: 'pavers', models: ['F1000', 'F1200', 'F1700', 'F2500', 'F2500W', 'SD1800', 'SD1800W', 'SD2500', 'SD2500W'] },

  // WIRTGEN
  { brand: 'WIRTGEN', category: 'pavers', models: ['W50', 'W100', 'W130', 'W150', 'W200', 'W210', 'W220', 'W250'] },

  // DITCH WITCH
  { brand: 'DITCH WITCH', category: 'trenchers', models: ['C12', 'C14', 'C16', 'C16X', 'C24X', 'C30X', 'HT25', 'RT45', 'RT55', 'RT80', 'RT100', 'RT115', 'RT120', 'RT125'] },
  { brand: 'DITCH WITCH', category: 'drills', models: ['JT5', 'JT9', 'JT10', 'JT20', 'JT24', 'JT25', 'JT30', 'JT40', 'JT60', 'JT100', 'JT2020', 'JT3020', 'JT4020'] },

  // VERMEER
  { brand: 'VERMEER', category: 'trenchers', models: ['RTX150', 'RTX200', 'RTX250', 'RTX450', 'RTX550', 'RTX750', 'RTX1250'] },
  { brand: 'VERMEER', category: 'drills', models: ['D8x12', 'D10x15', 'D16x20', 'D20x22', 'D23x30', 'D24x40', 'D36x50', 'D40x55', 'D60x90', 'D80x100', 'D100x120', 'D220x300', 'D330x500'] },

  // PUTZMEISTER
  { brand: 'PUTZMEISTER', category: 'concrete-equipment', models: ['BSA 1005', 'BSA 1407', 'BSA 2109', 'BSF 28', 'BSF 32', 'BSF 36', 'BSF 38', 'BSF 42', 'BSF 47', 'BSF 52', 'BSF 56', 'BSF 61', 'MX 28', 'MX 32', 'MX 36', 'MX 40', 'MX 43'] },

  // MANITOU
  { brand: 'MANITOU', category: 'telehandlers', models: ['MLT625', 'MLT630', 'MLT634', 'MLT635', 'MLT737', 'MLT741', 'MLT840', 'MLT940', 'MLT1040', 'MLT1740', 'MT420', 'MT523', 'MT625', 'MT732', 'MT835', 'MT932', 'MT1030', 'MT1135', 'MT1235', 'MT1335', 'MT1440', 'MT1840', 'MHT780', 'MHT860', 'MHT10120', 'MHT10130', 'MHT10160', 'MHT10225'] },
  { brand: 'MANITOU', category: 'forklifts', models: ['M26', 'M30', 'M40', 'M50', 'MI20', 'MI25', 'MI30', 'MI35', 'MSI20', 'MSI25', 'MSI30', 'MSI35', 'MSI40', 'MSI50'] },

  // ============================================
  // FORKLIFT BRANDS
  // ============================================

  // TOYOTA FORKLIFTS (World's largest forklift manufacturer)
  { brand: 'TOYOTA', category: 'forklifts', models: ['8FGU15', '8FGU18', '8FGU20', '8FGU25', '8FGU30', '8FGU32', '8FGU35', '8FGU45', '8FGU50', '8FGCU15', '8FGCU18', '8FGCU20', '8FGCU25', '8FGCU30', '8FGCU32', '8FBCU15', '8FBCU18', '8FBCU20', '8FBCU25', '8FBCU30', '8FBMT15', '8FBMT20', '8FBMT25', '8FBMT30', '8FBE15', '8FBE18', '8FBE20', '7FGU15', '7FGU18', '7FGU20', '7FGU25', '7FGU30', '7FGU32', '7FGU35', '7FGCU20', '7FGCU25', '7FGCU30'] },

  // HYSTER FORKLIFTS
  { brand: 'HYSTER', category: 'forklifts', models: ['H30-40FT', 'H40-60FT', 'H60-70FT', 'H70-80FT', 'H80-100FT', 'H100-120FT', 'H135-155FT', 'H170-190FT', 'H230-280HD', 'H300-360HD', 'S30-40FT', 'S40-60FT', 'S60-70FT', 'S80-100FT', 'S100-120FT', 'S120-155FT', 'E30-40HSD', 'E40-60HSD', 'E60-70HSD', 'E80-100HSD', 'J30-40XN', 'J40-50XN', 'J60-70XN', 'J80-100XN', 'R30XMS', 'R30XMA', 'N30-35XMH', 'N40-50XMH'] },

  // YALE FORKLIFTS
  { brand: 'YALE', category: 'forklifts', models: ['GLP030-040VX', 'GLP040-060VX', 'GLP060-070VX', 'GLP080-100VX', 'GLP100-120VX', 'GLP135-155VX', 'GDP030-040VX', 'GDP040-060VX', 'GDP060-070VX', 'GDP080-100VX', 'ERP030-040VT', 'ERP040-060VT', 'ERP060-070VT', 'ERC030-040VA', 'ERC040-060VA', 'ERC060-070VA', 'MPE060-080VG', 'MPE080-100VG', 'MRW020-030E', 'MRW040-050E', 'NR040-050DA', 'NR060-070DA', 'OS030-040EF', 'SS030-040EC'] },

  // LINDE FORKLIFTS
  { brand: 'LINDE', category: 'forklifts', models: ['H14', 'H16', 'H18', 'H20', 'H25', 'H30', 'H35', 'H40', 'H45', 'H50', 'H60', 'H70', 'H80', 'E14', 'E16', 'E18', 'E20', 'E25', 'E30', 'E35', 'E40', 'E45', 'E50', 'E60', 'R14', 'R16', 'R17', 'R20', 'R25', 'K', 'L10', 'L12', 'L14', 'L16', 'N20', 'N24', 'P30', 'P50', 'P60', 'T16', 'T18', 'T20', 'T24', 'V10', 'V11', 'V12'] },

  // CROWN FORKLIFTS
  { brand: 'CROWN', category: 'forklifts', models: ['FC 4500', 'FC 5200', 'FC 5500', 'SC 5200', 'SC 5300', 'SC 5500', 'SC 6000', 'C-5', 'RC 5500', 'RR 5700', 'RM 6000', 'TSP 6500', 'TSP 7000', 'SP 3500', 'SP 4000', 'ESR 5200', 'ESR 5260', 'SHR 5500', 'PE 4000', 'PE 4500', 'PW 3500', 'PTH 50', 'WP 2300', 'WP 3000', 'WS 2300', 'WF 3000', 'GPC 3000'] },

  // JUNGHEINRICH FORKLIFTS
  { brand: 'JUNGHEINRICH', category: 'forklifts', models: ['EFG 110-120', 'EFG 213-220', 'EFG 316-320', 'EFG 425-435', 'EFG 535-550', 'DFG 316-320', 'DFG 425-435', 'DFG 540-550', 'TFG 316-320', 'TFG 425-435', 'TFG 540-550', 'ETV 110-120', 'ETV 214-216', 'ETV 318-320', 'ETV Q20-Q25', 'ETM 214-216', 'ETM 320-325', 'EKS 110-215', 'EKX 410-516', 'EKX 514-516', 'ERE 120-225', 'ERE 225-235', 'EJC 110-120', 'EJC 212-220'] },

  // KOMATSU FORKLIFTS
  { brand: 'KOMATSU', category: 'forklifts', models: ['FG15T-21', 'FG18T-21', 'FG20T-17', 'FG25T-17', 'FG30T-17', 'FG35AT-17', 'FG40T-10', 'FG45T-10', 'FG50AT-10', 'FG60T-10', 'FG70-10', 'FD15T-21', 'FD18T-21', 'FD20T-17', 'FD25T-17', 'FD30T-17', 'FD35AT-17', 'FD40T-10', 'FD45T-10', 'FD50AT-10', 'FD60T-10', 'FD70-10', 'FD80-10', 'FD100-10', 'FD115-10', 'FD135-10', 'FD150-10', 'FB15-12', 'FB18-12', 'FB20-12', 'FB25-12', 'FB30-12'] },

  // CATERPILLAR FORKLIFTS
  { brand: 'CATERPILLAR', category: 'forklifts', models: ['GP15N', 'GP18N', 'GP20N', 'GP25N', 'GP30N', 'GP35N', 'GP40N', 'GP45N', 'GP50N', 'GP55N', 'DP15N', 'DP18N', 'DP20N', 'DP25N', 'DP30N', 'DP35N', 'DP40N', 'DP45N', 'DP50N', 'DP55N', 'DP60N', 'DP70N', 'DP80N', 'DP100N', 'DP115N', 'DP135N', 'DP150N', 'EP16N', 'EP18N', 'EP20N', 'EP25N', 'EP30N', 'EP35N', 'EP40N', 'EP45N', 'EP50N', '2P3000', '2P5000', '2P6000', '2P7000'] },

  // MITSUBISHI FORKLIFTS
  { brand: 'MITSUBISHI', category: 'forklifts', models: ['FG15N', 'FG18N', 'FG20N', 'FG25N', 'FG30N', 'FG35N', 'FG40N', 'FG45N', 'FG50N', 'FD15N', 'FD18N', 'FD20N', 'FD25N', 'FD30N', 'FD35N', 'FD40N', 'FD45N', 'FD50N', 'FD60N', 'FD70N', 'FB16N', 'FB18N', 'FB20N', 'FB25N', 'FB30N', 'FB35N', 'EDR15N', 'EDR18N', 'ESR15N', 'ESR18N', 'ESR20N', '?"', 'RBN15', 'RBN18', 'RBN20'] },

  // CLARK FORKLIFTS
  { brand: 'CLARK', category: 'forklifts', models: ['C15', 'C18', 'C20', 'C25', 'C30', 'C32', 'C35', 'C40', 'C45', 'C50', 'C55', 'C60', 'C70', 'C75', 'C80', 'S15', 'S18', 'S20', 'S25', 'S30', 'S32', 'GTX16', 'GTX18', 'GTX20', 'GEX16', 'GEX18', 'GEX20', 'GEX25', 'GEX30', 'GTS20', 'GTS25', 'GTS30', 'GTS33', 'ECX20', 'ECX25', 'ECX30', 'ECX32', 'EPX16', 'EPX18', 'EPX20'] },

  // NISSAN FORKLIFTS (now UniCarriers)
  { brand: 'NISSAN', category: 'forklifts', models: ['MCP1F1A15LV', 'MCP1F1A18LV', 'MCP1F2A20LV', 'MCP1F2A25LV', 'MCP1F2A30LV', 'MAP1F1A15LV', 'MAP1F1A18LV', 'MAP1F2A20LV', 'MAP1F2A25LV', 'PF30', 'PF35', 'PF40', 'PF45', 'PF50', 'PF60', 'PF70', 'PF80', 'TX30', 'TX35', 'TX40', 'TX45', 'TX50', 'BX30', 'BX35', 'BX40', 'BX45', 'BX50'] },

  // STILL FORKLIFTS
  { brand: 'STILL', category: 'forklifts', models: ['RX20-14', 'RX20-16', 'RX20-18', 'RX20-20', 'RX60-25', 'RX60-30', 'RX60-35', 'RX60-40', 'RX60-45', 'RX60-50', 'RX70-16', 'RX70-18', 'RX70-20', 'RX70-22', 'RX70-25', 'RX70-30', 'RX70-35', 'RX70-40', 'RX70-45', 'RX70-50', 'FM-X 10', 'FM-X 12', 'FM-X 14', 'FM-X 17', 'FM-X 20', 'FM-X 25', 'MX-X', 'EXU 16', 'EXU 18', 'EXU 20', 'EXU 22', 'EXV 10', 'EXV 12', 'EXV 14', 'EXV 16'] },

  // TCM FORKLIFTS
  { brand: 'TCM', category: 'forklifts', models: ['FG15T', 'FG18T', 'FG20T', 'FG25T', 'FG30T', 'FG35T', 'FD15T', 'FD18T', 'FD20T', 'FD25T', 'FD30T', 'FD35T', 'FD40T', 'FD45T', 'FD50T', 'FD60T', 'FD70T', 'FD80T', 'FD100T', 'FB15-8', 'FB18-8', 'FB20-8', 'FB25-8', 'FB30-8', 'FRB15-8', 'FRB18-8', 'FRB20-8', 'FRB25-8'] },

  // DOOSAN FORKLIFTS
  { brand: 'DOOSAN', category: 'forklifts', models: ['G15S-5', 'G18S-5', 'G20SC-5', 'G25S-5', 'G30S-5', 'G35S-5', 'D15S-5', 'D18S-5', 'D20SC-5', 'D25S-5', 'D30S-5', 'D35S-5', 'D40S-5', 'D45S-5', 'D50S-5', 'D55S-5', 'D60S-5', 'D70S-5', 'D80S-5', 'D90S-5', 'D100S-5', 'D110S-5', 'D120S-5', 'D130S-5', 'D140S-5', 'D150S-5', 'D160S-5', 'B15T-5', 'B18T-5', 'B20T-5', 'B25T-5', 'B30T-5'] },

  // HANGCHA FORKLIFTS (Chinese major brand)
  { brand: 'HANGCHA', category: 'forklifts', models: ['CPCD15', 'CPCD18', 'CPCD20', 'CPCD25', 'CPCD30', 'CPCD35', 'CPCD40', 'CPCD45', 'CPCD50', 'CPCD60', 'CPCD70', 'CPCD80', 'CPCD100', 'CPQD15', 'CPQD18', 'CPQD20', 'CPQD25', 'CPQD30', 'CPQD35', 'CPD15', 'CPD18', 'CPD20', 'CPD25', 'CPD30', 'CPD35', 'A15', 'A18', 'A20', 'A25', 'A30', 'A35', 'XF15', 'XF18', 'XF20', 'XF25', 'XF30'] },

  // HELI FORKLIFTS (Chinese major brand)
  { brand: 'HELI', category: 'forklifts', models: ['CPCD15', 'CPCD18', 'CPCD20', 'CPCD25', 'CPCD30', 'CPCD35', 'CPCD40', 'CPCD45', 'CPCD50', 'CPCD60', 'CPCD70', 'CPQD15', 'CPQD18', 'CPQD20', 'CPQD25', 'CPQD30', 'CPD15', 'CPD18', 'CPD20', 'CPD25', 'CPD30', 'G Series G15', 'G Series G18', 'G Series G20', 'G Series G25', 'G Series G30', 'K Series K15', 'K Series K18', 'K Series K20', 'K Series K25'] },

  // BYD FORKLIFTS (Electric specialist)
  { brand: 'BYD', category: 'forklifts', models: ['ECB16', 'ECB18', 'ECB20', 'ECB25', 'ECB30', 'ECB35', 'ECB40', 'ECB45', 'ECB50', 'EFT16', 'EFT18', 'EFT20', 'EFT25', 'EFT30', 'EPT20', 'EPT25', 'EPT30', 'EST16', 'EST18', 'EST20'] },

  // EP EQUIPMENT FORKLIFTS
  { brand: 'EP EQUIPMENT', category: 'forklifts', models: ['CPD15', 'CPD18', 'CPD20', 'CPD25', 'CPD30', 'CPD35', 'EFL151', 'EFL181', 'EFL201', 'EFL251', 'EFL301', 'EFL351', 'EPL151', 'EPL181', 'EPL201', 'EPL251', 'WPL201', 'WPL251', 'RPL201', 'RPL251', 'ESL101', 'ESL121', 'ESL151', 'KPL201', 'KPL251'] },
];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log('🚀 Starting machine reference data seeding...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing machine reference data...');
  await prisma.machineModel.deleteMany();
  await prisma.machineBrand.deleteMany();
  await prisma.machineCategory.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Seed categories
  console.log('📁 Seeding categories...');
  const categoryMap = new Map<string, string>();

  // First, create all parent categories
  for (const cat of categories.filter(c => !c.parent)) {
    const created = await prisma.machineCategory.create({
      data: {
        name: cat.name,
        nameEn: cat.nameEn,
        nameTr: cat.nameTr,
        slug: cat.slug,
        parentId: null,
        sortOrder: categories.indexOf(cat),
      },
    });
    categoryMap.set(cat.slug, created.id);
  }

  // Then create subcategories
  for (const cat of categories.filter(c => c.parent)) {
    const parentId = categoryMap.get(cat.parent!);
    const created = await prisma.machineCategory.create({
      data: {
        name: cat.name,
        nameEn: cat.nameEn,
        nameTr: cat.nameTr,
        slug: cat.slug,
        parentId: parentId,
        sortOrder: categories.indexOf(cat),
      },
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ Created ${categoryMap.size} categories\n`);

  // Seed brands
  console.log('🏭 Seeding brands...');
  const brandMap = new Map<string, string>();

  for (let i = 0; i < allBrands.length; i++) {
    const brandName = allBrands[i];
    const isPopular = popularBrands.includes(brandName);
    const slug = slugify(brandName);

    try {
      const created = await prisma.machineBrand.create({
        data: {
          name: brandName,
          slug: slug,
          isPopular: isPopular,
          sortOrder: isPopular ? popularBrands.indexOf(brandName) : 1000 + i,
        },
      });
      brandMap.set(brandName, created.id);
    } catch (error) {
      // Skip duplicates
      console.log(`⚠️  Skipping duplicate brand: ${brandName}`);
    }
  }
  console.log(`✅ Created ${brandMap.size} brands\n`);

  // Seed models
  console.log('🚜 Seeding machine models...');
  let modelCount = 0;

  for (const entry of machineModels) {
    const brandId = brandMap.get(entry.brand);
    const categoryId = categoryMap.get(entry.category);

    if (!brandId) {
      console.log(`⚠️  Brand not found: ${entry.brand}`);
      continue;
    }

    for (const modelName of entry.models) {
      try {
        await prisma.machineModel.create({
          data: {
            brandId: brandId,
            categoryId: categoryId,
            name: modelName,
            fullName: `${entry.brand} ${modelName}`,
          },
        });
        modelCount++;
      } catch (error) {
        // Skip duplicates
      }
    }
  }
  console.log(`✅ Created ${modelCount} machine models\n`);

  // Summary
  const totalCategories = await prisma.machineCategory.count();
  const totalBrands = await prisma.machineBrand.count();
  const totalModels = await prisma.machineModel.count();

  console.log('📊 Seeding Summary:');
  console.log(`   Categories: ${totalCategories}`);
  console.log(`   Brands: ${totalBrands}`);
  console.log(`   Models: ${totalModels}`);
  console.log('\n✅ Machine reference data seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
