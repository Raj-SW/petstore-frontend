import automaticpetfeeder from "../../assets/ProductsImages/automaticpetfeeder.webp";
import birdcage from "../../assets/ProductsImages/birdcage.webp";
import birdperch from "../../assets/ProductsImages/birdperch.webp";
import catpost from "../../assets/ProductsImages/catpost.webp";
import cattoy from "../../assets/ProductsImages/cattoy.webp";
import dogharness from "../../assets/ProductsImages/dogharness.webp";
import cattunnelltoy from "../../assets/ProductsImages/cattunneltoy.webp";
import dogleash from "../../assets/ProductsImages/dogleash.webp";
import fishtank from "../../assets/ProductsImages/fishtank.webp";
import hamsterhideout from "../../assets/ProductsImages/hamsterhideout.webp";
import petbed from "../../assets/ProductsImages/petbed.webp";
import petbrush from "../../assets/ProductsImages/petbrush.webp";
import petcarrier from "../../assets/ProductsImages/petcarrier.webp";
import petcoolingmat from "../../assets/ProductsImages/petcoolingmat.webp";
import petfeeder from "../../assets/ProductsImages/petfeeder.webp";
import petstroller from "../../assets/ProductsImages/petstroller.webp";
import petwaterdispenser from "../../assets/ProductsImages/petwaterdispenser.webp";
import petwatertravel from "../../assets/ProductsImages/petwatertravel.webp";
import rabbitplaypen from "../../assets/ProductsImages/rabbitplaypen.webp";
import petrainjacket from "../../assets/ProductsImages/petrainjacket.webp";
import birdstand from "../../assets/ProductsImages/largebirdtoy.webp";
import petcave from "../../assets/ProductsImages/pumpkincatbed.webp";
import petcamera from "../../assets/ProductsImages/petcamera.webp";
import dogtirechewtoy from "../../assets/ProductsImages/dogtirechewtoy.webp";
import luxuriousaquarium from "../../assets/ProductsImages/luxuriousaquarium.webp";
import groomingkit from "../../assets/ProductsImages/petgroomingkit.webp";
import petdispenser from "../../assets/ProductsImages/petwaterdispenser.webp";
import catwheel from "../../assets/ProductsImages/interactivecatwheel.webp";
import birdtoys from "../../assets/ProductsImages/birdtoy.webp";
import elevatedbowlstand from "../../assets/ProductsImages/elevatedbowlstand.webp";
import collapsibletravelbowl from "../../assets/ProductsImages/collapsibletravelbowl.webp";
import interactivecatfish from "../../assets/ProductsImages/interactivecatfishtoy.webp";

const Products = [
  {
    id: 1,
    title: "Luxury Dog Bed",
    description:
      "A soft and stylish dog bed perfect for medium-sized pets, designed with a washable cover for convenience.",
    rating: 2,
    price: "49.99",
    imageUrl: petbed,
    category: "dog",
    isFeatured: true,
    isApparel: true,
  },
  {
    id: 2,
    title: "Vibrant Cat Scratching Post",
    description:
      "A multi-level scratching post with colorful sisal material, built-in toys, and a sturdy base to keep cats entertained.",
    rating: 3.5,
    price: "39.99",
    imageUrl: catpost,
    category: "cat",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 3,
    title: "Ergonomic Pet Feeder",
    description:
      "A sleek, elevated feeder with two stainless steel bowls on a stylish wooden stand, designed for better digestion.",
    rating: 3,
    price: "29.99",
    imageUrl: petfeeder,
    category: "general",
    isFeatured: true,
    isApparel: true,
  },
  {
    id: 4,
    title: "Sleek Pet Water Fountain",
    description:
      "A modern water fountain with continuous flow and a built-in filtration system, ensuring fresh and clean water for pets.",
    rating: 3,
    price: "44.99",
    imageUrl: petwaterdispenser,
    category: "general",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 5,
    title: "Cozy Hamster Hideout",
    description:
      "A wooden hideout with a natural design, featuring ventilation holes and a small entrance, perfect for small rodents.",
    rating: 2,
    price: "14.99",
    imageUrl: hamsterhideout,
    category: "small pets",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 6,
    title: "Durable Dog Leash",
    description:
      "A heavy-duty nylon leash with padded handles and a secure metal clip, designed for comfort and durability during outdoor activities.",
    rating: 4,
    price: "19.99",
    imageUrl: dogleash,
    category: "dog",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 7,
    title: "Modern Pet Carrier",
    description:
      "A sleek, lightweight pet carrier with breathable mesh panels and a sturdy handle, perfect for traveling.",
    rating: 4.8,
    price: "39.99",
    imageUrl: petcarrier,
    category: "general",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 8,
    title: "Vibrant Bird Cage",
    description:
      "A spacious, modern bird cage with multiple perches and feeding bowls, designed to create a comfortable environment for birds.",
    rating: 4.6,
    price: "59.99",
    imageUrl: birdcage,
    category: "bird",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 9,
    title: "Premium Fish Tank",
    description:
      "A sleek tank with vibrant decorations, built-in LED lighting, and a filtration system, ideal for showcasing colorful fish.",
    rating: 4.9,
    price: "89.99",
    imageUrl: fishtank,
    category: "fish",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 10,
    title: "Interactive Cat Toy",
    description:
      "A colorful rolling ball with LED lights and a motion sensor, designed for playful cats.",
    rating: 4.6,
    price: "19.99",
    imageUrl: cattoy,
    category: "cat",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 11,
    title: "Adjustable Dog Harness",
    description:
      "A breathable and sturdy harness with reflective strips for safety, ideal for day or night walks.",
    rating: 4.7,
    price: "24.99",
    imageUrl: dogharness,
    category: "dog",
    isFeatured: true,
    isApparel: true,
  },
  {
    id: 12,
    title: "Pet Travel Water Bottle",
    description:
      "A portable, leak-proof water bottle with a built-in bowl, perfect for hydrating pets on the go.",
    rating: 4.5,
    price: "18.99",
    imageUrl: petwatertravel,
    category: "general",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 13,
    title: "Foldable Rabbit Playpen",
    description:
      "A foldable playpen with durable mesh panels and a secure design, offering a spacious and safe area for rabbits.",
    rating: 4.8,
    price: "39.99",
    imageUrl: rabbitplaypen,
    category: "small pets",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 14,
    title: "Stylish Grooming Brush",
    description:
      "A sleek grooming brush with soft bristles and an ergonomic handle, perfect for removing loose fur and tangles.",
    rating: 4.7,
    price: "14.99",
    imageUrl: petbrush,
    category: "general",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 15,
    title: "Automatic Pet Feeder",
    description:
      "A modern feeder with a digital timer and portion control, ideal for convenient and scheduled pet feeding.",
    rating: 4.9,
    price: "59.99",
    imageUrl: automaticpetfeeder,
    category: "general",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 16,
    title: "Pet Cooling Mat",
    description:
      "A gel-infused cooling mat designed to keep pets comfortable in warm weather.",
    rating: 4.6,
    price: "24.99",
    imageUrl: petcoolingmat,
    category: "general",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 17,
    title: "Pet Stroller",
    description:
      "A stylish and foldable stroller with breathable mesh panels and a padded interior, perfect for outdoor adventures.",
    rating: 4.8,
    price: "99.99",
    imageUrl: petstroller,
    category: "general",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 18,
    title: "Collapsible Cat Tunnel Toy",
    description:
      "A collapsible, colorful tunnel with multiple entry points, crinkly material, and hanging toys for endless feline fun.",
    rating: 4.7,
    price: "19.99",
    imageUrl: cattunnelltoy,
    category: "cat",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 19,
    title: "Bird Swing Perch",
    description:
      "A colorful perch made of natural wood and ropes, offering a playful and resting spot for birds in a vibrant cage.",
    rating: 4.5,
    price: "14.99",
    imageUrl: birdperch,
    category: "bird",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 20,
    title: "Dog Raincoat",
    description:
      "A stylish dog raincoat with a hood and reflective strips, ensuring safety and dryness during rainy walks.",
    rating: 4.7,
    price: "24.99",
    imageUrl: petrainjacket,
    category: "dog",
    isFeatured: true,
    isApparel: true,
  },
  {
    id: 21,
    title: "Large Bird Stand",
    description:
      "A multi-perch bird stand with feeding bowls and hanging toys, ideal for entertaining pet birds in any space.",
    rating: 4.6,
    price: "49.99",
    imageUrl: birdstand,
    category: "bird",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 22,
    title: "Cozy Pet Cave Bed",
    description:
      "A plush cave bed designed for cats or small dogs, providing a warm and private sleeping area.",
    rating: 4.8,
    price: "39.99",
    imageUrl: petcave,
    category: "cat",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 23,
    title: "High-Tech Pet Camera",
    description:
      "A smart pet camera with two-way audio and a treat dispenser, perfect for monitoring and interacting with pets remotely.",
    rating: 4.9,
    price: "129.99",
    imageUrl: petcamera,
    category: "general",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 24,
    title: "Durable Tire Chew Toy",
    description:
      "A rugged chew toy for large dogs, designed with textured surfaces to improve dental health and withstand heavy chewing.",
    rating: 4.5,
    price: "14.99",
    imageUrl: dogtirechewtoy,
    category: "dog",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 25,
    title: "Elegant Aquarium Stand",
    description:
      "A sleek wood-and-metal stand, providing stable support for medium-sized fish tanks with modern decor.",
    rating: 4.7,
    price: "89.99",
    imageUrl: luxuriousaquarium,
    category: "fish",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 26,
    title: "Pet Grooming Kit",
    description:
      "A complete grooming set with a comb, scissors, and nail clippers, essential for keeping pets neat and tidy.",
    rating: 4.7,
    price: "19.99",
    imageUrl: groomingkit,
    category: "general",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 27,
    title: "Large Pet Water Dispenser",
    description:
      "A spill-proof water dispenser with a large transparent tank, ensuring fresh water for pets throughout the day.",
    rating: 4.8,
    price: "29.99",
    imageUrl: petdispenser,
    category: "general",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 28,
    title: "Interactive Cat Wheel",
    description:
      "A sleek exercise wheel designed to keep cats active and entertained, made from durable, pet-safe materials.",
    rating: 4.9,
    price: "129.99",
    imageUrl: catwheel,
    category: "cat",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 29,
    title: "Bird Toys Set",
    description:
      "A collection of colorful bird toys designed to keep parrots and other birds entertained and active.",
    rating: 4.6,
    price: "19.99",
    imageUrl: birdtoys,
    category: "bird",
    isFeatured: true,
    isApparel: false,
  },
  {
    id: 30,
    title: "Elevated Bowl Stand",
    description:
      "An ergonomic elevated stand with stainless steel bowls, promoting better digestion and comfort for pets.",
    rating: 4.8,
    price: "49.99",
    imageUrl: elevatedbowlstand,
    category: "general",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 31,
    title: "Collapsible Travel Bowl",
    description:
      "A set of lightweight, collapsible bowls perfect for feeding and hydrating pets during travel or outdoor adventures.",
    rating: 4.7,
    price: "14.99",
    imageUrl: collapsibletravelbowl,
    category: "general",
    isFeatured: false,
    isApparel: false,
  },
  {
    id: 32,
    title: "Interactive Cat Fish Toy",
    description:
      "A lifelike fish toy with motion sensors, designed to stimulate your cat's natural instincts.",
    rating: 4.5,
    price: "19.99",
    imageUrl: interactivecatfish,
    category: "cat",
    isFeatured: false,
    isApparel: false,
  },
];

export default Products;
