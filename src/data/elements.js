/**
 * Periodic Table Element Data
 * 
 * Complete periodic table with electron configurations
 * for all 118 elements, including common ionization states.
 */

// Aufbau order for filling orbitals
const AUFBAU_ORDER = [
    { n: 1, l: 0 }, // 1s
    { n: 2, l: 0 }, // 2s
    { n: 2, l: 1 }, // 2p
    { n: 3, l: 0 }, // 3s
    { n: 3, l: 1 }, // 3p
    { n: 4, l: 0 }, // 4s
    { n: 3, l: 2 }, // 3d
    { n: 4, l: 1 }, // 4p
    { n: 5, l: 0 }, // 5s
    { n: 4, l: 2 }, // 4d
    { n: 5, l: 1 }, // 5p
    { n: 6, l: 0 }, // 6s
    { n: 4, l: 3 }, // 4f
    { n: 5, l: 2 }, // 5d
    { n: 6, l: 1 }, // 6p
    { n: 7, l: 0 }, // 7s
    { n: 5, l: 3 }, // 5f
    { n: 6, l: 2 }, // 6d
    { n: 7, l: 1 }, // 7p
];

/**
 * Generate electron configuration for a given number of electrons
 * Following Aufbau principle with Hund's rule
 */
export function generateElectronConfiguration(electronCount) {
    const config = [];
    let remaining = electronCount;

    for (const { n, l } of AUFBAU_ORDER) {
        if (remaining <= 0) break;

        const maxElectrons = 2 * (2 * l + 1); // Max electrons in subshell
        const electrons = Math.min(remaining, maxElectrons);

        // Distribute electrons across m values
        for (let m = -l; m <= l && remaining > 0; m++) {
            const electronsInOrbital = Math.min(2, remaining);
            config.push({ n, l, m, electrons: electronsInOrbital });
            remaining -= electronsInOrbital;
        }
    }

    return config;
}

/**
 * Generate subshell configuration (grouped by n,l)
 */
export function generateSubshellConfiguration(electronCount) {
    const config = [];
    let remaining = electronCount;

    for (const { n, l } of AUFBAU_ORDER) {
        if (remaining <= 0) break;

        const maxElectrons = 2 * (2 * l + 1);
        const electrons = Math.min(remaining, maxElectrons);

        if (electrons > 0) {
            config.push({ n, l, electrons });
            remaining -= electrons;
        }
    }

    return config;
}

/**
 * Format electron configuration as string (e.g., "1s² 2s² 2p⁶")
 */
export function formatConfiguration(config) {
    const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const orbitalLetters = ['s', 'p', 'd', 'f', 'g'];

    const subshells = new Map();

    for (const { n, l, electrons } of config) {
        const key = `${n}${orbitalLetters[l]}`;
        subshells.set(key, (subshells.get(key) || 0) + electrons);
    }

    return Array.from(subshells.entries())
        .map(([key, count]) => {
            const sup = count.toString().split('').map(d => superscripts[d]).join('');
            return `${key}${sup}`;
        })
        .join(' ');
}

// Element categories for periodic table coloring
export const CATEGORIES = {
    ALKALI: 'alkali',
    ALKALINE: 'alkaline',
    TRANSITION: 'transition',
    POST_TRANSITION: 'post-transition',
    METALLOID: 'metalloid',
    NONMETAL: 'nonmetal',
    HALOGEN: 'halogen',
    NOBLE: 'noble',
    LANTHANIDE: 'lanthanide',
    ACTINIDE: 'actinide'
};

// Complete element data
export const elements = {
    H: { name: 'Hydrogen', atomicNumber: 1, category: CATEGORIES.NONMETAL, commonIons: [1, -1] },
    He: { name: 'Helium', atomicNumber: 2, category: CATEGORIES.NOBLE, commonIons: [] },
    Li: { name: 'Lithium', atomicNumber: 3, category: CATEGORIES.ALKALI, commonIons: [1] },
    Be: { name: 'Beryllium', atomicNumber: 4, category: CATEGORIES.ALKALINE, commonIons: [2] },
    B: { name: 'Boron', atomicNumber: 5, category: CATEGORIES.METALLOID, commonIons: [3] },
    C: { name: 'Carbon', atomicNumber: 6, category: CATEGORIES.NONMETAL, commonIons: [4, -4] },
    N: { name: 'Nitrogen', atomicNumber: 7, category: CATEGORIES.NONMETAL, commonIons: [-3] },
    O: { name: 'Oxygen', atomicNumber: 8, category: CATEGORIES.NONMETAL, commonIons: [-2] },
    F: { name: 'Fluorine', atomicNumber: 9, category: CATEGORIES.HALOGEN, commonIons: [-1] },
    Ne: { name: 'Neon', atomicNumber: 10, category: CATEGORIES.NOBLE, commonIons: [] },
    Na: { name: 'Sodium', atomicNumber: 11, category: CATEGORIES.ALKALI, commonIons: [1] },
    Mg: { name: 'Magnesium', atomicNumber: 12, category: CATEGORIES.ALKALINE, commonIons: [2] },
    Al: { name: 'Aluminium', atomicNumber: 13, category: CATEGORIES.POST_TRANSITION, commonIons: [3] },
    Si: { name: 'Silicon', atomicNumber: 14, category: CATEGORIES.METALLOID, commonIons: [4, -4] },
    P: { name: 'Phosphorus', atomicNumber: 15, category: CATEGORIES.NONMETAL, commonIons: [-3, 5] },
    S: { name: 'Sulfur', atomicNumber: 16, category: CATEGORIES.NONMETAL, commonIons: [-2, 4, 6] },
    Cl: { name: 'Chlorine', atomicNumber: 17, category: CATEGORIES.HALOGEN, commonIons: [-1] },
    Ar: { name: 'Argon', atomicNumber: 18, category: CATEGORIES.NOBLE, commonIons: [] },
    K: { name: 'Potassium', atomicNumber: 19, category: CATEGORIES.ALKALI, commonIons: [1] },
    Ca: { name: 'Calcium', atomicNumber: 20, category: CATEGORIES.ALKALINE, commonIons: [2] },
    Sc: { name: 'Scandium', atomicNumber: 21, category: CATEGORIES.TRANSITION, commonIons: [3] },
    Ti: { name: 'Titanium', atomicNumber: 22, category: CATEGORIES.TRANSITION, commonIons: [4, 3] },
    V: { name: 'Vanadium', atomicNumber: 23, category: CATEGORIES.TRANSITION, commonIons: [5, 4, 3] },
    Cr: { name: 'Chromium', atomicNumber: 24, category: CATEGORIES.TRANSITION, commonIons: [3, 6] },
    Mn: { name: 'Manganese', atomicNumber: 25, category: CATEGORIES.TRANSITION, commonIons: [2, 4, 7] },
    Fe: { name: 'Iron', atomicNumber: 26, category: CATEGORIES.TRANSITION, commonIons: [2, 3] },
    Co: { name: 'Cobalt', atomicNumber: 27, category: CATEGORIES.TRANSITION, commonIons: [2, 3] },
    Ni: { name: 'Nickel', atomicNumber: 28, category: CATEGORIES.TRANSITION, commonIons: [2] },
    Cu: { name: 'Copper', atomicNumber: 29, category: CATEGORIES.TRANSITION, commonIons: [1, 2] },
    Zn: { name: 'Zinc', atomicNumber: 30, category: CATEGORIES.TRANSITION, commonIons: [2] },
    Ga: { name: 'Gallium', atomicNumber: 31, category: CATEGORIES.POST_TRANSITION, commonIons: [3] },
    Ge: { name: 'Germanium', atomicNumber: 32, category: CATEGORIES.METALLOID, commonIons: [4] },
    As: { name: 'Arsenic', atomicNumber: 33, category: CATEGORIES.METALLOID, commonIons: [-3, 3, 5] },
    Se: { name: 'Selenium', atomicNumber: 34, category: CATEGORIES.NONMETAL, commonIons: [-2, 4, 6] },
    Br: { name: 'Bromine', atomicNumber: 35, category: CATEGORIES.HALOGEN, commonIons: [-1] },
    Kr: { name: 'Krypton', atomicNumber: 36, category: CATEGORIES.NOBLE, commonIons: [] },
    Rb: { name: 'Rubidium', atomicNumber: 37, category: CATEGORIES.ALKALI, commonIons: [1] },
    Sr: { name: 'Strontium', atomicNumber: 38, category: CATEGORIES.ALKALINE, commonIons: [2] },
    Y: { name: 'Yttrium', atomicNumber: 39, category: CATEGORIES.TRANSITION, commonIons: [3] },
    Zr: { name: 'Zirconium', atomicNumber: 40, category: CATEGORIES.TRANSITION, commonIons: [4] },
    Nb: { name: 'Niobium', atomicNumber: 41, category: CATEGORIES.TRANSITION, commonIons: [5] },
    Mo: { name: 'Molybdenum', atomicNumber: 42, category: CATEGORIES.TRANSITION, commonIons: [6] },
    Tc: { name: 'Technetium', atomicNumber: 43, category: CATEGORIES.TRANSITION, commonIons: [7] },
    Ru: { name: 'Ruthenium', atomicNumber: 44, category: CATEGORIES.TRANSITION, commonIons: [3] },
    Rh: { name: 'Rhodium', atomicNumber: 45, category: CATEGORIES.TRANSITION, commonIons: [3] },
    Pd: { name: 'Palladium', atomicNumber: 46, category: CATEGORIES.TRANSITION, commonIons: [2, 4] },
    Ag: { name: 'Silver', atomicNumber: 47, category: CATEGORIES.TRANSITION, commonIons: [1] },
    Cd: { name: 'Cadmium', atomicNumber: 48, category: CATEGORIES.TRANSITION, commonIons: [2] },
    In: { name: 'Indium', atomicNumber: 49, category: CATEGORIES.POST_TRANSITION, commonIons: [3] },
    Sn: { name: 'Tin', atomicNumber: 50, category: CATEGORIES.POST_TRANSITION, commonIons: [2, 4] },
    Sb: { name: 'Antimony', atomicNumber: 51, category: CATEGORIES.METALLOID, commonIons: [-3, 3, 5] },
    Te: { name: 'Tellurium', atomicNumber: 52, category: CATEGORIES.METALLOID, commonIons: [-2, 4, 6] },
    I: { name: 'Iodine', atomicNumber: 53, category: CATEGORIES.HALOGEN, commonIons: [-1] },
    Xe: { name: 'Xenon', atomicNumber: 54, category: CATEGORIES.NOBLE, commonIons: [] },
    Cs: { name: 'Cesium', atomicNumber: 55, category: CATEGORIES.ALKALI, commonIons: [1] },
    Ba: { name: 'Barium', atomicNumber: 56, category: CATEGORIES.ALKALINE, commonIons: [2] },
    La: { name: 'Lanthanum', atomicNumber: 57, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Ce: { name: 'Cerium', atomicNumber: 58, category: CATEGORIES.LANTHANIDE, commonIons: [3, 4] },
    Pr: { name: 'Praseodymium', atomicNumber: 59, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Nd: { name: 'Neodymium', atomicNumber: 60, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Pm: { name: 'Promethium', atomicNumber: 61, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Sm: { name: 'Samarium', atomicNumber: 62, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Eu: { name: 'Europium', atomicNumber: 63, category: CATEGORIES.LANTHANIDE, commonIons: [2, 3] },
    Gd: { name: 'Gadolinium', atomicNumber: 64, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Tb: { name: 'Terbium', atomicNumber: 65, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Dy: { name: 'Dysprosium', atomicNumber: 66, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Ho: { name: 'Holmium', atomicNumber: 67, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Er: { name: 'Erbium', atomicNumber: 68, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Tm: { name: 'Thulium', atomicNumber: 69, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Yb: { name: 'Ytterbium', atomicNumber: 70, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Lu: { name: 'Lutetium', atomicNumber: 71, category: CATEGORIES.LANTHANIDE, commonIons: [3] },
    Hf: { name: 'Hafnium', atomicNumber: 72, category: CATEGORIES.TRANSITION, commonIons: [4] },
    Ta: { name: 'Tantalum', atomicNumber: 73, category: CATEGORIES.TRANSITION, commonIons: [5] },
    W: { name: 'Tungsten', atomicNumber: 74, category: CATEGORIES.TRANSITION, commonIons: [6] },
    Re: { name: 'Rhenium', atomicNumber: 75, category: CATEGORIES.TRANSITION, commonIons: [4] },
    Os: { name: 'Osmium', atomicNumber: 76, category: CATEGORIES.TRANSITION, commonIons: [4] },
    Ir: { name: 'Iridium', atomicNumber: 77, category: CATEGORIES.TRANSITION, commonIons: [3, 4] },
    Pt: { name: 'Platinum', atomicNumber: 78, category: CATEGORIES.TRANSITION, commonIons: [2, 4] },
    Au: { name: 'Gold', atomicNumber: 79, category: CATEGORIES.TRANSITION, commonIons: [1, 3] },
    Hg: { name: 'Mercury', atomicNumber: 80, category: CATEGORIES.TRANSITION, commonIons: [1, 2] },
    Tl: { name: 'Thallium', atomicNumber: 81, category: CATEGORIES.POST_TRANSITION, commonIons: [1, 3] },
    Pb: { name: 'Lead', atomicNumber: 82, category: CATEGORIES.POST_TRANSITION, commonIons: [2, 4] },
    Bi: { name: 'Bismuth', atomicNumber: 83, category: CATEGORIES.POST_TRANSITION, commonIons: [3] },
    Po: { name: 'Polonium', atomicNumber: 84, category: CATEGORIES.METALLOID, commonIons: [2, 4] },
    At: { name: 'Astatine', atomicNumber: 85, category: CATEGORIES.HALOGEN, commonIons: [-1] },
    Rn: { name: 'Radon', atomicNumber: 86, category: CATEGORIES.NOBLE, commonIons: [] },
    Fr: { name: 'Francium', atomicNumber: 87, category: CATEGORIES.ALKALI, commonIons: [1] },
    Ra: { name: 'Radium', atomicNumber: 88, category: CATEGORIES.ALKALINE, commonIons: [2] },
    Ac: { name: 'Actinium', atomicNumber: 89, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    Th: { name: 'Thorium', atomicNumber: 90, category: CATEGORIES.ACTINIDE, commonIons: [4] },
    Pa: { name: 'Protactinium', atomicNumber: 91, category: CATEGORIES.ACTINIDE, commonIons: [5] },
    U: { name: 'Uranium', atomicNumber: 92, category: CATEGORIES.ACTINIDE, commonIons: [6] },
    Np: { name: 'Neptunium', atomicNumber: 93, category: CATEGORIES.ACTINIDE, commonIons: [5] },
    Pu: { name: 'Plutonium', atomicNumber: 94, category: CATEGORIES.ACTINIDE, commonIons: [4] },
    Am: { name: 'Americium', atomicNumber: 95, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    Cm: { name: 'Curium', atomicNumber: 96, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    Bk: { name: 'Berkelium', atomicNumber: 97, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    Cf: { name: 'Californium', atomicNumber: 98, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    Es: { name: 'Einsteinium', atomicNumber: 99, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    Fm: { name: 'Fermium', atomicNumber: 100, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    Md: { name: 'Mendelevium', atomicNumber: 101, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    No: { name: 'Nobelium', atomicNumber: 102, category: CATEGORIES.ACTINIDE, commonIons: [2] },
    Lr: { name: 'Lawrencium', atomicNumber: 103, category: CATEGORIES.ACTINIDE, commonIons: [3] },
    Rf: { name: 'Rutherfordium', atomicNumber: 104, category: CATEGORIES.TRANSITION, commonIons: [4] },
    Db: { name: 'Dubnium', atomicNumber: 105, category: CATEGORIES.TRANSITION, commonIons: [5] },
    Sg: { name: 'Seaborgium', atomicNumber: 106, category: CATEGORIES.TRANSITION, commonIons: [6] },
    Bh: { name: 'Bohrium', atomicNumber: 107, category: CATEGORIES.TRANSITION, commonIons: [7] },
    Hs: { name: 'Hassium', atomicNumber: 108, category: CATEGORIES.TRANSITION, commonIons: [8] },
    Mt: { name: 'Meitnerium', atomicNumber: 109, category: CATEGORIES.TRANSITION, commonIons: [] },
    Ds: { name: 'Darmstadtium', atomicNumber: 110, category: CATEGORIES.TRANSITION, commonIons: [] },
    Rg: { name: 'Roentgenium', atomicNumber: 111, category: CATEGORIES.TRANSITION, commonIons: [] },
    Cn: { name: 'Copernicium', atomicNumber: 112, category: CATEGORIES.TRANSITION, commonIons: [] },
    Nh: { name: 'Nihonium', atomicNumber: 113, category: CATEGORIES.POST_TRANSITION, commonIons: [] },
    Fl: { name: 'Flerovium', atomicNumber: 114, category: CATEGORIES.POST_TRANSITION, commonIons: [] },
    Mc: { name: 'Moscovium', atomicNumber: 115, category: CATEGORIES.POST_TRANSITION, commonIons: [] },
    Lv: { name: 'Livermorium', atomicNumber: 116, category: CATEGORIES.POST_TRANSITION, commonIons: [] },
    Ts: { name: 'Tennessine', atomicNumber: 117, category: CATEGORIES.HALOGEN, commonIons: [] },
    Og: { name: 'Oganesson', atomicNumber: 118, category: CATEGORIES.NOBLE, commonIons: [] }
};

// Standard periodic table grid layout (row, col)
export const periodicTableLayout = [
    // Period 1
    { symbol: 'H', row: 0, col: 0 },
    { symbol: 'He', row: 0, col: 17 },
    // Period 2
    { symbol: 'Li', row: 1, col: 0 },
    { symbol: 'Be', row: 1, col: 1 },
    { symbol: 'B', row: 1, col: 12 },
    { symbol: 'C', row: 1, col: 13 },
    { symbol: 'N', row: 1, col: 14 },
    { symbol: 'O', row: 1, col: 15 },
    { symbol: 'F', row: 1, col: 16 },
    { symbol: 'Ne', row: 1, col: 17 },
    // Period 3
    { symbol: 'Na', row: 2, col: 0 },
    { symbol: 'Mg', row: 2, col: 1 },
    { symbol: 'Al', row: 2, col: 12 },
    { symbol: 'Si', row: 2, col: 13 },
    { symbol: 'P', row: 2, col: 14 },
    { symbol: 'S', row: 2, col: 15 },
    { symbol: 'Cl', row: 2, col: 16 },
    { symbol: 'Ar', row: 2, col: 17 },
    // Period 4
    { symbol: 'K', row: 3, col: 0 },
    { symbol: 'Ca', row: 3, col: 1 },
    { symbol: 'Sc', row: 3, col: 2 },
    { symbol: 'Ti', row: 3, col: 3 },
    { symbol: 'V', row: 3, col: 4 },
    { symbol: 'Cr', row: 3, col: 5 },
    { symbol: 'Mn', row: 3, col: 6 },
    { symbol: 'Fe', row: 3, col: 7 },
    { symbol: 'Co', row: 3, col: 8 },
    { symbol: 'Ni', row: 3, col: 9 },
    { symbol: 'Cu', row: 3, col: 10 },
    { symbol: 'Zn', row: 3, col: 11 },
    { symbol: 'Ga', row: 3, col: 12 },
    { symbol: 'Ge', row: 3, col: 13 },
    { symbol: 'As', row: 3, col: 14 },
    { symbol: 'Se', row: 3, col: 15 },
    { symbol: 'Br', row: 3, col: 16 },
    { symbol: 'Kr', row: 3, col: 17 },
    // Period 5
    { symbol: 'Rb', row: 4, col: 0 },
    { symbol: 'Sr', row: 4, col: 1 },
    { symbol: 'Y', row: 4, col: 2 },
    { symbol: 'Zr', row: 4, col: 3 },
    { symbol: 'Nb', row: 4, col: 4 },
    { symbol: 'Mo', row: 4, col: 5 },
    { symbol: 'Tc', row: 4, col: 6 },
    { symbol: 'Ru', row: 4, col: 7 },
    { symbol: 'Rh', row: 4, col: 8 },
    { symbol: 'Pd', row: 4, col: 9 },
    { symbol: 'Ag', row: 4, col: 10 },
    { symbol: 'Cd', row: 4, col: 11 },
    { symbol: 'In', row: 4, col: 12 },
    { symbol: 'Sn', row: 4, col: 13 },
    { symbol: 'Sb', row: 4, col: 14 },
    { symbol: 'Te', row: 4, col: 15 },
    { symbol: 'I', row: 4, col: 16 },
    { symbol: 'Xe', row: 4, col: 17 },
    // Period 6
    { symbol: 'Cs', row: 5, col: 0 },
    { symbol: 'Ba', row: 5, col: 1 },
    { symbol: 'La', row: 5, col: 2 },
    { symbol: 'Hf', row: 5, col: 3 },
    { symbol: 'Ta', row: 5, col: 4 },
    { symbol: 'W', row: 5, col: 5 },
    { symbol: 'Re', row: 5, col: 6 },
    { symbol: 'Os', row: 5, col: 7 },
    { symbol: 'Ir', row: 5, col: 8 },
    { symbol: 'Pt', row: 5, col: 9 },
    { symbol: 'Au', row: 5, col: 10 },
    { symbol: 'Hg', row: 5, col: 11 },
    { symbol: 'Tl', row: 5, col: 12 },
    { symbol: 'Pb', row: 5, col: 13 },
    { symbol: 'Bi', row: 5, col: 14 },
    { symbol: 'Po', row: 5, col: 15 },
    { symbol: 'At', row: 5, col: 16 },
    { symbol: 'Rn', row: 5, col: 17 },
    // Period 7
    { symbol: 'Fr', row: 6, col: 0 },
    { symbol: 'Ra', row: 6, col: 1 },
    { symbol: 'Ac', row: 6, col: 2 },
    { symbol: 'Rf', row: 6, col: 3 },
    { symbol: 'Db', row: 6, col: 4 },
    { symbol: 'Sg', row: 6, col: 5 },
    { symbol: 'Bh', row: 6, col: 6 },
    { symbol: 'Hs', row: 6, col: 7 },
    { symbol: 'Mt', row: 6, col: 8 },
    { symbol: 'Ds', row: 6, col: 9 },
    { symbol: 'Rg', row: 6, col: 10 },
    { symbol: 'Cn', row: 6, col: 11 },
    { symbol: 'Nh', row: 6, col: 12 },
    { symbol: 'Fl', row: 6, col: 13 },
    { symbol: 'Mc', row: 6, col: 14 },
    { symbol: 'Lv', row: 6, col: 15 },
    { symbol: 'Ts', row: 6, col: 16 },
    { symbol: 'Og', row: 6, col: 17 },
    // Lanthanides (row 8)
    { symbol: 'Ce', row: 8, col: 3 },
    { symbol: 'Pr', row: 8, col: 4 },
    { symbol: 'Nd', row: 8, col: 5 },
    { symbol: 'Pm', row: 8, col: 6 },
    { symbol: 'Sm', row: 8, col: 7 },
    { symbol: 'Eu', row: 8, col: 8 },
    { symbol: 'Gd', row: 8, col: 9 },
    { symbol: 'Tb', row: 8, col: 10 },
    { symbol: 'Dy', row: 8, col: 11 },
    { symbol: 'Ho', row: 8, col: 12 },
    { symbol: 'Er', row: 8, col: 13 },
    { symbol: 'Tm', row: 8, col: 14 },
    { symbol: 'Yb', row: 8, col: 15 },
    { symbol: 'Lu', row: 8, col: 16 },
    // Actinides (row 9)
    { symbol: 'Th', row: 9, col: 3 },
    { symbol: 'Pa', row: 9, col: 4 },
    { symbol: 'U', row: 9, col: 5 },
    { symbol: 'Np', row: 9, col: 6 },
    { symbol: 'Pu', row: 9, col: 7 },
    { symbol: 'Am', row: 9, col: 8 },
    { symbol: 'Cm', row: 9, col: 9 },
    { symbol: 'Bk', row: 9, col: 10 },
    { symbol: 'Cf', row: 9, col: 11 },
    { symbol: 'Es', row: 9, col: 12 },
    { symbol: 'Fm', row: 9, col: 13 },
    { symbol: 'Md', row: 9, col: 14 },
    { symbol: 'No', row: 9, col: 15 },
    { symbol: 'Lr', row: 9, col: 16 }
];

/**
 * Get element data by symbol
 */
export function getElement(symbol) {
    return elements[symbol] ? { symbol, ...elements[symbol] } : null;
}

/**
 * Get all element symbols sorted by atomic number
 */
export function getAllSymbols() {
    return Object.entries(elements)
        .sort((a, b) => a[1].atomicNumber - b[1].atomicNumber)
        .map(([symbol]) => symbol);
}
