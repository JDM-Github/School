
// Fake sections
const sections = [
    { id: 'N1', name: 'N1' },
    { id: 'N2', name: 'N2' },
    { id: 'N3', name: 'N3' },
    { id: 'N4', name: 'N4' }
];

// Fake student accounts
const studentAccounts = [
    { id: 1, firstName: 'Alice', gradeLevel: 'Grade 11' },
    { id: 2, firstName: 'Bob', gradeLevel: 'Grade 12' },
    { id: 3, firstName: 'Charlie', gradeLevel: 'Grade 11' },
    { id: 4, firstName: 'Diana', gradeLevel: 'Grade 12' },
    { id: 5, firstName: 'Eve', gradeLevel: 'Grade 11' }
];

// Track used sections per year
const usedSections = {};

// Sort students so Grade 12 comes first
studentAccounts.sort((a, b) => {
    if (a.gradeLevel === 'Grade 12' && b.gradeLevel !== 'Grade 12') return -1;
    if (a.gradeLevel !== 'Grade 12' && b.gradeLevel === 'Grade 12') return 1;
    return 0;
});

console.log('Processing order after sort:');
studentAccounts.forEach(s => console.log(`${s.firstName} - ${s.gradeLevel}`));

// // Simulate section assignment
// for (const account of studentAccounts) {
//     const schoolYear = account.gradeLevel === 'Grade 11' ? '2025-2026' : '2024-2025';

//     if (!usedSections[schoolYear]) usedSections[schoolYear] = new Set();

//     // Available sections for this year
//     const availableSections = sections.filter(s => !usedSections[schoolYear].has(s.id));

//     let section;
//     if (availableSections.length > 0) {
//         section = faker.helpers.arrayElement(availableSections);
//     } else {
//         // fallback: pick any used section for the same year
//         const usedArray = Array.from(usedSections[schoolYear]);
//         section = sections.find(s => s.id === faker.helpers.arrayElement(usedArray));
//     }

//     // mark section as used
//     usedSections[schoolYear].add(section.id);

//     console.log(`${account.firstName} (${account.gradeLevel}) assigned to section ${section.id} for ${schoolYear}`);
// }

// console.log('\nUsed sections:', usedSections);
