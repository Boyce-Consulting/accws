import { Injectable, signal } from '@angular/core';
import {
  Client,
  WastewaterSystem,
  Product,
  SampleRecord,
  TreatmentPlan,
  Proposal,
  CaseStudy,
} from '../models';
import { WeatherRecord } from '../models/weather.model';
import { SiteVisit } from '../models/site-visit.model';

// ---------------------------------------------------------------------------
// Supporting types for dashboard activity and alerts
// ---------------------------------------------------------------------------

export interface ActivityLogItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'sample' | 'treatment' | 'proposal' | 'system' | 'client' | 'visit';
}

export interface Alert {
  id: string;
  message: string;
  severity: 'warning' | 'danger' | 'info';
  systemId?: string;
  date: string;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

const MOCK_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Athabasca County',
    type: 'multi-system',
    status: 'active',
    contactName: 'Jackson Roth',
    contactEmail: 'jackson.roth@athabascacounty.com',
    contactPhone: '(780) 675-2273',
    address: '3602 48 Ave, Athabasca, AB T9S 1M8',
    province: 'AB',
    systemIds: ['sys-001', 'sys-002', 'sys-003', 'sys-004', 'sys-005'],
    proposalIds: ['prop-001'],
    notes:
      'Multi-system rural municipality. Five lagoon systems serving small communities across the county. Long-standing client with annual treatment programs.',
    createdAt: '2022-03-15T00:00:00.000Z',
  },
  {
    id: 'cli-002',
    name: 'Dawson City WWTP',
    type: 'single-use',
    status: 'active',
    contactName: 'Anthony Clarke',
    contactEmail: 'aclarke@dawsoncity.ca',
    contactPhone: '(867) 993-7400',
    address: '1107 Front St, Dawson City, YT Y0B 1G0',
    province: 'YT',
    systemIds: ['sys-006'],
    proposalIds: ['prop-002'],
    notes:
      'Municipal WWTP in the Yukon. Experienced a system upset (convergence event) requiring emergency bioaugmentation. Proposal accepted and treatment delivered.',
    createdAt: '2023-09-01T00:00:00.000Z',
  },
  {
    id: 'cli-003',
    name: 'South Red Deer Regional Wastewater Commission',
    type: 'regional-collection',
    status: 'active',
    contactName: 'Don Munro',
    contactEmail: 'don.munro@srdrwc.ca',
    contactPhone: '(403) 227-3540',
    address: 'Red Deer County, AB',
    province: 'AB',
    systemIds: [
      'sys-007',
      'sys-008',
      'sys-009',
      'sys-010',
      'sys-011',
      'sys-012',
      'sys-013',
    ],
    proposalIds: ['prop-003'],
    notes:
      'Regional lift-station network serving seven communities in the Red Deer corridor. Total service population ~22,431. Secondary contact: Travis Green.',
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'cli-004',
    name: 'Town of Ponoka',
    type: 'single-use',
    status: 'active',
    contactName: 'Public Works Manager',
    contactEmail: 'publicworks@ponoka.ca',
    contactPhone: '(403) 783-4431',
    address: '5102 43 Ave, Ponoka, AB T4J 1R7',
    province: 'AB',
    systemIds: [],
    proposalIds: [],
    notes:
      'Case study client. Three-year adaptive bioaugmentation program delivered exceptional results. cBOD reduced 76.9%, ammonia reduced 74.5%.',
    createdAt: '2021-01-01T00:00:00.000Z',
  },
  {
    id: 'cli-005',
    name: 'Town of Stettler',
    type: 'single-use',
    status: 'active',
    contactName: 'Utilities Supervisor',
    contactEmail: 'utilities@stettler.ca',
    contactPhone: '(403) 742-8305',
    address: '5031 50 Ave, Stettler, AB T0C 2L2',
    province: 'AB',
    systemIds: [],
    proposalIds: [],
    notes:
      'Case study client. Two-year sludge reduction program across five lagoon cells. Cell D achieved -793 m³ total sludge change.',
    createdAt: '2021-06-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Wastewater Systems
// ---------------------------------------------------------------------------

const MOCK_SYSTEMS: WastewaterSystem[] = [
  // ---- Athabasca County: Colinton Lagoon ----
  {
    id: 'sys-001',
    clientId: 'cli-001',
    name: 'Colinton Lagoon',
    type: 'lagoon',
    status: 'attention',
    location: { lat: 54.43, lng: -113.58 },
    province: 'AB',
    commissioned: 1979,
    population: 249,
    flowRate: 30,
    description:
      'Single-cell facultative lagoon serving the hamlet of Colinton. Significant sludge accumulation (~7,637 m³, approx. 40% of design volume). Annual bioaugmentation program in place.',
    cells: [
      {
        id: 'cel-001-1',
        name: 'Cell 1',
        areaAcres: 3.68,
        areaM2: 14896,
        volumeM3: 15950,
        function: 'facultative',
        retentionTimeDays: 256,
        adjustedRetentionDays: 157,
        sludgeVolumeM3: 7637,
        depth: 1.07,
      },
      {
        id: 'cel-001-2',
        name: 'Inlet Zone',
        areaAcres: 0.11,
        areaM2: 445,
        volumeM3: 178,
        function: 'anaerobic',
      },
      {
        id: 'cel-001-3',
        name: 'Truck Dump',
        areaAcres: 0.21,
        areaM2: 850,
        volumeM3: 340,
        function: 'anaerobic',
      },
      {
        id: 'cel-001-4',
        name: 'Facultative Zone',
        areaAcres: 0.28,
        areaM2: 1133,
        volumeM3: 453,
        function: 'facultative',
      },
    ],
  },

  // ---- Athabasca County: Rochester Lagoon ----
  {
    id: 'sys-002',
    clientId: 'cli-001',
    name: 'Rochester Lagoon',
    type: 'lagoon',
    status: 'healthy',
    location: { lat: 54.38, lng: -113.23 },
    province: 'AB',
    commissioned: 1981,
    population: 79,
    flowRate: 14.4,
    description:
      'Two-cell anaerobic/facultative lagoon with evaporation cell. Small rural system serving the hamlet of Rochester.',
    cells: [
      {
        id: 'cel-002-1',
        name: 'Cell 1',
        areaAcres: 0.13,
        areaM2: 518,
        volumeM3: 904,
        function: 'anaerobic',
        retentionTimeDays: 46,
        adjustedRetentionDays: 26,
      },
      {
        id: 'cel-002-2',
        name: 'Cell 2',
        areaAcres: 0.12,
        areaM2: 466,
        volumeM3: 816,
        function: 'facultative',
        retentionTimeDays: 41,
        adjustedRetentionDays: 34,
      },
      {
        id: 'cel-002-3',
        name: 'Evap Cell 3',
        areaAcres: 0.56,
        areaM2: 2266,
        volumeM3: 0,
        function: 'evaporative',
      },
    ],
  },

  // ---- Athabasca County: Grassland Lagoon ----
  {
    id: 'sys-003',
    clientId: 'cli-001',
    name: 'Grassland Lagoon',
    type: 'lagoon',
    status: 'healthy',
    location: { lat: 54.51, lng: -112.13 },
    province: 'AB',
    population: 46,
    flowRate: 12,
    description:
      'Two-cell lagoon with oversized storage capacity relative to population. Very long retention times. Serves the small hamlet of Grassland.',
    cells: [
      {
        id: 'cel-003-1',
        name: 'Cell 1',
        areaAcres: 3.23,
        areaM2: 13077,
        volumeM3: 9330,
        function: 'anaerobic',
        retentionTimeDays: 811,
        adjustedRetentionDays: 733,
      },
      {
        id: 'cel-003-2',
        name: 'Cell 2',
        areaAcres: 7.9,
        areaM2: 31968,
        volumeM3: 60531,
        function: 'storage',
      },
    ],
  },

  // ---- Athabasca County: Wandering River Lagoon ----
  {
    id: 'sys-004',
    clientId: 'cli-001',
    name: 'Wandering River Lagoon',
    type: 'lagoon',
    status: 'healthy',
    location: { lat: 55.07, lng: -112.47 },
    province: 'AB',
    commissioned: 1983,
    description:
      'Two-cell anaerobic/facultative lagoon serving the hamlet of Wandering River. Commissioned in 1983.',
    cells: [
      {
        id: 'cel-004-1',
        name: 'Cell 1',
        areaAcres: 0.893,
        areaM2: 3614,
        volumeM3: 7228,
        function: 'anaerobic',
      },
      {
        id: 'cel-004-2',
        name: 'Cell 2',
        areaAcres: 2.9,
        areaM2: 11733,
        volumeM3: 23466,
        function: 'facultative',
      },
    ],
  },

  // ---- Athabasca County: Island Lake Lagoon ----
  {
    id: 'sys-005',
    clientId: 'cli-001',
    name: 'Island Lake Lagoon',
    type: 'lagoon',
    status: 'attention',
    location: { lat: 55.45, lng: -111.85 },
    province: 'AB',
    population: 175,
    flowRate: 45,
    description:
      'Facultative lagoon with separate treatment zone. Serves the Island Lake South area. Population includes a mix of year-round and seasonal residents.',
    cells: [
      {
        id: 'cel-005-1',
        name: 'Cell 1',
        areaAcres: 4.06,
        areaM2: 16412,
        volumeM3: 13500,
        function: 'facultative',
        retentionTimeDays: 309,
        adjustedRetentionDays: 173,
      },
      {
        id: 'cel-005-2',
        name: 'Treatment Zone',
        areaAcres: 0.74,
        areaM2: 2995,
        volumeM3: 1198,
        function: 'treatment',
      },
    ],
  },

  // ---- Dawson City WWTP ----
  {
    id: 'sys-006',
    clientId: 'cli-002',
    name: 'Dawson City WWTP',
    type: 'wwtp',
    status: 'healthy',
    location: { lat: 64.06, lng: -139.43 },
    province: 'YT',
    flowRate: 3000,
    description:
      'Municipal wastewater treatment plant serving Dawson City. Experienced a convergence event (system upset) in late 2023, requiring emergency bioaugmentation with VitaStim Polar and SmartBOD. System has since recovered.',
    cells: [],
  },

  // ---- SRDRWC: Olds Lift Station ----
  {
    id: 'sys-007',
    clientId: 'cli-003',
    name: 'Olds Lift Station',
    type: 'lift-station',
    status: 'healthy',
    location: { lat: 51.79, lng: -114.11 },
    province: 'AB',
    population: 9682,
    flowRate: 2893,
    description:
      'Primary lift station for the Town of Olds. Largest contributor to the SRDRWC regional collection network.',
    cells: [],
  },

  // ---- SRDRWC: Bowden Lift Station ----
  {
    id: 'sys-008',
    clientId: 'cli-003',
    name: 'Bowden Lift Station',
    type: 'lift-station',
    status: 'healthy',
    location: { lat: 51.93, lng: -114.02 },
    province: 'AB',
    population: 1280,
    flowRate: 379,
    description:
      "Lift station serving the Town of Bowden's contribution to the regional collection system.",
    cells: [],
  },

  // ---- SRDRWC: Innisfail Lift Station ----
  {
    id: 'sys-009',
    clientId: 'cli-003',
    name: 'Innisfail Lift Station',
    type: 'lift-station',
    status: 'attention',
    location: { lat: 52.03, lng: -113.95 },
    province: 'AB',
    population: 7985,
    flowRate: 2264,
    description:
      'Second largest contributor in the SRDRWC network. Periodic H2S odor complaints from adjacent properties — Bug on a Rope treatment program in progress.',
    cells: [],
  },

  // ---- SRDRWC: Penhold Lift Station ----
  {
    id: 'sys-010',
    clientId: 'cli-003',
    name: 'Penhold Lift Station',
    type: 'lift-station',
    status: 'healthy',
    location: { lat: 52.14, lng: -113.87 },
    province: 'AB',
    population: 3484,
    flowRate: 166,
    description:
      'Lift station serving the Town of Penhold in the SRDRWC network.',
    cells: [],
  },

  // ---- SRDRWC: West 1 Lift Station ----
  {
    id: 'sys-011',
    clientId: 'cli-003',
    name: 'W1 Lift Station',
    type: 'lift-station',
    status: 'healthy',
    location: { lat: 52.21, lng: -113.82 },
    province: 'AB',
    flowRate: 628,
    description: 'West 1 regional collection lift station in the SRDRWC network.',
    cells: [],
  },

  // ---- SRDRWC: West 2 Lift Station ----
  {
    id: 'sys-012',
    clientId: 'cli-003',
    name: 'W2 Lift Station',
    type: 'lift-station',
    status: 'healthy',
    location: { lat: 52.18, lng: -113.85 },
    province: 'AB',
    flowRate: 333,
    description: 'West 2 regional collection lift station in the SRDRWC network.',
    cells: [],
  },

  // ---- SRDRWC: West 3 Lift Station ----
  {
    id: 'sys-013',
    clientId: 'cli-003',
    name: 'W3 Lift Station',
    type: 'lift-station',
    status: 'healthy',
    location: { lat: 52.23, lng: -113.79 },
    province: 'AB',
    flowRate: 1276,
    description: 'West 3 regional collection lift station in the SRDRWC network.',
    cells: [],
  },
];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const MOCK_PRODUCTS: Product[] = [
  // Cold-weather
  {
    id: 'prod-001',
    name: 'VitaStim Polar',
    category: 'cold-weather',
    description:
      'Cold-weather microbial blend fortified with 23 vitamins and biostimulants. Maintains biological activity during ice-on conditions and spring start-up. Primary product for Alberta and northern lagoon programs.',
    unit: '30lb Pail',
    price: 920,
    activeIngredient: 'Psychrotrophic microbial consortium + vitamin complex',
    applications: [
      'Cold-climate lagoons',
      'Winter bioaugmentation',
      'Spring activation',
      'WWTP upset recovery',
    ],
    temperatureRange: 'Active at 1°C and above',
  },
  {
    id: 'prod-002',
    name: 'VitaStim Sludge Reducer',
    category: 'cold-weather',
    description:
      'Warm-season sludge digestion microbial blend. Applied during summer months to break down accumulated sludge and extend lagoon service life.',
    unit: '30lb Pail',
    price: 870,
    activeIngredient: 'Thermophilic and mesophilic sludge-digesting microorganisms',
    applications: ['Sludge reduction', 'Summer lagoon treatment', 'BOD reduction'],
    temperatureRange: 'Optimal 15°C–30°C',
  },
  {
    id: 'prod-003',
    name: 'Polar Rx',
    category: 'cold-weather',
    description:
      'Cold-weather sludge treatment in pelletized bag format. Sinks to sludge layer for direct contact at very low temperatures.',
    unit: '30lb Bag',
    price: 890,
    activeIngredient: 'Cold-active sludge-digesting microorganisms in pellet matrix',
    applications: ['Cold-weather sludge treatment', 'Ice-on application', 'Sludge depth reduction'],
    temperatureRange: 'Active at 1.5°C and above',
  },
  {
    id: 'prod-004',
    name: 'Sludge Rx',
    category: 'cold-weather',
    description:
      'Pelletized microbial blend for warm-month sludge treatment. Easy to apply — drops through the water column to reach the sludge layer.',
    unit: '30lb Bag',
    price: 810,
    activeIngredient: 'Mesophilic sludge-digesting microorganisms in pellet matrix',
    applications: ['Warm-season sludge reduction', 'Sludge layer treatment', 'VSS reduction'],
    temperatureRange: 'Optimal 10°C–25°C',
  },

  // Carbon-oxygen
  {
    id: 'prod-005',
    name: 'SmartBOD',
    category: 'carbon-oxygen',
    description:
      'Advanced carbon source providing biological life support for stressed or upset biological systems. Rapidly restores BOD and microbial diversity.',
    unit: '50lb Bag',
    price: 520,
    applications: [
      'System upset recovery',
      'BOD augmentation',
      'Biological restart',
      'Nutrient deficiency correction',
    ],
  },
  {
    id: 'prod-006',
    name: 'OxyPaks XL',
    category: 'carbon-oxygen',
    description:
      'Granular oxygen-releasing compound for supplemental aeration in lagoons and collection systems. Improves dissolved oxygen levels in anaerobic zones.',
    unit: '50lb Pail',
    price: 600,
    activeIngredient: 'Calcium peroxide compound',
    applications: [
      'Dissolved oxygen supplementation',
      'Anaerobic zone treatment',
      'Odor suppression via O2 enhancement',
    ],
  },

  // Collection-odor
  {
    id: 'prod-007',
    name: 'Bug on a Rope Sr',
    category: 'collection-odor',
    description:
      'Slow-dissolving biological brick (4×9 lb) suspended in lift station wet wells. Continuously releases FOG and H2S control microorganisms over 30–90 days.',
    unit: '4×9lb Pack',
    price: 990,
    activeIngredient: 'Lipase/protease/cellulase enzyme blend + sulfide-oxidizing bacteria',
    applications: ['Lift station H2S control', 'FOG management', 'Collection system odor control'],
  },
  {
    id: 'prod-008',
    name: 'Bug on a Rope Jr',
    category: 'collection-odor',
    description:
      'Smaller version of Bug on a Rope (4×3 lb) for smaller lift stations and wet wells with lower flow rates.',
    unit: '4×3lb Pack',
    price: 540,
    activeIngredient: 'Lipase/protease/cellulase enzyme blend + sulfide-oxidizing bacteria',
    applications: [
      'Small lift station H2S control',
      'Smaller wet wells',
      'Residential collection odor',
    ],
  },
  {
    id: 'prod-009',
    name: 'DaZZel Sewer Sweetener',
    category: 'collection-odor',
    description:
      'Non-H2S odor remediation liquid targeting mercaptans, amines, and other malodorous compounds in collection systems.',
    unit: '20L Jug',
    price: 450,
    applications: [
      'Non-sulfide odor remediation',
      'Sewer sweetening',
      'Community complaint response',
    ],
  },
  {
    id: 'prod-010',
    name: 'De-Sulph-A-Nator',
    category: 'collection-odor',
    description:
      'Reactive precision sulfide control liquid for targeted H2S treatment in high-odor problem areas.',
    unit: '20L Jug',
    price: 520,
    activeIngredient: 'Oxidizing agent blend for sulfide neutralization',
    applications: [
      'Targeted H2S elimination',
      'Precision sulfide control',
      'Odor emergency response',
    ],
  },
  {
    id: 'prod-011',
    name: 'OxyFresh',
    category: 'collection-odor',
    description:
      'Additional H2S treatment option for collection systems. Liquid formulation for dosing into force mains or wet wells.',
    unit: '20L Jug',
    price: 550,
    applications: ['H2S treatment', 'Force main odor control', 'Wet well dosing'],
  },

  // Specialty
  {
    id: 'prod-012',
    name: 'Total Floc',
    category: 'specialty',
    description:
      'Combined phosphorus binding and bacterial additive for polishing effluent quality. Reduces total phosphorus while supporting biological activity.',
    unit: '55gal Drum',
    price: 6810,
    applications: ['Phosphorus removal', 'Effluent polishing', 'Regulatory compliance support'],
  },
  {
    id: 'prod-013',
    name: 'GreaseZilla',
    category: 'specialty',
    description:
      'FOG (fats, oils and grease) management product for collection systems and lagoon inlets. Prevents grease cap formation and blockages.',
    unit: '30lb Pail',
    price: 780,
    activeIngredient: 'Lipase-producing microbial blend',
    applications: ['FOG degradation', 'Grease cap prevention', 'Collection system maintenance'],
  },
  {
    id: 'prod-014',
    name: 'Qwik-Zyme P',
    category: 'specialty',
    description:
      'Protein-targeting enzyme blend for breaking down protein-based solids in lagoons and wastewater systems. Reduces TSS and BOD from protein sources.',
    unit: '30lb Pail',
    price: 680,
    activeIngredient: 'Protease enzyme complex',
    applications: ['Protein degradation', 'TSS reduction', 'BOD control from protein sources'],
  },
  {
    id: 'prod-015',
    name: 'Qwik-Zyme L',
    category: 'specialty',
    description:
      'Lipid-targeting enzyme blend for breaking down lipid-based compounds. Works synergistically with Qwik-Zyme P in combined treatment programs.',
    unit: '30lb Pail',
    price: 680,
    activeIngredient: 'Lipase enzyme complex',
    applications: ['Lipid degradation', 'FOG reduction', 'BOD control from lipid sources'],
  },
];

// ---------------------------------------------------------------------------
// Sample Records
// ---------------------------------------------------------------------------

const MOCK_SAMPLES: SampleRecord[] = [
  // --- Colinton effluent history (real historical data) ---
  {
    id: 'smp-001',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2018-10-16',
    type: 'effluent',
    parameters: {
      ammonia: 8.06,
      bod: 20.3,
      tss: 42.0,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'Pre-treatment baseline sample.',
  },
  {
    id: 'smp-002',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2020-07-15',
    type: 'effluent',
    parameters: {
      ammonia: 3.24,
      bod: 26.3,
      tss: 48.0,
      ph: 7.21,
      cod: 138,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'Mid-season sample. BOD slightly elevated.',
  },
  {
    id: 'smp-003',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2022-05-26',
    type: 'effluent',
    parameters: {
      ammonia: 8.2,
      bod: 56.7,
      tss: 66.0,
      cod: 199,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'Spring sample after ice-off. Elevated BOD and TSS indicating sludge disturbance.',
  },
  {
    id: 'smp-004',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2023-10-05',
    type: 'effluent',
    parameters: {
      ammonia: 4.7,
      bod: 18.6,
      tss: 51.0,
      cod: 109,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'Fall sample. BOD within acceptable range following summer treatment program.',
  },
  {
    id: 'smp-005',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-10-17',
    type: 'effluent',
    parameters: {
      ammonia: 6.89,
      bod: 22.0,
      tss: 69.0,
      cod: 160,
      phosphorus: 2.17,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'Annual fall regulatory sample. Phosphorus tested for the first time. TSS slightly elevated.',
  },

  // --- Colinton sludge survey ---
  {
    id: 'smp-006',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2024-08-20',
    type: 'sludge',
    parameters: {},
    sludgeSurvey: {
      cellId: 'cel-001-1',
      cellName: 'Cell 1',
      year: 2024,
      volumeM3: 7637,
      totalSolidsPct: 3.8,
      volatileSolidsPct: 65.2,
      specificGravity: 1.04,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'Sludge survey confirming ~40% volume reduction from design capacity. Sludge removal required within 3–5 years.',
  },

  // --- Island Lake effluent ---
  {
    id: 'smp-007',
    systemId: 'sys-005',
    cellId: 'cel-005-1',
    date: '2025-07-14',
    type: 'effluent',
    parameters: {
      ammonia: 12.4,
      bod: 34.8,
      tss: 58.0,
      cod: 187,
      ph: 7.45,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'Summer compliance sample. Ammonia elevated — treatment plan review recommended.',
  },

  // --- Dawson City influent/effluent during upset ---
  {
    id: 'smp-008',
    systemId: 'sys-006',
    date: '2023-11-03',
    type: 'influent',
    parameters: {
      bod: 280,
      tss: 310,
      ammonia: 42.0,
      cod: 620,
    },
    notes: 'Convergence event. Influent BOD and TSS significantly above design parameters.',
    collectedBy: 'Anthony Clarke',
  },
  {
    id: 'smp-009',
    systemId: 'sys-006',
    date: '2024-02-15',
    type: 'effluent',
    parameters: {
      bod: 18.5,
      tss: 22.0,
      ammonia: 5.3,
      cod: 74,
      ph: 7.3,
      dissolvedOxygen: 4.2,
    },
    notes: 'Post-treatment recovery sample. System returning to normal operating parameters.',
    collectedBy: 'Anthony Clarke',
  },

  // --- Innisfail Lift Station H2S monitoring ---
  {
    id: 'smp-010',
    systemId: 'sys-009',
    date: '2025-09-22',
    type: 'effluent',
    parameters: {
      h2s: 18.4,
    },
    notes: 'H2S spot reading at wet well. Elevated — Bug on a Rope Sr deployment recommended.',
    collectedBy: 'Don Munro',
  },

  // --- Colinton monthly effluent samples 2025 (backfill for progress charts) ---
  {
    id: 'smp-011',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-01-15',
    type: 'effluent',
    parameters: {
      bod: 35.2,
      tss: 40.5,
      ammonia: 7.8,
      ph: 7.1,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'January monthly sample. Under-ice conditions. BOD elevated.',
  },
  {
    id: 'smp-012',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-02-12',
    type: 'effluent',
    parameters: {
      bod: 33.8,
      tss: 39.0,
      ammonia: 7.5,
      ph: 7.15,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'February monthly. Slight improvement from January.',
  },
  {
    id: 'smp-013',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-03-18',
    type: 'effluent',
    parameters: {
      bod: 31.4,
      tss: 37.2,
      ammonia: 7.1,
      ph: 7.2,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'March sample. Ice starting to thin. VitaStim Polar application beginning.',
  },
  {
    id: 'smp-014',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-04-16',
    type: 'effluent',
    parameters: {
      bod: 29.0,
      tss: 35.8,
      ammonia: 6.6,
      ph: 7.25,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'April post ice-off. Biology responding to spring treatment.',
  },
  {
    id: 'smp-015',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-05-14',
    type: 'effluent',
    parameters: {
      bod: 26.5,
      tss: 33.0,
      ammonia: 5.9,
      ph: 7.3,
      cod: 145,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'May sample. Continued improvement with spring bioaugmentation.',
  },
  {
    id: 'smp-016',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-06-11',
    type: 'effluent',
    parameters: {
      bod: 24.1,
      tss: 30.5,
      ammonia: 5.2,
      ph: 7.35,
      cod: 132,
    },
    collectedBy: 'Ray Menard',
    notes: 'June sample. Summer sludge reduction program started.',
  },
  {
    id: 'smp-017',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-07-16',
    type: 'effluent',
    parameters: {
      bod: 22.3,
      tss: 28.0,
      ammonia: 4.8,
      ph: 7.4,
      cod: 124,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'July mid-summer. Sludge Reducer and Sludge Rx performing well.',
  },
  {
    id: 'smp-018',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-08-13',
    type: 'effluent',
    parameters: {
      bod: 20.8,
      tss: 26.5,
      ammonia: 4.4,
      ph: 7.38,
      cod: 118,
    },
    collectedBy: 'Ray Menard',
    notes: 'August sample. BOD approaching target range. TSS trending down.',
  },
  {
    id: 'smp-019',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-09-10',
    type: 'effluent',
    parameters: {
      bod: 19.5,
      tss: 24.0,
      ammonia: 5.0,
      ph: 7.32,
      cod: 112,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'September. End of summer program. Excellent improvement trajectory.',
  },
  {
    id: 'smp-020',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-10-17',
    type: 'effluent',
    parameters: {
      bod: 18.9,
      tss: 22.5,
      ammonia: 5.5,
      ph: 7.28,
      cod: 108,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'October regulatory sample. BOD well within limits. Fall Polar application started.',
  },
  {
    id: 'smp-021',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-11-12',
    type: 'effluent',
    parameters: {
      bod: 18.2,
      tss: 21.0,
      ammonia: 6.0,
      ph: 7.22,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'November pre-freeze. Biology maintained well heading into winter.',
  },
  {
    id: 'smp-022',
    systemId: 'sys-001',
    cellId: 'cel-001-1',
    date: '2025-12-10',
    type: 'effluent',
    parameters: {
      bod: 18.0,
      tss: 20.2,
      ammonia: 6.3,
      ph: 7.18,
    },
    collectedBy: 'Jacy Hingley',
    notes: 'December under-ice sample. BOD stable at 18 mg/L. Excellent year-end result.',
  },
];

// ---------------------------------------------------------------------------
// Weather Snapshots
// ---------------------------------------------------------------------------

const MOCK_WEATHER: WeatherRecord[] = [
  {
    id: 'wx-001',
    systemId: 'sys-001',
    date: '2026-03-09',
    weather: {
      temperatureC: -5,
      windSpeedKmh: 32,
      windDirection: 'NW',
      humidityPct: 68,
      precipitationMm: 0,
      conditions: 'Partly cloudy, blowing snow',
    },
  },
  {
    id: 'wx-002',
    systemId: 'sys-006',
    date: '2026-03-09',
    weather: {
      temperatureC: -15,
      windSpeedKmh: 12,
      windDirection: 'N',
      humidityPct: 74,
      precipitationMm: 1.2,
      conditions: 'Light snow, overcast',
    },
  },
  {
    id: 'wx-003',
    systemId: 'sys-009',
    date: '2026-03-09',
    weather: {
      temperatureC: -3,
      windSpeedKmh: 18,
      windDirection: 'W',
      humidityPct: 55,
      precipitationMm: 0,
      conditions: 'Clear, chinook arch visible',
    },
  },
  {
    id: 'wx-004',
    systemId: 'sys-010',
    date: '2026-03-09',
    weather: {
      temperatureC: -4,
      windSpeedKmh: 22,
      windDirection: 'W',
      humidityPct: 58,
      precipitationMm: 0,
      conditions: 'Clear, gusty',
    },
  },
];

// ---------------------------------------------------------------------------
// Site Visits
// ---------------------------------------------------------------------------

const MOCK_SITE_VISITS: SiteVisit[] = [
  // --- Colinton Lagoon visits ---
  {
    id: 'sv-001',
    systemId: 'sys-001',
    clientId: 'cli-001',
    treatmentPlanId: 'trt-001',
    visitDate: '2025-12-15',
    visitedBy: 'Jacy Hingley',
    status: 'completed',
    activities: [
      { type: 'product-application', description: 'Applied VitaStim Polar through ice hole' },
    ],
    observation: {
      systemType: 'lagoon',
      sludgePresent: true,
      sludgeAppearance: ['dark'],
      sludgeSurfaceCoveragePct: 0,
      waterColour: ['dark-brown'],
      algaePresent: false,
      algaeType: [],
      cattailSeverity: 'none',
      odour: { intensity: 1, nature: ['earthy'] },
      productApplications: [
        { productId: 'prod-001', productName: 'VitaStim Polar', quantity: 30, unit: 'lb', method: 'Poured through ice access hole at inlet zone', zone: 'Cell 1' },
      ],
    },
    notes: 'Winter check. Applied 1 pail VitaStim Polar through ice hole near inlet. Sludge gas bubbles visible at ice edge. No discharge occurring.',
    photoIds: [],
    followUpRequired: false,
    createdAt: '2025-12-15T11:45:00Z',
  },
  {
    id: 'sv-002',
    systemId: 'sys-001',
    clientId: 'cli-001',
    treatmentPlanId: 'trt-001',
    visitDate: '2026-01-20',
    visitedBy: 'Jacy Hingley',
    status: 'completed',
    activities: [
      { type: 'product-application', description: 'Applied VitaStim Polar through augered ice hole' },
    ],
    observation: {
      systemType: 'lagoon',
      sludgePresent: false,
      waterColour: [],
      algaePresent: false,
      algaeType: [],
      cattailSeverity: 'none',
      odour: { intensity: 0, nature: ['none'] },
      productApplications: [
        { productId: 'prod-001', productName: 'VitaStim Polar', quantity: 30, unit: 'lb', method: 'Applied through augered ice hole at inlet' },
      ],
    },
    notes: 'January application completed. Ice thickness 48 cm. Had to auger new access hole — previous one frozen over. Freeboard adequate. Berm condition good despite heavy snowfall.',
    photoIds: [],
    followUpRequired: false,
    createdAt: '2026-01-20T12:15:00Z',
  },
  {
    id: 'sv-003',
    systemId: 'sys-001',
    clientId: 'cli-001',
    treatmentPlanId: 'trt-001',
    visitDate: '2026-02-18',
    visitedBy: 'Ray Menard',
    status: 'completed',
    activities: [
      { type: 'product-application', description: 'Applied VitaStim Polar and Polar Rx' },
    ],
    observation: {
      systemType: 'lagoon',
      sludgePresent: true,
      sludgeAppearance: ['dark', 'loose'],
      sludgeSurfaceCoveragePct: 0,
      waterColour: ['green'],
      algaePresent: false,
      algaeType: [],
      cattailSeverity: 'none',
      odour: { intensity: 2, nature: ['hydrogen-sulfide'] },
      productApplications: [
        { productId: 'prod-001', productName: 'VitaStim Polar', quantity: 30, unit: 'lb', method: 'Applied through existing ice hole' },
        { productId: 'prod-003', productName: 'Polar Rx', quantity: 30, unit: 'lb', method: 'Pellets distributed through ice hole to reach sludge layer' },
      ],
    },
    notes: 'February visit — applied VitaStim Polar and Polar Rx. Slight septic odour suggests anaerobic activity increasing under ice. Normal for this time of year. Ice thinning slightly compared to January.',
    photoIds: [],
    followUpRequired: false,
    createdAt: '2026-02-18T11:30:00Z',
  },

  // --- Lift station visits (Innisfail & Penhold) ---
  {
    id: 'sv-004',
    systemId: 'sys-009',
    clientId: 'cli-003',
    visitDate: '2025-12-08',
    visitedBy: 'Jacy Hingley',
    status: 'completed',
    activities: [
      { type: 'product-application', description: 'Replaced Bug on a Rope Sr in wet well' },
      { type: 'flow-meter-reading', description: 'Flow meter check' },
    ],
    observation: {
      systemType: 'lift-station',
      fogPresent: true,
      fogAppearance: ['matts'],
      fogSurfaceCoveragePct: 20,
      odour: { intensity: 3, nature: ['hydrogen-sulfide'] },
      h2sReading: 14.2,
      productApplications: [
        { productId: 'prod-007', productName: 'Bug on a Rope Sr', quantity: 36, unit: 'lb', method: 'Suspended 4x9lb pack on rope at mid-depth in wet well' },
      ],
    },
    notes: 'Replaced Bug on a Rope. Previous pack ~70% dissolved after 55 days. FOG mat present but not as thick as October. H2S at 14.2 ppm — down from 18.4 in September. Trend improving.',
    photoIds: [],
    followUpRequired: true,
    followUpNotes: 'Monitor H2S trend. Target below 10 ppm by next visit.',
    nextVisitDate: '2026-02-03',
    createdAt: '2025-12-08T14:30:00Z',
  },
  {
    id: 'sv-005',
    systemId: 'sys-009',
    clientId: 'cli-003',
    visitDate: '2026-02-03',
    visitedBy: 'Ray Menard',
    status: 'completed',
    activities: [
      { type: 'product-application', description: 'Replaced Bug on a Rope Sr unit' },
    ],
    observation: {
      systemType: 'lift-station',
      fogPresent: true,
      fogAppearance: ['globules'],
      fogSurfaceCoveragePct: 5,
      odour: { intensity: 2, nature: ['hydrogen-sulfide'] },
      h2sReading: 8.6,
      productApplications: [
        { productId: 'prod-007', productName: 'Bug on a Rope Sr', quantity: 36, unit: 'lb', method: 'Replaced rope unit in wet well' },
      ],
    },
    notes: 'H2S now at 8.6 ppm — below the 10 ppm action threshold for the first time. FOG layer dramatically reduced. Bug on a Rope program clearly working. Next replacement due early April.',
    photoIds: [],
    followUpRequired: false,
    createdAt: '2026-02-03T11:45:00Z',
  },
  {
    id: 'sv-006',
    systemId: 'sys-010',
    clientId: 'cli-003',
    visitDate: '2026-01-14',
    visitedBy: 'Jacy Hingley',
    status: 'completed',
    activities: [
      { type: 'flow-meter-reading', description: 'Routine flow meter and H2S check' },
    ],
    observation: {
      systemType: 'lift-station',
      fogPresent: false,
      odour: { intensity: 1, nature: ['none'] },
      h2sReading: 3.1,
      productApplications: [],
    },
    notes: 'Routine check on Penhold station. System performing well. No product application needed — Bug on a Rope from November still active (~50% dissolved). H2S well within acceptable range.',
    photoIds: [],
    followUpRequired: false,
    createdAt: '2026-01-14T15:00:00Z',
  },

  // --- Dawson City WWTP visit ---
  {
    id: 'sv-007',
    systemId: 'sys-006',
    clientId: 'cli-002',
    visitDate: '2026-01-28',
    visitedBy: 'Jacy Hingley',
    status: 'completed',
    activities: [
      { type: 'product-application', description: 'VitaStim Polar maintenance dose' },
      { type: 'sampling', description: 'MLSS and DO measurements' },
    ],
    observation: {
      systemType: 'wwtp',
      odour: { intensity: 1, nature: ['none'] },
      effluentClarity: 'clear',
      productApplications: [
        { productId: 'prod-001', productName: 'VitaStim Polar', quantity: 30, unit: 'lb', method: 'Added to aeration basin via surface application' },
      ],
    },
    notes: 'Annual winter check. System fully recovered from 2023 convergence event. Biology healthy, DO at 5.8 mg/L. Applied 1 pail VitaStim Polar as maintenance dose. Clarifier performing well.',
    photoIds: [],
    followUpRequired: false,
    createdAt: '2026-01-28T12:30:00Z',
  },

  // --- Scheduled future visit ---
  {
    id: 'sv-008',
    systemId: 'sys-001',
    clientId: 'cli-001',
    treatmentPlanId: 'trt-001',
    visitDate: '2026-03-22',
    visitedBy: 'Jacy Hingley',
    status: 'scheduled',
    activities: [
      { type: 'product-application', description: 'Spring VitaStim Polar application' },
      { type: 'sampling', description: 'Post-thaw effluent sampling' },
    ],
    observation: {
      systemType: 'lagoon',
      sludgePresent: false,
      waterColour: [],
      algaePresent: false,
      algaeType: [],
      cattailSeverity: 'none',
      productApplications: [],
    },
    notes: 'Scheduled spring ice-off inspection and first spring VitaStim Polar application. Check ice conditions, freeboard, and berm integrity after winter.',
    photoIds: [],
    followUpRequired: false,
    createdAt: '2026-03-01T08:00:00Z',
  },

  // --- In-progress visit ---
  {
    id: 'sv-009',
    systemId: 'sys-004',
    clientId: 'cli-001',
    visitDate: '2026-03-09',
    visitedBy: 'Jacy Hingley',
    status: 'in-progress',
    activities: [
      { type: 'product-application', description: 'Bio Energizer application' },
      { type: 'aeration-maintenance', description: 'Checking aerator function' },
    ],
    observation: {
      systemType: 'lagoon',
      sludgePresent: true,
      sludgeAppearance: ['dark'],
      sludgeSurfaceCoveragePct: 8,
      waterColour: ['dark-brown'],
      algaePresent: true,
      algaeType: ['brown'],
      cattailSeverity: 'severe',
      odour: { intensity: 3, nature: ['ammonia', 'earthy'] },
      productApplications: [
        { productId: 'prod-001', productName: 'Bio Energizer', quantity: 25, unit: 'L', method: 'spray', zone: 'Cell 1' },
      ],
    },
    photoIds: ['ph-016', 'ph-017'],
    notes: 'Cattail encroachment is concerning. Aerator #2 not functioning — needs repair.',
    followUpRequired: true,
    followUpNotes: 'Aerator repair needed. Schedule cattail management for spring.',
    createdAt: '2026-03-09T10:00:00Z',
  },

  // --- Complaint-driven visit ---
  {
    id: 'sv-010',
    systemId: 'sys-009',
    clientId: 'cli-003',
    visitDate: '2025-09-25',
    visitedBy: 'Ray Menard',
    status: 'completed',
    activities: [
      { type: 'product-application', description: 'Qwik-Zyme P application' },
      { type: 'complaint', description: 'Odour complaint from nearby residence — investigated' },
    ],
    observation: {
      systemType: 'lift-station',
      fogPresent: true,
      fogAppearance: ['sticking-to-wall'],
      fogSurfaceCoveragePct: 25,
      odour: { intensity: 4, nature: ['hydrogen-sulfide', 'sewer'] },
      flowMeterReading: 310,
      h2sReading: 42,
      productApplications: [
        { productId: 'prod-014', productName: 'Qwik-Zyme P', quantity: 8, unit: 'lb', method: 'direct pour', zone: 'Wet well' },
      ],
    },
    photoIds: ['ph-011', 'ph-012', 'ph-013', 'ph-014', 'ph-015'],
    notes: 'High H2S reading. FOG buildup significant on walls. Odour complaint validated — increased dosage applied. Will monitor closely.',
    followUpRequired: true,
    followUpNotes: 'Urgent: re-visit in 1 week. Consider jet truck cleaning if FOG does not reduce.',
    nextVisitDate: '2025-10-02',
    createdAt: '2025-09-25T15:30:00Z',
  },
];

// ---------------------------------------------------------------------------
// Treatment Plans
// ---------------------------------------------------------------------------

const MOCK_TREATMENTS: TreatmentPlan[] = [
  // --- Colinton 2026 Treatment Plan ---
  {
    id: 'trt-001',
    systemId: 'sys-001',
    clientId: 'cli-001',
    year: 2026,
    status: 'active',
    totalCost: 9480,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
    dosingSchedules: [
      {
        id: 'dos-001-1',
        zone: 'Cell 1 – Full Coverage',
        productId: 'prod-001',
        productName: 'VitaStim Polar',
        quantityLbs: 30,
        frequency: 'Monthly',
        months: [3, 4, 5],
        notes: 'Spring activation — apply after ice-off, 1 pail/month for 3 months.',
      },
      {
        id: 'dos-001-2',
        zone: 'Cell 1 – Sludge Layer',
        productId: 'prod-002',
        productName: 'VitaStim Sludge Reducer',
        quantityLbs: 30,
        frequency: 'Monthly',
        months: [6, 7, 8],
        notes: 'Summer sludge digestion program. Target sludge layer directly.',
      },
      {
        id: 'dos-001-3',
        zone: 'Cell 1 – Sludge Layer',
        productId: 'prod-004',
        productName: 'Sludge Rx',
        quantityLbs: 30,
        frequency: 'Monthly',
        months: [6, 7, 8],
        notes: 'Companion pelletized sludge treatment applied alongside VitaStim Sludge Reducer.',
      },
      {
        id: 'dos-001-4',
        zone: 'Cell 1 – Full Coverage',
        productId: 'prod-001',
        productName: 'VitaStim Polar',
        quantityLbs: 30,
        frequency: 'Monthly',
        months: [10, 11],
        notes: 'Fall and pre-ice-on application to maintain biology through winter.',
      },
    ],
  },

  // --- Island Lake 2026 Treatment Plan ---
  {
    id: 'trt-002',
    systemId: 'sys-005',
    clientId: 'cli-001',
    year: 2026,
    status: 'planned',
    totalCost: 5520,
    createdAt: '2026-02-10T00:00:00.000Z',
    dosingSchedules: [
      {
        id: 'dos-002-1',
        zone: 'Cell 1',
        productId: 'prod-001',
        productName: 'VitaStim Polar',
        quantityLbs: 30,
        frequency: 'Monthly',
        months: [4, 5, 6],
        notes: 'Spring bioaugmentation to address elevated ammonia observed in 2025 sampling.',
      },
      {
        id: 'dos-002-2',
        zone: 'Cell 1',
        productId: 'prod-014',
        productName: 'Qwik-Zyme P',
        quantityLbs: 30,
        frequency: 'Monthly',
        months: [6, 7, 8],
        notes: 'Protein-targeting enzyme to reduce TSS and BOD.',
      },
    ],
  },

  // --- SRDRWC Innisfail 2026 H2S Control Plan ---
  {
    id: 'trt-003',
    systemId: 'sys-009',
    clientId: 'cli-003',
    year: 2026,
    status: 'active',
    totalCost: 3960,
    createdAt: '2026-01-20T00:00:00.000Z',
    dosingSchedules: [
      {
        id: 'dos-003-1',
        zone: 'Wet Well',
        productId: 'prod-007',
        productName: 'Bug on a Rope Sr',
        quantityLbs: 36,
        frequency: 'Every 60 days',
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        notes: 'Continuous H2S and FOG control. Replace rope every 60 days.',
      },
    ],
  },

  // --- Dawson City 2024 Emergency Treatment (completed) ---
  {
    id: 'trt-004',
    systemId: 'sys-006',
    clientId: 'cli-002',
    year: 2024,
    status: 'completed',
    totalCost: 6700,
    createdAt: '2023-11-10T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
    dosingSchedules: [
      {
        id: 'dos-004-1',
        zone: 'Aeration Basin',
        productId: 'prod-001',
        productName: 'VitaStim Polar',
        quantityLbs: 150,
        frequency: 'Weekly for 5 weeks',
        months: [11, 12, 1],
        notes: 'Emergency bioaugmentation following convergence event. 5 pails total.',
      },
      {
        id: 'dos-004-2',
        zone: 'Aeration Basin',
        productId: 'prod-005',
        productName: 'SmartBOD',
        quantityLbs: 250,
        frequency: 'Weekly for 5 weeks',
        months: [11, 12, 1],
        notes: 'Carbon support during biological restart. 5 bags total.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------

const MOCK_PROPOSALS: Proposal[] = [
  // --- Athabasca County 2026 Annual Program ---
  {
    id: 'prop-001',
    clientId: 'cli-001',
    clientName: 'Athabasca County',
    title: 'Athabasca County 2026 Annual Lagoon Treatment Program',
    date: '2026-01-28',
    status: 'sent',
    preparedBy: 'Jacy Hingley',
    preparedFor: 'Jackson Roth',
    validUntil: '2026-03-31',
    notes:
      'Volume pricing applied across the 5-system program. Pricing reflects annual commitment for all Athabasca County lagoon systems.',
    lineItems: [
      {
        id: 'li-001-01',
        productId: 'prod-001',
        productName: 'VitaStim Polar',
        unit: '30lb Pail',
        price: 920,
        quantity: 18,
        subtotal: 16560,
      },
      {
        id: 'li-001-02',
        productId: 'prod-002',
        productName: 'VitaStim Sludge Reducer',
        unit: '30lb Pail',
        price: 870,
        quantity: 10,
        subtotal: 8700,
      },
      {
        id: 'li-001-03',
        productId: 'prod-003',
        productName: 'Polar Rx',
        unit: '30lb Bag',
        price: 890,
        quantity: 8,
        subtotal: 7120,
      },
      {
        id: 'li-001-04',
        productId: 'prod-004',
        productName: 'Sludge Rx',
        unit: '30lb Bag',
        price: 810,
        quantity: 8,
        subtotal: 6480,
      },
      {
        id: 'li-001-05',
        productId: 'prod-014',
        productName: 'Qwik-Zyme P',
        unit: '30lb Pail',
        price: 680,
        quantity: 4,
        subtotal: 2720,
      },
      {
        id: 'li-001-06',
        productId: 'prod-015',
        productName: 'Qwik-Zyme L',
        unit: '30lb Pail',
        price: 680,
        quantity: 4,
        subtotal: 2720,
      },
    ],
    subtotal: 44300,
    discount: 8217.40,
    discountLabel: 'Volume Discount (Multi-System Program)',
    gst: 2040.63,
    shipping: 372.0,
    total: 42495.18,
  },

  // --- Dawson City WWTP Emergency Treatment ---
  {
    id: 'prop-002',
    clientId: 'cli-002',
    clientName: 'Dawson City WWTP',
    title: 'Dawson City WWTP — Emergency Bioaugmentation (Convergence Event)',
    date: '2023-11-08',
    status: 'accepted',
    preparedBy: 'Jacy Hingley',
    preparedFor: 'Anthony Clarke',
    validUntil: '2023-12-31',
    notes:
      'Emergency response proposal for system upset. Expedited shipping arranged. System has since recovered to normal parameters.',
    lineItems: [
      {
        id: 'li-002-01',
        productId: 'prod-001',
        productName: 'VitaStim Polar',
        unit: '30lb Pail',
        price: 820,
        quantity: 5,
        subtotal: 4100,
      },
      {
        id: 'li-002-02',
        productId: 'prod-005',
        productName: 'SmartBOD',
        unit: '50lb Bag',
        price: 520,
        quantity: 5,
        subtotal: 2600,
      },
    ],
    subtotal: 6700,
    gst: 335,
    total: 6700,
  },

  // --- SRDRWC Option B ---
  {
    id: 'prop-003',
    clientId: 'cli-003',
    clientName: 'South Red Deer Regional Wastewater Commission',
    title: 'SRDRWC 2026 Collection System Odour Control — Option B',
    date: '2026-02-12',
    status: 'draft',
    preparedBy: 'Jacy Hingley',
    preparedFor: 'Don Munro',
    validUntil: '2026-04-30',
    notes:
      'Option B includes Bug on a Rope Sr for primary H2S control at Innisfail and W3, with De-Sulph-A-Nator for spot treatment at problem access points.',
    lineItems: [
      {
        id: 'li-003-01',
        productId: 'prod-007',
        productName: 'Bug on a Rope Sr',
        unit: '4×9lb Pack',
        price: 990,
        quantity: 12,
        subtotal: 11880,
      },
      {
        id: 'li-003-02',
        productId: 'prod-010',
        productName: 'De-Sulph-A-Nator',
        unit: '20L Jug',
        price: 520,
        quantity: 8,
        subtotal: 4160,
      },
      {
        id: 'li-003-03',
        productId: 'prod-009',
        productName: 'DaZZel Sewer Sweetener',
        unit: '20L Jug',
        price: 450,
        quantity: 4,
        subtotal: 1800,
      },
    ],
    subtotal: 17840,
    gst: 892,
    shipping: 373.82,
    total: 19105.82,
  },
];

// ---------------------------------------------------------------------------
// Case Studies
// ---------------------------------------------------------------------------

const MOCK_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-001',
    title: 'Adaptive Bioaugmentation for Cold-Climate Lagoon Treatment',
    clientName: 'Town of Ponoka',
    systemType: 'Facultative Lagoon',
    location: 'Ponoka, Alberta',
    province: 'AB',
    problem:
      'The Town of Ponoka was consistently exceeding regulatory effluent limits for cBOD and ammonia. Cold Alberta winters limited conventional treatment performance, and the lagoon was struggling to meet seasonal discharge requirements.',
    solution:
      'A three-year adaptive bioaugmentation program was designed and implemented, combining cold-weather microbial blends (VitaStim Polar) during spring start-up and fall, with warm-season enzyme treatments (Qwik-Zyme P, Qwik-Zyme L) and sludge reduction products (VitaStim Sludge Reducer, Sludge Rx) during summer months. Bug on a Rope and GreaseZilla addressed FOG and odour at the inlet works.',
    results: [
      {
        metric: 'Effluent cBOD',
        before: '56.5 mg/L',
        after: '13.0 mg/L',
        changePercent: -76.9,
      },
      {
        metric: 'Effluent Ammonia',
        before: '29.5 mg/L',
        after: '7.5 mg/L',
        changePercent: -74.5,
      },
      {
        metric: 'Regulatory Compliance',
        before: 'Non-compliant',
        after: 'Compliant',
        changePercent: 100,
      },
    ],
    productsUsed: [
      'VitaStim Polar',
      'Qwik-Zyme P',
      'Qwik-Zyme L',
      'VitaStim Sludge Reducer',
      'Sludge Rx',
      'Bug on a Rope Sr',
      'GreaseZilla',
    ],
    duration: '3 years',
    createdAt: '2024-06-01T00:00:00.000Z',
  },
  {
    id: 'cs-002',
    title: 'Successful Sludge Reduction Across Multi-Cell Lagoon System',
    clientName: 'Town of Stettler',
    systemType: 'Multi-Cell Facultative Lagoon',
    location: 'Stettler, Alberta',
    province: 'AB',
    problem:
      "The Town of Stettler's five-cell lagoon system had accumulated significant sludge volumes in all cells, reducing effective treatment capacity and increasing risk of regulatory non-compliance. Dredging costs were estimated at several hundred thousand dollars.",
    solution:
      'A two-year biological sludge reduction program was implemented using GreaseZilla (FOG reduction), Sludge Rx (pelletized warm-season treatment), VitaStim Sludge Reducer (warm-season microbial blend), and VitaStim Polar (cold-weather maintenance). Products were applied strategically to each cell based on function and sludge depth surveys.',
    results: [
      {
        metric: 'Cell D Sludge Volume',
        before: 'Baseline',
        after: '-793 m³ net reduction',
        changePercent: -100,
      },
      {
        metric: 'Overall Sludge Volume (5 cells)',
        before: 'Pre-program baseline',
        after: 'Measurable reduction across all cells',
        changePercent: -35,
      },
      {
        metric: 'Estimated Dredging Cost Avoidance',
        before: '$0 avoided',
        after: '~$180,000 deferred',
        changePercent: 100,
      },
    ],
    productsUsed: [
      'GreaseZilla',
      'Sludge Rx',
      'VitaStim Sludge Reducer',
      'VitaStim Polar',
    ],
    duration: '2 years',
    createdAt: '2024-09-15T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Activity Log
// ---------------------------------------------------------------------------

const MOCK_ACTIVITY: ActivityLogItem[] = [
  {
    id: 'act-001',
    message: 'Proposal sent to Athabasca County for 2026 Annual Lagoon Treatment Program ($42,495.18)',
    timestamp: '2026-01-28T14:32:00.000Z',
    type: 'proposal',
  },
  {
    id: 'act-002',
    message: 'Effluent sample collected at Colinton Lagoon — BOD 22 mg/L, TSS 69 mg/L',
    timestamp: '2025-10-17T10:15:00.000Z',
    type: 'sample',
  },
  {
    id: 'act-003',
    message: 'SRDRWC Option B proposal drafted for odour control program ($19,105.82)',
    timestamp: '2026-02-12T09:00:00.000Z',
    type: 'proposal',
  },
  {
    id: 'act-004',
    message: 'Colinton Lagoon 2026 treatment plan activated — spring dosing scheduled',
    timestamp: '2026-02-01T11:45:00.000Z',
    type: 'treatment',
  },
  {
    id: 'act-005',
    message: 'H2S reading at Innisfail Lift Station: 18.4 ppm — elevated, monitoring required',
    timestamp: '2025-09-22T08:30:00.000Z',
    type: 'sample',
  },
  {
    id: 'act-006',
    message: 'Island Lake Lagoon 2026 treatment plan created — addressing elevated ammonia',
    timestamp: '2026-02-10T13:20:00.000Z',
    type: 'treatment',
  },
  {
    id: 'act-007',
    message: 'Dawson City WWTP proposal accepted — $6,700 emergency bioaugmentation',
    timestamp: '2023-11-12T16:00:00.000Z',
    type: 'proposal',
  },
  {
    id: 'act-008',
    message: 'South Red Deer Regional Wastewater Commission added as new regional client',
    timestamp: '2024-01-10T09:00:00.000Z',
    type: 'client',
  },
  {
    id: 'act-009',
    message: 'Site visit completed at Colinton Lagoon — VitaStim Polar and Polar Rx applied through ice',
    timestamp: '2026-02-18T11:30:00.000Z',
    type: 'visit',
  },
  {
    id: 'act-010',
    message: 'Site visit completed at Innisfail Lift Station — H2S down to 8.6 ppm, Bug on a Rope replaced',
    timestamp: '2026-02-03T11:45:00.000Z',
    type: 'visit',
  },
  {
    id: 'act-011',
    message: 'Site visit completed at Dawson City WWTP — system healthy, maintenance dose of VitaStim Polar applied',
    timestamp: '2026-01-28T12:30:00.000Z',
    type: 'visit',
  },
];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alr-001',
    message: 'Colinton Lagoon: Sludge volume at 40% of design capacity (7,637 m³). Sludge removal should be planned within 3–5 years.',
    severity: 'warning',
    systemId: 'sys-001',
    date: '2024-08-20',
  },
  {
    id: 'alr-002',
    message: 'Innisfail Lift Station: H2S level at 18.4 ppm — above the 10 ppm action threshold. Bug on a Rope deployment recommended.',
    severity: 'danger',
    systemId: 'sys-009',
    date: '2025-09-22',
  },
  {
    id: 'alr-003',
    message: 'Island Lake Lagoon: Ammonia at 12.4 mg/L in July 2025 sample — above provincial guideline of 10 mg/L.',
    severity: 'warning',
    systemId: 'sys-005',
    date: '2025-07-14',
  },
  {
    id: 'alr-004',
    message: 'SRDRWC Option B proposal has been in draft status for 18 days. Consider sending to Don Munro.',
    severity: 'info',
    date: '2026-03-02',
  },
  {
    id: 'alr-005',
    message: 'Cold weather alert: \u201315\u00B0C at Dawson City WWTP \u2014 ensure VitaStim Polar dosing is active.',
    severity: 'warning',
    systemId: 'sys-006',
    date: '2026-03-08',
  },
  {
    id: 'alr-006',
    message: 'Conditions warming at Colinton \u2014 spring treatment window approaching. Schedule ice-off inspection.',
    severity: 'info',
    systemId: 'sys-001',
    date: '2026-03-09',
  },
];

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class MockDataService {
  // Private writable signals
  private _clients = signal<Client[]>(MOCK_CLIENTS);
  private _systems = signal<WastewaterSystem[]>(MOCK_SYSTEMS);
  private _products = signal<Product[]>(MOCK_PRODUCTS);
  private _samples = signal<SampleRecord[]>(MOCK_SAMPLES);
  private _treatments = signal<TreatmentPlan[]>(MOCK_TREATMENTS);
  private _proposals = signal<Proposal[]>(MOCK_PROPOSALS);
  private _caseStudies = signal<CaseStudy[]>(MOCK_CASE_STUDIES);
  private _activityLog = signal<ActivityLogItem[]>(MOCK_ACTIVITY);
  private _alerts = signal<Alert[]>(MOCK_ALERTS);
  private _weather = signal<WeatherRecord[]>(MOCK_WEATHER);
  private _siteVisits = signal(MOCK_SITE_VISITS);

  // Public readonly signals
  readonly clients = this._clients.asReadonly();
  readonly systems = this._systems.asReadonly();
  readonly products = this._products.asReadonly();
  readonly samples = this._samples.asReadonly();
  readonly treatments = this._treatments.asReadonly();
  readonly proposals = this._proposals.asReadonly();
  readonly caseStudies = this._caseStudies.asReadonly();
  readonly activityLog = this._activityLog.asReadonly();
  readonly alerts = this._alerts.asReadonly();
  readonly weather = this._weather.asReadonly();
  readonly siteVisits = this._siteVisits.asReadonly();
}
