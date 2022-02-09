const WorldParticles = 200;

class Utils {
  sample_covidState(person) {
    return d3.randomUniform(1)() < 0.05 ? "infected" : "susceptible";
  }

  sample_susceptibility(person) {
    return randn_bm(1, 0.1);
  }

  sample_infectivity(person) {
    return randn_bm(1, 0.1);
  }

  //functions return probability per day, rest done in sim
  sample_recovery(timeInfected) {
    // guaranteed infection for 2 weeks
    const minInfectionTime = 14;
    if (timeInfected < minInfectionTime) {
      return 0;
    } else {
      var heuristic = 10.0;
      return (timeInfected - minInfectionTime) / heuristic;
    }
  }

  sample_death(timeInfected) {
    // these are both heuristics. decreasing minInfectionTime will rapidly increase death rate
    const minInfectionTime = 17;
    var heuristic = 30.0;
    if (timeInfected < 14) {
      return 0;
    } else {
      return (timeInfected - minInfectionTime) / heuristic;
    }
  }

  sample_infection(timeLatent) {
    // latent phase from 2 -14 days
    if (timeLatent < 2) {
      return 0;
    } else {
      var heuristic = 12.0;
      return (timeLatent - 2.0) / heuristic;
    }
  }

  sample_asymptomatic() {
    return 0.1;
  }
}

class Simulation {
  init(opts) {
    this.width = opts && opts.width ? opts.width : innerWidth;
    this.height = opts && opts.height ? opts.height : innerHeight;
    this.center = [this.width / 2, this.height / 2];
    this.data = [];
    this.timelength = opts && opts.timelength ? opts.timelength : 1000;
    this.ticksPerDay = opts && opts.ticksPerDay ? opts.ticksPerDay : 20;
    this.curTime = 0;
    this.playing = 0;
    this.utils = new Utils()
    // data structure to hold info on how many particles in each compartment. for plotting purposes
    this.compartmentStats = {
      latent: 0,
      asymptomatic: 0,
      infected: 0,
      susceptible: 0,
      recovered: 0,
      dead: 0,
    };

    return this;
  }

  advanceWorld() {
    this.curTime += 1;
  }

  reset() {
    this.curTime = 0;
    this.data = [];
    
    // data structure to hold info on how many particles in each compartment. for plotting purposes
    this.compartmentStats = {"latent":0, "asymptomatic":0, "infected":0, "susceptible": 0, "recovered":0, "dead":0 }

    for (let i = 0; i < WorldParticles; i++) {
      // const radius = d3.randomUniform(2, 5)();
      const radius = 5;
      const temp = d3.randomUniform(1)()
      const temp2 = d3.randomUniform(1)()

      // Add a circle to your simulation with simulation.add
      this.add({
          speed: d3.randomUniform(1, 2)(),
          angle: d3.randomUniform(0, 360)(),
          pos: [
              d3.randomUniform(radius, this.width - radius)(),
              d3.randomUniform(radius, this.height - radius)()
          ],
          radius,
          // TODO logic for determining how many people are infected at the start of the simulation
          covidState: temp < .05 ? "infected" : "susceptible",
          timer: 0,
          quarantineState: temp2 < 0.05 ? true : false,
          // look at utils.js for fn definitions
          susceptibility: calc_susceptibility(),
          infectivity: calc_infectivity()
      });
  }


    

}

  add(person) {
    const d = person || {};
    d.pos = d.pos || [this.width / 2, this.height / 2];
    d.radius = d.radius || 5;
    d.angle = d.angle || 0;
    d.speed = d.speed || 1;
    d.index = this.data.length;
    d.covidState = d.covidState || "susceptible";
    d.susceptibility = d.susceptibility || 1;
    d.infectivity = d.infectivity || 1;
    d.timer = 0;
    d.timeStateStart = 0;

    this.data.push(d);
    this.compartmentStats[d.covidState] += 1;

    return this;
  }

  advance(person) {
    //logic for covid state transitions
    var temp = Math.random();
    var temp2 = Math.random();

    var stateTimeDays =
      (this.curTime - person.timeStateStart) / this.ticksPerDay; //stateTime in days
    if (
      person.covidState == "infected" ||
      person.covidState == "asymptomatic"
    ) {
      if (temp < this.utils.sample_recovery(stateTimeDays) / this.ticksPerDay) {
        this.compartmentStats[person.covidState] -= 1;
        this.compartmentStats["recovered"] += 1;
        person.covidState = "recovered";
        person.timeStateStart = this.curTime;
      } else if (temp2 < this.utils.sample_death(stateTimeDays) / this.ticksPerDay) {
        this.compartmentStats[person.covidState] -= 1;
        person.covidState = "dead";
        this.compartmentStats["dead"] += 1;
        person.timeStateStart = this.curTime;
      }
    } else if (person.covidState == "latent") {
      if (temp < this.utils.sample_infection(stateTimeDays) / this.ticksPerDay) {
        person.timeStateStart = this.curTime;
        this.compartmentStats["latent"] -= 1;
        if (temp2 < this.utils.sample_asymptomatic()) {
          person.covidState = "asymptomatic";
          this.compartmentStats["asymptomatic"] += 1;
        } else {
          person.covidState = "infected";
          this.compartmentStats["infected"] += 1;
        }
      }
    }

    person.timer = person.timer + 1;
    if (person.quarantineState == false) {
    if (person.covidState != "dead") {
      person.pos = geometric.pointTranslate(
        person.pos,
        person.angle,
        person.speed
      );
    }
  }
  }

  interact(person, otherPerson) {
    // To avoid having them stick to each other,
    // test if moving them in each other's angles will bring them closer or farther apart
    const keep = geometric.lineLength([
        geometric.pointTranslate(person.pos, person.angle, person.speed),
        geometric.pointTranslate(
          otherPerson.pos,
          otherPerson.angle,
          otherPerson.speed
        ),
      ]),
      swap = geometric.lineLength([
        geometric.pointTranslate(
          person.pos,
          otherPerson.angle,
          otherPerson.speed
        ),
        geometric.pointTranslate(otherPerson.pos, person.angle, person.speed),
      ]);

    if (keep < swap) {
      const copy = Object.assign({}, person);
      person.angle = otherPerson.angle;
      person.speed = otherPerson.speed;
      otherPerson.angle = copy.angle;
      otherPerson.speed = copy.speed;

      // logic for infection - infection spreads w.p. (susceptible person's) susceptibility * (infected person's )infectivity
      if (
        (person.covidState == "infected" ||
          person.covidState == "asymptomatic") &&
        otherPerson.covidState == "susceptible"
      ) {
        const temp = Math.random();
        if (temp < person.infectivity * otherPerson.susceptibility) {
          otherPerson.covidState = "latent";
          otherPerson.timeStateStart = this.curTime;
          this.compartmentStats["latent"] += 1;
          this.compartmentStats["susceptible"] -= 1;
        }
      }
      if (
        (otherPerson.covidState == "infected" ||
          otherPerson.covidState == "asymptomatic") &&
        person.covidState == "susceptible"
      ) {
        const temp = Math.random();
        if (temp < otherPerson.infectivity * person.susceptibility) {
          person.covidState = "latent";

          this.compartmentStats["latent"] += 1;
          this.compartmentStats["susceptible"] -= 1;
        }
      }
    }
  }

  tick() {
    const quadtree = d3
      .quadtree()
      .x((d) => d.pos[0])
      .y((d) => d.pos[1])
      .extent([-1, -1], [this.width + 1, this.height + 1])
      .addAll(this.data);

    for (let i = 0, l = this.data.length, maxRadius = 0; i < l; i++) {
      const person = this.data[i];

      if (person.radius > maxRadius) maxRadius = person.radius;

      const r = person.radius + maxRadius,
        nx1 = person.pos[0] - r,
        nx2 = person.pos[0] + r,
        ny1 = person.pos[1] - r,
        ny2 = person.pos[1] + r;

      quadtree.visit((visited, x1, y1, x2, y2) => {
        if (visited.data && visited.data.index !== person.index) {
          // if visited block has data attribute , collision has occured 
          if (
            geometric.lineLength([person.pos, visited.data.pos]) <
            person.radius + visited.data.radius
          ) {
            this.interact(person, visited.data);
          }
        }

        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });

      

      // Detect sides
      const wallVertical =
          person.pos[0] <= person.radius ||
          person.pos[0] >= this.width - person.radius,
        wallHorizontal =
          person.pos[1] <= person.radius ||
          person.pos[1] >= this.height - person.radius;

      if (wallVertical || wallHorizontal) {
        // Is it moving more towards the middle or away from it?
        const t0 = geometric.pointTranslate(
          person.pos,
          person.angle,
          person.speed
        );
        const l0 = geometric.lineLength([this.center, t0]);

        const reflected = geometric.angleReflect(
          person.angle,
          wallVertical ? 90 : 0
        );
        const t1 = geometric.pointTranslate(
          person.pos,
          reflected,
          person.speed
        );
        const l1 = geometric.lineLength([this.center, t1]);

        if (l1 < l0) person.angle = reflected;
      }
      this.advance(person);
    }
    this.advanceWorld();
  }


}
