// Full menu data - single source of truth for menu page
const MENU_DATA = {
  cupcakes: {
    icon: '🧁',
    title: 'Cupcakes',
    sublines: [
      {
        name: 'Gourmet Heritage Line',
        items: [
          { icon: '🍋', name: 'Lemon Burst', desc: 'Bright, buttery lemon cake with fresh zest and smooth lemon buttercream', pricing: '6-Pack: $20 · Dozen: $35', cart: [{ name: 'Lemon Burst Cupcakes (6-Pack)', price: 20 }, { name: 'Lemon Burst Cupcakes (Dozen)', price: 35 }] },
          { icon: '🍊', name: 'Orange Cranberry', desc: 'Zesty orange cake with tart cranberry swirls and cream cheese frosting', pricing: '6-Pack: $20 · Dozen: $35' },
          { icon: '🥧', name: 'Key Lime Pie', desc: 'Tangy key lime cake with graham cracker crust and whipped topping', pricing: '6-Pack: $20 · Dozen: $35' },
          { icon: '🍫', name: 'Chocolate Crunch', desc: 'Rich chocolate cake with crunchy toffee bits and chocolate ganache', pricing: '6-Pack: $20 · Dozen: $35' }
        ]
      },
      {
        name: 'Kool Aid Fruit Blast Line',
        items: [
          { icon: '🍒', name: 'Cherry Bomb', desc: 'Bursting cherry flavor with vanilla buttercream and cherry drizzle', pricing: '6-Pack: $18 · Dozen: $32' },
          { icon: '💙', name: 'Blue Razz Pop', desc: 'Electric blue raspberry cake with matching blue frosting', pricing: '6-Pack: $18 · Dozen: $32' },
          { icon: '🍉', name: 'Watermelon Splash', desc: 'Refreshing watermelon cake with pink and green ombré frosting', pricing: '6-Pack: $18 · Dozen: $32' },
          { icon: '🌈', name: 'Rainbow Variety Pack', desc: 'Mix of all Kool Aid flavors in one colorful pack', pricing: '6-Pack: $18 · Dozen: $32' },
          { icon: '✨', name: 'Pick Your Own Flavor', desc: 'Custom Kool Aid flavor of your choice', pricing: '6-Pack: $18 · Dozen: $32' }
        ]
      }
    ],
    note: 'More flavors + rotating options available!'
  },
  cakePops: {
    icon: '🍭',
    title: 'Cake Pops',
    items: [
      { icon: '❤️', name: 'Red Velvet Bliss', desc: 'Classic red velvet cake dipped in white chocolate', pricing: 'Individual: $3 · Dozen: $30' },
      { icon: '🎉', name: 'Birthday Confetti', desc: 'Vanilla cake with rainbow sprinkles and chocolate coating', pricing: 'Individual: $3 · Dozen: $30' },
      { icon: '🍫', name: 'Chocolate Fudge', desc: 'Rich chocolate cake with dark chocolate coating', pricing: 'Individual: $3 · Dozen: $30' },
      { icon: '🍪', name: 'Cookies & Cream Dream', desc: 'Oreo-studded cake with white chocolate coating', pricing: 'Individual: $3 · Dozen: $30' },
      { icon: '👻', name: 'Specialty Shapes', desc: 'Ghosts, pumpkins, and seasonal shapes available', pricing: 'Custom pricing for events' }
    ],
    note: 'More flavors to be added! Custom pricing for events'
  },
  cakecicles: {
    icon: '🍰',
    title: 'Cakecicles',
    items: [
      { icon: '❤️', name: 'Red Velvet Bliss Cakesicle', desc: 'Red velvet cake with cream cheese filling and white chocolate coating', pricing: '$4 each · $36/dozen' },
      { icon: '🍫', name: 'Chocolate Fudge Cakesicle', desc: 'Rich chocolate cake with chocolate mousse filling', pricing: '$4 each · $36/dozen' },
      { icon: '🍪', name: 'Cookies & Cream Dream Cakesicle', desc: 'Oreo cake with vanilla cream filling and chocolate coating', pricing: '$4 each · $36/dozen' },
      { icon: '🎉', name: 'Birthday Confetti Cakesicle', desc: 'Vanilla cake with rainbow sprinkles and colorful coating', pricing: '$4 each · $36/dozen' },
      { icon: '🎨', name: 'Custom / Party Design Cakesicles', desc: 'Custom designs and flavors for special events', pricing: 'Custom pricing' }
    ]
  },
  cakes: {
    icon: '🎂',
    title: 'Custom Cakes',
    items: [{ icon: '🎂', name: 'Custom Cake', desc: '2 layers, filled & frosted. Options: Buttercream, Cream Cheese, Whipped Cream; Fondant, Drip Designs; Molded Toppers, Hand-Piped Flowers; Sculpted, Character, 3D.', pricing: 'Contact for quote' }],
    note: 'Custom designs and flavors available! Contact us for pricing and consultation.'
  },
  seasonal: {
    icon: '🎃',
    title: 'Seasonal & Specialty',
    items: [
      { icon: '🎃', name: 'Pumpkin Butterscotch Bundts', desc: 'Spiced pumpkin cake with butterscotch glaze', pricing: 'Seasonal availability' },
      { icon: '❄️', name: 'Peppermint Mocha Pops', desc: 'Chocolate cake with peppermint cream and mocha coating', pricing: 'Holiday season' },
      { icon: '💔', name: 'Breakable Hearts', desc: 'Chocolate hearts filled with treats and surprises', pricing: "Valentine's Day" },
      { icon: '🍫', name: 'Dubai Chocolate Bars', desc: 'Premium chocolate bars with exotic flavors and gold accents', pricing: 'Limited edition' },
      { icon: '🍓', name: 'Chocolate-Dipped Strawberries', desc: 'Fresh strawberries dipped in premium chocolate', pricing: 'Seasonal availability' },
      { icon: '🎁', name: 'Seasonal Variety Packs', desc: 'Mixed selection of seasonal treats and flavors', pricing: 'Limited time' }
    ],
    note: 'Requests open for custom creations! Seasonal items available during specific times.'
  },
  spookyBundles: {
    icon: '🎃',
    title: 'Spooky Party Bundles',
    items: [
      { icon: '🍰', name: 'Bento Cakes', desc: 'Perfect for small celebrations. 5–6" mini cake with a simple buttercream design. Writing included.', pricing: '$45 · Add edible image: +$10' },
      { icon: '🎂', name: 'Classic', desc: '8" cake, 2 layers with a simple buttercream design. Writing included.', pricing: '$65 · Custom theme: +$20 · Edible image: +$15' },
      { icon: '🎉', name: 'Cake Bundle', desc: 'Perfect for birthdays. Includes: 6" cake, 1 dozen cupcakes, 1 dozen cake pops.', pricing: '$120' },
      { icon: '✨', name: 'Deluxe', desc: '"The party stopper". Includes: 8" cake, 1 dozen cupcakes, 1 dozen cake pops, 1 dozen dipped treats (Oreos or Pretzels).', pricing: '$170' },
      { icon: '👑', name: 'Ultimate', desc: '"The ultimate package". Includes: 8–10" cake, 2 dozen cupcakes, 2 dozen cake pops, 2 dozen dipped treats.', pricing: '$220' },
      { icon: '➕', name: 'Upgrades', desc: 'Custom theme design — $20+ · Edible image topper — $15 · Fondant decorations — $15+ · Gold leaf or shimmers — $10', pricing: '' }
    ],
    note: 'Orders must be placed 10 days in advance. 50% deposit required to secure order. Remaining balance due at pickup.'
  },
  spookyBabyBundles: {
    icon: '👻',
    title: 'Spooky Baby Bundles',
    sublines: [
      {
        name: '🍫 By the Dozen',
        items: [
          { icon: '🍪', name: 'Dipped Oreos', desc: '', pricing: '$20' },
          { icon: '🍘', name: 'Dipped Rice Krispies', desc: '', pricing: '$20' },
          { icon: '🥨', name: 'Dipped Pretzel Rods', desc: '', pricing: '$20' },
          { icon: '🥨', name: 'Dipped Caramel Pretzel Rods', desc: '', pricing: '$26' },
          { icon: '🍓', name: 'Chocolate Strawberries', desc: '', pricing: '$30' },
          { icon: '🍭', name: 'Cake Pops', desc: '', pricing: '$32' },
          { icon: '🧁', name: 'Cupcakes', desc: '', pricing: '$32' },
          { icon: '🍰', name: 'Cake-sicles', desc: '', pricing: '$38' }
        ]
      }
    ],
    items: [
      { icon: '🎁', name: 'Treat Box', desc: '2 dozen treats. Pick your choice of 2 treat dozens. Options 1–7 available. 24 pieces.', pricing: '$65' },
      { icon: '🎉', name: 'Party Box', desc: '3 dozen treats. Pick your choice of 3 treat dozens. Options 1–8 available. 36 pieces.', pricing: '$95' },
      { icon: '🍬', name: 'Dessert Table', desc: '4 dozen treats. Pick your choice of 4 treat dozens. Options 1–8 available. 48 pieces.', pricing: '$130' },
      { icon: '➕', name: 'Upgrades', desc: 'Extra chocolate drizzles — $5 per dozen · Chocolate molded toppers — $5 per dozen · Edible glitter or shimmer — $10 · Individually wrapped — $10 · Custom thematic colors — $15 · Edible decorations — $15+ · Edible printed images — $15+ · Themed decor (plastic) — $15+ · Fondant decorations — $15+', pricing: '' }
    ],
    note: 'Orders must be placed at least 10 days in advance or $10 rush fee applies. 50% deposit required (non-refundable) to book. Remaining balance due upon arrival. Prices listed are starting prices; upgrades and time may increase cost.'
  }
};
