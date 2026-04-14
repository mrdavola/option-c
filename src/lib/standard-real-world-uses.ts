/**
 * Real-world use cases for Common Core standards (K-2).
 *
 * Each entry has three short, age-appropriate sentences:
 *   - fun:       an exciting or playful use (video games, superheroes, pets)
 *   - career:    how a grown-up job uses this skill
 *   - practical: an everyday use kids recognize (cooking, sharing, family)
 *
 * Written for K-2 readers: no "budgets", "spreadsheets", "investments", etc.
 */

export interface RealWorldUses {
  /** Fun/exciting use — video games, sports, superheroes, pets. */
  fun: string
  /** Career use — engineer, chef, pilot, firefighter. */
  career: string
  /** Everyday/practical use — cooking, sharing, family, school trips. */
  practical: string
}

export const STANDARD_REAL_WORLD_USES: Record<string, RealWorldUses> = {
  // ============================================================
  // KINDERGARTEN — Counting & Cardinality
  // ============================================================

  "K.CC.A": {
    fun: "Count the stars in the night sky, or count your superhero action figures!",
    career: "Scientists count animals in a forest and pilots count passengers on planes.",
    practical: "Count the days till your birthday, or count your steps on a walk.",
  },
  "K.CC.A.1": {
    fun: "Count the stars in the night sky, or count your superhero action figures!",
    career: "Scientists count stars and animals; pilots count passengers on planes.",
    practical: "Counting helps you share snacks fairly and count days till your birthday.",
  },
  "K.CC.A.2": {
    fun: "In video games you count down from a number before a race starts!",
    career: "Rocket scientists count down 10, 9, 8... before a launch.",
    practical: "When you're hiding in hide-and-seek, counting from a number is a big part of the game.",
  },
  "K.CC.A.3": {
    fun: "Write the jersey number of your favorite sports player on a drawing!",
    career: "Mail carriers write numbers on every package they deliver.",
    practical: "Writing numbers helps you make your birthday invitations and mark pages.",
  },
  "K.CC.B": {
    fun: "Count how many puppies, kittens, or dinosaur toys you have in your collection!",
    career: "Zookeepers count each animal to make sure they're all safe.",
    practical: "Count the cookies on a plate so everyone in the family gets one.",
  },
  "K.CC.B.4": {
    fun: "Count the pokemon cards in your deck to see how big your team is!",
    career: "Librarians count books so they know how many are on the shelf.",
    practical: "Count plates on the table to see if everyone has one.",
  },
  "K.CC.B.4a": {
    fun: "When you count your toys, you give each one its own number — like naming them!",
    career: "Scientists count every frog in a pond without missing any, one by one.",
    practical: "When sharing crackers, point to each one so you don't skip any.",
  },
  "K.CC.B.4b": {
    fun: "No matter how you line up your toy cars, you still have the same number!",
    career: "Farmers count sheep from any side of the field — the total is the same.",
    practical: "Counting grapes in a pile or in a line gives the same answer.",
  },
  "K.CC.B.4c": {
    fun: "Level up in a game by adding one more star every time!",
    career: "Bakers add one more scoop to keep track of cookies baking.",
    practical: "One more, one more, one more — like adding people to a group hug!",
  },
  "K.CC.B.5": {
    fun: "Count the bubbles you blow, or the crayons in your box!",
    career: "Chefs count eggs, cups, and spoons when they're cooking.",
    practical: "Count how many socks are in your drawer before laundry day.",
  },
  "K.CC.C": {
    fun: "See who has more stickers — you or your best friend!",
    career: "Coaches compare team scores to see who is winning.",
    practical: "Compare cookies in two jars to see which has more.",
  },
  "K.CC.C.6": {
    fun: "Compare two dinosaur piles to see which team is bigger in your pretend battle!",
    career: "Teachers compare the number of kids in two lines to make them fair.",
    practical: "See which bowl of popcorn has more, so siblings can share fairly.",
  },
  "K.CC.C.7": {
    fun: "Which is bigger: 7 goals or 4 goals? Cheer for the winning team!",
    career: "Doctors compare numbers to see if a kid is healthy and growing.",
    practical: "Compare two prices at the store to pick the smaller one.",
  },

  // ============================================================
  // K — Operations & Algebraic Thinking
  // ============================================================

  "K.OA.A": {
    fun: "Add your game points after each round, or count how many monsters you caught!",
    career: "Chefs add ingredients together and subtract cookies from the tray.",
    practical: "Adding happens when friends join your game; subtracting when they leave.",
  },
  "K.OA.A.1": {
    fun: "Add superhero power-ups, or subtract villains you've beaten in a game!",
    career: "Firefighters add water from hoses and subtract problems one by one.",
    practical: "Put two groups of Legos together, or take some away to share.",
  },
  "K.OA.A.2": {
    fun: "If you had 5 Pokemon and caught 3 more, how many do you have now?",
    career: "Chefs solve problems like 'I have 6 eggs, I need 4 more'.",
    practical: "If you have 7 grapes and eat 2, you can figure out how many are left.",
  },
  "K.OA.A.3": {
    fun: "Split your 10 toy cars into teams — 3 and 7? 5 and 5? So many ways!",
    career: "Game designers split players into fair teams to make the game fun.",
    practical: "Share a plate of 6 cookies with a friend — 3 and 3, or 4 and 2.",
  },
  "K.OA.A.4": {
    fun: "You have 7 dinosaurs — how many more do you need to have 10?",
    career: "Builders figure out how many more bricks they need to finish a wall.",
    practical: "If 6 kids are at your party and 10 is the goal, 4 more friends can come!",
  },
  "K.OA.A.5": {
    fun: "Adding or subtracting tiny numbers fast helps you win quick games!",
    career: "Cashiers quickly add up small numbers like 2 + 3 in their head.",
    practical: "Quickly figure out if you have enough cookies for you and a sibling.",
  },

  // ============================================================
  // K — Number & Operations in Base Ten
  // ============================================================

  "K.NBT.A": {
    fun: "A game with 15 coins = 1 bag of 10 + 5 extra coins!",
    career: "Store workers pack 10 items in a box and the rest go on top.",
    practical: "A crate of 12 eggs is 10 eggs plus 2 more.",
  },
  "K.NBT.A.1": {
    fun: "13 stickers = 1 sheet of 10 + 3 extras on your notebook!",
    career: "Pizza shops pack 10 to a box; 14 means 1 box plus 4 extra.",
    practical: "A pack of 10 crackers plus 6 loose = 16 total.",
  },

  // ============================================================
  // K — Measurement & Data
  // ============================================================

  "K.MD.A": {
    fun: "Measure your pet with blocks to see how long your cat is!",
    career: "Carpenters measure wood to build houses and treehouses.",
    practical: "Measure your foot to see if your shoes still fit.",
  },
  "K.MD.A.1": {
    fun: "Is your toy dragon longer than your action figure? Measure to find out!",
    career: "Tailors measure arms and legs to make shirts and pants that fit.",
    practical: "Measure a table to see if a new chair will fit beside it.",
  },
  "K.MD.A.2": {
    fun: "Stack two towers — which superhero's is taller?",
    career: "Coaches measure kids to place them in teams by size.",
    practical: "Compare two backpacks to see which one holds more.",
  },
  "K.MD.B": {
    fun: "Sort your stuffed animals into bears, dogs, and cats — which has the most?",
    career: "Grocery workers sort fruits into bins and count each type.",
    practical: "Sort laundry into shirts, pants, and socks — count each pile.",
  },
  "K.MD.B.3": {
    fun: "Group your Pokemon cards by type — which has the most fire types?",
    career: "Veterinarians sort pets into dogs, cats, and rabbits to help them.",
    practical: "Sort clean laundry into your clothes, your sibling's, and towels.",
  },

  // ============================================================
  // K — Geometry
  // ============================================================

  "K.G.A": {
    fun: "Find circles, squares, and triangles in your favorite cartoon characters!",
    career: "Architects use shapes to design buildings and playgrounds.",
    practical: "Spot shapes on street signs — triangles warn, circles say stop.",
  },
  "K.G.A.1": {
    fun: "Find a square pizza, a round cookie, and a triangle slice of watermelon!",
    career: "Artists draw shapes to create pictures, comics, and animated movies.",
    practical: "Notice the shapes of your plate, cup, and napkin at dinner.",
  },
  "K.G.A.2": {
    fun: "A triangle is still a triangle if you flip it upside down in your drawing!",
    career: "Graphic designers rotate shapes to make logos and posters.",
    practical: "A book is a rectangle whether it's standing up or lying flat.",
  },
  "K.G.A.3": {
    fun: "A toy ball is 3D, but a drawing of a ball on paper is 2D!",
    career: "3D printer operators design shapes flat, then build them tall.",
    practical: "A flat cracker is 2D; a cereal box is 3D.",
  },
  "K.G.B": {
    fun: "Build with blocks — stack squares to make a tower or triangles for a roof!",
    career: "Engineers put shapes together to build bridges and skyscrapers.",
    practical: "Fit puzzle pieces together to see how shapes make pictures.",
  },
  "K.G.B.4": {
    fun: "Compare a beach ball and a block — one rolls, one doesn't!",
    career: "Toy designers pick shapes that are safe and fun to play with.",
    practical: "A ball rolls off the table but a box stays put — shapes matter!",
  },
  "K.G.B.5": {
    fun: "Build a triangle out of 3 pretzel sticks, or a square with 4!",
    career: "Builders put sticks and beams together to make a house frame.",
    practical: "Stack blocks to make castles, forts, and race tracks.",
  },
  "K.G.B.6": {
    fun: "Two triangles make a square — now you can build a pyramid fort!",
    career: "Quilt makers sew shapes together to make big, cozy blankets.",
    practical: "Two slices of pizza make a square — or half a round pizza!",
  },

  // ============================================================
  // GRADE 1 — Operations & Algebraic Thinking
  // ============================================================

  "1.OA.A": {
    fun: "Add up your soccer goals, or subtract enemies in a video game!",
    career: "Chefs add cups of flour, then subtract when they use some.",
    practical: "Add candy from two bags, then subtract what you share with friends.",
  },
  "1.OA.A.1": {
    fun: "If you caught 12 fish and your friend caught 8, who caught more and by how many?",
    career: "Rangers solve problems like 'there were 15 birds, now 6 flew away'.",
    practical: "Figure out how many cookies are left after everyone takes some.",
  },
  "1.OA.A.2": {
    fun: "Add points from 3 mini-games: 4 + 3 + 5 = your total high score!",
    career: "Pizza makers add 3 toppings at a time to count slices sold.",
    practical: "Count fruit in a basket: 5 apples + 3 bananas + 4 oranges.",
  },
  "1.OA.B": {
    fun: "5 + 2 is the same as 2 + 5 — the score is the same either way!",
    career: "Cashiers add numbers in any order — they always get the same total.",
    practical: "When stacking blocks, 3 + 4 + 7 is the same as 7 + 3 + 4.",
  },
  "1.OA.B.3": {
    fun: "Trick: 9 + 6 is tricky, but 9 + 1 + 5 = 10 + 5 = 15!",
    career: "Store clerks group numbers smartly to add up prices fast.",
    practical: "Count coins by grouping to ten first — super fast!",
  },
  "1.OA.B.4": {
    fun: "If you know 6 + 4 = 10, you know 10 − 4 = 6 in the same game!",
    career: "Bike mechanics use the same idea to check change back.",
    practical: "If 8 + 2 = 10, then 10 cookies minus 8 leaves 2 left.",
  },
  "1.OA.C": {
    fun: "Count on from 7: 8, 9, 10 — level complete!",
    career: "Scorekeepers count on to add the next player's score.",
    practical: "Count on from 15 steps when walking up stairs: 16, 17, 18.",
  },
  "1.OA.C.5": {
    fun: "In a race, count on from where you were: 'I was at 8, I ran 4 more, now 12!'",
    career: "Coaches count on from last score to add new points.",
    practical: "Count on from your age when saying how old you'll be next year.",
  },
  "1.OA.C.6": {
    fun: "Fast adders win quick-reaction games — 7 + 8 = 15 in a flash!",
    career: "Baseball players add up their runs quickly during a game.",
    practical: "Quickly add money in your piggy bank to see if you can buy a toy.",
  },
  "1.OA.D": {
    fun: "Mystery blank: 7 + ? = 10 — solve it to unlock the treasure!",
    career: "Game designers set target numbers and figure out how to reach them.",
    practical: "You have 3 cookies; how many more to get 10? Solve the puzzle.",
  },
  "1.OA.D.7": {
    fun: "Prove two teams tied: 3 + 4 and 2 + 5 — both equal 7!",
    career: "Judges check that both sides of a scale weigh the same.",
    practical: "Check that two groups of candy are fair: 2+3 = 4+1 = 5 each.",
  },
  "1.OA.D.8": {
    fun: "Find the missing power-up: 4 + ? = 10 to beat the level!",
    career: "Builders figure out how many more bricks they need for a wall.",
    practical: "If you have 5 stickers and want 12, how many more do you need?",
  },

  // ============================================================
  // GRADE 1 — Number & Operations in Base Ten
  // ============================================================

  "1.NBT.A": {
    fun: "Count points up to 120 in a long video game marathon!",
    career: "Scorekeepers tally up to big numbers in games and races.",
    practical: "Count all the pennies in your jar — you might have over 100!",
  },
  "1.NBT.A.1": {
    fun: "Count every step on a big hike, or every jump on a trampoline!",
    career: "Runners count laps around a track — sometimes past 100!",
    practical: "Count the raindrops on a window — you'll pass 100 quickly.",
  },
  "1.NBT.B": {
    fun: "Which team scored more: 47 or 74 points? Same digits, different place!",
    career: "Store clerks know 23 apples is way less than 32 apples.",
    practical: "45 cents and 54 cents are different — place value matters.",
  },
  "1.NBT.B.2": {
    fun: "In 56, the 5 means 5 bundles of 10 and the 6 means 6 singles — like cards!",
    career: "Bakers pack cookies in tens; 36 cookies = 3 packs + 6 loose.",
    practical: "24 crayons in a box: 2 rows of 10 plus 4 extras.",
  },
  "1.NBT.B.2a": {
    fun: "Ten coins make one bundle — like a magic combo!",
    career: "Coin rollers pack 10 pennies into one roll to count faster.",
    practical: "10 fingers make 1 'ten' — your hands are perfect counters!",
  },
  "1.NBT.B.2b": {
    fun: "13 monsters defeated = 1 bundle of 10 + 3 more!",
    career: "Egg cartons often hold 12: 1 ten + 2 ones.",
    practical: "14 crackers = 10 in a stack + 4 more on the side.",
  },
  "1.NBT.B.2c": {
    fun: "Level 70 means 7 bundles of 10 — hard to reach!",
    career: "Delivery drivers with 40 boxes have 4 stacks of 10.",
    practical: "50 balloons at a party = 5 big bundles of 10.",
  },
  "1.NBT.B.3": {
    fun: "Compare scores with your friend — is 67 or 76 bigger? (Hint: 76!)",
    career: "Sports announcers compare scores all game long.",
    practical: "At the store, compare 45 cents to 54 cents before choosing.",
  },
  "1.NBT.C": {
    fun: "Add up your scores from two levels: 45 + 20 = 65 points!",
    career: "Pizza shop clerks add 23 + 30 when two orders come in.",
    practical: "Add 15 steps up the stairs plus 10 more: 25 total.",
  },
  "1.NBT.C.4": {
    fun: "Combine 34 gold coins + 28 gems to see your treasure total!",
    career: "Cashiers add 45 cents + 16 cents to find the total cost.",
    practical: "Add 24 stickers in your book + 9 new ones = 33 total.",
  },
  "1.NBT.C.5": {
    fun: "Power-up gives +10 health: go from 47 to 57 in one jump!",
    career: "Trainers add or subtract 10 reps without counting each one.",
    practical: "Find 10 more pages to read in a 45-page book: 55 pages total.",
  },
  "1.NBT.C.6": {
    fun: "Subtract 30 from 80 when you use a giant power-down move!",
    career: "Warehouse workers subtract bundles of 10 from stock counts.",
    practical: "If 60 balloons and 20 pop, 40 left to play with!",
  },

  // ============================================================
  // GRADE 1 — Measurement & Data
  // ============================================================

  "1.MD.A": {
    fun: "See how much longer your new dinosaur toy is than your old one!",
    career: "Tailors compare arm lengths to make sleeves that fit just right.",
    practical: "Compare your shoe to your sibling's to see whose is longer.",
  },
  "1.MD.A.1": {
    fun: "Line up 3 of your friends and see who is tallest, shortest, and in the middle!",
    career: "Sports coaches line up players from shortest to tallest for team photos.",
    practical: "Order three books by how tall they are so they fit on the shelf.",
  },
  "1.MD.A.2": {
    fun: "Measure your bed with stuffed animals — how many long is it?",
    career: "Carpenters measure wood with a ruler to cut it the right length.",
    practical: "Measure your desk with paperclips to see how wide it is.",
  },
  "1.MD.B": {
    fun: "Check the clock to see if it's cartoon time yet!",
    career: "Pilots read clocks to take off and land on time.",
    practical: "Know when to head to school by reading the clock.",
  },
  "1.MD.B.3": {
    fun: "Set a timer for 30 minutes of game time!",
    career: "Chefs use clocks to know when to take food out of the oven.",
    practical: "Know when school starts by reading the clock: 8:30!",
  },
  "1.MD.C": {
    fun: "Make a chart of your favorite pizza toppings at your party!",
    career: "Scientists make charts to show what they found in experiments.",
    practical: "Chart your family's favorite ice cream flavors to help pick for a party.",
  },
  "1.MD.C.4": {
    fun: "Make a chart of your Pokemon types — which has the most?",
    career: "Zookeepers chart how many animals of each kind live at the zoo.",
    practical: "Chart the fruits in the fruit bowl — apples, bananas, oranges.",
  },

  // ============================================================
  // GRADE 1 — Geometry
  // ============================================================

  "1.G.A": {
    fun: "Shapes make up everything — from game characters to buildings in movies!",
    career: "Architects use shapes and their attributes to design amazing homes.",
    practical: "Spot shapes in your room: window (rectangle), plate (circle).",
  },
  "1.G.A.1": {
    fun: "A triangle is always a triangle — red, blue, big, small — it has 3 sides!",
    career: "Road sign makers know the shape tells drivers what to do.",
    practical: "Pick out the 'triangle' snacks from a cracker box.",
  },
  "1.G.A.2": {
    fun: "Build a spaceship from triangle wings and a rectangle body!",
    career: "Quilt makers sew small shapes into big designs.",
    practical: "Fit puzzle pieces to make one big picture.",
  },
  "1.G.A.3": {
    fun: "Split your pizza into halves or quarters so everyone gets a piece!",
    career: "Bakers cut cakes into halves and fourths for parties.",
    practical: "Share a sandwich in halves — each piece is half of the whole.",
  },

  // ============================================================
  // GRADE 2 — Operations & Algebraic Thinking
  // ============================================================

  "2.OA.A": {
    fun: "Add up your game scores across 2 rounds: 45 + 38 = total win points!",
    career: "Store clerks add two-digit numbers all day long.",
    practical: "Add how many crackers you have across 2 boxes.",
  },
  "2.OA.A.1": {
    fun: "You had 50 cards, lost 18 trades, won 25 — how many cards now?",
    career: "Librarians add and subtract books as they're checked out and returned.",
    practical: "You have 45 stickers, use 12, get 10 more — now how many?",
  },
  "2.OA.B": {
    fun: "Add 7 + 8 in a flash to win the quick-math game!",
    career: "Basketball players add points fast as the game goes.",
    practical: "Quickly add how many crayons are in two pencil boxes.",
  },
  "2.OA.B.2": {
    fun: "Lightning-fast math: 9 + 7 = 16 without even thinking!",
    career: "Chefs add cups and spoons fast without stopping to count.",
    practical: "Add how many pieces of fruit are in your lunch box in a second.",
  },
  "2.OA.C": {
    fun: "Odd team or even team? Line up your toys in pairs to find out!",
    career: "Dance teachers pair up students — odd numbers mean one is left over.",
    practical: "Pair your socks — an odd number means one is missing.",
  },
  "2.OA.C.3": {
    fun: "Even numbers team up perfectly — odd numbers leave a lonely one!",
    career: "Soccer coaches match players; odd players sit out one round.",
    practical: "Check if you can share candy evenly with a sibling — odd leaves one extra.",
  },
  "2.OA.C.4": {
    fun: "A pretend garden: 4 rows of 3 flowers = 12 blooms!",
    career: "Gardeners plant in rows and columns to know how many seeds they need.",
    practical: "An egg carton has 2 rows of 6 = 12 eggs.",
  },

  // ============================================================
  // GRADE 2 — Number & Operations in Base Ten
  // ============================================================

  "2.NBT.A": {
    fun: "High scores can climb to 347 — that's 3 hundreds + 4 tens + 7 ones!",
    career: "Bookstore clerks know 347 books means 3 big stacks of 100.",
    practical: "A page number 258 is 2 hundreds + 5 tens + 8 ones.",
  },
  "2.NBT.A.1": {
    fun: "Your score is 506: 5 hundreds, 0 tens, and 6 ones!",
    career: "Librarians read book numbers using hundreds, tens, and ones.",
    practical: "House number 421 is 4 hundreds + 2 tens + 1 one.",
  },
  "2.NBT.A.1a": {
    fun: "100 points = 10 bundles of 10 — like 10 stacked power-ups!",
    career: "Coin rollers bundle 100 pennies into 10 rolls of 10.",
    practical: "100 crackers in a box is 10 stacks of 10.",
  },
  "2.NBT.A.1b": {
    fun: "A level worth 500 points = 5 hundred-packs in your inventory!",
    career: "Factory workers count 300 items as 3 boxes of 100.",
    practical: "300 paperclips come in 3 boxes of 100.",
  },
  "2.NBT.A.2": {
    fun: "Skip-count by 5s when counting your pretend money: 5, 10, 15, 20!",
    career: "Cashiers skip-count coins: 5, 10, 15 for nickels.",
    practical: "Count by 10s when counting toes: 10, 20, 30 toes in the room!",
  },
  "2.NBT.A.3": {
    fun: "Write a score of 758 as 700 + 50 + 8 in your notebook!",
    career: "Mailcarriers read 3-digit house numbers all day.",
    practical: "Write your house number clearly: 235 = 200 + 30 + 5.",
  },
  "2.NBT.A.4": {
    fun: "Who leveled up more: a player at 456 XP or 465 XP? Check the tens!",
    career: "Sports commentators compare 3-digit scores all game.",
    practical: "Compare prices: 345 cents vs 354 cents — always pick the lower one.",
  },
  "2.NBT.B": {
    fun: "Add up two rounds: 234 + 125 = your grand total!",
    career: "Cashiers add and subtract 3-digit numbers at the register.",
    practical: "Add pages read: 120 pages Monday + 85 pages Tuesday = 205.",
  },
  "2.NBT.B.5": {
    fun: "Add high scores: 47 + 38 = new record!",
    career: "Store workers add two-digit prices fast in their head.",
    practical: "Add how many steps walked in the morning + afternoon.",
  },
  "2.NBT.B.6": {
    fun: "Add four mini-game scores: 22 + 18 + 15 + 25 = big win!",
    career: "Coaches add up scores from four quarters of a game.",
    practical: "Add four weeks of allowance: 5 + 5 + 5 + 5 = 20.",
  },
  "2.NBT.B.7": {
    fun: "Add 234 + 156 to see your combined treasure!",
    career: "Architects add up lengths to build bridges and tall buildings.",
    practical: "Add miles on a car trip: 134 + 89 = 223 miles.",
  },
  "2.NBT.B.8": {
    fun: "Power-up gives +100 health: from 347 straight to 447!",
    career: "Factory workers add 100 packages without counting each.",
    practical: "Adding 10 days to a date? Just bump the tens.",
  },
  "2.NBT.B.9": {
    fun: "Explain your cool math trick to a friend and teach them to win the game!",
    career: "Math teachers explain why adding works to help kids learn.",
    practical: "Show your little sibling how adding 20 + 30 just means adding 2 + 3 tens.",
  },

  // ============================================================
  // GRADE 2 — Measurement & Data
  // ============================================================

  "2.MD.A": {
    fun: "Measure your pet in inches and compare to your stuffed animals!",
    career: "Builders use rulers and yardsticks to make every part fit.",
    practical: "Measure a window to see if a new curtain will fit.",
  },
  "2.MD.A.1": {
    fun: "Measure your longest paper airplane throw in inches or feet!",
    career: "Carpenters pick the right tool: inches for small, yards for big.",
    practical: "Use a ruler to measure a new book for the shelf.",
  },
  "2.MD.A.2": {
    fun: "Measure your jump in feet AND inches — same jump, two numbers!",
    career: "Scientists measure the same thing with different units to double-check.",
    practical: "Measure a pencil in inches, then in centimeters.",
  },
  "2.MD.A.3": {
    fun: "Guess how tall your superhero cape is, then measure to see!",
    career: "Movers estimate box sizes to know what fits in the truck.",
    practical: "Estimate how far your bedroom is from the kitchen in steps.",
  },
  "2.MD.A.4": {
    fun: "How many inches longer is your snake drawing than your friend's?",
    career: "Tailors figure out how much to add or cut for the right fit.",
    practical: "Measure two ropes to see how much longer one is before tying.",
  },
  "2.MD.B": {
    fun: "Walk 30 feet to the tree, then 20 feet to the swing — total distance!",
    career: "Map makers add path lengths to show how far it is to walk somewhere.",
    practical: "Walk 25 feet to the mailbox, then 15 back — you walked 40 feet total.",
  },
  "2.MD.B.5": {
    fun: "Your paper airplane flew 25 ft, then 18 ft — total distance?",
    career: "Delivery drivers add miles to know how far they've driven.",
    practical: "Add your walk to school + walk back = total distance today.",
  },
  "2.MD.B.6": {
    fun: "Hop along a number line to win the math race!",
    career: "Map designers mark numbers on maps to show distance.",
    practical: "Use a ruler like a number line to add or subtract lengths.",
  },
  "2.MD.C": {
    fun: "Set a 20-minute timer for game time, then a 10-minute cleanup!",
    career: "Chefs set timers for everything they cook.",
    practical: "Know when your favorite show starts and ends.",
  },
  "2.MD.C.7": {
    fun: "Tell time to know when recess starts — 10:15!",
    career: "Pilots and train conductors read clocks to the minute.",
    practical: "Know when school ends — watch the clock for 3:05.",
  },
  "2.MD.C.8": {
    fun: "Count your coins to see how many video game tokens you can buy!",
    career: "Cashiers count dollars and coins to give correct change.",
    practical: "Count your piggy bank coins to see what toy you can get.",
  },
  "2.MD.D": {
    fun: "Chart your favorite superhero teams to see which has the most fans!",
    career: "Scientists make charts to show what they found in experiments.",
    practical: "Chart the toys in your room to see which type you have most of.",
  },
  "2.MD.D.9": {
    fun: "Measure all your pencils and chart which length is most common!",
    career: "Scientists measure plants each week and chart how they grow.",
    practical: "Measure shoes in your family — chart the sizes.",
  },
  "2.MD.D.10": {
    fun: "Make a bar graph of your class's favorite ice cream — which wins?",
    career: "Weather scientists make graphs to show rain and snow each month.",
    practical: "Make a bar chart of your week's stickers earned each day.",
  },

  // ============================================================
  // GRADE 2 — Geometry
  // ============================================================

  "2.G.A": {
    fun: "Spot hexagons in a soccer ball and triangles in pizza slices!",
    career: "Designers use shapes to make everything from logos to cereal boxes.",
    practical: "Find shapes in your home — clocks, books, cereal boxes.",
  },
  "2.G.A.1": {
    fun: "Draw a shape with 5 sides — that's a pentagon, like a house roof drawing!",
    career: "Graphic designers pick shapes with the right number of sides for logos.",
    practical: "Notice road signs: octagons mean STOP, triangles mean YIELD.",
  },
  "2.G.A.2": {
    fun: "A chessboard has 8 rows × 8 cols = 64 squares — huge!",
    career: "Tile layers plan rectangles of tiles for floors: rows × cols.",
    practical: "An ice cube tray has 2 rows of 7 = 14 cubes.",
  },
  "2.G.A.3": {
    fun: "Share a pizza — halves for 2, thirds for 3, fourths for 4 friends!",
    career: "Bakers cut cakes into halves, thirds, or fourths for parties.",
    practical: "Split a sandwich into halves for you and a sibling.",
  },

  // ============================================================
  // GRADE 3
  // ============================================================

  "3.OA.A": {
    fun: "Build a LEGO wall 5 bricks long and 3 tall — 15 bricks total, a perfect rectangle!",
    career: "Farmers plant crops in rows — 8 rows of 12 tomatoes means 96 tomatoes at harvest.",
    practical: "Order 2 pizzas cut into 8 slices each: 2 × 8 = 16 slices for the family.",
  },
  "3.OA.A.1": {
    fun: "Stack 4 rows of 6 Pokemon cards to see how your collection grows — 24 cards!",
    career: "A bakery boxes cupcakes in trays: 4 rows of 6 cupcakes = 24 per tray.",
    practical: "When setting the table for 5 people with 3 forks each, that's 15 forks total.",
  },
  "3.OA.A.2": {
    fun: "Split 24 candies into 4 equal Halloween bags — 6 candies per bag!",
    career: "Camp counselors divide 30 kids into 5 equal teams — 6 kids each.",
    practical: "Sharing 12 grapes among 4 friends means each gets 3 grapes.",
  },
  "3.OA.A.3": {
    fun: "In Minecraft, 6 chests of 9 diamonds each — 54 diamonds to build with!",
    career: "Librarians shelve 45 books in stacks of 9 — 5 stacks line the shelf.",
    practical: "Packing snacks: 3 bags of 7 crackers = 21 crackers for the trip.",
  },
  "3.OA.A.4": {
    fun: "If 6 friends share treats equally and each gets 4, you packed 24 treats!",
    career: "Coaches figure missing numbers: 8 players × ? bags of balls = 48, so 6 bags each.",
    practical: "If your lunchbox has 3 rows and 15 snacks fit, each row holds 5.",
  },
  "3.OA.B": {
    fun: "7 × 8 is hard, but 7 × 5 + 7 × 3 = 35 + 21 = 56 — a superpower shortcut!",
    career: "Video-game designers use shortcuts like 4 × 6 = 6 × 4 to save coding time.",
    practical: "When you know 5 × 6 = 30, you also know 6 × 5 = 30 — same answer!",
  },
  "3.OA.B.5": {
    fun: "To multiply 3 × 7 × 2, first do 3 × 2 = 6, then 6 × 7 = 42 — easier that way!",
    career: "Engineers rearrange numbers to make math faster when designing machines.",
    practical: "When buying 2 packs of 5 candy × 4 friends, do 2 × 4 = 8, then 8 × 5 = 40.",
  },
  "3.OA.B.6": {
    fun: "Think of 42 ÷ 7 as 'how many 7s equal 42?' — the answer is 6 Pokemon gyms!",
    career: "Warehouse workers ask 'how many boxes of 8 make 48?' to pack shipments.",
    practical: "56 crackers split into plates of 7 means 8 plates for snack time.",
  },
  "3.OA.C": {
    fun: "Knowing 7 × 8 = 56 by heart is like a video-game cheat code for math!",
    career: "Cashiers quickly calculate 9 packs of 6 sodas = 54 sodas.",
    practical: "Weekly chores: 7 days × 4 dishes = 28 dishes to wash a week.",
  },
  "3.OA.C.7": {
    fun: "Memorizing times tables is like leveling up — every fact is a new power!",
    career: "Carpenters instantly know 8 × 9 = 72 when laying out floorboards.",
    practical: "7 days of 8 hours of sleep = 56 hours of rest each week.",
  },
  "3.OA.D": {
    fun: "Save $5 a week for 6 weeks, then buy a $25 game: $30 - $25 = $5 left for candy!",
    career: "Store managers use two-step math: 4 boxes of 12 minus 8 sold = 40 left.",
    practical: "Buy 3 apples at $2 each with $10: 10 - 6 = $4 change.",
  },
  "3.OA.D.8": {
    fun: "Earn 9 coins per level across 5 levels, spend 12 on a power-up — 33 coins left!",
    career: "A baker makes 6 dozen cookies (72), gives away 18, still has 54 left.",
    practical: "Pack 3 bags of 4 snacks + 5 loose — 17 snacks for the picnic.",
  },
  "3.OA.D.9": {
    fun: "Pokemon levels 5, 10, 15, 20 follow a +5 pattern — next level up is 25!",
    career: "Scientists spot patterns in nature: tree rings, bee cells, seashell spirals.",
    practical: "Even numbers like 2, 4, 6, 8, 10 make it fast to count by 2s when sharing.",
  },
  "3.NBT.A": {
    fun: "Round high scores: 487 rounds to 500 — sounds way more impressive!",
    career: "Accountants round numbers to nearest 100 to estimate costs quickly.",
    practical: "At the store, 479 is about $500 — helps you know if you have enough.",
  },
  "3.NBT.A.1": {
    fun: "In a race with 38 racers, say 'about 40 racers' — sounds way cooler!",
    career: "News reporters round: '248 fans' becomes 'about 250 fans'.",
    practical: "If a book has 192 pages, you can say 'about 200 pages' to friends.",
  },
  "3.NBT.A.2": {
    fun: "Count coins from your jar: 234 pennies + 156 pennies = 390 pennies total!",
    career: "Librarians add numbers of books: 467 fiction + 289 nonfiction = 756 books.",
    practical: "Trip odometer: 812 miles so far minus 347 you already drove = 465 left.",
  },
  "3.NBT.A.3": {
    fun: "9 dungeons with 80 coins each — 720 coins collected, quick multiply by tens!",
    career: "Concert planners find seats: 7 sections × 50 seats = 350 people.",
    practical: "5 boxes of 60 crayons to donate = 300 crayons for classrooms.",
  },
  "3.NF.A": {
    fun: "A pizza in 8 equal slices — each slice is 1/8, and 4 slices is 4/8 = 1/2!",
    career: "Chefs use fractions: 1/4 cup of sugar, 2/3 cup of flour in recipes.",
    practical: "Share a chocolate bar with 3 friends — each gets 1/4 of the bar.",
  },
  "3.NF.A.1": {
    fun: "Cut a pizza into 6 slices — each slice is 1/6, like Pokemon types in a type chart!",
    career: "Pharmacists split pills into halves or thirds for exact doses.",
    practical: "A granola bar split into 4 equal pieces means each kid gets 1/4.",
  },
  "3.NF.A.2": {
    fun: "A jump rope game with 4 marks from 0 to 1 — jump to 3/4 to win!",
    career: "Musicians count fractions of beats: 1/4 note, 1/8 note, 1/2 note in music.",
    practical: "A ruler showing 1/4 inch marks helps kids measure tiny toys.",
  },
  "3.NF.A.2a": {
    fun: "Your racecourse from 0 to 1 split in 4 parts — 1/4 is the first checkpoint!",
    career: "Runners mark laps: a 400 m track divided into 4 equal 100 m legs.",
    practical: "Cut a licorice rope into 3 equal pieces — the first mark is 1/3.",
  },
  "3.NF.A.2b": {
    fun: "In a video game, take 3 jumps of 1/4 to land on 3/4 of the map!",
    career: "Carpenters measure 5 lengths of 1/8 inch to mark 5/8 on a board.",
    practical: "If a cup has 4 levels, filling to the 3rd mark is 3/4 full.",
  },
  "3.NF.A.3": {
    fun: "2/4 of a pizza is the same as 1/2 — same slice, different way to say it!",
    career: "Bakers know 2/4 cup = 1/2 cup — equivalent fractions in recipes.",
    practical: "1/2 of your allowance is the same as 4/8 — still half of the total.",
  },
  "3.NF.A.3a": {
    fun: "1/2 and 2/4 of a chocolate bar are the exact same chunk!",
    career: "Chefs swap 4/8 cup for 1/2 cup — identical amounts.",
    practical: "Half a sandwich and 2/4 of a sandwich look different, but taste the same.",
  },
  "3.NF.A.3b": {
    fun: "Level up: 1/2 = 2/4 = 4/8 — they're all the same in Minecraft inventory slots!",
    career: "Tailors convert 3/4 yard to 6/8 yard for measuring fabric.",
    practical: "When doubling a recipe, 1/3 becomes 2/6 — same size, new numbers.",
  },
  "3.NF.A.3c": {
    fun: "Whole pizza = 8/8 — every slice adds up to one whole pizza!",
    career: "Engineers know 5 meters = 5/1 meters — whole numbers are fractions too.",
    practical: "1 whole apple = 4/4 of an apple when it's cut into quarters.",
  },
  "3.NF.A.3d": {
    fun: "3/4 of a pie is more than 1/4 — get the biggest slice, claim the win!",
    career: "Waiters compare fractions: 1/2 vs 3/8 to serve the right portion.",
    practical: "Sharing fairly: 5/6 of a snack is more than 2/6 — trade wisely!",
  },
  "3.MD.A": {
    fun: "Time how long a YouTube video plays — 3:15 to 3:45 means 30 minutes of fun!",
    career: "Chefs time cooking — a roast at 4:15 until 5:45 bakes 90 minutes.",
    practical: "Homework starts at 4:10, ends at 4:45 — 35 minutes of math practice.",
  },
  "3.MD.A.1": {
    fun: "Gaming session from 2:30 to 3:15 = 45 minutes of epic battles!",
    career: "TV producers schedule shows down to the minute — 22 min episodes.",
    practical: "If recess starts at 10:20 and ends at 10:45, you get 25 minutes outside.",
  },
  "3.MD.A.2": {
    fun: "Fill 3 bottles at 750 ml each for a party — 2250 ml (2.25 L) of juice!",
    career: "Zookeepers weigh animals: a puppy 2 kg, a tiger 200 kg.",
    practical: "A juice carton holds 2 L — pour 500 ml for a cup and save the rest.",
  },
  "3.MD.B": {
    fun: "Track your Pokemon collection with a bar graph — 12 fire, 8 water, 5 grass!",
    career: "Scientists graph bird sightings: 10 robins, 15 sparrows, 7 hawks.",
    practical: "Survey your class for favorite ice cream and graph it for show-and-tell.",
  },
  "3.MD.B.3": {
    fun: "A bar where each square = 5 means a 6-square bar shows 30 — BIG score!",
    career: "Weather reporters use bar graphs to show rainfall in different months.",
    practical: "Graph family chores: 3 squares × 5 each = 15 chores per kid this month.",
  },
  "3.MD.B.4": {
    fun: "Measure all your toy cars to the 1/4 inch and plot them — see which is longest!",
    career: "Biologists measure leaves to 1/4 inch to track tree species.",
    practical: "Measuring your pencils helps you find which one is shortest to toss.",
  },
  "3.MD.C": {
    fun: "Tile a Minecraft floor 5 × 6 — you need 30 blocks to cover the area!",
    career: "Floor installers calculate tiles: a 10 × 8 ft bathroom = 80 tiles.",
    practical: "Your bedroom rug is 4 × 6 ft — 24 square feet of cozy floor.",
  },
  "3.MD.C.5": {
    fun: "Area is like counting the squares of grass you need to mow — no gaps allowed!",
    career: "Landscapers measure lawn area to order the right amount of sod.",
    practical: "To paint a wall, measuring area tells you how much paint to buy.",
  },
  "3.MD.C.5a": {
    fun: "One Minecraft block of grass covers 1 square — the starting unit of building!",
    career: "Tile setters start with one square inch to plan whole patterns.",
    practical: "A sticky note is about 1 square unit — easy to count on the fridge.",
  },
  "3.MD.C.5b": {
    fun: "Fill a picture with 12 stickers, each 1 square — your picture has 12 sq units of area!",
    career: "Architects cover blueprints in unit squares to measure room sizes.",
    practical: "Count the tiles on your bathroom floor — that's the area in unit squares.",
  },
  "3.MD.C.6": {
    fun: "Lay out your trading cards in rows to find the area of your 'card base' — 3×4=12!",
    career: "Gardeners tile raised garden beds with square foot plots.",
    practical: "Count floor tiles under your bed to find its area — 2 × 5 = 10 tiles.",
  },
  "3.MD.C.7": {
    fun: "Design a 6 × 5 treehouse floor — 30 square feet of space for your friends!",
    career: "Builders use length × width to know how many boards to buy for a deck.",
    practical: "Your closet floor 4 × 3 = 12 sq ft tells you how many shoes fit.",
  },
  "3.MD.C.7a": {
    fun: "Cover a game board 6 × 4 with tiles — 24 tiles to play a full game!",
    career: "Tile layers confirm area by counting tiles and multiplying sides — matches!",
    practical: "A checkerboard 8 × 8 has 64 squares — tile and multiply, same answer.",
  },
  "3.MD.C.7b": {
    fun: "Your skate ramp is 12 × 5 ft — 60 sq ft of epic skating space!",
    career: "Roofers calculate square footage before ordering shingles: 25 × 30 = 750 sq ft.",
    practical: "Your picnic blanket 6 × 4 ft = 24 sq ft — room for 4 kids to sit.",
  },
  "3.MD.C.7c": {
    fun: "A 5 × 7 fort can split into 5 × 4 + 5 × 3 — same area, easier to build!",
    career: "Engineers split big rectangles into smaller ones to simplify math.",
    practical: "A 4 × 8 rug feels easier as two 4 × 4 squares you can lift.",
  },
  "3.MD.C.7d": {
    fun: "An L-shaped treehouse: add the two rectangle pieces for total floor area!",
    career: "Architects split weird room shapes into rectangles to add up floor area.",
    practical: "Your kitchen + dining area: find each rectangle's area, then add.",
  },
  "3.MD.D": {
    fun: "Build a square pen 4 ft on each side for your stuffed animals — 16 ft of fence!",
    career: "Ranchers measure perimeter to know how much fencing to buy.",
    practical: "A 3 × 5 ft garden bed needs 16 ft of wood to edge — easy to plan.",
  },
  "3.MD.D.8": {
    fun: "Draw a polygon path around your room and measure total steps — that's perimeter!",
    career: "Pool builders calculate perimeter for fences and safety rails.",
    practical: "Put up holiday lights around a window 3 × 5 ft — you need 16 ft of lights.",
  },
  "3.G.A": {
    fun: "A stop sign is an octagon (8 sides), a yield sign is a triangle (3 sides)!",
    career: "Graphic designers pick shapes based on their properties — stars, hexagons.",
    practical: "Sort shapes in a puzzle box: all 4-sided shapes go in the quadrilateral slot.",
  },
  "3.G.A.1": {
    fun: "Rhombuses, squares, and rectangles all share 4 sides — shape family reunion!",
    career: "Quilt makers combine quadrilaterals — squares, diamonds, trapezoids.",
    practical: "Your phone screen is a rectangle — 4 sides, 4 right angles, a quadrilateral.",
  },
  "3.G.A.2": {
    fun: "Slice your pie into 6 equal parts — each slice is 1/6 of the pie!",
    career: "Pizza shop owners slice pies into equal fractions for each customer.",
    practical: "Divide a chocolate bar into 4 equal parts for 4 friends — each gets 1/4.",
  },

  // ============================================================
  // GRADE 4
  // ============================================================

  "4.OA.A": {
    fun: "Your Pokemon has 35 HP, 5 times the enemy's 7 HP — you're way stronger!",
    career: "Animal trainers feed 3 times as many treats to dogs than cats.",
    practical: "If your older sibling is 4 times your age, you do multiplication to compare.",
  },
  "4.OA.A.1": {
    fun: "Your high score of 35 is 5 times your friend's 7 — bragging rights earned!",
    career: "Sports coaches say a star player scores 3 times as many points as others.",
    practical: "Your dog weighs 24 lb, your cat 8 — dog is 3 times as heavy.",
  },
  "4.OA.A.2": {
    fun: "If your new bike cost $120 and 3 times your old one's $40 — huge upgrade!",
    career: "Farmers: field B has 3 times as many cows as field A.",
    practical: "Dad's height (72 in) is about 2 times your height (36 in).",
  },
  "4.OA.A.3": {
    fun: "Win 3 packs of 8 stickers, trade 4 away — 20 stickers left in your book!",
    career: "Chefs: 6 dozen eggs (72) minus 15 used = 57 left for tomorrow's batch.",
    practical: "Buy 4 boxes of 10 cookies and eat 8 — 32 left for the week.",
  },
  "4.OA.B": {
    fun: "Factor pairs of 24 make all the ways you can split 24 Pokemon into teams!",
    career: "Engineers use factors to design even gear ratios in machines.",
    practical: "Arrange 12 cupcakes in neat rows: 2×6, 3×4, 1×12 — all factor pairs.",
  },
  "4.OA.B.4": {
    fun: "Is 19 prime? Yes — only 1 and 19 divide it, a lone-wolf number!",
    career: "Cybersecurity uses prime numbers to keep passwords safe.",
    practical: "If you have 15 cookies, you can share them 3 ways or 5 ways — 15's factors.",
  },
  "4.OA.C": {
    fun: "Pattern 2, 4, 8, 16, 32 — double each time, Minecraft XP-level style!",
    career: "Coders write patterns to make things repeat in apps and games.",
    practical: "Allowance grows $5, $10, $15 each week — predict next weeks easily.",
  },
  "4.OA.C.5": {
    fun: "Start at 3, add 4: 3, 7, 11, 15... patterns unlock hidden sequences!",
    career: "Scientists find patterns in star brightness, heartbeats, tides.",
    practical: "Steps on a staircase: 1, 2, 3, 4... always +1 to reach the top.",
  },
  "4.NBT.A": {
    fun: "Round your 487-point high score to 500 — feels like a big win!",
    career: "Journalists round 28,450 people to '28,000' for quick headlines.",
    practical: "A car trip of 347 miles is 'about 350 miles' when telling friends.",
  },
  "4.NBT.A.1": {
    fun: "The 5 in 500 is 10 times the 5 in 50 — each move left multiplies by 10!",
    career: "Bankers count zeros carefully: $5,000 vs $50,000 is a huge difference.",
    practical: "Understanding place value means knowing 300 is way more than 30.",
  },
  "4.NBT.A.2": {
    fun: "Compare 9,876 coins vs 10,000 — even though 9,876 has a 9, 10,000 is bigger!",
    career: "Scorekeepers at big stadiums compare attendance numbers fast.",
    practical: "Expanded form: 4,729 = 4,000 + 700 + 20 + 9 — helps break down big numbers.",
  },
  "4.NBT.A.3": {
    fun: "Your video had 3,572 views — round to 'about 3,600' to share with friends!",
    career: "Sports stats round to 10 or 100 for easier broadcasting.",
    practical: "A town of 45,678 is 'about 50,000' on maps and road signs.",
  },
  "4.NBT.B": {
    fun: "Stack 1,234 + 567 gold coins = 1,801 — massive treasure haul!",
    career: "Cashiers add thousands of dollars daily — precision matters.",
    practical: "Family car has 23,456 miles; after a trip of 890 more = 24,346 miles.",
  },
  "4.NBT.B.4": {
    fun: "Collect 1,245 stars then 678 more — 1,923 total, new record!",
    career: "Inventory clerks add and subtract thousands of items daily.",
    practical: "Saving account: $3,456 deposit - $1,289 withdrawal = $2,167 left.",
  },
  "4.NBT.B.5": {
    fun: "23 levels × 45 coins each = 1,035 coins — you're rich in the game!",
    career: "Carpenters multiply 12 boards × 14 ft = 168 feet of lumber needed.",
    practical: "Buying 24 snack packs at $3 each = $72 for the family movie night.",
  },
  "4.NBT.B.6": {
    fun: "288 XP split across 12 levels = 24 XP per level — steady progress!",
    career: "Teachers divide 144 pencils equally among 6 classes = 24 per class.",
    practical: "365 pages in a book ÷ 5 days = 73 pages per day to finish.",
  },
  "4.NF.A": {
    fun: "3/4 of a pizza is bigger than 2/3 — always grab the 3/4!",
    career: "Chefs convert fractions: 1/2 cup = 4/8 cup for exact measurements.",
    practical: "Share pizza fairly: 3/4 and 6/8 are equivalent — same amount!",
  },
  "4.NF.A.1": {
    fun: "2/3 = 4/6 = 8/12 — one slice, three ways to describe it!",
    career: "Tailors scale patterns using equivalent fractions.",
    practical: "1/2 cup of milk = 2/4 cup = 4/8 cup — same amount, different measuring cups.",
  },
  "4.NF.A.2": {
    fun: "5/6 of a chocolate bar beats 7/12 — always check which is bigger!",
    career: "Bakers compare 3/4 and 5/8 cups to pick the right measure.",
    practical: "Which is more: 1/2 cup or 3/8 cup? Common denom 8 tells you 1/2.",
  },
  "4.NF.B": {
    fun: "1/4 + 2/4 pizza = 3/4 — almost the whole pie!",
    career: "Chefs add 1/3 cup oil + 2/3 cup water for perfect salad dressing.",
    practical: "Run 1/2 mi, then 3/4 mi more — total 5/4 miles (1 1/4 mi) today!",
  },
  "4.NF.B.3": {
    fun: "3/5 = 1/5 + 1/5 + 1/5 — three pieces add up to the whole fraction!",
    career: "Nurses count doses: 3/4 cup medicine = three 1/4-cup doses.",
    practical: "Eat 1/8 of pizza three times = 3/8 eaten total.",
  },
  "4.NF.B.3a": {
    fun: "Add 3/8 + 4/8 of your pizza = 7/8 eaten — just 1/8 left for later!",
    career: "Chefs combine like-denominator fractions: 2/4 cup + 1/4 cup = 3/4 cup.",
    practical: "Walk 3/10 mi + 5/10 mi = 8/10 mi — almost a full mile covered.",
  },
  "4.NF.B.3b": {
    fun: "3/8 of cake can be 1/8 + 2/8 — build bigger fractions from pieces!",
    career: "Pharmacists split 9/10 g medicine into 3/10 + 6/10 for easier dosing.",
    practical: "7/10 of your allowance might be 3/10 for lunch + 4/10 for the movie.",
  },
  "4.NF.B.3c": {
    fun: "1 1/4 + 1/4 pizza = 1 1/2 pizzas — party size!",
    career: "Carpenters add 2 3/8 in + 1 3/8 in boards = 3 6/8 in (3 3/4) total.",
    practical: "Growing: 4 1/2 ft tall + 2/4 ft more = 5 ft — almost high-fiving mom!",
  },
  "4.NF.B.3d": {
    fun: "Run 3/8 mi, then 2/8 mi — 5/8 of a mile for today's sprint!",
    career: "Runners log 1 3/4 mi Monday + 2/4 mi Tuesday = 2 1/4 mi.",
    practical: "Pour 1/3 cup orange juice + 1/3 cup pineapple = 2/3 cup smoothie base.",
  },
  "4.NF.B.4": {
    fun: "3 dogs each need 1/4 cup of food = 3/4 cup total — easy measure!",
    career: "Bakers make 5 batches each using 2/3 cup sugar = 10/3 cups.",
    practical: "4 kids each drink 1/2 cup juice = 2 cups poured for the table.",
  },
  "4.NF.B.4a": {
    fun: "5/4 is the same as 5 pieces of size 1/4 — fraction superpower!",
    career: "Musicians think of 7/8 as 7 beats of 1/8 each.",
    practical: "9/12 inch = nine 1/12-inch tick marks on a ruler.",
  },
  "4.NF.B.4b": {
    fun: "3 × 2/5 means 3 of 2/5 pieces = 6/5 (1 1/5) — more than one whole!",
    career: "Bakers scale recipes: 4 times 3/8 cup = 12/8 cup.",
    practical: "6 kids × 3/4 cup juice each = 18/4 cups (4 1/2 cups) to pour.",
  },
  "4.NF.B.4c": {
    fun: "4 friends eat 2/3 pizza each: 8/3 (2 2/3) total — need 3 pizzas!",
    career: "Chefs plan portions: 8 guests × 3/4 lb meat = 6 lb roast.",
    practical: "Making 5 batches, each with 2/3 cup flour = 10/3 cups (3 1/3 cups) flour.",
  },
  "4.NF.C": {
    fun: "0.5 = 1/2 = 5/10 — different outfits for the same fraction!",
    career: "Runners track speeds: 0.25 seconds = 25/100 — super precise.",
    practical: "$0.75 = 75/100 = 3/4 of a dollar — same money, different forms.",
  },
  "4.NF.C.5": {
    fun: "3/10 dollar + 4/100 dollar = 34 cents — combine tenths and hundredths!",
    career: "Cashiers add $0.30 + $0.04 = $0.34 all day long.",
    practical: "6/10 of a meter + 9/100 of a meter = 69/100 m = 0.69 m for measuring.",
  },
  "4.NF.C.6": {
    fun: "Your race time of 12.25 seconds = 12 25/100 seconds — so precise!",
    career: "Scientists write 0.62 meters for exact measurements in experiments.",
    practical: "A ruler shows 0.5 inch — same as 1/2 inch — when measuring toys.",
  },
  "4.NF.C.7": {
    fun: "Compare 0.75 vs 0.8 — the 0.8 chocolate bar is bigger, grab it!",
    career: "Stopwatch users compare race times: 9.78 s is faster than 9.8 s.",
    practical: "0.5 L of juice is more than 0.45 L — the 0.5 bottle wins!",
  },
  "4.MD.A": {
    fun: "Measure your jump: 48 inches = 4 feet — olympic-level!",
    career: "Builders convert: 3 ft = 36 in when cutting wood.",
    practical: "A 2 L soda = 2,000 ml — enough for 4 cups of 500 ml.",
  },
  "4.MD.A.1": {
    fun: "Your puppy is 1 kg = 1,000 grams — so light you can carry it easily!",
    career: "Pilots convert feet, meters, and inches for safe takeoffs.",
    practical: "1 hour = 60 minutes — always handy when setting a cookie timer.",
  },
  "4.MD.A.2": {
    fun: "Run 2 km 500 m = 2,500 m — awesome cross-country effort!",
    career: "Truck drivers log 3 hr 30 min = 210 minutes behind the wheel.",
    practical: "6 lb 8 oz baby brother = 104 oz — good to know at the doctor.",
  },
  "4.MD.A.3": {
    fun: "Your Minecraft floor is 12 × 8 = 96 blocks — epic building!",
    career: "Interior designers solve: room is 35 sq ft, 5 ft wide, so 7 ft long.",
    practical: "Know room area to pick a rug that fits — 12 × 8 ft = 96 sq ft.",
  },
  "4.MD.B": {
    fun: "Line-plot your toy heights and find the tallest vs shortest!",
    career: "Biologists line-plot tadpole sizes to track how they grow.",
    practical: "Measure family shoe lengths to find who has the biggest feet.",
  },
  "4.MD.B.4": {
    fun: "Line-plot pencil lengths to the 1/8 in — find which pencil is king!",
    career: "Engineers line-plot bolt widths to choose the right tool.",
    practical: "Measuring ribbons for gifts to the 1/4 in helps wrap perfectly.",
  },
  "4.MD.C": {
    fun: "A full spin is 360° — do a 90° turn for a quarter flip!",
    career: "Pilots measure banking angles in degrees to steer safely.",
    practical: "Turn 90° to face the kitchen from the living room.",
  },
  "4.MD.C.5": {
    fun: "Skateboard tricks: a 360 is a full spin, a 180 is halfway around!",
    career: "Astronomers measure angles in the sky to track planets.",
    practical: "Clock hand from 12 to 3 turns 90° — a quarter of the clock.",
  },
  "4.MD.C.5a": {
    fun: "1 degree is 1/360 of a full spin — tiny but mighty!",
    career: "Scientists measure rotations to the single degree with protractors.",
    practical: "A compass lets hikers walk at exact-degree headings.",
  },
  "4.MD.C.5b": {
    fun: "A 45° angle is halfway between flat and corner — cool skate ramp!",
    career: "Architects draw angles to exact degrees for roofs.",
    practical: "Tilting a book 30° on a shelf makes it easier to read the title.",
  },
  "4.MD.C.6": {
    fun: "Use a protractor to measure ramps and find which is steepest for marbles!",
    career: "Carpenters use protractors to cut angles for picture frames.",
    practical: "Measure the angle of your phone stand so it doesn't tip over.",
  },
  "4.MD.C.7": {
    fun: "If a shape has a 40° and 30° angle, they combine to 70° — quick math!",
    career: "Builders know wall angles must add up to straight (180°) for doors to fit.",
    practical: "Split a pizza into two angle parts that add up to 180° — flat line.",
  },
  "4.G.A": {
    fun: "Spot right, acute, obtuse angles in your house — angle scavenger hunt!",
    career: "Geometric designers pick angles to make logos pop.",
    practical: "Your book corner has 4 right angles — same as every book.",
  },
  "4.G.A.1": {
    fun: "Railroad tracks = parallel lines — they never meet, just like in geometry!",
    career: "Road planners draw parallel and perpendicular lines for safe roads.",
    practical: "Perpendicular lines form a + sign on graph paper for neat charts.",
  },
  "4.G.A.2": {
    fun: "Every right triangle has one 90° corner — look for them on roofs!",
    career: "Architects classify roofs by triangle types to plan strength.",
    practical: "A picture frame with 4 right angles lies flat on the wall.",
  },
  "4.G.A.3": {
    fun: "Butterflies have a line of symmetry down the middle — both wings match!",
    career: "Fashion designers use symmetry to make balanced clothing designs.",
    practical: "Fold paper in half — if it matches, it has a line of symmetry.",
  },

  // ============================================================
  // GRADE 5
  // ============================================================

  "5.OA.A": {
    fun: "Score formula: (3 + 4) × 2 = 14 points — parentheses change the game!",
    career: "Coders use parentheses to control the order machines do math.",
    practical: "Recipe: (2 + 3) × 4 oz servings = 20 oz total for the family.",
  },
  "5.OA.A.1": {
    fun: "Solve [(6+4)×2] - 5 = 15 — nested puzzle, nested reward!",
    career: "Scientists evaluate formulas with brackets every day.",
    practical: "Figure tips: (meal + tax) × 0.2 — parentheses matter.",
  },
  "5.OA.A.2": {
    fun: "See 3 × (100 + 50) means 3 times (100+50) — no need to calculate, just know!",
    career: "Engineers read formulas to spot '3 times' without solving.",
    practical: "If ticket is twice the fair price, you know 2 × price without solving.",
  },
  "5.OA.B": {
    fun: "Rule +3 vs rule +6 — the +6 pattern grows twice as fast!",
    career: "Data scientists compare growth patterns to predict trends.",
    practical: "Saving $5/week vs $10/week — the 10 pattern is twice as fast.",
  },
  "5.OA.B.3": {
    fun: "Pattern A: 0, 3, 6, 9. Pattern B: 0, 6, 12, 18. B is 2× A — graph it!",
    career: "Scientists plot two patterns to spot relationships in data.",
    practical: "If your brother grows twice as fast, his pattern is always 2× yours.",
  },
  "5.NBT.A": {
    fun: "Each digit shifting left makes it 10× bigger — superpower place value!",
    career: "Engineers design rulers where each tick = 1/10 of the last.",
    practical: "0.1 m = 10 cm — shifting the decimal changes the unit.",
  },
  "5.NBT.A.1": {
    fun: "In 777, the leftmost 7 is 100× the rightmost 7 — place value magic!",
    career: "Accountants know moving a digit left or right changes dollars to cents.",
    practical: "$3.00 is 100× more than $0.03 — place value in action!",
  },
  "5.NBT.A.2": {
    fun: "10^4 = 10,000 views — shortcut for writing huge numbers!",
    career: "Scientists use powers of 10 for star distances and atom sizes.",
    practical: "3.5 × 100 = 350 — just shift the decimal right 2 places.",
  },
  "5.NBT.A.3": {
    fun: "Track race times to the thousandth: 9.587 s is faster than 9.591 s!",
    career: "Sports timekeepers write times like 12.345 s for photo finishes.",
    practical: "0.25 inch = 25/100 — precise enough to fit Lego pieces.",
  },
  "5.NBT.A.3a": {
    fun: "Write 347.392 as 3×100 + 4×10 + 7 + 3/10 + 9/100 + 2/1000 — full breakdown!",
    career: "Scientists read expanded decimals for exact measurements.",
    practical: "$5.32 is $5 + 30 cents + 2 cents — expanded form in wallets.",
  },
  "5.NBT.A.3b": {
    fun: "Compare 0.456 vs 0.465 — the 0.465 is bigger, grab the bigger slice!",
    career: "Chemists compare lab values like 0.234 vs 0.243 to check results.",
    practical: "Gas prices 3.295 vs 3.299 — small decimal difference, same trip!",
  },
  "5.NBT.A.4": {
    fun: "Round 7.86 → 8 dollars, easy to count with an 8-pack of soda!",
    career: "Scientists round 2.349 to 2.35 for cleaner reports.",
    practical: "A 12.345-lb box rounds to 12.35 lb for the shipping label.",
  },
  "5.NBT.B": {
    fun: "234 × 12 = 2,808 Pokemon hits — huge combo damage!",
    career: "Warehouse workers multiply and divide thousands of items accurately.",
    practical: "Splitting a $14.56 pizza bill by 4 kids = $3.64 each.",
  },
  "5.NBT.B.5": {
    fun: "123 × 45 = 5,535 — a mountain of numbers multiplied!",
    career: "Engineers multiply big numbers to calculate forces in bridges.",
    practical: "24 cans of soda × $0.65 each = $15.60 for the party.",
  },
  "5.NBT.B.6": {
    fun: "3,456 gold coins ÷ 12 guildmates = 288 each — fair share!",
    career: "Teachers divide 1,800 flashcards among 15 students = 120 each.",
    practical: "$1,000 saved ÷ 8 weeks = $125/week needed for your goal.",
  },
  "5.NBT.B.7": {
    fun: "Buy a $2.50 snack and a $1.75 drink — that's $4.25, your lunch sorted!",
    career: "Cashiers add and subtract decimal prices all day long.",
    practical: "Pay $10 for items costing $5.62 and $2.38 = $8 total, $2 change.",
  },
  "5.NF.A": {
    fun: "1/2 + 1/3 = 5/6 of your snack — almost a whole bag!",
    career: "Chefs combine 2/3 cup flour + 3/4 cup sugar — common-denom time!",
    practical: "Walk 1/2 mi to the park + 1/4 mi to the store = 3/4 mi total.",
  },
  "5.NF.A.1": {
    fun: "Mix 2/3 cup red slime + 3/5 cup blue slime = 19/15 cups — overflow!",
    career: "Pharmacists add fractions of different denominators for dosing.",
    practical: "1/2 gallon milk + 1/4 gallon in fridge = 3/4 gallon total.",
  },
  "5.NF.A.2": {
    fun: "Eat 3/8 of pizza, then 1/4 more — solve to find total devoured!",
    career: "Chefs check if 2/5 + 1/2 = 9/10 makes sense for portion limits.",
    practical: "Have 5/6 tank gas, use 1/3 on a trip — 1/2 tank left to get home.",
  },
  "5.NF.B": {
    fun: "4 ÷ 1/5 = 20 — fits 20 pieces of 1/5 into 4 wholes!",
    career: "Tailors measure how many 1/4 yd pieces fit in 3 yards of fabric (12).",
    practical: "How many 1/3 cup servings in 2 cups of raisins? 6 servings!",
  },
  "5.NF.B.3": {
    fun: "3/4 is the same as 3 ÷ 4 — fraction bar = divide bar!",
    career: "Statisticians interpret fractions as divisions for averages.",
    practical: "Share 9 slices among 4 friends = 9/4 = 2 1/4 slices each.",
  },
  "5.NF.B.4": {
    fun: "(2/3) × 6 = 4 slices — fraction of a whole-number stash!",
    career: "Engineers scale blueprints: 2/3 × 6 ft = 4 ft on a smaller model.",
    practical: "Drink 2/3 of a 6-cup jug = 4 cups swallowed.",
  },
  "5.NF.B.4a": {
    fun: "(2/3) × 4 = 8/3 — taking 2/3 of 4 wholes gives you 8 pieces of 1/3!",
    career: "Bakers see 3/4 × 2 cups as 2 parts out of 4 wholes split into 4 each.",
    practical: "(2/3) × 9 lb dog food = 6 lb — easy to measure at home.",
  },
  "5.NF.B.4b": {
    fun: "A 1/2 × 1/3 tile has area 1/6 — tiny square with big meaning!",
    career: "Tile layers compute fractional tile areas: 5/8 ft × 2/3 ft = 10/24 sq ft.",
    practical: "A picture frame 3/4 ft × 1/2 ft = 3/8 sq ft wall space.",
  },
  "5.NF.B.5": {
    fun: "Multiplying by 1/2 shrinks a number — opposite of leveling up!",
    career: "Scientists scale drawings down (×<1) and up (×>1) constantly.",
    practical: "Multiplying a recipe by 1/2 makes it smaller for fewer people.",
  },
  "5.NF.B.5a": {
    fun: "10 × (3/5) = 6 — multiplying by less than 1 shrinks numbers!",
    career: "Engineers know scaling by 1/10 makes models 10× smaller.",
    practical: "Pizza (1/2) × large = smaller pizza; (2) × large = double.",
  },
  "5.NF.B.5b": {
    fun: "6 × (3/2) = 9 — multiplying by more than 1 grows your stack!",
    career: "Investors see growth when multiplying by 1.1 or more.",
    practical: "Doubling a recipe (× 2) makes more food; halving (× 1/2) makes less.",
  },
  "5.NF.B.6": {
    fun: "5/6 × 12 ft skate ramp = 10 ft of sick air time!",
    career: "Construction workers multiply 2 1/4 × 4 lengths for boards.",
    practical: "2/3 of 9 lb sugar = 6 lb needed for the birthday cake.",
  },
  "5.NF.B.7": {
    fun: "Split 1/2 candy bar between 3 kids — each gets 1/6 — sharing wizardry!",
    career: "Bakers divide 4 cups flour into 1/2 cup servings = 8 cookies.",
    practical: "Divide 5 ft rope into 1/2-ft pieces = 10 jump-rope lengths.",
  },
  "5.NF.B.7a": {
    fun: "(1/4) ÷ 5 = 1/20 — split 1/4 pizza into 5 tiny bites for friends!",
    career: "Chefs split 1/3 cup dressing into 4 tiny 1/12 cup samples.",
    practical: "Share 1/2 bag chips among 3 kids — each gets 1/6 of the bag.",
  },
  "5.NF.B.7b": {
    fun: "5 ÷ (1/3) = 15 — five whole pizzas = 15 slices of 1/3 each!",
    career: "Lumber workers know 6 ft ÷ (1/3 ft) = 18 pieces per 6-ft board.",
    practical: "2 cups ÷ 1/8 cup servings = 16 servings in a fruit salad.",
  },
  "5.NF.B.7c": {
    fun: "Split 1/4 pie into 3 slices, each is 1/12 — tiniest bites imaginable!",
    career: "Nurses divide 1/2 cup medicine into 4 doses = 1/8 cup each.",
    practical: "2 cups trail mix in 1/3-cup handfuls = 6 snack servings for hiking.",
  },
  "5.MD.A": {
    fun: "5 meters = 500 cm — the length of 5 playgrounds in centimeters!",
    career: "Scientists convert between metric units for accurate measurements.",
    practical: "2 hours of play = 120 minutes — easy to time with a kitchen timer.",
  },
  "5.MD.A.1": {
    fun: "2.5 km race = 2,500 m — more impressive to say 'two-thousand five hundred'!",
    career: "Runners convert km to m for marathon training plans.",
    practical: "A 3 kg backpack = 3,000 g when weighing for a hike.",
  },
  "5.MD.B": {
    fun: "Line-plot juice amounts in beakers — redistribute equally for fair shares!",
    career: "Lab scientists line-plot drop sizes to the 1/8 unit.",
    practical: "If 4 friends bring 2, 3, 5, 6 candies, sharing equally = 4 each.",
  },
  "5.MD.B.2": {
    fun: "Line-plot your pencil heights to 1/8 in — find who has the stubbiest pencil!",
    career: "Biologists redistribute water in plant tests for fair comparisons.",
    practical: "Beakers of juice at 2, 3, 5, 6 oz average to 4 oz each — fair share!",
  },
  "5.MD.C": {
    fun: "Volume of your shoebox = length × width × height — how many Legos fit!",
    career: "Movers calculate box volume to plan truck loads.",
    practical: "Your 10 × 5 × 3 ft swimming pool = 150 cubic ft of water!",
  },
  "5.MD.C.3": {
    fun: "A unit cube is 1×1×1 — smallest brick in the Minecraft universe!",
    career: "Packaging engineers measure volume in unit cubes to fit products.",
    practical: "Ice cube trays have small unit cubes — count them to know the volume.",
  },
  "5.MD.C.3a": {
    fun: "1 unit cube has volume 1 — the starting block of all volume math!",
    career: "Storage planners think in unit cubes to stack boxes efficiently.",
    practical: "A sugar cube is about 1 unit cube — tiny but countable.",
  },
  "5.MD.C.3b": {
    fun: "A box packed by 27 cubes is 3×3×3 — Rubik's Cube vibes!",
    career: "Warehouse workers count unit cubes fitting into big crates.",
    practical: "Your lunchbox might hold 24 cube-shaped snacks (4×3×2).",
  },
  "5.MD.C.4": {
    fun: "Count Minecraft blocks in your tower — 5 × 5 × 2 = 50 blocks high!",
    career: "Storage designers count boxes in trucks by cubic units.",
    practical: "Counting ice cubes in a tray: 3 × 4 × 1 = 12 cubes ready to freeze.",
  },
  "5.MD.C.5": {
    fun: "Design a 4 × 5 × 2 treasure chest — 40 cubic feet of loot space!",
    career: "Architects calculate room volume for heating and cooling.",
    practical: "Your bedroom 10 × 10 × 8 ft = 800 cu ft of air — plenty to breathe!",
  },
  "5.MD.C.5a": {
    fun: "Pack unit cubes into a 3 × 4 × 2 box = 24 cubes — matches 3×4×2!",
    career: "Engineers confirm volume by packing with cubes before building.",
    practical: "Shoebox 12 × 8 × 5 = 480 cu in — enough for many toys.",
  },
  "5.MD.C.5b": {
    fun: "V = l × w × h is the magic formula — plug in numbers, out pops the volume!",
    career: "Pool builders use V = lwh to order the right amount of water.",
    practical: "Fish tank 2 × 1 × 1 ft = 2 cu ft of water for your goldfish.",
  },
  "5.MD.C.5c": {
    fun: "Castle with 2 towers: add their volumes for total space — 8 + 27 = 35!",
    career: "Architects add wing volumes to find a whole building's capacity.",
    practical: "An L-shaped kitchen: add two rectangular volumes for total cooking space.",
  },
  "5.G.A": {
    fun: "Your treasure map uses (x, y) — the X marks exact coordinates!",
    career: "Game designers place every character using x, y coordinates.",
    practical: "Graphing points makes it easy to plan a seating chart for a party.",
  },
  "5.G.A.1": {
    fun: "On a game grid, (3, 4) means go right 3, up 4 — land on the star!",
    career: "Pilots read coordinate grids to track their exact flight path.",
    practical: "Use coordinates to place items in a video-game inventory grid.",
  },
  "5.G.A.2": {
    fun: "Plot plants in a garden: (1,2), (3,4), (5,6) — see your garden come to life!",
    career: "Scientists plot data points to track animal populations.",
    practical: "Your step counter tracks location over time — coordinate pairs daily.",
  },
  "5.G.B": {
    fun: "A square is a rectangle AND a rhombus AND a parallelogram — shape triple threat!",
    career: "Designers classify shapes to pick the right one for logos.",
    practical: "Sorting shapes in a puzzle: squares fit in rectangle and rhombus holes.",
  },
  "5.G.B.3": {
    fun: "All squares are rectangles (4 right angles) — squares inherit rectangle powers!",
    career: "Builders rely on inherited shape properties to pre-cut materials.",
    practical: "Any square frame is also a rectangle — fits rectangle-shaped photos.",
  },
  "5.G.B.4": {
    fun: "Classify shapes: quadrilaterals > parallelograms > rectangles > squares — a family tree!",
    career: "Architects group shape families to speed up building plans.",
    practical: "Board games use shape categories to tell pieces apart quickly.",
  },
}

/**
 * Look up real-world uses for a standard. Returns null if none exist.
 */
export function getRealWorldUses(standardId: string): RealWorldUses | null {
  return STANDARD_REAL_WORLD_USES[standardId] ?? null
}
