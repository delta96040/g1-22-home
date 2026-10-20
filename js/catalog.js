// Furniture catalogue. Sizes are real-world defaults in metres: [width, depth, height].
// `m` = model file in /models (Kenney Furniture Kit 2.0, CC0); `p` = procedural builder in items.js.
// `y` = default height off the floor, `wall` = snaps flush against walls and turns to face the room.

export const CATEGORIES = ['All', 'Living', 'Bedroom', 'Dining & Bar', 'Study', 'Kitchen', 'Bath', 'Storage & Entry', 'Lighting & AC', 'Decor', 'Sets'];

const I = (id, name, cat, size, opt = {}) => ({ id, name, cat, size, y: 0, ...opt });

export const ITEMS = [
  // Living
  I('sofa3', '3-seat sofa', 'Living', [2.1, 0.9, 0.85], { m: 'lounge-sofa', wall: true }),
  I('sofaL', 'Sofa with chaise', 'Living', [2.1, 1.6, 0.85], { m: 'lounge-sofa-long', wall: true }),
  I('sofaCorner', 'Sofa corner piece', 'Living', [0.95, 0.95, 0.85], { m: 'lounge-sofa-corner' }),
  I('sofaDesign', 'Low designer sofa', 'Living', [2.2, 0.85, 0.72], { m: 'lounge-design-sofa', wall: true }),
  I('sofaDesignL', 'L-shaped sofa', 'Living', [2.6, 2.6, 0.72], { m: 'lounge-design-sofa-corner', wall: true }),
  I('armchair', 'Armchair', 'Living', [0.9, 0.8, 0.85], { m: 'lounge-chair' }),
  I('recliner', 'Recliner', 'Living', [0.9, 1.2, 1.05], { m: 'lounge-chair-relax' }),
  I('designChair', 'Designer lounge chair', 'Living', [1.2, 0.8, 0.72], { m: 'lounge-design-chair' }),
  I('ottoman', 'Ottoman / pouf', 'Living', [0.8, 0.8, 0.42], { m: 'lounge-sofa-ottoman' }),
  I('coffee', 'Coffee table', 'Living', [1.2, 0.65, 0.42], { m: 'table-coffee' }),
  I('coffeeGlass', 'Glass coffee table', 'Living', [1.2, 0.65, 0.42], { m: 'table-coffee-glass' }),
  I('coffeeSq', 'Square coffee table', 'Living', [0.8, 0.8, 0.42], { m: 'table-coffee-square' }),
  I('tvUnit', 'TV unit (open)', 'Living', [1.8, 0.45, 0.5], { m: 'cabinet-television', wall: true }),
  I('tvUnitDoors', 'TV unit (doors)', 'Living', [1.8, 0.45, 0.5], { m: 'cabinet-television-doors', wall: true }),
  I('tv55stand', 'TV 55″ on stand', 'Living', [1.24, 0.25, 0.82], { m: 'television-modern' }),
  I('tv55', 'TV 55″ wall-mounted', 'Living', [1.23, 0.05, 0.71], { p: 'tvWall', y: 1.05, wall: true }),
  I('tv65', 'TV 65″ wall-mounted', 'Living', [1.45, 0.05, 0.84], { p: 'tvWall', y: 1.0, wall: true }),
  I('tv75', 'TV 75″ wall-mounted', 'Living', [1.68, 0.05, 0.97], { p: 'tvWall', y: 0.95, wall: true }),
  I('tvPanel', 'TV wall panel (fluted)', 'Living', [2.4, 0.06, 2.6], { p: 'panel', wall: true, color: '#6b4a32' }),
  I('speaker', 'Tower speaker', 'Living', [0.3, 0.3, 1.1], { m: 'speaker' }),
  I('speakerSm', 'Bookshelf speaker', 'Living', [0.2, 0.18, 0.4], { m: 'speaker-small' }),
  I('rugRect', 'Rug 240×160', 'Living', [2.4, 1.6, 0.012], { m: 'rug-rectangle' }),
  I('rugRounded', 'Rug, rounded corners', 'Living', [2.4, 1.6, 0.012], { m: 'rug-rounded' }),
  I('rugRound', 'Round rug', 'Living', [1.8, 1.8, 0.012], { m: 'rug-round' }),
  I('rugSq', 'Square rug', 'Living', [2.0, 2.0, 0.012], { m: 'rug-square' }),

  // Bedroom
  I('bedKing', 'King bed 6×6.5 ft', 'Bedroom', [1.95, 2.15, 1.05], { m: 'bed-double', wall: true }),
  I('bedQueen', 'Queen bed 5×6.5 ft', 'Bedroom', [1.6, 2.1, 1.0], { m: 'bed-double', wall: true }),
  I('bedSingle', 'Single bed', 'Bedroom', [1.0, 2.05, 0.9], { m: 'bed-single', wall: true }),
  I('bedBunk', 'Bunk bed', 'Bedroom', [1.05, 2.05, 1.7], { m: 'bed-bunk', wall: true }),
  I('bedside', 'Bedside table', 'Bedroom', [0.5, 0.42, 0.55], { m: 'cabinet-bed-drawer', wall: true }),
  I('bedsideOpen', 'Bedside table, open shelf', 'Bedroom', [0.5, 0.42, 0.55], { m: 'cabinet-bed-drawer-table', wall: true }),
  I('wardrobe2', 'Wardrobe, 2 door', 'Bedroom', [1.2, 0.6, 2.1], { p: 'wardrobe', wall: true, color: '#e8e2d6' }),
  I('wardrobe3', 'Wardrobe, 3 door', 'Bedroom', [1.8, 0.6, 2.1], { p: 'wardrobe', wall: true, color: '#e8e2d6' }),
  I('wardrobeSlide', 'Sliding wardrobe', 'Bedroom', [2.4, 0.65, 2.4], { p: 'slider', wall: true, color: '#3f3a36' }),
  I('dresser', 'Dressing table + mirror', 'Bedroom', [1.0, 0.45, 1.75], { p: 'dresser', wall: true, color: '#8a5a36' }),
  I('mirrorWall', 'Wall mirror', 'Bedroom', [0.6, 0.03, 0.9], { p: 'mirror', y: 0.95, wall: true, color: '#b08a4f' }),
  I('mirrorFull', 'Full-length mirror', 'Bedroom', [0.55, 0.04, 1.7], { p: 'mirror', y: 0.1, wall: true, color: '#2b2b2b' }),
  I('benchBed', 'Bed-end bench', 'Bedroom', [1.4, 0.45, 0.46], { m: 'bench-cushion' }),
  I('bear', 'Teddy bear', 'Bedroom', [0.35, 0.25, 0.45], { m: 'bear' }),

  // Dining & bar
  I('table6', 'Dining table, 6 seat', 'Dining & Bar', [1.8, 0.95, 0.76], { m: 'table' }),
  I('table6cloth', 'Dining table with cloth', 'Dining & Bar', [1.8, 0.95, 0.76], { m: 'table-cloth' }),
  I('tableGlass', 'Glass dining table', 'Dining & Bar', [1.8, 0.95, 0.76], { m: 'table-glass' }),
  I('tableCross', 'Trestle dining table', 'Dining & Bar', [1.8, 0.95, 0.76], { m: 'table-cross' }),
  I('tableRound', 'Round table', 'Dining & Bar', [1.2, 1.2, 0.76], { m: 'table-round' }),
  I('chair', 'Dining chair', 'Dining & Bar', [0.46, 0.5, 0.95], { m: 'chair' }),
  I('chairCushion', 'Dining chair, cushioned', 'Dining & Bar', [0.46, 0.5, 0.95], { m: 'chair-cushion' }),
  I('chairModern', 'Modern chair', 'Dining & Bar', [0.46, 0.5, 0.92], { m: 'chair-modern-cushion' }),
  I('chairFrame', 'Frame chair', 'Dining & Bar', [0.46, 0.5, 0.92], { m: 'chair-modern-frame-cushion' }),
  I('chairRound', 'Rounded chair', 'Dining & Bar', [0.46, 0.5, 0.9], { m: 'chair-rounded' }),
  I('bench', 'Dining bench', 'Dining & Bar', [1.4, 0.4, 0.46], { m: 'bench' }),
  I('barCounter', 'Bar counter module', 'Dining & Bar', [0.9, 0.5, 1.05], { m: 'kitchen-bar' }),
  I('barEnd', 'Bar counter end', 'Dining & Bar', [0.22, 0.5, 1.05], { m: 'kitchen-bar-end' }),
  I('barStool', 'Bar stool', 'Dining & Bar', [0.45, 0.42, 0.78], { m: 'stool-bar' }),
  I('barStoolSq', 'Bar stool, square', 'Dining & Bar', [0.38, 0.38, 0.75], { m: 'stool-bar-square' }),
  I('barCab', 'Bar cabinet with bottles', 'Dining & Bar', [1.2, 0.45, 1.9], { p: 'barCab', wall: true, color: '#3d2f25' }),
  I('crockery', 'Crockery unit', 'Dining & Bar', [1.4, 0.45, 1.9], { p: 'crockery', wall: true, color: '#e8e2d6' }),

  // Study
  I('desk', 'Study table', 'Study', [1.2, 0.6, 0.75], { m: 'desk', wall: true }),
  I('deskCorner', 'Corner desk', 'Study', [1.5, 1.5, 0.75], { m: 'desk-corner', wall: true }),
  I('deskChair', 'Office chair', 'Study', [0.62, 0.6, 1.1], { m: 'chair-desk' }),
  I('monitor', 'Monitor 27″', 'Study', [0.62, 0.2, 0.48], { m: 'computer-screen', y: 0.75 }),
  I('laptop', 'Laptop', 'Study', [0.34, 0.26, 0.22], { m: 'laptop', y: 0.75 }),
  I('keyboard', 'Keyboard', 'Study', [0.44, 0.15, 0.03], { m: 'computer-keyboard', y: 0.75 }),
  I('mouse', 'Mouse', 'Study', [0.07, 0.12, 0.035], { m: 'computer-mouse', y: 0.75 }),
  I('bookcase', 'Bookcase, open', 'Study', [0.9, 0.35, 1.95], { m: 'bookcase-open', wall: true }),
  I('bookcaseLow', 'Low bookcase', 'Study', [0.9, 0.35, 0.9], { m: 'bookcase-open-low', wall: true }),
  I('bookcaseWide', 'Wide bookcase', 'Study', [1.6, 0.4, 1.6], { m: 'bookcase-closed-wide', wall: true }),
  I('books', 'Books', 'Study', [0.3, 0.2, 0.22], { m: 'books', y: 0.75 }),

  // Kitchen
  I('kBase', 'Base cabinet 60', 'Kitchen', [0.6, 0.6, 0.9], { m: 'kitchen-cabinet', wall: true }),
  I('kDrawer', 'Drawer cabinet 60', 'Kitchen', [0.6, 0.6, 0.9], { m: 'kitchen-cabinet-drawer', wall: true }),
  I('kCorner', 'Corner base cabinet', 'Kitchen', [0.9, 0.9, 0.9], { m: 'kitchen-cabinet-corner-inner', wall: true }),
  I('kCornerRound', 'Rounded end cabinet', 'Kitchen', [0.6, 0.6, 0.9], { m: 'kitchen-cabinet-corner-round', wall: true }),
  I('kSink', 'Sink cabinet', 'Kitchen', [0.6, 0.6, 1.0], { m: 'kitchen-sink', wall: true }),
  I('kStove', 'Hob + oven', 'Kitchen', [0.6, 0.6, 0.9], { m: 'kitchen-stove', wall: true }),
  I('kStoveE', 'Induction hob + oven', 'Kitchen', [0.6, 0.6, 0.9], { m: 'kitchen-stove-electric', wall: true }),
  I('kUpper', 'Wall cabinet', 'Kitchen', [0.6, 0.35, 0.7], { m: 'kitchen-cabinet-upper', y: 1.45, wall: true }),
  I('kUpper2', 'Wall cabinet, double', 'Kitchen', [0.6, 0.35, 0.7], { m: 'kitchen-cabinet-upper-double', y: 1.45, wall: true }),
  I('kUpperLow', 'Wall cabinet, short', 'Kitchen', [0.6, 0.35, 0.35], { m: 'kitchen-cabinet-upper-low', y: 1.8, wall: true }),
  I('kHood', 'Chimney hood', 'Kitchen', [0.6, 0.45, 0.75], { m: 'hood-modern', y: 1.5, wall: true }),
  I('fridgeDD', 'Fridge, double door', 'Kitchen', [0.9, 0.72, 1.8], { m: 'kitchen-fridge-large', wall: true }),
  I('fridge', 'Fridge', 'Kitchen', [0.7, 0.7, 1.75], { m: 'kitchen-fridge', wall: true }),
  I('fridgeSm', 'Mini fridge', 'Kitchen', [0.55, 0.55, 0.85], { m: 'kitchen-fridge-small', wall: true }),
  I('micro', 'Microwave', 'Kitchen', [0.5, 0.4, 0.3], { m: 'kitchen-microwave', y: 0.9 }),
  I('coffeeM', 'Coffee machine', 'Kitchen', [0.25, 0.32, 0.35], { m: 'kitchen-coffee-machine', y: 0.9 }),
  I('toaster', 'Toaster', 'Kitchen', [0.28, 0.16, 0.2], { m: 'toaster', y: 0.9 }),
  I('blender', 'Mixer / blender', 'Kitchen', [0.2, 0.18, 0.38], { m: 'kitchen-blender', y: 0.9 }),
  I('washer', 'Washing machine', 'Kitchen', [0.6, 0.6, 0.85], { m: 'washer', wall: true }),
  I('dryer', 'Dryer', 'Kitchen', [0.6, 0.6, 0.85], { m: 'dryer', wall: true }),
  I('washStack', 'Washer + dryer stack', 'Kitchen', [0.6, 0.6, 1.7], { m: 'washer-dryer-stacked', wall: true }),
  I('island', 'Kitchen island', 'Kitchen', [1.8, 0.9, 0.9], { p: 'island', color: '#4a5a52' }),
  I('bin', 'Dustbin', 'Kitchen', [0.32, 0.36, 0.65], { m: 'trashcan' }),

  // Bath
  I('wc', 'WC', 'Bath', [0.4, 0.68, 0.8], { m: 'toilet', wall: true }),
  I('wcSq', 'WC, wall-hung style', 'Bath', [0.38, 0.55, 0.8], { m: 'toilet-square', wall: true }),
  I('basin', 'Pedestal basin', 'Bath', [0.55, 0.45, 0.9], { m: 'bathroom-sink', wall: true }),
  I('vanity', 'Vanity basin', 'Bath', [0.8, 0.55, 1.05], { m: 'bathroom-sink-square', wall: true }),
  I('vanityCab', 'Vanity cabinet', 'Bath', [0.8, 0.55, 0.85], { m: 'bathroom-cabinet-drawer', wall: true }),
  I('tub', 'Bathtub', 'Bath', [1.7, 0.8, 0.6], { m: 'bathtub', wall: true }),
  I('shower', 'Shower enclosure', 'Bath', [0.9, 0.9, 2.0], { m: 'shower', wall: true }),
  I('showerRound', 'Shower, quadrant', 'Bath', [0.9, 0.9, 2.0], { m: 'shower-round', wall: true }),
  I('bathMirror', 'Mirror cabinet', 'Bath', [0.6, 0.18, 0.8], { m: 'bathroom-mirror', y: 1.1, wall: true }),
  I('bathCab', 'Wall cabinet', 'Bath', [0.45, 0.25, 0.75], { m: 'bathroom-cabinet', y: 1.25, wall: true }),

  // Storage & entry
  I('shoeRack', 'Shoe rack (open)', 'Storage & Entry', [1.0, 0.35, 0.9], { p: 'shoeRack', wall: true, color: '#8a5a36' }),
  I('shoeCab', 'Shoe cabinet', 'Storage & Entry', [1.2, 0.35, 1.0], { p: 'shoeCab', wall: true, color: '#e8e2d6' }),
  I('console', 'Console table', 'Storage & Entry', [1.1, 0.38, 0.8], { m: 'side-table', wall: true }),
  I('consoleDr', 'Console with drawers', 'Storage & Entry', [1.1, 0.38, 0.8], { m: 'side-table-drawers', wall: true }),
  I('cupboard', 'Cupboard', 'Storage & Entry', [0.9, 0.45, 1.95], { m: 'bookcase-closed-doors', wall: true }),
  I('cupboardTall', 'Closed bookcase', 'Storage & Entry', [0.9, 0.45, 1.95], { m: 'bookcase-closed', wall: true }),
  I('coatStand', 'Coat stand', 'Storage & Entry', [0.5, 0.5, 1.75], { m: 'coat-rack-standing' }),
  I('coatHooks', 'Wall coat hooks', 'Storage & Entry', [0.9, 0.25, 0.5], { m: 'coat-rack', y: 1.5, wall: true }),
  I('boxOpen', 'Moving box', 'Storage & Entry', [0.6, 0.4, 0.5], { m: 'cardboard-box-open' }),

  // Lighting & AC
  I('ac', 'Split AC 1.5 ton', 'Lighting & AC', [0.98, 0.23, 0.31], { p: 'ac', y: 2.35, wall: true, color: '#f4f4f2' }),
  I('ac2', 'Split AC 2 ton', 'Lighting & AC', [1.1, 0.25, 0.33], { p: 'ac', y: 2.33, wall: true, color: '#f4f4f2' }),
  I('fan', 'Ceiling fan', 'Lighting & AC', [1.2, 1.2, 0.35], { m: 'ceiling-fan', y: 2.65 }),
  I('pendant', 'Pendant light', 'Lighting & AC', [0.3, 0.3, 0.6], { m: 'lamp-square-ceiling', y: 2.4 }),
  I('floorLamp', 'Floor lamp', 'Lighting & AC', [0.42, 0.45, 1.6], { m: 'lamp-round-floor' }),
  I('floorLampSq', 'Floor lamp, square', 'Lighting & AC', [0.3, 0.3, 1.6], { m: 'lamp-square-floor' }),
  I('tableLamp', 'Table lamp', 'Lighting & AC', [0.3, 0.32, 0.55], { m: 'lamp-round-table', y: 0.55 }),
  I('wallLamp', 'Wall light', 'Lighting & AC', [0.35, 0.22, 0.15], { m: 'lamp-wall', y: 1.9, wall: true }),

  // Decor
  I('plant', 'Floor plant', 'Decor', [0.5, 0.55, 1.4], { m: 'potted-plant' }),
  I('plantS1', 'Small plant', 'Decor', [0.22, 0.22, 0.32], { m: 'plant-small-1', y: 0.75 }),
  I('plantS2', 'Small plant (2)', 'Decor', [0.22, 0.22, 0.32], { m: 'plant-small-2', y: 0.75 }),
  I('plantS3', 'Small succulent', 'Decor', [0.22, 0.2, 0.32], { m: 'plant-small-3', y: 0.75 }),
  I('art', 'Wall art', 'Decor', [0.9, 0.03, 0.6], { p: 'art', y: 1.4, wall: true, color: '#c9774f' }),
  I('curtain', 'Curtains', 'Decor', [2.2, 0.12, 2.6], { p: 'curtain', wall: true, color: '#cdbfa8' }),
  I('mandir', 'Pooja mandir', 'Decor', [0.9, 0.45, 1.5], { p: 'mandir', wall: true, color: '#8a5a36' }),
  I('cushion', 'Cushion', 'Decor', [0.45, 0.15, 0.45], { m: 'pillow' }),
  I('radio', 'Radio', 'Decor', [0.35, 0.12, 0.26], { m: 'radio', y: 0.75 }),
  I('custom', 'Custom block', 'Decor', [1.0, 0.6, 0.8], { p: 'box', color: '#9aa8a2' }),

  // Sets (several pieces placed together)
  I('setDining6', 'Dining set for 6', 'Sets', [1.8, 1.95, 0.95], { set: [['table6', 0, 0, 0], ['chairCushion', -0.55, -0.62, 0], ['chairCushion', 0, -0.62, 0], ['chairCushion', 0.55, -0.62, 0], ['chairCushion', -0.55, 0.62, 180], ['chairCushion', 0, 0.62, 180], ['chairCushion', 0.55, 0.62, 180]] }),
  I('setDining4', 'Round dining for 4', 'Sets', [1.9, 1.9, 0.95], { set: [['tableRound', 0, 0, 0], ['chair', 0, -0.7, 0], ['chair', 0, 0.7, 180], ['chair', -0.7, 0, 90], ['chair', 0.7, 0, -90]] }),
  I('setBar', 'Bar counter + 3 stools', 'Sets', [2.02, 1.0, 1.05], { set: [['barEnd', -0.9, -0.2, 0], ['barCounter', -0.34, -0.2, 0], ['barCounter', 0.56, -0.2, 0], ['barStool', -0.45, 0.32, 180], ['barStool', 0.1, 0.32, 180], ['barStool', 0.65, 0.32, 180]] }),
  I('setStudy', 'Study desk setup', 'Sets', [1.2, 1.1, 1.1], { set: [['desk', 0, -0.25, 0], ['monitor', 0.05, -0.38, 0, 0.75], ['keyboard', 0.05, -0.15, 0, 0.75], ['mouse', 0.35, -0.15, 0, 0.75], ['laptop', -0.38, -0.25, 15, 0.75], ['deskChair', 0, 0.3, 180]] }),
  I('setLiving', 'Living set (sofa, 2 chairs, table, rug)', 'Sets', [3.0, 2.6, 0.85], { set: [['rugRect', 0, 0.1, 0], ['sofa3', 0, -0.85, 0], ['armchair', -1.05, 0.45, 90], ['armchair', 1.05, 0.45, -90], ['coffee', 0, 0.2, 0]] }),
  I('setBedroom', 'Bed with 2 bedside tables', 'Sets', [3.05, 2.15, 1.05], { set: [['bedKing', 0, 0, 0], ['bedside', -1.28, -0.83, 0], ['bedside', 1.28, -0.83, 0], ['tableLamp', -1.28, -0.83, 0, 0.55], ['tableLamp', 1.28, -0.83, 0, 0.55]] }),
];
export const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export const FLOOR_TYPES = {
  wood: 'Oak planks', walnut: 'Walnut planks', marble: 'White marble', stone: 'Beige stone',
  tile: 'Grey tile 30', ktile: 'Kitchen tile', black: 'Black granite', terrazzo: 'Terrazzo',
  deck: 'Wood deck', granite: 'Granite', pebble: 'Pebbles', steel: 'Steel', carpet: 'Carpet',
};
export const PAINTS = ['#f3f1ec', '#ebe6dc', '#e9ece9', '#dfe6e1', '#d8dfe6', '#e8d9c8', '#d9c7b0', '#b9c3b2', '#9fb0a3', '#7d8e9e', '#5b6b7a', '#4a4f55', '#c98f6e', '#a65d4f', '#e5c681', '#2f3a33'];
