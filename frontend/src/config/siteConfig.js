// MatchStake Site Config — FIFA World Cup 2026 Theme
// All content data for the design sections

export const siteConfig = {
  language: "en",
  siteTitle: "MatchStake — World Cup 2026 Social Staking",
  siteDescription: "Create watch party rooms, predict scores, and stake OKB with friends on X Layer. Built for the OKX X Cup Hackathon.",
};

export const navigationConfig = {
  brandName: "MATCHSTAKE",
  logoPath: "/logo.png",
  links: [
    { label: "MATCHES", href: "/matches" },
    { label: "STADIUMS", href: "/#facilities" },
    { label: "MATCHDAY", href: "/#observation" },
    { label: "LEADERBOARD", href: "/leaderboard" },
    { label: "SWAP", href: "/swap" },
  ],
};

export const heroConfig = {
  eyebrow: "OKX X CUP HACKATHON // X LAYER MAINNET",
  titleLines: [
    "MATCH",
    "STAKE",
    "2026",
  ],
  leadText: "Friends bet on the World Cup — nobody pays up. MatchStake fixes that. Create a watch party room, invite friends, stake on predictions — the smart contract handles the rest.",
  supportingNotes: [
    "Social staking rooms for World Cup 2026 matches. Private groups, shared pools.",
    "Smart contract scores predictions automatically — correct result, exact score, or nothing.",
    "Built on X Layer. Fast, transparent, no middleman. Just you and your crew.",
  ],
};

export const manifestoConfig = {
  videoPath: "/videos/manifesto.mp4",
  text: "In 2026, football returns to North America with a scope never before attempted. MatchStake brings the social staking experience on-chain — create private rooms for your watch party, set custom stake ranges, and let the smart contract handle scoring and payouts. No trust required. No excuses. Everyone puts skin in the game. Powered by X Layer for fast, low-cost transactions.",
};

export const facilitiesConfig = {
  sectionLabel: "HOST STADIUMS",
  detailBackText: "BACK TO STADIUMS",
  detailNotFoundText: "Stadium not found.",
  detailReturnText: "Return to stadiums",
  items: [
    {
      slug: "metlife-stadium",
      name: "METLIFE STADIUM",
      code: "NYC-01",
      address: "East Rutherford, New Jersey, USA",
      status: "FINAL VENUE",
      email: "tickets@metlifestadium.wc2026",
      phone: "+1 201-559-1515",
      ctaText: "VIEW MATCHES",
      ctaHref: "/matches",
      image: "/images/facility-metlife.jpg",
      utcOffset: -5,
      article: {
        title: "MetLife Stadium: The Final Stage",
        paragraphs: [
          "MetLife Stadium, located in East Rutherford, New Jersey, just across the Hudson River from Manhattan, will host the 2026 FIFA World Cup Final on July 19, 2026. With a seating capacity of 82,500, it is the largest stadium in the NFL and will become the centerpiece of world football for one historic evening.",
          "Opened in 2010, MetLife Stadium was built at a cost of $1.6 billion and serves as the home of the New York Giants and New York Jets. Its design allows for rapid configuration changes, making it exceptionally well-suited for international football.",
          "The stadium will host a total of eight matches during the tournament, including a Round of 16 fixture, a quarter-final, a semi-final, and the final itself.",
          "Transportation infrastructure includes direct rail service to Manhattan, extensive bus networks, and ferry access across the Hudson.",
        ],
      },
    },
    {
      slug: "sofi-stadium",
      name: "SOFI STADIUM",
      code: "LA-02",
      address: "Inglewood, California, USA",
      status: "QUARTER-FINAL VENUE",
      email: "info@sofi.wc2026",
      phone: "+1 424-541-9800",
      ctaText: "VIEW MATCHES",
      ctaHref: "/matches",
      image: "/images/facility-sofi.jpg",
      utcOffset: -8,
      article: {
        title: "SoFi Stadium: The Jewel of the West",
        paragraphs: [
          "SoFi Stadium in Inglewood, California is arguably the most technologically advanced sports venue ever constructed. Opened in 2020 at a reported cost of over $5 billion, it features a 70,240-seat capacity expandable to 100,240 for major events.",
          "The stadium was designed by HKS Architects with a radical approach: the playing field sits 100 feet below ground level, excavated from the former site of the Hollywood Park racetrack.",
          "SoFi Stadium will host eight World Cup matches in 2026, including matches in the group stage, Round of 32, and a quarter-final.",
          "Adjacent to the stadium, the Hollywood Park development includes a 6,000-seat performance venue, residential towers, retail space, and a man-made lake.",
        ],
      },
    },
    {
      slug: "estadio-azteca",
      name: "ESTADIO AZTECA",
      code: "MEX-03",
      address: "Mexico City, Mexico",
      status: "OPENING MATCH VENUE",
      email: "boletos@azteca.wc2026",
      phone: "+52 55-5483-7000",
      ctaText: "VIEW MATCHES",
      ctaHref: "/matches",
      image: "/images/facility-azteca.jpg",
      utcOffset: -6,
      article: {
        title: "Estadio Azteca: The Cathedral of Football",
        paragraphs: [
          "Estadio Azteca in Mexico City is the only stadium in the world to have hosted two FIFA World Cup finals: in 1970, when Brazil's Pele won his third title, and in 1986, when Diego Maradona led Argentina to glory. In 2026, it will add another historic chapter by hosting the tournament's opening match on June 11, 2026.",
          "With a capacity of 87,523, the Azteca is the largest football-specific stadium in Latin America. Built in 1966 and located in the Coyoacan borough of Mexico City at an altitude of 2,200 meters above sea level.",
          "For the 2026 World Cup, the stadium underwent significant renovations including upgraded seating, improved accessibility, and modernized broadcast facilities while preserving its historic character.",
          "Mexico City will host five matches total, including the opening ceremony and match.",
        ],
      },
    },
    {
      slug: "bc-place",
      name: "BC PLACE",
      code: "VAN-04",
      address: "Vancouver, British Columbia, Canada",
      status: "GROUP STAGE VENUE",
      email: "info@bcplace.wc2026",
      phone: "+1 604-669-2300",
      ctaText: "VIEW MATCHES",
      ctaHref: "/matches",
      image: "/images/facility-bcplace.jpg",
      utcOffset: -8,
      article: {
        title: "BC Place: Canada's Football Beacon",
        paragraphs: [
          "BC Place in Vancouver, British Columbia is Canada's most iconic stadium and the nation's primary venue for the 2026 FIFA World Cup. With a capacity of 54,500, its distinctive white fabric roof has defined the Vancouver skyline since the stadium opened for Expo 86.",
          "The stadium was originally constructed with an air-supported dome roof, which was replaced in 2011 with the current retractable fabric roof.",
          "BC Place will host seven matches during the 2026 World Cup, making it one of the busiest venues in the tournament.",
          "The stadium sits at the edge of False Creek, within walking distance of Vancouver's downtown core.",
        ],
      },
    },
  ],
};

export const observationConfig = {
  sectionLabel: "MATCHDAY LIVE",
  videoPath: "/videos/observation.mp4",
  statusText: "LIVE BROADCAST // MATCH FEED 01",
  latLabel: "PITCH X",
  lonLabel: "PITCH Y",
  initialLat: 52.5,
  initialLon: -34.0,
};

export const archivesConfig = {
  sectionLabel: "ARCHIVES",
  vaultTitle: "OPEN THE VAULT",
  closeText: "CLOSE VAULT",
  items: [
    { src: "/images/archive-1970.jpg", label: "Pele's Third // 1970" },
    { src: "/images/archive-1986.jpg", label: "Maradona's Masterpiece // 1986" },
    { src: "/images/archive-2010.jpg", label: "Iniesta's Decider // 2010" },
    { src: "/images/archive-2022.jpg", label: "Messi's Triumph // 2022" },
  ],
};

export const footerConfig = {
  copyrightText: "MATCHSTAKE © 2026. BUILT FOR OKX X CUP HACKATHON.",
  statusText: "DEPLOYED ON X LAYER",
};
