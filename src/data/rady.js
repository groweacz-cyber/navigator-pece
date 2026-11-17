// Praktické rady pro každodenní pohyb doma. Jeden zdroj pro appku (záložka Rady)
// i web (scripts/build-rady.mjs generuje web/rady.html).
//
// Proč jen obecné zásady: Opatruj není zdravotnický prostředek a neradí podle
// diagnózy. Texty vycházejí z běžně uznávaných ergonomických zásad. Před širším
// zveřejněním je má zkontrolovat fyzioterapeut nebo ergoterapeut (docs/ROZHODNUTI.md).

export const UPOZORNENI =
  'Obecné rady pro pohodlnější každodenní pohyb. Nenahrazují fyzioterapeuta ani lékaře. ' +
  'Při konkrétních potížích se poraď s odborníkem.'

export const KDY_PRESTAT = {
  nadpis: 'Kdy přestat a zavolat pomoc',
  text: 'Okamžitě přestaň a zavolej 155 (nebo 112) při náhlé silné bolesti, bolesti na hrudi, dušnosti, mdlobě nebo silné závrati, náhlé slabosti či znecitlivění ruky či nohy, nebo po pádu s bolestí. Bolest, která nepolevuje ani po odpočinku, nebo se opakuje, je důvod objednat se k lékaři.',
}

export const RADY = [
  {
    id: 'vareni',
    ikona: '🍳',
    nazev: 'Vaření bez zbytečné námahy',
    uvod: 'Kuchyň jde zařídit tak, aby se ohýbalo a natahovalo co nejméně.',
    tipy: [
      'Vše, co děláš vsedě, dělej vsedě: krájení, loupání i míchání zvládneš na židli u stolu s opěradlem.',
      'Věci, které používáš každý den, měj mezi pasem a rameny. Nic těžkého nedávej nahoru ani úplně dolů.',
      'Do spodních skříněk se nesehýbej. Pomůže výsuvný koš, nebo si potřebné věci přesuň na pracovní desku.',
      'Těžký hrnec nenos plný. Vodu nalévej konvicí nebo menším hrnkem přímo na plotně a hotové jídlo přendávej po částech.',
      'Těžké věci posouvej po desce, nenos je. Skvělý pomocník je pojízdný servírovací stolek.',
      'Šetři síly při přípravě: vař na dva dny a využij předkrájenou nebo mraženou zeleninu.',
      'Protiskluzová podložka a pevná obuv s patou. Rozlitou vodu utři hned.',
      'Každých 15 až 20 minut si sedni a odpočiň. Plánuj náročnější vaření na dobu, kdy máš nejvíc sil.',
    ],
  },
  {
    id: 'uklid',
    ikona: '🧹',
    nazev: 'Úklid, který nebolí',
    uvod: 'Raději kratší úklid častěji než jeden vyčerpávající.',
    tipy: [
      'Rozděl úklid na malé kousky: jedna místnost nebo jedna činnost denně, deset až patnáct minut.',
      'Používej nástroje s dlouhou rukojetí: lapač na smetí, mop s ždímáním bez ohýbání, teleskopickou prachovku.',
      'Při vytírání a vysávání dělej krok dopředu a přenášej váhu. Netoč se v bedrech, otáčej se celým tělem.',
      'Lehký vysavač, nejlépe bezdrátový, nebo robotický. Z patra do patra ho nenos s plnou náručí.',
      'Na židli ani na žebřík nelez. Vysoké police nech vyčistit jiným, nebo použij pevné schůdky s madlem.',
      'Prádlo nos po částech v malém koši a sušák měj ve výšce pasu. Při vyndávání z pračky si dřepni nebo si sedni na stoličku.',
      'Odstraň, o co se dá zakopnout: volné koberečky, kabely, prahy. V chodbách a na schodech dobře svítí.',
    ],
  },
  {
    id: 'pohyb',
    ikona: '🚶',
    nazev: 'Pohyb po bytě a vstávání',
    uvod: 'Většina pádů vzniká doma, při všedních věcech. Pomáhají drobné úpravy.',
    tipy: [
      'Při vstávání z křesla: posuň se na kraj, nohy dej pod sebe, předkloň se a odraz se rukama. Vstaň a chvíli stůj, než se rozejdeš.',
      'Madla a opory u toalety, vany a schodů jsou investice, ne ostuda. V noci ať svítí noční světlo na cestě na toaletu.',
      'Nos jen to, co zvládneš jednou rukou, druhou se drž. Na přenášení se hodí kapsy, batůžek nebo pojízdný stolek.',
      'V bytě měj pevnou obuv nebo protiskluzové pantofle, ne jen ponožky na hladké podlaze.',
      'Otáčej se po malých krocích, ne otočkou na místě.',
      'Mobil nebo nouzové tlačítko měj u sebe, ne na druhém konci bytu.',
    ],
  },
  {
    id: 'koupelna',
    ikona: '🚿',
    nazev: 'Koupelna a hygiena',
    uvod: 'Mokré a hladké povrchy jsou nejrizikovější místo v bytě.',
    tipy: [
      'Sprchové sedátko a ruční sprcha na hadici. Sprchovat se vsedě je bezpečnější a méně vyčerpávající.',
      'Protiskluzová podložka ve vaně i před ní a madlo na stěně. Ručníky měj na dosah.',
      'Teplotu vody zkus rukou dřív, než do sprchy vstoupíš. Po horké koupeli vstávej pomalu, může se zatočit hlava.',
      'Zvýšené prkénko na toaletě usnadní vstávání.',
    ],
  },
  {
    id: 'tempo',
    ikona: '⏱️',
    nazev: 'Tempo, pauzy a plánování dne',
    uvod: 'Šetři sílu tam, kde to jde, ať ti zbude na to, co tě baví.',
    tipy: [
      'Střídej polohy: po 15 až 20 minutách vsedě vstaň a protáhni se, po stání si zase sedni.',
      'Náročnější práce dělej ráno nebo kdy máš nejvíc energie. Odpoledne nech na odpočinek.',
      'Pij dost tekutin a nevynechávej jídlo. Únava a závrať často souvisí s tím, že jsme nejedli nebo nepili.',
      'Když ti něco přestane jít, nech to být. Požádat o pomoc je rozumné, ne slabé.',
      'Říkej si o pomoc s těžkými věcmi: nákup, výměna žárovky, přenášení.',
    ],
  },
  {
    id: 'pecujici',
    ikona: '🤝',
    nazev: 'Pro pečující: opatruj svá záda',
    uvod: 'Kdo pomáhá druhému s vstáváním nebo mytím, namáhá si vlastní tělo.',
    tipy: [
      'Drž břemeno i člověka blízko u těla. Pokrč kolena a drž záda rovná, netoč trupem, otáč se nohama.',
      'Nezvedej sám člověka, který nepomůže, a nikdy ho nezvedej po pádu. Zavolej pomoc.',
      'Využij pomůcky: kluzná podložka, otočný kotouč, madla, zvedák. Zeptej se v domácí péči nebo u fyzioterapeuta, jak je používat.',
      'Naplánuj si u sebe pauzy a střídání s dalšími členy rodiny. Právě na to je Opatruj: viz Rozložení péče.',
    ],
  },
]
