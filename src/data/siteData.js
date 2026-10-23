export const classSchedule = [
  {
    id: 'wroughton-juniors-thu',
    location: 'Wroughton',
    venue: 'Ellendune Community Centre',
    audience: 'Children 7+',
    day: 'Thursday',
    time: '6:00pm to 7:00pm',
    type: 'Kids',
  },
  {
    id: 'wroughton-mixed-sat',
    location: 'Wroughton',
    venue: 'Ellendune Community Centre',
    audience: 'Mixed juniors and adults',
    day: 'Saturday',
    time: '10:30am to 11:30am',
    type: 'Mixed',
  },
  {
    id: 'wroughton-adults-mon',
    location: 'Wroughton',
    venue: 'Ellendune Community Centre',
    audience: 'Teens and adults',
    day: 'Monday',
    time: '7:00pm to 8:30pm',
    type: 'Adults',
  },
  {
    id: 'wroughton-adults-thu',
    location: 'Wroughton',
    venue: 'Ellendune Community Centre',
    audience: 'Teens and adults',
    day: 'Thursday',
    time: '7:00pm to 8:30pm',
    type: 'Adults',
  },
  {
    id: 'mevagissey-family-tue',
    location: 'Mevagissey',
    venue: 'Mevagissey Activity Centre',
    audience: 'Family and adults 7+',
    day: 'Tuesday',
    time: '7:30pm to 9:00pm',
    type: 'Family',
  },
]

export const venues = [
  {
    name: 'Ellendune Community Centre',
    address: 'Barrett Way, Wroughton, Swindon, SN4 9LW',
    street: 'Barrett Way',
    postcode: 'SN4 9LW',
    area: 'Wroughton',
    w3w: 'https://w3w.co/fuels.many.pouch',
    primary: true,
  },
  {
    name: 'Mevagissey Activity Centre',
    address: 'Valley Road, Mevagissey, PL26 6SA',
    street: 'Valley Road',
    postcode: 'PL26 6SA',
    area: 'Mevagissey',
    w3w: 'https://w3w.co/convinced.others.radiated',
    primary: true,
  },
  {
    name: 'Winterbourne Monkton Community Hall',
    trainingNote: 'Monthly training venue. Check the club calendar for the date and time.',
    image: '/images/facebook-training-june.jpg',
    address: 'Wiltshire Church Lane, Winterbourne Monkton, Swindon, SN4 9NW',
    area: 'Swindon area',
    w3w: 'https://w3w.co/ranked.dares.childcare',
    primary: false,
  },
]

export const locations = [
  {
    slug: 'wroughton',
    name: 'Wroughton',
    area: 'Swindon',
    image: '/images/wroughton.jpg',
    imageAlt: 'Hakuba students practising dojo etiquette at Wroughton',
    listingImage: '/images/video-stills/1121619617203683-12s.jpg',
    listingImageAlt: 'Children and adults practising karate together at Ellendune Community Centre in Wroughton',
    text: 'Primary Wiltshire training location with separate juniors and adults sessions plus a mixed Saturday class.',
  },
  {
    slug: 'mevagissey',
    name: 'Mevagissey',
    area: 'Cornwall',
    image: '/images/mevagissey.jpg',
    imageAlt: 'Hakuba Karate dojo in Mevagissey',
    text: 'Family and adult Wado-Ryu class in Cornwall taught with the same Hakuba standards and progression pathway.',
  },
]

export const resources = [
  { name: 'Grading syllabus', href: 'https://hakuba-karate.co.uk/grading-syllabus/' },
  { name: 'Karate terminology', href: 'https://hakuba-karate.co.uk/karate-terminology/' },
  { name: 'Katas of Wadoryu', href: 'https://hakuba-karate.co.uk/katas-of-wadoryu/' },
]

export const syllabusPdfs = [
  { belt: '9th Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2018/09/9thKyu_RedBelt_Syllabus.pdf' },
  { belt: '8th Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2018/09/8thKyu_YellowBelt_Syllabus.pdf' },
  { belt: '7th Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2018/09/7thKyu_OrangeBelt_Syllabus.pdf' },
  { belt: '6th Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2018/09/6thKyu_GreenBelt_Syllabus.pdf' },
  { belt: '5th Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2018/09/5thKyu_BlueBelt_Syllabus.pdf' },
  { belt: '4th Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2018/09/4thKyu_PurpleBelt_Syllabus.pdf' },
  { belt: '3rd Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2023/03/3rdKyu_BrownBelt_Syllabus.pdf' },
  { belt: '2nd Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2023/03/2ndKyu_BrownWhiteBelt_Syllabus.pdf' },
  { belt: '1st Kyu', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2023/03/1stKyu_BrownBlackBeltSyllabus.pdf' },
  { belt: 'Shodan', href: 'https://hakuba-karate.co.uk/wp-content/uploads/2023/03/SHODAN-壱段.pdf' },
]

export const appFeatures = [
  'Belt syllabus',
  'Stances',
  'Practice quiz',
  'Belt tying',
  'Counting',
  'Terminology',
  'Study mode',
  'Achievements',
  'Calendar',
  'Search',
]

export const federations = [
  { name: 'British Wado Federation', href: 'https://britishwadofederation.org.uk/', logo: '/bwf-logo.jpg' },
  { name: 'International Wado Federation', href: 'https://iwf-karate.org/', logo: '/iwf-logo.png' },
]

export const firstClassSteps = [
  'Choose a suitable session from the timetable. No booking is needed.',
  'Wear comfortable training clothes and bring water. Contact us if you would like help choosing a class.',
  'Arrive a few minutes early to meet the instructor and settle in.',
  'Train in a beginner-friendly session focused on safe basics and dojo etiquette.',
  'After class, we explain the next step and how to continue confidently.',
]

export const newsItems = [
  { title: 'Hakuba Mevagissey Opening night 3rd February 2026', date: '26 March 2026', href: 'https://hakuba-karate.co.uk/2026/03/26/hakuba-mevagissey-opening-night-03-03-26/' },
  { title: 'Kyu Grading – 15 Nov 2025', date: '16 November 2025', href: 'https://hakuba-karate.co.uk/2025/11/16/kyu-grading-15-nov-2025/' },
  { title: 'Kefalonia 3-5 Oct 2025', date: '11 October 2025', href: 'https://hakuba-karate.co.uk/2025/10/11/kefalonia-3-5-oct-2025/' },
  { title: 'Hakuba Training Course – Cornwall – 6th Sept 2025', date: '9 September 2025', href: 'https://hakuba-karate.co.uk/2025/09/09/hakuba-training-course-cornwall-6th-sept-2025/' },
  { title: 'Kyu Grading Success', date: '17 May 2025', href: 'https://hakuba-karate.co.uk/2025/05/17/kyu-grading-success/' },
]

export const contact = {
  phone: '07772 491216',
  email: 'hakuba.wadoryu.karate@gmail.com',
  calendarUrl: 'https://hakuba-karate.co.uk/calendar/',
}
