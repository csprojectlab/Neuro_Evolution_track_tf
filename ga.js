/**
 * Generate a new generation, picking best from previous generation.
 */
function nextGeneration () {
    calculateFitness(end);
    for (let i = 0; i < TOTAL; i++) 
        population[i] = pickOne();
    for (let i = 0; i < TOTAL; i++)
        savedParticles[i].dispose();
    savedParticles = [];    
}   // End of nextGeneration function.

/**
 * Pick one particle and mutate it.
 */
function pickOne () {
    let index = 0;
    let r = random(1);
    while (r > 0) {
        r = r - savedParticles[index].fitness;
        index++;
    }   // End of loop.
    index--;
    let particle = savedParticles[index];
    let child = new Particle(particle.brain);
    child.mutate();
    return child;
    // TODO implement copy particle.
}   // End of pickOne function.

/**
 * Calculate the fitness of each particle and normalize it.
 */
function calculateFitness (target) {
    for (let particle of savedParticles) 
        particle.calculateFitness();   // Every particle calculate it's fitness.
    // Normalize the values.
    let sum = 0;
    for (let particle of savedParticles)
        sum += particle.fitness;
    for (let particle of savedParticles)
        particle.fitness = particle.fitness / sum;    
}   // End of calculateFitness function.