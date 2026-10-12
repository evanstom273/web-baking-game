// The tent's recipe book. Timings are game seconds, not real cooking advice.
export const FLAVOURS = {
  berry: { name: 'Summer berries', colour: '#b84c67', description: 'Bright fruit with a pleasantly sharp finish.', tags: ['fruit', 'tart'], pairs: ['vanilla', 'lemon', 'chocolate', 'almond', 'coconut', 'rose'] },
  lemon: { name: 'Lemon zest', colour: '#e2bc4c', description: 'Fresh citrus to lift a rich, buttery bake.', tags: ['fruit', 'citrus', 'tart'], pairs: ['berry', 'vanilla', 'herb', 'raspberry', 'almond', 'pistachio', 'ginger', 'coconut'] },
  chocolate: { name: 'Dark chocolate', colour: '#694334', description: 'Deep cocoa, a little bitterness, plenty of comfort.', tags: ['rich', 'roasted'], pairs: ['vanilla', 'coffee', 'orange', 'raspberry', 'berry', 'coconut', 'almond', 'pistachio', 'hazelnut', 'caramel', 'ginger'] },
  vanilla: { name: 'Vanilla bean', colour: '#e4caa0', description: 'A gentle classic that lets your technique shine.', tags: ['sweet', 'warm'], pairs: ['berry', 'lemon', 'chocolate', 'coffee', 'orange', 'raspberry', 'coconut', 'almond', 'pistachio', 'hazelnut', 'cinnamon', 'ginger', 'caramel', 'rose'] },
  herb: { name: 'Garden rosemary', colour: '#668768', description: 'A fragrant, savoury touch from the kitchen garden.', tags: ['herbal', 'savoury'], pairs: ['lemon', 'orange', 'almond'] },
  coffee: { name: 'Fresh coffee', colour: '#78563e', description: 'Roasted warmth for creams, sponges and chocolate bakes.', tags: ['roasted', 'rich'], pairs: ['chocolate', 'vanilla', 'hazelnut', 'caramel', 'cinnamon'] },
  orange: { name: 'Orange zest', colour: '#db8b40', description: 'A rounded citrus note with a sunny peel finish.', tags: ['fruit', 'citrus'], pairs: ['chocolate', 'vanilla', 'almond', 'cinnamon', 'ginger', 'herb', 'caramel'] },
  raspberry: { name: 'Raspberry', colour: '#b3476b', description: 'A clean, sharp fruit flavour that cuts through rich fillings.', tags: ['fruit', 'tart'], pairs: ['chocolate', 'vanilla', 'lemon', 'almond', 'pistachio', 'rose', 'coconut'] },
  coconut: { name: 'Toasted coconut', colour: '#d6cbb4', description: 'Gentle sweetness and a toasted, nutty edge.', tags: ['sweet', 'toasted'], pairs: ['chocolate', 'vanilla', 'lemon', 'berry', 'raspberry', 'caramel', 'ginger'] },
  almond: { name: 'Almond', colour: '#c7a77a', description: 'A mellow nuttiness that works especially well with fruit.', tags: ['nut', 'sweet'], pairs: ['berry', 'lemon', 'chocolate', 'vanilla', 'orange', 'raspberry', 'herb', 'rose', 'cinnamon'] },
  pistachio: { name: 'Pistachio', colour: '#99a56b', description: 'A delicate green nuttiness for elegant creams and pastry.', tags: ['nut', 'delicate'], pairs: ['vanilla', 'lemon', 'raspberry', 'rose', 'chocolate', 'caramel'] },
  hazelnut: { name: 'Roasted hazelnut', colour: '#b18352', description: 'Deeply toasted nuts, at home beside coffee or chocolate.', tags: ['nut', 'roasted'], pairs: ['chocolate', 'coffee', 'vanilla', 'caramel', 'cinnamon'] },
  cinnamon: { name: 'Cinnamon', colour: '#ab7452', description: 'A warm spice for soft doughs, biscuits and orchard fruit.', tags: ['spice', 'warm'], pairs: ['vanilla', 'orange', 'almond', 'coffee', 'hazelnut', 'ginger', 'caramel'] },
  ginger: { name: 'Stem ginger', colour: '#c69b53', description: 'A little warming heat, especially lovely with citrus.', tags: ['spice', 'warm'], pairs: ['lemon', 'orange', 'chocolate', 'vanilla', 'coconut', 'cinnamon', 'caramel'] },
  caramel: { name: 'Salted caramel', colour: '#bf8340', description: 'Buttery sweetness with a small pinch of salt.', tags: ['sweet', 'rich'], pairs: ['chocolate', 'vanilla', 'coffee', 'coconut', 'pistachio', 'hazelnut', 'cinnamon', 'ginger', 'orange'] },
  rose: { name: 'Rosewater', colour: '#ce9aac', description: 'A gentle floral accent: a little gives the loveliest result.', tags: ['floral', 'delicate'], pairs: ['vanilla', 'berry', 'raspberry', 'almond', 'pistachio'] },
};

export const RIVALS = [
  { id: 'maeve', name: 'Maeve', job: 'Retired librarian', trait: 'Measures twice. Has never trusted a fan oven.', speciality: 0, skill: 70, colour: '#799b83' },
  { id: 'rafi', name: 'Rafi', job: 'Cycle mechanic', trait: 'Builds beautiful things, including rather unstable cakes.', speciality: 3, skill: 73, colour: '#bd8553' },
  { id: 'jules', name: 'Jules', job: 'Primary school teacher', trait: 'Always has spare biscuits and a reassuring word.', speciality: 1, skill: 65, colour: '#b87b8f' },
  { id: 'arthur', name: 'Arthur', job: 'Bus driver', trait: 'Treats proving dough like a very important passenger.', speciality: 2, skill: 76, colour: '#738fa4' },
  { id: 'nia', name: 'Nia', job: 'Florist', trait: 'Brilliant with colour. The washing-up can wait.', speciality: 4, skill: 68, colour: '#9a83ac' },
  { id: 'benji', name: 'Benji', job: 'Community gardener', trait: 'Will put an herb in anything if nobody stops him.', speciality: 2, skill: 60, colour: '#95a258' },
  { id: 'lottie', name: 'Lottie', job: 'Cinema projectionist', trait: 'Quietly ambitious, until the caramel starts smoking.', speciality: 4, skill: 63, colour: '#ca946d' },
];

export const WEEKS = [
  {
    id: 0, name: 'Cake week', theme: 'Cakes', subtitle: 'A fresh apron. A familiar sponge. Absolutely no pressure.', kind: 'cake',
    recipes: [
      {
        id: 'garden-sponge', name: 'Garden-party sponge', round: 'Signature', kind: 'cake',
        description: 'Bake a tender sponge for the village fête, with a flavour and finish that feel like you.',
        ingredients: [{ name: 'Self-raising flour', target: 200, unit: 'g' }, { name: 'Soft butter', target: 200, unit: 'g' }, { name: 'Caster sugar', target: 200, unit: 'g' }, { name: 'Beaten eggs', target: 200, unit: 'g' }],
        mixTarget: 9, shapeTarget: 55, temp: 180, bakeTime: 30, coolTime: 8, prepLabel: 'Whisk', shapeLabel: 'Spread',
        tip: 'Stop mixing when the batter is pale and smooth. A light touch keeps the crumb tender.',
        technicalHint: 'A level layer bakes evenly from the edge to the middle.', decorTarget: 3, budget: 200, flavours: ['berry', 'lemon', 'chocolate', 'vanilla'],
      },
      {
        id: 'lemon-madeleines', name: 'Lemon madeleines', round: 'Technical', kind: 'cake',
        description: 'Six little shell cakes: golden edges, a soft centre and a neat, even rise.',
        ingredients: [{ name: 'Plain flour', target: 120, unit: 'g' }, { name: 'Melted butter', target: 100, unit: 'g' }, { name: 'Caster sugar', target: 100, unit: 'g' }, { name: 'Beaten eggs', target: 120, unit: 'g' }],
        mixTarget: 8, shapeTarget: 45, temp: 190, bakeTime: 28, coolTime: 8, prepLabel: 'Fold', shapeLabel: 'Spread',
        tip: 'These little cakes colour quickly. Watch the oven once their edges turn gold.',
        technicalHint: 'Fold gently, fill evenly and aim for 190°C. The edges should just catch the colour.', decorTarget: 3, budget: 185, flavours: ['lemon'],
      },
      {
        id: 'orchard-celebration', name: 'Orchard celebration cake', round: 'Showstopper', kind: 'cake',
        description: 'Build a layered centrepiece with a fruit-garden finish. A straight stack is a very good start.',
        ingredients: [{ name: 'Self-raising flour', target: 300, unit: 'g' }, { name: 'Soft butter', target: 300, unit: 'g' }, { name: 'Caster sugar', target: 280, unit: 'g' }, { name: 'Beaten eggs', target: 300, unit: 'g' }],
        mixTarget: 11, shapeTarget: 62, temp: 175, bakeTime: 38, coolTime: 12, prepLabel: 'Whisk', shapeLabel: 'Spread',
        tip: 'Give those layers time to cool. Warm sponge and patient icing do not get along.',
        technicalHint: 'Even layers and cool sponge will support your decoration.', decorTarget: 6, budget: 245, flavours: ['berry', 'lemon', 'vanilla'],
      },
    ],
  },
  {
    id: 1, name: 'Biscuit week', theme: 'Biscuits', subtitle: 'Small bakes. Crisp edges. Remarkably large expectations.', kind: 'biscuit',
    recipes: [
      {
        id: 'tea-tin-shortbread', name: 'Tea-tin shortbread', round: 'Signature', kind: 'biscuit',
        description: 'Fill the judges’ tea tin with buttery shortbread that snaps neatly and melts away.',
        ingredients: [{ name: 'Plain flour', target: 240, unit: 'g' }, { name: 'Soft butter', target: 160, unit: 'g' }, { name: 'Caster sugar', target: 80, unit: 'g' }],
        mixTarget: 8, shapeTarget: 48, temp: 170, bakeTime: 30, coolTime: 8, prepLabel: 'Fold', shapeLabel: 'Roll',
        tip: 'Bring the dough together without overworking it. You want shortbread, not a doorstep.',
        technicalHint: 'Keep the dough an even thickness and pull it out pale gold.', decorTarget: 3, budget: 190, flavours: ['lemon', 'chocolate', 'vanilla'],
      },
      {
        id: 'viennese-curls', name: 'Viennese curls', round: 'Technical', kind: 'biscuit',
        description: 'Pipe a matching batch of delicate butter biscuits, with ridges the judges can actually see.',
        ingredients: [{ name: 'Plain flour', target: 200, unit: 'g' }, { name: 'Soft butter', target: 180, unit: 'g' }, { name: 'Icing sugar', target: 55, unit: 'g' }, { name: 'Cornflour', target: 40, unit: 'g' }],
        mixTarget: 10, shapeTarget: 58, temp: 175, bakeTime: 29, coolTime: 9, prepLabel: 'Whisk', shapeLabel: 'Shape',
        tip: 'A smooth dough makes clear curls. Leave them to firm up before decorating.',
        technicalHint: 'Beat until smooth, shape to the marked depth and bake at 175°C.', decorTarget: 4, budget: 205, flavours: ['vanilla'],
      },
      {
        id: 'biscuit-greenhouse', name: 'The biscuit greenhouse', round: 'Showstopper', kind: 'biscuit',
        description: 'Create an edible little greenhouse, with crisp walls and a cheerful garden of decorations.',
        ingredients: [{ name: 'Plain flour', target: 350, unit: 'g' }, { name: 'Butter', target: 175, unit: 'g' }, { name: 'Brown sugar', target: 140, unit: 'g' }, { name: 'Golden syrup', target: 90, unit: 'g' }],
        mixTarget: 11, shapeTarget: 65, temp: 180, bakeTime: 37, coolTime: 12, prepLabel: 'Fold', shapeLabel: 'Roll',
        tip: 'Structure starts with evenly rolled walls. Assembly can wait until the biscuits are firm.',
        technicalHint: 'Aim for crisp, level pieces before building upwards.', decorTarget: 7, budget: 255, flavours: ['lemon', 'chocolate', 'vanilla'],
      },
    ],
  },
  {
    id: 2, name: 'Bread week', theme: 'Bread', subtitle: 'Roll up your sleeves. The dough has opinions.', kind: 'bread',
    recipes: [
      {
        id: 'village-bloomer', name: 'Village-market bloomer', round: 'Signature', kind: 'bread',
        description: 'Make a generous loaf with a springy middle, a proud rise and a properly golden crust.',
        ingredients: [{ name: 'Strong bread flour', target: 400, unit: 'g' }, { name: 'Warm water', target: 260, unit: 'ml' }, { name: 'Fast-action yeast', target: 7, unit: 'g' }, { name: 'Fine salt', target: 8, unit: 'g' }],
        mixTarget: 13, shapeTarget: 60, temp: 210, bakeTime: 40, coolTime: 10, prepLabel: 'Knead', shapeLabel: 'Shape',
        tip: 'Knead until the dough is elastic, then shape it firmly so it rises upwards.',
        technicalHint: 'Strong dough, a snug shape and a hot oven make a good bloomer.', decorTarget: 3, budget: 220, flavours: ['herb', 'vanilla'],
      },
      {
        id: 'six-knot-rolls', name: 'Six knot rolls', round: 'Technical', kind: 'bread',
        description: 'Six neatly tied rolls should look like they belong to the same family.',
        ingredients: [{ name: 'Strong bread flour', target: 360, unit: 'g' }, { name: 'Warm water', target: 230, unit: 'ml' }, { name: 'Fast-action yeast', target: 7, unit: 'g' }, { name: 'Fine salt', target: 7, unit: 'g' }],
        mixTarget: 14, shapeTarget: 70, temp: 205, bakeTime: 35, coolTime: 9, prepLabel: 'Knead', shapeLabel: 'Shape',
        tip: 'A little tension helps the knots hold their shape. Pull too far and the dough will tear.',
        technicalHint: 'Knead thoroughly, aim for 70% shaping and bake at 205°C.', decorTarget: 4, budget: 220, flavours: ['herb'],
      },
      {
        id: 'harvest-wreath', name: 'Harvest-table wreath', round: 'Showstopper', kind: 'bread',
        description: 'Shape an impressive bread wreath worthy of the centre of the harvest table.',
        ingredients: [{ name: 'Strong bread flour', target: 500, unit: 'g' }, { name: 'Warm water', target: 320, unit: 'ml' }, { name: 'Fast-action yeast', target: 10, unit: 'g' }, { name: 'Fine salt', target: 10, unit: 'g' }],
        mixTarget: 15, shapeTarget: 72, temp: 200, bakeTime: 46, coolTime: 12, prepLabel: 'Knead', shapeLabel: 'Shape',
        tip: 'Keep the wreath balanced. One very thick section will still be doughy when the rest is baked.',
        technicalHint: 'An even shape matters just as much as an elaborate one.', decorTarget: 6, budget: 265, flavours: ['herb', 'lemon', 'chocolate'],
      },
    ],
  },
  {
    id: 3, name: 'Pastry week', theme: 'Pastry', subtitle: 'Cool hands, crisp layers and a very watchful oven.', kind: 'pastry',
    recipes: [
      {
        id: 'orchard-galette', name: 'Rustic orchard galette', round: 'Signature', kind: 'pastry',
        description: 'A free-form fruit tart with a buttery, folded edge. Rustic is welcome; raw is less welcome.',
        ingredients: [{ name: 'Plain flour', target: 220, unit: 'g' }, { name: 'Cold butter', target: 110, unit: 'g' }, { name: 'Cold water', target: 65, unit: 'ml' }, { name: 'Sliced apples', target: 240, unit: 'g' }],
        mixTarget: 8, shapeTarget: 50, temp: 200, bakeTime: 39, coolTime: 10, prepLabel: 'Fold', shapeLabel: 'Roll',
        tip: 'Keep the pastry handling brief. Those little pockets of butter give you a tender crust.',
        technicalHint: 'Roll evenly, keep a sturdy rim and let the base take some colour.', decorTarget: 4, budget: 220, flavours: ['berry', 'lemon', 'vanilla'],
      },
      {
        id: 'choux-buns', name: 'Golden choux buns', round: 'Technical', kind: 'pastry',
        description: 'Make an even batch of light pastry shells, ready for a careful decorative finish.',
        ingredients: [{ name: 'Plain flour', target: 100, unit: 'g' }, { name: 'Butter', target: 75, unit: 'g' }, { name: 'Water', target: 150, unit: 'ml' }, { name: 'Beaten eggs', target: 150, unit: 'g' }],
        mixTarget: 12, shapeTarget: 55, temp: 210, bakeTime: 36, coolTime: 11, prepLabel: 'Whisk', shapeLabel: 'Shape',
        tip: 'A glossy mixture should hold its shape. Take the buns out too soon and the puff may vanish.',
        technicalHint: 'Look for a smooth, glossy mix and an evenly golden shell at 210°C.', decorTarget: 4, budget: 220, flavours: ['vanilla'],
      },
      {
        id: 'pastry-sunburst', name: 'The pastry sunburst', round: 'Showstopper', kind: 'pastry',
        description: 'Roll, fold and shape a radiant pastry centrepiece with crisp, distinct layers.',
        ingredients: [{ name: 'Plain flour', target: 300, unit: 'g' }, { name: 'Cold butter', target: 250, unit: 'g' }, { name: 'Cold water', target: 150, unit: 'ml' }, { name: 'Caster sugar', target: 75, unit: 'g' }],
        mixTarget: 9, shapeTarget: 68, temp: 205, bakeTime: 44, coolTime: 13, prepLabel: 'Fold', shapeLabel: 'Roll',
        tip: 'Gentle folding protects the layers. A heavy hand turns a sunburst into a paving slab.',
        technicalHint: 'Keep the folds light and the thickness consistent.', decorTarget: 6, budget: 260, flavours: ['lemon', 'chocolate', 'vanilla'],
      },
    ],
  },
  {
    id: 4, name: 'Dessert week', theme: 'Desserts', subtitle: 'The semi-final. Save a little room for pudding.', kind: 'dessert',
    recipes: [
      {
        id: 'sunday-pudding', name: 'Sunday spoon pudding', round: 'Signature', kind: 'dessert',
        description: 'Bring a comforting baked pudding to the tent, with a soft centre and your own flavour twist.',
        ingredients: [{ name: 'Self-raising flour', target: 180, unit: 'g' }, { name: 'Soft butter', target: 120, unit: 'g' }, { name: 'Brown sugar', target: 140, unit: 'g' }, { name: 'Beaten eggs', target: 150, unit: 'g' }],
        mixTarget: 10, shapeTarget: 52, temp: 175, bakeTime: 38, coolTime: 8, prepLabel: 'Whisk', shapeLabel: 'Spread',
        tip: 'A tender pudding wants gentle mixing and a centre that has only just set.',
        technicalHint: 'A steady oven and a level dish keep the edges from racing ahead.', decorTarget: 4, budget: 215, flavours: ['berry', 'lemon', 'chocolate'],
      },
      {
        id: 'vanilla-custard-tarts', name: 'Vanilla custard tarts', round: 'Technical', kind: 'dessert',
        description: 'Set a delicate vanilla filling in crisp pastry. A gentle wobble is the aim.',
        ingredients: [{ name: 'Shortcrust pastry', target: 240, unit: 'g' }, { name: 'Double cream', target: 250, unit: 'ml' }, { name: 'Egg yolks', target: 80, unit: 'g' }, { name: 'Caster sugar', target: 70, unit: 'g' }],
        mixTarget: 8, shapeTarget: 58, temp: 160, bakeTime: 40, coolTime: 12, prepLabel: 'Whisk', shapeLabel: 'Spread',
        tip: 'Custard likes a gentle oven. Too much heat and that silky texture disappears.',
        technicalHint: 'Whisk gently, keep the pastry even and bake at 160°C until just set.', decorTarget: 3, budget: 220, flavours: ['vanilla'],
      },
      {
        id: 'pudding-garden', name: 'The midnight pudding garden', round: 'Showstopper', kind: 'dessert',
        description: 'Present a rich chocolate dessert as a tiny edible garden, complete with carefully placed details.',
        ingredients: [{ name: 'Dark chocolate', target: 220, unit: 'g' }, { name: 'Butter', target: 160, unit: 'g' }, { name: 'Beaten eggs', target: 220, unit: 'g' }, { name: 'Caster sugar', target: 150, unit: 'g' }],
        mixTarget: 11, shapeTarget: 64, temp: 170, bakeTime: 42, coolTime: 14, prepLabel: 'Fold', shapeLabel: 'Spread',
        tip: 'Let the chocolate centre set before decorating. Otherwise the garden may begin to sink.',
        technicalHint: 'Smooth batter and a patient cooling stage give the details a firm footing.', decorTarget: 7, budget: 260, flavours: ['berry', 'chocolate', 'vanilla'],
      },
    ],
  },
  {
    id: 5, name: 'The grand final', theme: 'Final', subtitle: 'Three bakers. One last weekend. Put the kettle on.', kind: 'cake',
    recipes: [
      {
        id: 'homecoming-tea-cake', name: 'Homecoming tea cake', round: 'Signature', kind: 'cake',
        description: 'A beautifully finished cake that tells the judges what kind of baker you have become.',
        ingredients: [{ name: 'Self-raising flour', target: 250, unit: 'g' }, { name: 'Soft butter', target: 220, unit: 'g' }, { name: 'Caster sugar', target: 220, unit: 'g' }, { name: 'Beaten eggs', target: 250, unit: 'g' }],
        mixTarget: 10, shapeTarget: 60, temp: 180, bakeTime: 38, coolTime: 10, prepLabel: 'Whisk', shapeLabel: 'Spread',
        tip: 'Trust what you have learned. An excellent familiar bake is still an excellent bake.',
        technicalHint: 'Balance your flavour, protect the crumb and give the finish room to shine.', decorTarget: 5, budget: 240, flavours: ['berry', 'lemon', 'chocolate', 'vanilla'],
      },
      {
        id: 'almond-tea-fingers', name: 'Almond tea fingers', round: 'Technical', kind: 'biscuit',
        description: 'A final test of consistency: delicate almond biscuits, evenly baked and neatly dressed.',
        ingredients: [{ name: 'Plain flour', target: 160, unit: 'g' }, { name: 'Ground almonds', target: 80, unit: 'g' }, { name: 'Soft butter', target: 160, unit: 'g' }, { name: 'Caster sugar', target: 90, unit: 'g' }],
        mixTarget: 9, shapeTarget: 67, temp: 175, bakeTime: 32, coolTime: 10, prepLabel: 'Fold', shapeLabel: 'Shape',
        tip: 'They keep firming as they cool. Catch the edges at a light, even gold.',
        technicalHint: 'Aim for 67% shaping, 175°C and a restrained golden colour.', decorTarget: 5, budget: 225, flavours: ['vanilla'],
      },
      {
        id: 'village-celebration', name: 'A village in celebration', round: 'Showstopper', kind: 'cake',
        description: 'Your final centrepiece: a grand layered cake, decorated as a joyful little village fête.',
        ingredients: [{ name: 'Self-raising flour', target: 400, unit: 'g' }, { name: 'Soft butter', target: 400, unit: 'g' }, { name: 'Caster sugar', target: 380, unit: 'g' }, { name: 'Beaten eggs', target: 400, unit: 'g' }],
        mixTarget: 13, shapeTarget: 72, temp: 175, bakeTime: 50, coolTime: 15, prepLabel: 'Whisk', shapeLabel: 'Spread',
        tip: 'One last deep breath. Bake it evenly, cool it properly and make every decoration count.',
        technicalHint: 'Strong fundamentals underneath; a celebration on top.', decorTarget: 7, budget: 270, flavours: ['berry', 'lemon', 'chocolate', 'vanilla'],
      },
    ],
  },
];

const FAMILIES = ['cake', 'cookie', 'biscuit', 'bread', 'pastry', 'tart', 'pie', 'dessert', 'construction'];
const SWEET_FAMILIES = FAMILIES.filter(family => family !== 'bread');
const SWEET_FLAVOURS = Object.keys(FLAVOURS).filter(flavour => flavour !== 'herb');

export const COMPONENTS = [
  { id: 'none', name: 'No extra component', role: 'filling', colour: '#eee6d2', flavours: Object.keys(FLAVOURS), families: FAMILIES, work: 0, method: 'fold' },
  { id: 'berry-jam', name: 'Summer berry jam', role: 'filling', colour: '#a44a64', flavours: ['berry', 'raspberry', 'vanilla', 'lemon', 'almond', 'rose'], families: FAMILIES, work: 6, method: 'heat' },
  { id: 'lemon-curd', name: 'Lemon curd', role: 'filling', colour: '#e6c34f', flavours: ['lemon', 'vanilla', 'berry', 'raspberry', 'coconut', 'ginger', 'almond'], families: SWEET_FAMILIES, work: 8, method: 'heat' },
  { id: 'ganache', name: 'Chocolate ganache', role: 'filling', colour: '#674130', flavours: ['chocolate', 'coffee', 'orange', 'hazelnut', 'raspberry', 'vanilla', 'caramel', 'coconut'], families: SWEET_FAMILIES, work: 7, method: 'heat' },
  { id: 'buttercream', name: 'Vanilla buttercream', role: 'filling', colour: '#eadcbb', flavours: SWEET_FLAVOURS, families: SWEET_FAMILIES, work: 7, method: 'whisk' },
  { id: 'vanilla-custard', name: 'Vanilla pastry cream', role: 'filling', colour: '#e8d19a', flavours: ['vanilla', 'chocolate', 'lemon', 'berry', 'raspberry', 'orange', 'almond', 'pistachio', 'coffee'], families: ['cake', 'pastry', 'tart', 'pie', 'dessert', 'construction'], work: 9, method: 'heat' },
  { id: 'whipped-cream', name: 'Soft whipped cream', role: 'filling', colour: '#f8edda', flavours: SWEET_FLAVOURS, families: SWEET_FAMILIES, work: 5, method: 'whisk' },
  { id: 'salted-caramel', name: 'Salted caramel', role: 'filling', colour: '#ba7c37', flavours: ['caramel', 'chocolate', 'coffee', 'vanilla', 'hazelnut', 'cinnamon', 'ginger', 'coconut'], families: FAMILIES, work: 9, method: 'heat' },
  { id: 'praline', name: 'Hazelnut praline cream', role: 'filling', colour: '#b08b5d', flavours: ['hazelnut', 'chocolate', 'coffee', 'vanilla', 'caramel', 'almond'], families: SWEET_FAMILIES, work: 8, method: 'fold' },
  { id: 'cream-cheese', name: 'Cream cheese filling', role: 'filling', colour: '#ede1c6', flavours: ['vanilla', 'lemon', 'berry', 'raspberry', 'cinnamon', 'ginger', 'caramel'], families: ['cake', 'bread', 'dessert', 'construction'], work: 6, method: 'whisk' },
  { id: 'herb-butter', name: 'Garden herb butter', role: 'filling', colour: '#bcc487', flavours: ['herb', 'lemon', 'orange', 'almond'], families: ['bread', 'pastry', 'pie', 'construction'], work: 4, method: 'fold' },
  { id: 'cinnamon-butter', name: 'Cinnamon butter', role: 'filling', colour: '#bc916a', flavours: ['cinnamon', 'vanilla', 'orange', 'ginger', 'caramel', 'almond'], families: ['bread', 'pastry', 'cake', 'construction'], work: 5, method: 'fold' },
  { id: 'fruit-compote', name: 'Orchard fruit compote', role: 'filling', colour: '#c89258', flavours: ['vanilla', 'cinnamon', 'ginger', 'orange', 'lemon', 'almond', 'berry'], families: ['pastry', 'tart', 'pie', 'dessert', 'construction'], work: 8, method: 'heat' },
  { id: 'glaze', name: 'Shining citrus glaze', role: 'finish', colour: '#dfc36d', flavours: ['lemon', 'orange', 'vanilla', 'berry', 'raspberry', 'almond', 'ginger'], families: FAMILIES, work: 5, method: 'heat' },
  { id: 'icing', name: 'Smooth icing', role: 'finish', colour: '#f1e8cf', flavours: SWEET_FLAVOURS, families: FAMILIES, work: 5, method: 'whisk' },
  { id: 'chocolate-coat', name: 'Glossy chocolate coating', role: 'finish', colour: '#643d2e', flavours: ['chocolate', 'vanilla', 'coffee', 'orange', 'hazelnut', 'raspberry', 'caramel', 'coconut', 'almond'], families: SWEET_FAMILIES, work: 7, method: 'heat' },
  { id: 'cream-finish', name: 'Clouds of cream', role: 'finish', colour: '#f5e8cd', flavours: SWEET_FLAVOURS, families: SWEET_FAMILIES, work: 6, method: 'whisk' },
  { id: 'nut-crunch', name: 'Toasted nut crunch', role: 'finish', colour: '#b69866', flavours: ['almond', 'pistachio', 'hazelnut', 'chocolate', 'coffee', 'caramel', 'vanilla', 'cinnamon'], families: FAMILIES, work: 6, method: 'heat' },
  { id: 'meringue-finish', name: 'Soft meringue peaks', role: 'finish', colour: '#f2e9d8', flavours: ['lemon', 'vanilla', 'berry', 'raspberry', 'rose', 'pistachio', 'coconut'], families: SWEET_FAMILIES, work: 8, method: 'whisk' },
  { id: 'seed-crust', name: 'Seeded crust', role: 'finish', colour: '#9d9367', flavours: ['herb', 'lemon', 'almond', 'orange'], families: ['bread', 'pastry', 'pie', 'construction'], work: 4, method: 'fold' },
  { id: 'caramel-drizzle', name: 'Caramel drizzle', role: 'finish', colour: '#b97b35', flavours: ['caramel', 'chocolate', 'coffee', 'vanilla', 'hazelnut', 'cinnamon', 'ginger', 'orange'], families: FAMILIES, work: 7, method: 'heat' },
];

const decoration = (name, colour, style = 'place', families = FAMILIES, work = 2) => ({ name, colour, style, families, work });
export const DECORATIONS = {
  berry: decoration('Strawberry', '#ba4e55'),
  blueberry: decoration('Blueberries', '#606789'),
  raspberry: decoration('Raspberry', '#b34d71'),
  lemon: decoration('Candied lemon', '#e2c353'),
  orange: decoration('Orange slice', '#d99846'),
  chocolate: decoration('Chocolate square', '#6b4434'),
  curl: decoration('Chocolate curl', '#805238'),
  shard: decoration('Chocolate shard', '#614235', 'structure', ['cake', 'pastry', 'dessert', 'construction'], 3),
  cream: decoration('Cream dollop', '#f4e7ca', 'pipe', SWEET_FAMILIES, 2),
  rosette: decoration('Buttercream rosette', '#e8b4ac', 'pipe', ['cake', 'cookie', 'biscuit', 'pastry', 'dessert', 'construction'], 3),
  shell: decoration('Piped shell', '#ead9b6', 'pipe', SWEET_FAMILIES, 3),
  leaf: decoration('Mint leaf', '#64835d'),
  flower: decoration('Sugar flower', '#dcacb6', 'place', SWEET_FAMILIES, 3),
  pearl: decoration('Sugar pearl', '#eadfc7', 'place', SWEET_FAMILIES),
  sprinkle: decoration('Rainbow sprinkles', '#bc9296', 'place', SWEET_FAMILIES),
  almond: decoration('Toasted almonds', '#c09d6b'),
  pistachio: decoration('Crushed pistachios', '#9baa6b'),
  meringue: decoration('Meringue kiss', '#ede2ce', 'place', SWEET_FAMILIES, 3),
  fondant: decoration('Fondant ribbon', '#c697b0', 'structure', ['cake', 'biscuit', 'construction'], 4),
  lattice: decoration('Pastry lattice', '#d4ac73', 'structure', ['pastry', 'tart', 'pie', 'construction'], 4),
  arch: decoration('Sugar arch', '#d9b895', 'structure', ['cake', 'dessert', 'construction'], 4),
  flag: decoration('Little fête flag', '#b97063', 'structure', FAMILIES, 3),
};

const S = (type, cycles) => ({ type, cycles });
const CAKE_DECOR = ['berry', 'blueberry', 'raspberry', 'lemon', 'orange', 'curl', 'shard', 'cream', 'rosette', 'shell', 'flower', 'pearl', 'sprinkle', 'almond', 'pistachio', 'meringue', 'fondant', 'arch', 'flag'];
const BISCUIT_DECOR = ['chocolate', 'curl', 'rosette', 'shell', 'flower', 'pearl', 'sprinkle', 'almond', 'pistachio', 'fondant', 'flag'];
const BREAD_DECOR = ['leaf', 'lemon', 'orange', 'almond', 'pistachio', 'flag'];
const PASTRY_DECOR = ['berry', 'blueberry', 'raspberry', 'lemon', 'orange', 'chocolate', 'curl', 'cream', 'shell', 'leaf', 'almond', 'pistachio', 'lattice', 'flag'];
const DESSERT_DECOR = ['berry', 'blueberry', 'raspberry', 'lemon', 'orange', 'chocolate', 'curl', 'shard', 'cream', 'rosette', 'shell', 'leaf', 'flower', 'pearl', 'almond', 'pistachio', 'meringue', 'arch'];
const CAKE_FILLINGS = ['none', 'berry-jam', 'lemon-curd', 'ganache', 'buttercream', 'whipped-cream', 'salted-caramel', 'praline'];
const CAKE_FINISHES = ['none', 'icing', 'cream-finish', 'chocolate-coat', 'glaze', 'nut-crunch', 'caramel-drizzle'];
const BISCUIT_FILLINGS = ['none', 'berry-jam', 'ganache', 'buttercream', 'praline'];
const BISCUIT_FINISHES = ['none', 'icing', 'chocolate-coat', 'glaze', 'nut-crunch'];
const PASTRY_FILLINGS = ['none', 'fruit-compote', 'vanilla-custard', 'whipped-cream', 'lemon-curd', 'ganache', 'praline'];
const PASTRY_FINISHES = ['none', 'glaze', 'icing', 'chocolate-coat', 'cream-finish', 'nut-crunch'];

// Enrich the original recipe IDs so older saved seasons can still resolve them.
const DEFAULT_DETAILS = {
  'garden-sponge': { method: 'cream', family: 'cake', steps: [S('beat', 3), S('fold', 2)], shapeMode: 'level', pieces: 3, assemblyParts: 2, flavours: ['berry', 'lemon', 'chocolate', 'vanilla', 'coffee', 'orange', 'raspberry', 'coconut', 'caramel'] },
  'lemon-madeleines': { method: 'foam', family: 'cake', steps: [S('whip', 3), S('fold', 2)], shapeMode: 'portion', pieces: 6, assemblyParts: 1, flavours: ['lemon', 'vanilla'], fillings: ['none'], finishes: ['glaze'], prescribed: { flavours: ['lemon'], filling: 'none', finish: 'glaze' } },
  'orchard-celebration': { method: 'cream', family: 'cake', steps: [S('beat', 3), S('fold', 3)], shapeMode: 'level', pieces: 3, assemblyParts: 4, flavours: ['berry', 'lemon', 'vanilla', 'raspberry', 'almond', 'cinnamon', 'orange'] },
  'tea-tin-shortbread': { method: 'rub', family: 'biscuit', steps: [S('rub', 3), S('fold', 2)], shapeMode: 'roll', pieces: 6, assemblyParts: 1, flavours: ['vanilla', 'lemon', 'orange', 'chocolate', 'almond', 'ginger', 'rose'] },
  'viennese-curls': { method: 'cream', family: 'biscuit', steps: [S('beat', 3), S('fold', 2)], shapeMode: 'pipe', pieces: 6, assemblyParts: 1, flavours: ['vanilla'], fillings: ['none'], finishes: ['chocolate-coat'], prescribed: { flavours: ['vanilla'], filling: 'none', finish: 'chocolate-coat' } },
  'biscuit-greenhouse': { method: 'rub', family: 'construction', steps: [S('rub', 3), S('fold', 2)], shapeMode: 'roll', pieces: 5, assemblyParts: 5, flavours: ['vanilla', 'ginger', 'cinnamon', 'chocolate', 'orange', 'almond'], fillings: ['none', 'ganache', 'buttercream'], finishes: ['icing', 'chocolate-coat'], decorationIds: ['flower', 'leaf', 'pearl', 'fondant', 'arch', 'flag', 'lattice', 'chocolate'] },
  'village-bloomer': { method: 'knead', family: 'bread', steps: [S('knead', 4), S('fold', 2)], shapeMode: 'portion', pieces: 3, assemblyParts: 1, flavours: ['herb', 'lemon', 'orange', 'almond'], fillings: ['none', 'herb-butter'], finishes: ['none', 'seed-crust', 'glaze'] },
  'six-knot-rolls': { method: 'knead', family: 'bread', steps: [S('knead', 3), S('fold', 2)], shapeMode: 'plait', pieces: 6, assemblyParts: 1, flavours: ['herb'], fillings: ['none'], finishes: ['seed-crust'], prescribed: { flavours: ['herb'], filling: 'none', finish: 'seed-crust' } },
  'harvest-wreath': { method: 'knead', family: 'bread', steps: [S('knead', 4), S('fold', 3)], shapeMode: 'plait', pieces: 5, assemblyParts: 3, flavours: ['herb', 'lemon', 'orange', 'almond', 'cinnamon', 'ginger'], fillings: ['none', 'herb-butter', 'cinnamon-butter'], finishes: ['seed-crust', 'glaze', 'nut-crunch'] },
  'orchard-galette': { method: 'rub', family: 'tart', steps: [S('rub', 3), S('fold', 2)], shapeMode: 'roll', pieces: 3, assemblyParts: 2, flavours: ['vanilla', 'cinnamon', 'ginger', 'almond', 'lemon', 'berry'], fillings: ['fruit-compote', 'vanilla-custard', 'lemon-curd'], finishes: ['none', 'glaze', 'nut-crunch', 'cream-finish'] },
  'choux-buns': { method: 'choux', family: 'pastry', steps: [S('cook', 2), S('beat', 3)], shapeMode: 'pipe', pieces: 6, assemblyParts: 2, flavours: ['vanilla'], fillings: ['vanilla-custard'], finishes: ['chocolate-coat'], prescribed: { flavours: ['vanilla'], filling: 'vanilla-custard', finish: 'chocolate-coat' } },
  'pastry-sunburst': { method: 'laminate', family: 'pastry', steps: [S('rub', 2), S('laminate', 3)], shapeMode: 'roll', pieces: 6, assemblyParts: 3, flavours: ['chocolate', 'orange', 'vanilla', 'almond', 'hazelnut', 'cinnamon', 'caramel'], fillings: ['ganache', 'praline', 'vanilla-custard'], finishes: ['glaze', 'icing', 'nut-crunch'] },
  'sunday-pudding': { method: 'cream', family: 'dessert', steps: [S('beat', 3), S('fold', 2)], shapeMode: 'portion', pieces: 4, assemblyParts: 1, flavours: ['chocolate', 'vanilla', 'cinnamon', 'ginger', 'caramel', 'orange', 'coffee'], fillings: ['none', 'salted-caramel', 'ganache'], finishes: ['cream-finish', 'caramel-drizzle', 'chocolate-coat', 'nut-crunch'] },
  'vanilla-custard-tarts': { method: 'custard', family: 'tart', steps: [S('cook', 3), S('fold', 2)], shapeMode: 'line', pieces: 6, assemblyParts: 2, flavours: ['vanilla'], fillings: ['vanilla-custard'], finishes: ['glaze'], prescribed: { flavours: ['vanilla'], filling: 'vanilla-custard', finish: 'glaze' } },
  'pudding-garden': { method: 'foam', family: 'dessert', steps: [S('whip', 3), S('fold', 3)], shapeMode: 'level', pieces: 4, assemblyParts: 3, flavours: ['chocolate', 'coffee', 'hazelnut', 'caramel', 'vanilla', 'raspberry', 'orange'], fillings: ['ganache', 'praline', 'whipped-cream', 'salted-caramel'], finishes: ['chocolate-coat', 'cream-finish', 'nut-crunch'], decorationIds: ['berry', 'raspberry', 'shard', 'curl', 'cream', 'rosette', 'leaf', 'flower', 'pistachio', 'meringue', 'arch'] },
  'homecoming-tea-cake': { method: 'cream', family: 'cake', steps: [S('beat', 3), S('fold', 3)], shapeMode: 'level', pieces: 3, assemblyParts: 2, flavours: ['berry', 'lemon', 'chocolate', 'vanilla', 'coffee', 'orange', 'raspberry', 'coconut', 'almond', 'pistachio', 'hazelnut', 'caramel', 'rose'] },
  'almond-tea-fingers': { method: 'rub', family: 'biscuit', steps: [S('rub', 3), S('fold', 2)], shapeMode: 'portion', pieces: 6, assemblyParts: 1, flavours: ['almond', 'vanilla'], fillings: ['none'], finishes: ['chocolate-coat'], prescribed: { flavours: ['almond', 'vanilla'], filling: 'none', finish: 'chocolate-coat' } },
  'village-celebration': { method: 'cream', family: 'construction', steps: [S('beat', 4), S('fold', 3)], shapeMode: 'level', pieces: 5, assemblyParts: 5, flavours: SWEET_FLAVOURS, fillings: CAKE_FILLINGS.filter(id => id !== 'none'), finishes: CAKE_FINISHES.filter(id => id !== 'none'), decorationIds: CAKE_DECOR },
};

function enrich(recipe, details = {}) {
  Object.assign(recipe, details);
  const family = recipe.family;
  if (!recipe.fillings) recipe.fillings = family === 'biscuit' || family === 'cookie' ? [...BISCUIT_FILLINGS] : family === 'bread' ? ['none', 'herb-butter', 'cinnamon-butter'] : ['pastry', 'tart', 'pie'].includes(family) ? [...PASTRY_FILLINGS] : [...CAKE_FILLINGS];
  if (!recipe.finishes) recipe.finishes = family === 'biscuit' || family === 'cookie' ? [...BISCUIT_FINISHES] : family === 'bread' ? ['none', 'seed-crust', 'glaze', 'icing'] : ['pastry', 'tart', 'pie'].includes(family) ? [...PASTRY_FINISHES] : [...CAKE_FINISHES];
  if (!recipe.decorationIds) recipe.decorationIds = [...(recipe.kind === 'bread' ? BREAD_DECOR : recipe.kind === 'biscuit' ? BISCUIT_DECOR : recipe.kind === 'pastry' ? PASTRY_DECOR : recipe.kind === 'dessert' ? DESSERT_DECOR : CAKE_DECOR)];
  recipe.decorationIds = recipe.decorationIds.filter(id => DECORATIONS[id].families.includes(family));
  recipe.fillings = recipe.fillings.filter(id => COMPONENTS.find(component => component.id === id).families.includes(family));
  recipe.finishes = recipe.finishes.filter(id => COMPONENTS.find(component => component.id === id).families.includes(family));
  recipe.ingredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    flow: ingredient.flow || (/flour|cocoa|starch|baking powder|icing sugar/i.test(ingredient.name) ? 'powder' : /melted butter|water|milk|cream|eggs|yolks|whites|juice/i.test(ingredient.name) ? 'liquid' : /butter|syrup|honey|pastry|cream cheese/i.test(ingredient.name) ? 'sticky' : 'grain'),
  }));
  return recipe;
}

for (const week of WEEKS) {
  for (const recipe of week.recipes) {
    recipe.legacyBakeTime = recipe.bakeTime;
    recipe.legacyCoolTime = recipe.coolTime;
    recipe.bakeTime = Math.max(22, Math.min(34, Math.round(recipe.bakeTime * 0.72)));
    recipe.coolTime = Math.max(6, Math.min(11, Math.round(recipe.coolTime * 0.8)));
    enrich(recipe, DEFAULT_DETAILS[recipe.id]);
  }
}

const ingredient = (name, target, unit = 'g', flow) => ({ name, target, unit, ...(flow ? { flow } : {}) });
const extraRecipe = (week, round, details) => {
  const original = WEEKS[week].recipes[round];
  const recipe = { ...original, ...details, ingredients: details.ingredients || original.ingredients.map(item => ({ ...item })) };
  // Optional choices belong to the new dish, not its default-round template.
  if (!details.fillings) delete recipe.fillings;
  if (!details.finishes) delete recipe.finishes;
  if (!details.decorationIds) delete recipe.decorationIds;
  delete recipe.prescribed;
  return enrich(recipe);
};

const EXTRA_RECIPES = [
  extraRecipe(0, 0, {
    id: 'swiss-roll', name: 'Sunday Swiss roll', description: 'Whip a light sponge, spread a filling and roll it into a neat spiral. The swirl is your signature.',
    method: 'foam', family: 'cake', kind: 'cake', steps: [S('whip', 4), S('fold', 2)], shapeMode: 'roll', pieces: 3, assemblyParts: 2,
    ingredients: [ingredient('Beaten eggs', 200), ingredient('Caster sugar', 100), ingredient('Plain flour', 100)],
    temp: 190, bakeTime: 22, coolTime: 6, prepLabel: 'Whisk', shapeLabel: 'Roll', mixTarget: 10, shapeTarget: 54,
    flavours: ['berry', 'raspberry', 'lemon', 'vanilla', 'chocolate', 'coffee', 'coconut'], fillings: ['berry-jam', 'lemon-curd', 'ganache', 'whipped-cream', 'buttercream'], finishes: ['none', 'icing', 'cream-finish', 'chocolate-coat'],
    tip: 'Build enough air in the sponge, then fold gently. Spread a thin, even filling before rolling.', technicalHint: 'Light sponge and a balanced filling make a clean spiral.', decorTarget: 4,
  }),
  extraRecipe(0, 0, {
    id: 'marble-loaf', name: 'Marbled tea loaf', description: 'Swirl two complementary flavours through a buttery loaf, then give it a clean, confident finish.',
    method: 'cream', family: 'cake', kind: 'cake', steps: [S('beat', 3), S('fold', 3)], shapeMode: 'level', pieces: 3, assemblyParts: 1,
    ingredients: [ingredient('Self-raising flour', 220), ingredient('Soft butter', 180), ingredient('Caster sugar', 180), ingredient('Beaten eggs', 200)],
    temp: 175, bakeTime: 29, coolTime: 8, flavours: ['chocolate', 'vanilla', 'coffee', 'orange', 'caramel', 'hazelnut'], fillings: ['none', 'ganache', 'salted-caramel'], finishes: ['glaze', 'icing', 'chocolate-coat', 'caramel-drizzle', 'nut-crunch'],
    tip: 'A few deliberate folds keep the marbling distinct. Too much mixing loses the pattern.', technicalHint: 'Beat the base first, then fold the contrasting flavour through.', decorTarget: 3,
  }),
  extraRecipe(0, 2, {
    id: 'celebration-cupcake-tower', name: 'The cupcake flower tower', description: 'Build a flowering tower from little cakes, with balanced tiers and a garden of piped details.',
    method: 'cream', family: 'construction', kind: 'cake', steps: [S('beat', 3), S('fold', 3)], shapeMode: 'portion', pieces: 6, assemblyParts: 4,
    ingredients: [ingredient('Self-raising flour', 300), ingredient('Soft butter', 280), ingredient('Caster sugar', 280), ingredient('Beaten eggs', 300)],
    temp: 180, bakeTime: 27, coolTime: 9, flavours: ['vanilla', 'lemon', 'berry', 'raspberry', 'chocolate', 'rose', 'pistachio'], fillings: ['buttercream', 'lemon-curd', 'berry-jam', 'ganache'], finishes: ['cream-finish', 'icing', 'chocolate-coat'],
    tip: 'Keep the little cakes similar in size and build from a broad, steady base.', technicalHint: 'Even portions keep a tower balanced.', decorTarget: 7,
  }),
  extraRecipe(1, 0, {
    id: 'chocolate-chip-cookies', name: 'Chunky chocolate cookies', description: 'Portion a batch with soft centres, crisp edges and generous chocolate pieces.',
    method: 'cream', family: 'cookie', kind: 'biscuit', steps: [S('beat', 3), S('fold', 2)], shapeMode: 'portion', pieces: 6, assemblyParts: 1,
    ingredients: [ingredient('Plain flour', 220), ingredient('Soft butter', 130), ingredient('Brown sugar', 150), ingredient('Chocolate chunks', 120)],
    temp: 180, bakeTime: 22, coolTime: 6, flavours: ['chocolate', 'vanilla', 'orange', 'hazelnut', 'caramel', 'coffee', 'coconut'], fillings: ['none'], finishes: ['none', 'chocolate-coat', 'nut-crunch'],
    tip: 'Even scoops give everyone the same lovely centre. Take them out before the edges get too dark.', technicalHint: 'Beat the butter first; fold the chunks in last.', decorTarget: 3,
  }),
  extraRecipe(1, 0, {
    id: 'jam-sandwich-biscuits', name: 'Window-box jam sandwiches', description: 'Roll matching biscuits, cut little windows and sandwich them with a bright filling.',
    method: 'rub', family: 'biscuit', kind: 'biscuit', steps: [S('rub', 3), S('fold', 2)], shapeMode: 'roll', pieces: 6, assemblyParts: 2,
    ingredients: [ingredient('Plain flour', 250), ingredient('Cold butter', 150), ingredient('Icing sugar', 90), ingredient('Ground almonds', 50)],
    temp: 175, bakeTime: 23, coolTime: 7, flavours: ['vanilla', 'almond', 'raspberry', 'berry', 'lemon', 'rose'], fillings: ['berry-jam', 'lemon-curd', 'ganache', 'buttercream'], finishes: ['none', 'icing', 'glaze'],
    tip: 'Roll the tops and bases to the same thickness, then use just enough filling to show through.', technicalHint: 'Matching shapes make tidy little sandwiches.', decorTarget: 4,
  }),
  extraRecipe(1, 2, {
    id: 'biscuit-carousel', name: 'The biscuit carousel', description: 'Assemble a fairground centrepiece with biscuit panels, a roof and an exuberant little finish.',
    method: 'rub', family: 'construction', kind: 'biscuit', steps: [S('rub', 3), S('fold', 3)], shapeMode: 'roll', pieces: 5, assemblyParts: 5,
    ingredients: [ingredient('Plain flour', 400), ingredient('Cold butter', 200), ingredient('Brown sugar', 160), ingredient('Golden syrup', 100)],
    temp: 180, bakeTime: 29, coolTime: 9, flavours: ['ginger', 'cinnamon', 'vanilla', 'chocolate', 'orange', 'caramel'], fillings: ['none', 'ganache', 'buttercream'], finishes: ['icing', 'chocolate-coat'],
    decorationIds: ['chocolate', 'curl', 'rosette', 'flower', 'pearl', 'sprinkle', 'fondant', 'arch', 'flag'], tip: 'Let the panels become crisp before you build. The roof cannot rescue a wonky foundation.', technicalHint: 'Consistent rolling keeps every panel the right size.', decorTarget: 7,
  }),
  extraRecipe(2, 0, {
    id: 'garden-focaccia', name: 'Kitchen-garden focaccia', description: 'Make a broad, airy loaf with dimples, a gleaming crust and a fragrant garden finish.',
    method: 'knead', family: 'bread', kind: 'bread', steps: [S('knead', 3), S('fold', 3)], shapeMode: 'level', pieces: 3, assemblyParts: 1,
    ingredients: [ingredient('Strong bread flour', 400), ingredient('Warm water', 300, 'ml'), ingredient('Olive oil', 40, 'ml', 'liquid'), ingredient('Fast-action yeast', 7)],
    temp: 215, bakeTime: 26, coolTime: 7, flavours: ['herb', 'lemon', 'orange', 'almond'], fillings: ['none', 'herb-butter'], finishes: ['seed-crust', 'glaze', 'none'],
    tip: 'Fold the wet dough patiently. The aim is airy bread, with a level base beneath those dimples.', technicalHint: 'Gentle folds retain air in a wetter dough.', decorTarget: 4,
  }),
  extraRecipe(2, 0, {
    id: 'cinnamon-knots', name: 'Cinnamon breakfast knots', description: 'Knead a soft dough, add a buttery filling and twist it into a generous batch of breakfast knots.',
    method: 'knead', family: 'bread', kind: 'bread', steps: [S('knead', 4), S('fold', 2)], shapeMode: 'plait', pieces: 6, assemblyParts: 2,
    ingredients: [ingredient('Strong bread flour', 350), ingredient('Warm milk', 210, 'ml'), ingredient('Soft butter', 60), ingredient('Fast-action yeast', 7)],
    temp: 190, bakeTime: 27, coolTime: 8, flavours: ['cinnamon', 'vanilla', 'orange', 'caramel', 'ginger', 'almond'], fillings: ['cinnamon-butter', 'salted-caramel', 'cream-cheese'], finishes: ['icing', 'caramel-drizzle', 'nut-crunch', 'glaze'],
    tip: 'Keep the filling thin so it stays inside the twists. Similar knots will bake at the same pace.', technicalHint: 'Elastic dough makes tidy knots.', decorTarget: 4,
  }),
  extraRecipe(2, 2, {
    id: 'woven-bread-basket', name: 'The woven harvest basket', description: 'Weave dough into an edible basket and assemble it with a generous collection of little rolls.',
    method: 'knead', family: 'construction', kind: 'bread', steps: [S('knead', 4), S('fold', 3)], shapeMode: 'plait', pieces: 6, assemblyParts: 5,
    ingredients: [ingredient('Strong bread flour', 550), ingredient('Warm water', 340, 'ml'), ingredient('Olive oil', 35, 'ml', 'liquid'), ingredient('Fast-action yeast', 10)],
    temp: 200, bakeTime: 34, coolTime: 10, flavours: ['herb', 'lemon', 'orange', 'almond', 'cinnamon', 'ginger'], fillings: ['none', 'herb-butter', 'cinnamon-butter'], finishes: ['seed-crust', 'glaze', 'nut-crunch'],
    decorationIds: ['leaf', 'lemon', 'orange', 'almond', 'pistachio', 'flag'], tip: 'Make the woven strands an even thickness. A strong base will carry the basket handle.', technicalHint: 'Tidy, well-supported joins matter more than a hurried flourish.', decorTarget: 6,
  }),
  extraRecipe(3, 0, {
    id: 'summer-fruit-pie', name: 'Lattice-top fruit pie', description: 'Line a pie dish, add a generous fruit filling and finish with a neatly woven pastry lid.',
    method: 'rub', family: 'pie', kind: 'pastry', steps: [S('rub', 3), S('fold', 2)], shapeMode: 'line', pieces: 4, assemblyParts: 2,
    ingredients: [ingredient('Plain flour', 300), ingredient('Cold butter', 150), ingredient('Cold water', 90, 'ml'), ingredient('Mixed orchard fruit', 300)],
    temp: 200, bakeTime: 31, coolTime: 8, flavours: ['berry', 'raspberry', 'vanilla', 'cinnamon', 'ginger', 'lemon', 'almond'], fillings: ['fruit-compote', 'berry-jam', 'vanilla-custard'], finishes: ['glaze', 'cream-finish', 'none'],
    tip: 'Keep the pastry thickness even around the dish, especially where the base meets the sides.', technicalHint: 'A neat lining and a properly baked base make a good pie.', decorTarget: 4,
  }),
  extraRecipe(3, 0, {
    id: 'chocolate-eclairs', name: 'Patisserie éclairs', description: 'Cook a glossy choux paste, pipe long shells and fill them beneath a shining finish.',
    method: 'choux', family: 'pastry', kind: 'pastry', steps: [S('cook', 2), S('beat', 3)], shapeMode: 'pipe', pieces: 6, assemblyParts: 2,
    ingredients: [ingredient('Plain flour', 100), ingredient('Butter', 75), ingredient('Water', 150, 'ml'), ingredient('Beaten eggs', 150)],
    temp: 205, bakeTime: 27, coolTime: 8, flavours: ['chocolate', 'vanilla', 'coffee', 'hazelnut', 'caramel', 'pistachio', 'raspberry'], fillings: ['vanilla-custard', 'whipped-cream', 'praline', 'ganache'], finishes: ['chocolate-coat', 'icing', 'nut-crunch'],
    tip: 'Cook the paste before beating in the eggs. Pipe with a steady hand for matching shells.', technicalHint: 'Glossy paste should hold its shape before it goes into the oven.', decorTarget: 4,
  }),
  extraRecipe(3, 2, {
    id: 'choux-croquembouche', name: 'Caramel choux crown', description: 'Build crisp, filled choux buns into a caramel-bound tower with a confident crown.',
    method: 'choux', family: 'construction', kind: 'pastry', steps: [S('cook', 3), S('beat', 3)], shapeMode: 'pipe', pieces: 6, assemblyParts: 5,
    ingredients: [ingredient('Plain flour', 180), ingredient('Butter', 130), ingredient('Water', 270, 'ml'), ingredient('Beaten eggs', 270)],
    temp: 210, bakeTime: 31, coolTime: 10, flavours: ['vanilla', 'caramel', 'coffee', 'chocolate', 'hazelnut', 'orange'], fillings: ['vanilla-custard', 'praline', 'whipped-cream'], finishes: ['caramel-drizzle', 'chocolate-coat'],
    decorationIds: ['curl', 'shard', 'cream', 'rosette', 'flower', 'pearl', 'almond', 'pistachio', 'arch', 'flag'], tip: 'Cool the shells before filling, then build a broad base before the tower gets tall.', technicalHint: 'Similar shells distribute the weight evenly.', decorTarget: 6,
  }),
  extraRecipe(4, 0, {
    id: 'baked-cheesecake', name: 'Sunday baked cheesecake', description: 'Make a smooth, gently baked cheesecake with a crisp biscuit base and a bright finishing touch.',
    method: 'custard', family: 'dessert', kind: 'dessert', steps: [S('beat', 2), S('fold', 3)], shapeMode: 'level', pieces: 3, assemblyParts: 2,
    ingredients: [ingredient('Cream cheese', 400, 'g', 'sticky'), ingredient('Caster sugar', 120), ingredient('Beaten eggs', 150), ingredient('Biscuit crumbs', 180)],
    temp: 160, bakeTime: 32, coolTime: 11, flavours: ['vanilla', 'lemon', 'berry', 'raspberry', 'caramel', 'chocolate', 'orange'], fillings: ['none', 'berry-jam', 'lemon-curd', 'salted-caramel'], finishes: ['glaze', 'cream-finish', 'chocolate-coat', 'caramel-drizzle'],
    tip: 'Smooth the filling without beating in too much air. Cooling gives it time to settle.', technicalHint: 'A gentle oven keeps the filling silky.', decorTarget: 4,
  }),
  extraRecipe(4, 0, {
    id: 'summer-pavlova', name: 'Summer cloud pavlova', description: 'Whip a glossy meringue nest, bake it gently and fill the crisp shell with a cloud of cream.',
    method: 'meringue', family: 'dessert', kind: 'dessert', steps: [S('whip', 4), S('fold', 2)], shapeMode: 'pipe', pieces: 3, assemblyParts: 2,
    ingredients: [ingredient('Egg whites', 120), ingredient('Caster sugar', 220), ingredient('Cornflour', 10), ingredient('Lemon juice', 10, 'ml')],
    temp: 160, bakeTime: 30, coolTime: 10, flavours: ['vanilla', 'berry', 'raspberry', 'lemon', 'rose', 'pistachio', 'coconut'], fillings: ['whipped-cream', 'lemon-curd', 'berry-jam'], finishes: ['cream-finish', 'meringue-finish', 'nut-crunch'],
    tip: 'Whip to glossy peaks, then fold gently. Let the shell cool before giving it its crown.', technicalHint: 'The nest needs a firm edge and a little space for the filling.', decorTarget: 5,
  }),
  extraRecipe(4, 2, {
    id: 'profiterole-tower', name: 'The profiterole fountain', description: 'Stack filled choux buns into a fountain of chocolate, with a carefully balanced silhouette.',
    method: 'choux', family: 'construction', kind: 'pastry', steps: [S('cook', 3), S('beat', 3)], shapeMode: 'pipe', pieces: 6, assemblyParts: 4,
    ingredients: [ingredient('Plain flour', 160), ingredient('Butter', 120), ingredient('Water', 240, 'ml'), ingredient('Beaten eggs', 240)],
    temp: 205, bakeTime: 31, coolTime: 10, flavours: ['chocolate', 'vanilla', 'coffee', 'hazelnut', 'caramel', 'raspberry'], fillings: ['whipped-cream', 'vanilla-custard', 'praline', 'ganache'], finishes: ['chocolate-coat', 'caramel-drizzle'],
    decorationIds: ['raspberry', 'chocolate', 'curl', 'shard', 'cream', 'rosette', 'pearl', 'almond', 'pistachio', 'arch'], tip: 'A tower is only as steady as its bottom row. Let the coating frame the shape rather than hide it.', technicalHint: 'Cool shells, smooth filling and patient assembly.', decorTarget: 7,
  }),
  extraRecipe(5, 0, {
    id: 'jewel-fruit-tart', name: 'Jewel-box fruit tart', description: 'Make a crisp pastry case, add a smooth filling and arrange a colourful, jewel-like finish.',
    method: 'rub', family: 'tart', kind: 'pastry', steps: [S('rub', 3), S('fold', 2)], shapeMode: 'line', pieces: 3, assemblyParts: 2,
    ingredients: [ingredient('Plain flour', 240), ingredient('Cold butter', 120), ingredient('Icing sugar', 70), ingredient('Beaten eggs', 50)],
    temp: 180, bakeTime: 26, coolTime: 8, flavours: ['vanilla', 'lemon', 'berry', 'raspberry', 'almond', 'pistachio', 'rose'], fillings: ['vanilla-custard', 'lemon-curd', 'whipped-cream'], finishes: ['glaze', 'cream-finish', 'nut-crunch'],
    tip: 'Keep the case neat all around its rim. A smooth filling gives the fruit a level stage.', technicalHint: 'Crisp pastry and a restrained finish let the fruit shine.', decorTarget: 5,
  }),
  extraRecipe(5, 0, {
    id: 'butter-brioche', name: 'Butter-kissed brioche', description: 'Knead a rich, soft dough and shape it into a beautifully golden loaf for the final tea table.',
    method: 'knead', family: 'bread', kind: 'bread', steps: [S('knead', 4), S('fold', 3)], shapeMode: 'plait', pieces: 4, assemblyParts: 1,
    ingredients: [ingredient('Strong bread flour', 350), ingredient('Beaten eggs', 180), ingredient('Soft butter', 120), ingredient('Fast-action yeast', 7)],
    temp: 180, bakeTime: 30, coolTime: 9, flavours: ['vanilla', 'orange', 'cinnamon', 'almond', 'caramel', 'ginger'], fillings: ['none', 'cinnamon-butter', 'salted-caramel'], finishes: ['glaze', 'icing', 'nut-crunch', 'caramel-drizzle'],
    tip: 'Rich dough needs patience to become elastic. Even strands produce an even rise.', technicalHint: 'Finish kneading before you start the plait.', decorTarget: 4,
  }),
  extraRecipe(5, 2, {
    id: 'celebration-banquet', name: 'The miniature bake-house', description: 'Build an edible bake-house from cake panels, with a roof, a doorway and a little display of sweet details.',
    method: 'foam', family: 'construction', kind: 'cake', steps: [S('whip', 4), S('fold', 3)], shapeMode: 'level', pieces: 5, assemblyParts: 5,
    ingredients: [ingredient('Plain flour', 350), ingredient('Caster sugar', 350), ingredient('Beaten eggs', 450), ingredient('Melted butter', 150)],
    temp: 180, bakeTime: 34, coolTime: 11, flavours: SWEET_FLAVOURS, fillings: ['buttercream', 'ganache', 'praline', 'berry-jam', 'lemon-curd'], finishes: ['icing', 'chocolate-coat', 'cream-finish'],
    decorationIds: ['berry', 'raspberry', 'chocolate', 'curl', 'shard', 'cream', 'rosette', 'shell', 'leaf', 'flower', 'pearl', 'sprinkle', 'fondant', 'arch', 'flag'], tip: 'Bake the panels evenly and build from the ground up. A beautiful roof still needs a steady house.', technicalHint: 'Choose a coherent flavour, then make every join and detail intentional.', decorTarget: 7,
  }),
];

export const ALL_RECIPES = [...WEEKS.flatMap(week => week.recipes), ...EXTRA_RECIPES];
// Challenge clocks are fixed by round, independently of baking-station timings.
for (const recipe of ALL_RECIPES) {
  recipe.budget = recipe.round === 'Showstopper' ? 240
    : recipe.round === 'Technical' ? 210 : 180;
}
const RECIPE_BY_ID = new Map(ALL_RECIPES.map(recipe => [recipe.id, recipe]));
const ROUND_CHOICES = [
  [['garden-sponge', 'swiss-roll', 'marble-loaf'], ['lemon-madeleines'], ['orchard-celebration', 'celebration-cupcake-tower']],
  [['tea-tin-shortbread', 'chocolate-chip-cookies', 'jam-sandwich-biscuits'], ['viennese-curls'], ['biscuit-greenhouse', 'biscuit-carousel']],
  [['village-bloomer', 'garden-focaccia', 'cinnamon-knots'], ['six-knot-rolls'], ['harvest-wreath', 'woven-bread-basket']],
  [['orchard-galette', 'summer-fruit-pie', 'chocolate-eclairs'], ['choux-buns'], ['pastry-sunburst', 'choux-croquembouche']],
  [['sunday-pudding', 'baked-cheesecake', 'summer-pavlova'], ['vanilla-custard-tarts'], ['pudding-garden', 'profiterole-tower']],
  [['homecoming-tea-cake', 'jewel-fruit-tart', 'butter-brioche'], ['almond-tea-fingers'], ['village-celebration', 'celebration-banquet']],
];

export function getRoundRecipes(week, round) {
  return (ROUND_CHOICES[week]?.[round] || []).map(id => RECIPE_BY_ID.get(id));
}

// One brief for each competition round; every offered recipe satisfies its format.
export const BRIEFS = [
  [
    { title: 'Your teatime signature', description: 'Choose a sponge, rolled cake or marbled loaf. Make the flavour your own and finish it neatly.', minParts: 1, minDecor: 3 },
    { title: 'Six lemon madeleines', description: 'Use the prescribed lemon flavour and citrus glaze. The judges want an even batch of six shell cakes.', minParts: 1, minDecor: 3 },
    { title: 'A garden-party centrepiece', description: 'Build a celebration cake or a flower tower from at least three carefully balanced sections.', minParts: 3, minDecor: 6 },
  ],
  [
    { title: 'Fill the village tea tin', description: 'Choose buttery shortbread, chunky cookies or filled sandwich biscuits. Aim for a consistent batch.', minParts: 1, minDecor: 3 },
    { title: 'Six Viennese curls', description: 'Pipe the prescribed vanilla biscuits and finish with chocolate. Clear ridges and matching shapes count.', minParts: 1, minDecor: 4 },
    { title: 'An edible little building', description: 'Construct a biscuit greenhouse or fairground carousel, with stable joins and a purposeful decorative finish.', minParts: 3, minDecor: 7 },
  ],
  [
    { title: 'Something for the bread basket', description: 'Choose a market loaf, garden focaccia or breakfast knots. Show an even bake and well-handled dough.', minParts: 1, minDecor: 3 },
    { title: 'Six herb knot rolls', description: 'Follow the prescribed herb dough and seeded finish. Make all six knots part of the same family.', minParts: 1, minDecor: 4 },
    { title: 'The harvest table', description: 'Build a bread wreath or woven basket in at least three sections. It must hold together as well as it tastes.', minParts: 3, minDecor: 6 },
  ],
  [
    { title: 'Your pastry-shop favourite', description: 'Choose a rustic galette, lattice pie or filled éclairs. Match your filling to a crisp, properly baked case.', minParts: 1, minDecor: 4 },
    { title: 'Six golden choux buns', description: 'Make the prescribed choux shells, vanilla pastry cream and chocolate finish. Light shells, smooth filling.', minParts: 1, minDecor: 4 },
    { title: 'Pastry with presence', description: 'Construct a layered pastry sunburst or a caramel choux crown. Balance distinct sections into one centrepiece.', minParts: 3, minDecor: 6 },
  ],
  [
    { title: 'The pudding everyone wants', description: 'Choose a comforting pudding, smooth cheesecake or crisp pavlova. A lovely finish should suit the dessert.', minParts: 1, minDecor: 4 },
    { title: 'Six vanilla custard tarts', description: 'Use the prescribed vanilla filling and glaze. Keep the pastry tidy and the custard gently set.', minParts: 1, minDecor: 3 },
    { title: 'A dessert worth gathering round', description: 'Assemble a pudding garden or profiterole fountain. Give at least three balanced parts a coherent finish.', minParts: 3, minDecor: 7 },
  ],
  [
    { title: 'A final taste of home', description: 'Choose a tea cake, fruit tart or enriched brioche. Make a confident bake that shows who you are.', minParts: 1, minDecor: 4 },
    { title: 'Six almond tea fingers', description: 'Follow the almond-and-vanilla brief with chocolate finishing. The last technical rewards careful consistency.', minParts: 1, minDecor: 5 },
    { title: 'The village in celebration', description: 'Build a grand village cake or miniature bake-house. At least three structural parts and seven finishing touches tell your story.', minParts: 3, minDecor: 7 },
  ],
];
