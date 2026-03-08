export interface CategoryType {
  id: number;
  name: string;
  description: string;
  icon: string;
  image: string;
  productCount: number;
  color: string;
  href: string;
}

export const categoriesData: CategoryType[] = [
  {
    id: 1,
    name: "Металлопрокат",
    description: "Трубы, листы, профили, арматура",
    icon: "Wrench",
    image: "/img/764d08a6-7946-4b1d-9c27-48e192211cc0.jpg",
    productCount: 1250,
    color: "from-gray-500 to-gray-700",
    href: "/catalog?category=Металлопрокат"
  },
  {
    id: 2,
    name: "Стройматериалы",
    description: "Цемент, кирпич, блоки, смеси",
    icon: "Home",
    image: "/img/d166a943-2618-4918-b162-2f653f5ae829.jpg",
    productCount: 2100,
    color: "from-orange-500 to-red-600",
    href: "/catalog?category=Стройматериалы"
  },
  {
    id: 3,
    name: "Электроника",
    description: "Платы, компоненты, датчики",
    icon: "Cpu",
    image: "/img/eb347072-5079-42a8-9320-9ff8ccc544f5.jpg",
    productCount: 890,
    color: "from-blue-500 to-indigo-600",
    href: "/catalog?category=Электроника"
  },
  {
    id: 4,
    name: "Кровельные материалы",
    description: "Профнастил, металлочерепица, мембраны",
    icon: "Triangle",
    image: "/img/30071e99-054b-4aad-b22b-679e73394520.jpg",
    productCount: 670,
    color: "from-green-500 to-emerald-600",
    href: "/catalog?category=Кровельные материалы"
  },
  {
    id: 5,
    name: "Упаковочные материалы",
    description: "Коробки, пленка, скотч, этикетки",
    icon: "Package",
    image: "/img/43a9e543-590b-44fb-b286-827f5d9b1ef7.jpg",
    productCount: 1540,
    color: "from-purple-500 to-violet-600",
    href: "/catalog?category=Упаковочные материалы"
  },
  {
    id: 6,
    name: "Электротехника",
    description: "Кабели, провода, щитовое оборудование",
    icon: "Zap",
    image: "/img/eb347072-5079-42a8-9320-9ff8ccc544f5.jpg",
    productCount: 980,
    color: "from-yellow-500 to-orange-500",
    href: "/catalog?category=Электротехника"
  },
  {
    id: 7,
    name: "Канцелярские товары",
    description: "Бумага, ручки, папки, принтеры",
    icon: "FileText",
    image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg",
    productCount: 750,
    color: "from-pink-500 to-rose-600",
    href: "/catalog?category=Канцелярские товары"
  },
  {
    id: 8,
    name: "Крепёжные изделия",
    description: "Болты, гайки, шайбы, саморезы",
    icon: "Settings",
    image: "/img/764d08a6-7946-4b1d-9c27-48e192211cc0.jpg",
    productCount: 1200,
    color: "from-teal-500 to-cyan-600",
    href: "/catalog?category=Крепёжные изделия"
  },
  {
    id: 9,
    name: "Светотехника",
    description: "LED-ленты, светильники, лампы",
    icon: "Lightbulb",
    image: "/img/43a9e543-590b-44fb-b286-827f5d9b1ef7.jpg",
    productCount: 420,
    color: "from-amber-500 to-yellow-600",
    href: "/catalog?category=Светотехника"
  },
  {
    id: 10,
    name: "Отделочные материалы",
    description: "Плитка, обои, ламинат, краски",
    icon: "Palette",
    image: "/img/30071e99-054b-4aad-b22b-679e73394520.jpg",
    productCount: 1350,
    color: "from-lime-500 to-green-600",
    href: "/catalog?category=Отделочные материалы"
  },
  {
    id: 11,
    name: "Полимерные материалы",
    description: "Пленка, трубы, листы, профили",
    icon: "Layers",
    image: "/img/d166a943-2618-4918-b162-2f653f5ae829.jpg",
    productCount: 580,
    color: "from-indigo-500 to-purple-600",
    href: "/catalog?category=Полимерные материалы"
  },
  {
    id: 12,
    name: "Измерительные приборы",
    description: "Штангенциркули, рулетки, уровни",
    icon: "Ruler",
    image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg",
    productCount: 290,
    color: "from-slate-500 to-gray-600",
    href: "/catalog?category=Измерительные приборы"
  },
  {
    id: 13,
    name: "Сантехника",
    description: "Трубы, фитинги, смесители, унитазы",
    icon: "Droplets",
    image: "/img/d166a943-2618-4918-b162-2f653f5ae829.jpg",
    productCount: 1680,
    color: "from-blue-400 to-cyan-500",
    href: "/catalog?category=Сантехника"
  },
  {
    id: 14,
    name: "Отопление и вентиляция",
    description: "Радиаторы, котлы, вентиляторы",
    icon: "Thermometer",
    image: "/img/764d08a6-7946-4b1d-9c27-48e192211cc0.jpg",
    productCount: 920,
    color: "from-red-500 to-orange-600",
    href: "/catalog?category=Отопление и вентиляция"
  },
  {
    id: 15,
    name: "Автокомплектующие",
    description: "Запчасти, масла, аккумуляторы, шины",
    icon: "Car",
    image: "/img/43a9e543-590b-44fb-b286-827f5d9b1ef7.jpg",
    productCount: 3200,
    color: "from-gray-600 to-slate-700",
    href: "/catalog?category=Автокомплектующие"
  },
  {
    id: 16,
    name: "Мебель и интерьер",
    description: "Столы, стулья, шкафы, декор",
    icon: "Sofa",
    image: "/img/30071e99-054b-4aad-b22b-679e73394520.jpg",
    productCount: 1450,
    color: "from-brown-500 to-amber-600",
    href: "/catalog?category=Мебель и интерьер"
  },
  {
    id: 17,
    name: "Спецодежда и СИЗ",
    description: "Каски, перчатки, респираторы, костюмы",
    icon: "ShieldCheck",
    image: "/img/43a9e543-590b-44fb-b286-827f5d9b1ef7.jpg",
    productCount: 890,
    color: "from-emerald-500 to-teal-600",
    href: "/catalog?category=Спецодежда и СИЗ"
  },
  {
    id: 18,
    name: "Садовая техника",
    description: "Газонокосилки, триммеры, культиваторы",
    icon: "TreePine",
    image: "/img/d166a943-2618-4918-b162-2f653f5ae829.jpg",
    productCount: 650,
    color: "from-green-600 to-lime-700",
    href: "/catalog?category=Садовая техника"
  },
  {
    id: 19,
    name: "Химия и моющие средства",
    description: "Растворители, клеи, чистящие средства",
    icon: "FlaskConical",
    image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg",
    productCount: 740,
    color: "from-violet-500 to-purple-600",
    href: "/catalog?category=Химия и моющие средства"
  },
  {
    id: 20,
    name: "Пищевая продукция",
    description: "Продукты питания, напитки, снеки",
    icon: "Apple",
    image: "/img/43a9e543-590b-44fb-b286-827f5d9b1ef7.jpg",
    productCount: 2300,
    color: "from-red-400 to-pink-500",
    href: "/catalog?category=Пищевая продукция"
  },
  {
    id: 21,
    name: "Текстиль и ткани",
    description: "Ткани, пряжа, фурнитура, нитки",
    icon: "Shirt",
    image: "/img/30071e99-054b-4aad-b22b-679e73394520.jpg",
    productCount: 1100,
    color: "from-rose-500 to-pink-600",
    href: "/catalog?category=Текстиль и ткани"
  },
  {
    id: 22,
    name: "Медицинское оборудование",
    description: "Инструменты, расходники, мебель",
    icon: "Stethoscope",
    image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg",
    productCount: 560,
    color: "from-blue-600 to-indigo-700",
    href: "/catalog?category=Медицинское оборудование"
  },
  {
    id: 23,
    name: "Спортивные товары",
    description: "Тренажеры, мячи, одежда, обувь",
    icon: "Dumbbell",
    image: "/img/eb347072-5079-42a8-9320-9ff8ccc544f5.jpg",
    productCount: 1280,
    color: "from-orange-400 to-red-500",
    href: "/catalog?category=Спортивные товары"
  },
  {
    id: 24,
    name: "Бытовая техника",
    description: "Холодильники, стиральные машины, пылесосы",
    icon: "Refrigerator",
    image: "/img/764d08a6-7946-4b1d-9c27-48e192211cc0.jpg",
    productCount: 850,
    color: "from-slate-400 to-gray-600",
    href: "/catalog?category=Бытовая техника"
  },
  {
    id: 25,
    name: "Игрушки и товары для детей",
    description: "Развивающие игрушки, одежда, коляски",
    icon: "Baby",
    image: "/img/43a9e543-590b-44fb-b286-827f5d9b1ef7.jpg",
    productCount: 1920,
    color: "from-cyan-400 to-blue-500",
    href: "/catalog?category=Игрушки и товары для детей"
  },
  {
    id: 26,
    name: "Косметика и парфюмерия",
    description: "Крема, шампуни, духи, макияж",
    icon: "Sparkles",
    image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg",
    productCount: 1670,
    color: "from-pink-400 to-rose-500",
    href: "/catalog?category=Косметика и парфюмерия"
  },
  {
    id: 27,
    name: "Инструменты",
    description: "Дрели, отвертки, пилы, ключи",
    icon: "Hammer",
    image: "/img/764d08a6-7946-4b1d-9c27-48e192211cc0.jpg",
    productCount: 2150,
    color: "from-yellow-600 to-orange-700",
    href: "/catalog?category=Инструменты"
  },
  {
    id: 28,
    name: "Животные и зоотовары",
    description: "Корма, игрушки, аксессуары, клетки",
    icon: "Dog",
    image: "/img/d166a943-2618-4918-b162-2f653f5ae829.jpg",
    productCount: 1340,
    color: "from-emerald-400 to-green-500",
    href: "/catalog?category=Животные и зоотовары"
  },
  {
    id: 29,
    name: "Книги и образование",
    description: "Учебники, художественная литература, канцтовары",
    icon: "BookOpen",
    image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg",
    productCount: 980,
    color: "from-indigo-400 to-blue-600",
    href: "/catalog?category=Книги и образование"
  },
  {
    id: 30,
    name: "Компьютеры и IT",
    description: "Ноутбуки, мониторы, клавиатуры, мыши",
    icon: "Monitor",
    image: "/img/eb347072-5079-42a8-9320-9ff8ccc544f5.jpg",
    productCount: 1450,
    color: "from-gray-500 to-slate-600",
    href: "/catalog?category=Компьютеры и IT"
  },
  {
    id: 31,
    name: "Спецтехника",
    description: "Экскаваторы, погрузчики, краны, бульдозеры",
    icon: "Truck",
    image: "/img/764d08a6-7946-4b1d-9c27-48e192211cc0.jpg",
    productCount: 890,
    color: "from-orange-600 to-red-700",
    href: "/catalog?category=Спецтехника"
  },
  {
    id: 32,
    name: "Промышленное оборудование",
    description: "Станки, прессы, конвейеры, компрессоры",
    icon: "Factory",
    image: "/img/d166a943-2618-4918-b162-2f653f5ae829.jpg",
    productCount: 1240,
    color: "from-indigo-600 to-purple-700",
    href: "/catalog?category=Промышленное оборудование"
  },
  {
    id: 33,
    name: "Строительная техника",
    description: "Миксеры, виброплиты, бетономешалки, подъемники",
    icon: "HardHat",
    image: "/img/30071e99-054b-4aad-b22b-679e73394520.jpg",
    productCount: 670,
    color: "from-yellow-600 to-amber-700",
    href: "/catalog?category=Строительная техника"
  },
  {
    id: 34,
    name: "Генераторы и электростанции",
    description: "Дизель-генераторы, бензиновые станции, ИБП",
    icon: "Zap",
    image: "/img/eb347072-5079-42a8-9320-9ff8ccc544f5.jpg",
    productCount: 450,
    color: "from-blue-600 to-cyan-700",
    href: "/catalog?category=Генераторы и электростанции"
  },
  {
    id: 35,
    name: "Складская техника",
    description: "Погрузчики, тележки, стеллажи, подъемники",
    icon: "Package",
    image: "/img/43a9e543-590b-44fb-b286-827f5d9b1ef7.jpg",
    productCount: 780,
    color: "from-teal-600 to-green-700",
    href: "/catalog?category=Складская техника"
  },
  {
    id: 36,
    name: "Лабораторное оборудование",
    description: "Микроскопы, весы, центрифуги, анализаторы",
    icon: "TestTube",
    image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg",
    productCount: 320,
    color: "from-purple-600 to-violet-700",
    href: "/catalog?category=Лабораторное оборудование"
  }
];