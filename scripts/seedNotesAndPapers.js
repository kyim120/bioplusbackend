const mongoose = require('mongoose');
const Note = require('../models/Note');
const PastPaper = require('../models/PastPaper');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const User = require('../models/User');
require('dotenv').config();

const seedNotesAndPapers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sympathy-analyzer');
        console.log('MongoDB Connected');

        // Get admin user for createdBy field
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            throw new Error('Admin user not found. Please run seed-demo first.');
        }

        // Get subjects
        const subjects = await Subject.find({});
        const bio9 = subjects.find(s => s.code === 'BIO9');
        const bio10 = subjects.find(s => s.code === 'BIO10');
        const chem9 = subjects.find(s => s.code === 'CHEM9');
        const phy10 = subjects.find(s => s.code === 'PHY10');

        // Get chapters
        const chapters = await Chapter.find({});

        // Clear existing data
        await Note.deleteMany({});
        await PastPaper.deleteMany({});
        console.log('Cleared existing notes and past papers');

        // ============= NOTES =============
        const notes = [];

        // Biology Grade 9 Notes
        if (bio9) {
            notes.push(
                {
                    title: 'Cell Structure and Function',
                    subject: bio9._id,
                    grade: '9',
                    chapter: chapters.find(c => c.name === 'Cell Structure')?._id,
                    content: `
# Cell Structure and Function

## Introduction
Cells are the basic building blocks of all living organisms. Understanding cell structure is fundamental to biology.

## Key Components

### 1. Cell Membrane
- Semi-permeable barrier
- Controls what enters and exits the cell
- Made of phospholipid bilayer

### 2. Cytoplasm
- Jelly-like substance
- Contains organelles
- Site of many chemical reactions

### 3. Nucleus
- Control center of the cell
- Contains DNA
- Surrounded by nuclear membrane

### 4. Mitochondria
- Powerhouse of the cell
- Produces ATP (energy)
- Has its own DNA

### 5. Ribosomes
- Protein synthesis
- Found free or attached to ER
- Made of RNA and proteins

## Plant vs Animal Cells

**Plant Cells Have:**
- Cell wall (cellulose)
- Chloroplasts (photosynthesis)
- Large central vacuole

**Animal Cells Have:**
- Centrioles
- Smaller vacuoles
- No cell wall

## Important Points
✓ All cells come from pre-existing cells
✓ Cells are the smallest unit of life
✓ Different cells have different functions
          `,
                    topics: ['Cell Membrane', 'Cytoplasm', 'Nucleus', 'Mitochondria', 'Ribosomes'],
                    createdBy: adminUser._id,
                    isActive: true
                },
                {
                    title: 'Introduction to Biology - Quick Notes',
                    subject: bio9._id,
                    grade: '9',
                    chapter: chapters.find(c => c.name === 'Introduction to Biology')?._id,
                    content: `
# Introduction to Biology

## What is Biology?
Biology is the scientific study of life and living organisms.

## Characteristics of Living Things
1. **Movement** - Ability to move or change position
2. **Respiration** - Release energy from food
3. **Sensitivity** - Respond to stimuli
4. **Growth** - Increase in size and mass
5. **Reproduction** - Produce offspring
6. **Excretion** - Remove waste products
7. **Nutrition** - Take in and use food

## Levels of Organization
Cell → Tissue → Organ → Organ System → Organism

## Scientific Method
1. Observation
2. Question
3. Hypothesis
4. Experiment
5. Analysis
6. Conclusion

## Key Terms
- **Organism**: A living thing
- **Species**: Group of similar organisms that can reproduce
- **Habitat**: Where an organism lives
- **Ecosystem**: Community of organisms and their environment
          `,
                    topics: ['Characteristics of Life', 'Scientific Method', 'Levels of Organization'],
                    createdBy: adminUser._id,
                    isActive: true
                },
                {
                    title: 'Cell Division - Mitosis and Meiosis',
                    subject: bio9._id,
                    grade: '9',
                    chapter: chapters.find(c => c.name === 'Cell Division')?._id,
                    content: `
# Cell Division

## Mitosis (Body Cells)
Process of cell division that produces two identical daughter cells.

### Phases of Mitosis
1. **Prophase** - Chromosomes condense, nuclear membrane breaks down
2. **Metaphase** - Chromosomes align at cell equator
3. **Anaphase** - Sister chromatids separate
4. **Telophase** - Nuclear membranes reform, cell divides

## Meiosis (Sex Cells)
Process that produces four non-identical gametes (sex cells).

### Key Differences
| Mitosis | Meiosis |
|---------|---------|
| 2 daughter cells | 4 daughter cells |
| Identical cells | Different cells |
| Diploid (2n) | Haploid (n) |
| Body cells | Sex cells |

## Importance
- **Mitosis**: Growth, repair, asexual reproduction
- **Meiosis**: Sexual reproduction, genetic variation

## Key Terms
- **Chromosome**: DNA molecule containing genes
- **Diploid**: Full set of chromosomes (2n)
- **Haploid**: Half set of chromosomes (n)
- **Gamete**: Sex cell (sperm or egg)
          `,
                    topics: ['Mitosis', 'Meiosis', 'Chromosomes', 'Cell Cycle'],
                    createdBy: adminUser._id,
                    isActive: true
                }
            );
        }

        // Biology Grade 10 Notes
        if (bio10) {
            notes.push(
                {
                    title: 'Genetics and Heredity',
                    subject: bio10._id,
                    grade: '10',
                    chapter: chapters.find(c => c.name === 'Genetics and Heredity')?._id,
                    content: `
# Genetics and Heredity

## Mendelian Genetics

### Key Concepts
- **Gene**: Unit of heredity
- **Allele**: Different forms of a gene
- **Dominant**: Expressed when present (A)
- **Recessive**: Only expressed when homozygous (a)

### Genotype vs Phenotype
- **Genotype**: Genetic makeup (AA, Aa, aa)
- **Phenotype**: Physical appearance

## Punnett Squares
Used to predict offspring ratios

Example: Aa × Aa
- 25% AA (homozygous dominant)
- 50% Aa (heterozygous)
- 25% aa (homozygous recessive)

Phenotype ratio: 3:1 (dominant:recessive)

## DNA Structure
- Double helix
- Made of nucleotides
- Base pairs: A-T, G-C
- Sugar-phosphate backbone

## Genetic Disorders
- **Sickle Cell Anemia**: Recessive disorder
- **Cystic Fibrosis**: Recessive disorder
- **Huntington's Disease**: Dominant disorder

## Important Laws
1. **Law of Segregation**: Alleles separate during gamete formation
2. **Law of Independent Assortment**: Genes for different traits segregate independently
          `,
                    topics: ['Mendelian Genetics', 'DNA', 'Punnett Squares', 'Genetic Disorders'],
                    createdBy: adminUser._id,
                    isActive: true
                },
                {
                    title: 'Evolution and Natural Selection',
                    subject: bio10._id,
                    grade: '10',
                    chapter: chapters.find(c => c.name === 'Evolution')?._id,
                    content: `
# Evolution and Natural Selection

## Theory of Evolution
Change in heritable characteristics of populations over successive generations.

## Natural Selection (Darwin)
Process by which organisms better adapted to their environment survive and reproduce.

### Requirements for Natural Selection
1. **Variation**: Differences in traits
2. **Inheritance**: Traits passed to offspring
3. **Selection**: Some traits give survival advantage
4. **Time**: Changes occur over many generations

## Evidence for Evolution
1. **Fossil Record**: Shows change over time
2. **Comparative Anatomy**: Similar structures in different species
3. **Embryology**: Similar embryonic development
4. **Molecular Biology**: DNA similarities
5. **Biogeography**: Distribution of species

## Types of Selection
- **Directional**: Favors one extreme
- **Stabilizing**: Favors average
- **Disruptive**: Favors both extremes

## Adaptation
Inherited characteristic that increases survival and reproduction.

Examples:
- Camouflage
- Mimicry
- Antibiotic resistance in bacteria

## Speciation
Formation of new species when populations become reproductively isolated.
          `,
                    topics: ['Natural Selection', 'Adaptation', 'Evidence for Evolution', 'Speciation'],
                    createdBy: adminUser._id,
                    isActive: true
                }
            );
        }

        // Chemistry Grade 9 Notes
        if (chem9) {
            notes.push(
                {
                    title: 'Atomic Structure',
                    subject: chem9._id,
                    grade: '9',
                    content: `
# Atomic Structure

## Structure of an Atom
- **Nucleus**: Contains protons and neutrons
- **Electron Shells**: Electrons orbit the nucleus

## Subatomic Particles
| Particle | Charge | Mass | Location |
|----------|--------|------|----------|
| Proton | +1 | 1 | Nucleus |
| Neutron | 0 | 1 | Nucleus |
| Electron | -1 | 1/1840 | Shells |

## Atomic Number and Mass Number
- **Atomic Number (Z)**: Number of protons
- **Mass Number (A)**: Protons + Neutrons
- **Electrons**: Equal to protons in neutral atom

## Electron Configuration
- First shell: Maximum 2 electrons
- Second shell: Maximum 8 electrons
- Third shell: Maximum 8 electrons (for first 20 elements)

## Isotopes
Atoms of same element with different numbers of neutrons.

Example: Carbon-12 and Carbon-14
          `,
                    topics: ['Atomic Structure', 'Subatomic Particles', 'Electron Configuration', 'Isotopes'],
                    createdBy: adminUser._id,
                    isActive: true
                }
            );
        }

        // Physics Grade 10 Notes
        if (phy10) {
            notes.push(
                {
                    title: 'Forces and Motion',
                    subject: phy10._id,
                    grade: '10',
                    content: `
# Forces and Motion

## Newton's Laws of Motion

### First Law (Inertia)
An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.

### Second Law (F = ma)
Force equals mass times acceleration
- F = Force (N)
- m = Mass (kg)
- a = Acceleration (m/s²)

### Third Law (Action-Reaction)
For every action, there is an equal and opposite reaction.

## Types of Forces
1. **Gravity**: Pulls objects toward Earth
2. **Friction**: Opposes motion
3. **Normal Force**: Perpendicular to surface
4. **Tension**: Force in a rope or string
5. **Applied Force**: Force applied by a person or object

## Motion Equations
- v = u + at
- s = ut + ½at²
- v² = u² + 2as

Where:
- v = final velocity
- u = initial velocity
- a = acceleration
- t = time
- s = displacement

## Key Concepts
- **Speed**: Distance per unit time
- **Velocity**: Speed with direction
- **Acceleration**: Change in velocity per unit time
          `,
                    topics: ['Newton\'s Laws', 'Forces', 'Motion Equations', 'Velocity'],
                    createdBy: adminUser._id,
                    isActive: true
                }
            );
        }

        // Create notes
        const createdNotes = await Note.create(notes);
        console.log(`✅ Created ${createdNotes.length} notes`);

        // ============= PAST PAPERS =============
        const pastPapers = [];

        // Biology Grade 9 Past Papers
        if (bio9) {
            pastPapers.push(
                {
                    title: 'Biology Grade 9 - Annual Examination 2023',
                    subject: bio9._id,
                    grade: '9',
                    year: 2023,
                    term: 'Annual',
                    board: 'Federal Board',
                    duration: 180,
                    totalMarks: 75,
                    sections: [
                        {
                            name: 'Section A - Multiple Choice',
                            marks: 20,
                            questions: 20
                        },
                        {
                            name: 'Section B - Short Questions',
                            marks: 30,
                            questions: 10
                        },
                        {
                            name: 'Section C - Long Questions',
                            marks: 25,
                            questions: 3
                        }
                    ],
                    topics: ['Cell Structure', 'Classification', 'Human Biology', 'Plant Biology'],
                    difficulty: 'medium',
                    createdBy: adminUser._id,
                    isActive: true
                },
                {
                    title: 'Biology Grade 9 - Mid-Term Examination 2023',
                    subject: bio9._id,
                    grade: '9',
                    year: 2023,
                    term: 'Mid-Term',
                    board: 'Federal Board',
                    duration: 120,
                    totalMarks: 50,
                    sections: [
                        {
                            name: 'Section A - MCQs',
                            marks: 15,
                            questions: 15
                        },
                        {
                            name: 'Section B - Short Questions',
                            marks: 20,
                            questions: 8
                        },
                        {
                            name: 'Section C - Long Questions',
                            marks: 15,
                            questions: 2
                        }
                    ],
                    topics: ['Introduction to Biology', 'Cell Structure', 'Cell Division'],
                    difficulty: 'easy',
                    createdBy: adminUser._id,
                    isActive: true
                },
                {
                    title: 'Biology Grade 9 - Annual Examination 2022',
                    subject: bio9._id,
                    grade: '9',
                    year: 2022,
                    term: 'Annual',
                    board: 'Federal Board',
                    duration: 180,
                    totalMarks: 75,
                    sections: [
                        {
                            name: 'Section A - Objective',
                            marks: 20,
                            questions: 20
                        },
                        {
                            name: 'Section B - Subjective',
                            marks: 55,
                            questions: 13
                        }
                    ],
                    topics: ['All Topics'],
                    difficulty: 'medium',
                    createdBy: adminUser._id,
                    isActive: true
                }
            );
        }

        // Biology Grade 10 Past Papers
        if (bio10) {
            pastPapers.push(
                {
                    title: 'Biology Grade 10 - Annual Examination 2023',
                    subject: bio10._id,
                    grade: '10',
                    year: 2023,
                    term: 'Annual',
                    board: 'Federal Board',
                    duration: 180,
                    totalMarks: 85,
                    sections: [
                        {
                            name: 'Section A - MCQs',
                            marks: 20,
                            questions: 20
                        },
                        {
                            name: 'Section B - Short Questions',
                            marks: 35,
                            questions: 12
                        },
                        {
                            name: 'Section C - Long Questions',
                            marks: 30,
                            questions: 4
                        }
                    ],
                    topics: ['Genetics', 'Evolution', 'Ecology', 'Human Systems'],
                    difficulty: 'hard',
                    createdBy: adminUser._id,
                    isActive: true
                },
                {
                    title: 'Biology Grade 10 - Mid-Term Examination 2023',
                    subject: bio10._id,
                    grade: '10',
                    year: 2023,
                    term: 'Mid-Term',
                    board: 'Federal Board',
                    duration: 120,
                    totalMarks: 60,
                    sections: [
                        {
                            name: 'Section A - Objective',
                            marks: 20,
                            questions: 20
                        },
                        {
                            name: 'Section B - Subjective',
                            marks: 40,
                            questions: 10
                        }
                    ],
                    topics: ['Genetics and Heredity', 'Evolution'],
                    difficulty: 'medium',
                    createdBy: adminUser._id,
                    isActive: true
                },
                {
                    title: 'Biology Grade 10 - Annual Examination 2022',
                    subject: bio10._id,
                    grade: '10',
                    year: 2022,
                    term: 'Annual',
                    board: 'Federal Board',
                    duration: 180,
                    totalMarks: 85,
                    sections: [
                        {
                            name: 'Section A - MCQs',
                            marks: 20,
                            questions: 20
                        },
                        {
                            name: 'Section B - Short & Long Questions',
                            marks: 65,
                            questions: 15
                        }
                    ],
                    topics: ['Complete Syllabus'],
                    difficulty: 'hard',
                    createdBy: adminUser._id,
                    isActive: true
                }
            );
        }

        // Create past papers
        const createdPapers = await PastPaper.create(pastPapers);
        console.log(`✅ Created ${createdPapers.length} past papers`);

        console.log('\n📚 Notes and Past Papers Seeding Complete!');
        console.log(`   Notes: ${createdNotes.length}`);
        console.log(`   Past Papers: ${createdPapers.length}`);
        console.log('\n✅ All data has been seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding notes and past papers:', error);
        process.exit(1);
    }
};

seedNotesAndPapers();
