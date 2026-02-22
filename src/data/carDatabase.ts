export interface Modification {
  id: string;
  name: string;
  engine: string;
  transmission: string;
  power: string;
}

export interface Generation {
  id: string;
  name: string;
  years: string;
  modifications: Modification[];
}

export interface CarModel {
  id: string;
  name: string;
  generations: Generation[];
}

export interface CarBrand {
  id: string;
  name: string;
  models: CarModel[];
}

export interface SparePartWork {
  id: string;
  category: string;
  name: string;
  hours: number;
}

export const CAR_DATABASE: CarBrand[] = [
  {
    id: "toyota",
    name: "Toyota",
    models: [
      {
        id: "camry",
        name: "Camry",
        generations: [
          {
            id: "camry-v70",
            name: "VII (V70)",
            years: "2017 — н.в.",
            modifications: [
              { id: "c1", name: "2.0 AT", engine: "2.0 бензин (150 л.с.)", transmission: "Автомат", power: "150 л.с." },
              { id: "c2", name: "2.5 AT", engine: "2.5 бензин (181 л.с.)", transmission: "Автомат", power: "181 л.с." },
              { id: "c3", name: "3.5 AT", engine: "3.5 бензин (249 л.с.)", transmission: "Автомат", power: "249 л.с." },
            ]
          },
          {
            id: "camry-v50",
            name: "VI (V50)",
            years: "2011 — 2017",
            modifications: [
              { id: "c4", name: "2.0 AT", engine: "2.0 бензин (148 л.с.)", transmission: "Автомат", power: "148 л.с." },
              { id: "c5", name: "2.5 AT", engine: "2.5 бензин (181 л.с.)", transmission: "Автомат", power: "181 л.с." },
            ]
          }
        ]
      },
      {
        id: "corolla",
        name: "Corolla",
        generations: [
          {
            id: "corolla-e210",
            name: "XII (E210)",
            years: "2018 — н.в.",
            modifications: [
              { id: "cc1", name: "1.6 MT", engine: "1.6 бензин (122 л.с.)", transmission: "Механика", power: "122 л.с." },
              { id: "cc2", name: "1.6 CVT", engine: "1.6 бензин (122 л.с.)", transmission: "Вариатор", power: "122 л.с." },
              { id: "cc3", name: "1.8 Hybrid", engine: "1.8 гибрид (122 л.с.)", transmission: "Автомат", power: "122 л.с." },
            ]
          },
          {
            id: "corolla-e160",
            name: "XI (E160)",
            years: "2013 — 2018",
            modifications: [
              { id: "cc4", name: "1.3 MT", engine: "1.3 бензин (99 л.с.)", transmission: "Механика", power: "99 л.с." },
              { id: "cc5", name: "1.6 MT", engine: "1.6 бензин (122 л.с.)", transmission: "Механика", power: "122 л.с." },
              { id: "cc6", name: "1.8 CVT", engine: "1.8 бензин (140 л.с.)", transmission: "Вариатор", power: "140 л.с." },
            ]
          }
        ]
      },
      {
        id: "rav4",
        name: "RAV4",
        generations: [
          {
            id: "rav4-xa50",
            name: "V (XA50)",
            years: "2018 — н.в.",
            modifications: [
              { id: "r1", name: "2.0 CVT FWD", engine: "2.0 бензин (149 л.с.)", transmission: "Вариатор", power: "149 л.с." },
              { id: "r2", name: "2.0 CVT AWD", engine: "2.0 бензин (149 л.с.)", transmission: "Вариатор AWD", power: "149 л.с." },
              { id: "r3", name: "2.5 Hybrid AWD", engine: "2.5 гибрид (218 л.с.)", transmission: "Автомат AWD", power: "218 л.с." },
            ]
          }
        ]
      }
    ]
  },
  {
    id: "bmw",
    name: "BMW",
    models: [
      {
        id: "3series",
        name: "3 Series",
        generations: [
          {
            id: "3-g20",
            name: "G20",
            years: "2018 — н.в.",
            modifications: [
              { id: "b1", name: "318i AT", engine: "2.0 бензин (156 л.с.)", transmission: "Автомат", power: "156 л.с." },
              { id: "b2", name: "320i AT", engine: "2.0 бензин (184 л.с.)", transmission: "Автомат", power: "184 л.с." },
              { id: "b3", name: "330i AT", engine: "2.0 бензин (258 л.с.)", transmission: "Автомат", power: "258 л.с." },
              { id: "b4", name: "320d AT", engine: "2.0 дизель (190 л.с.)", transmission: "Автомат", power: "190 л.с." },
            ]
          },
          {
            id: "3-f30",
            name: "F30",
            years: "2012 — 2018",
            modifications: [
              { id: "b5", name: "316i AT", engine: "1.6 бензин (136 л.с.)", transmission: "Автомат", power: "136 л.с." },
              { id: "b6", name: "320i AT", engine: "2.0 бензин (184 л.с.)", transmission: "Автомат", power: "184 л.с." },
              { id: "b7", name: "328i AT", engine: "2.0 бензин (245 л.с.)", transmission: "Автомат", power: "245 л.с." },
            ]
          }
        ]
      },
      {
        id: "5series",
        name: "5 Series",
        generations: [
          {
            id: "5-g30",
            name: "G30",
            years: "2016 — н.в.",
            modifications: [
              { id: "b8", name: "520i AT", engine: "2.0 бензин (184 л.с.)", transmission: "Автомат", power: "184 л.с." },
              { id: "b9", name: "530i AT", engine: "2.0 бензин (252 л.с.)", transmission: "Автомат", power: "252 л.с." },
              { id: "b10", name: "520d AT", engine: "2.0 дизель (190 л.с.)", transmission: "Автомат", power: "190 л.с." },
            ]
          }
        ]
      }
    ]
  },
  {
    id: "mercedes",
    name: "Mercedes-Benz",
    models: [
      {
        id: "c-class",
        name: "C-Class",
        generations: [
          {
            id: "c-w206",
            name: "W206",
            years: "2021 — н.в.",
            modifications: [
              { id: "m1", name: "C200 AT", engine: "1.5 бензин (204 л.с.)", transmission: "Автомат", power: "204 л.с." },
              { id: "m2", name: "C220d AT", engine: "2.0 дизель (200 л.с.)", transmission: "Автомат", power: "200 л.с." },
              { id: "m3", name: "C300 AT", engine: "2.0 бензин (258 л.с.)", transmission: "Автомат", power: "258 л.с." },
            ]
          },
          {
            id: "c-w205",
            name: "W205",
            years: "2014 — 2021",
            modifications: [
              { id: "m4", name: "C180 AT", engine: "1.6 бензин (156 л.с.)", transmission: "Автомат", power: "156 л.с." },
              { id: "m5", name: "C200 AT", engine: "2.0 бензин (184 л.с.)", transmission: "Автомат", power: "184 л.с." },
              { id: "m6", name: "C250d AT", engine: "2.2 дизель (204 л.с.)", transmission: "Автомат", power: "204 л.с." },
            ]
          }
        ]
      },
      {
        id: "e-class",
        name: "E-Class",
        generations: [
          {
            id: "e-w213",
            name: "W213",
            years: "2016 — н.в.",
            modifications: [
              { id: "m7", name: "E200 AT", engine: "2.0 бензин (197 л.с.)", transmission: "Автомат", power: "197 л.с." },
              { id: "m8", name: "E220d AT", engine: "2.0 дизель (194 л.с.)", transmission: "Автомат", power: "194 л.с." },
              { id: "m9", name: "E300 AT", engine: "2.0 бензин (258 л.с.)", transmission: "Автомат", power: "258 л.с." },
            ]
          }
        ]
      }
    ]
  },
  {
    id: "volkswagen",
    name: "Volkswagen",
    models: [
      {
        id: "polo",
        name: "Polo",
        generations: [
          {
            id: "polo-vi",
            name: "VI",
            years: "2017 — н.в.",
            modifications: [
              { id: "v1", name: "1.0 MT", engine: "1.0 бензин (65 л.с.)", transmission: "Механика", power: "65 л.с." },
              { id: "v2", name: "1.0 TSI AT", engine: "1.0 бензин (115 л.с.)", transmission: "Робот", power: "115 л.с." },
              { id: "v3", name: "1.6 MT", engine: "1.6 бензин (110 л.с.)", transmission: "Механика", power: "110 л.с." },
            ]
          }
        ]
      },
      {
        id: "passat",
        name: "Passat",
        generations: [
          {
            id: "passat-b8",
            name: "B8",
            years: "2014 — н.в.",
            modifications: [
              { id: "v4", name: "1.4 TSI AT", engine: "1.4 бензин (150 л.с.)", transmission: "Робот", power: "150 л.с." },
              { id: "v5", name: "1.8 TSI AT", engine: "1.8 бензин (180 л.с.)", transmission: "Робот", power: "180 л.с." },
              { id: "v6", name: "2.0 TDI AT", engine: "2.0 дизель (150 л.с.)", transmission: "Робот", power: "150 л.с." },
            ]
          }
        ]
      }
    ]
  },
  {
    id: "hyundai",
    name: "Hyundai",
    models: [
      {
        id: "solaris",
        name: "Solaris",
        generations: [
          {
            id: "solaris-2",
            name: "II поколение",
            years: "2017 — н.в.",
            modifications: [
              { id: "h1", name: "1.4 MT", engine: "1.4 бензин (100 л.с.)", transmission: "Механика", power: "100 л.с." },
              { id: "h2", name: "1.4 AT", engine: "1.4 бензин (100 л.с.)", transmission: "Автомат", power: "100 л.с." },
              { id: "h3", name: "1.6 MT", engine: "1.6 бензин (123 л.с.)", transmission: "Механика", power: "123 л.с." },
              { id: "h4", name: "1.6 AT", engine: "1.6 бензин (123 л.с.)", transmission: "Автомат", power: "123 л.с." },
            ]
          }
        ]
      },
      {
        id: "tucson",
        name: "Tucson",
        generations: [
          {
            id: "tucson-4",
            name: "IV поколение",
            years: "2020 — н.в.",
            modifications: [
              { id: "h5", name: "2.0 AT FWD", engine: "2.0 бензин (150 л.с.)", transmission: "Автомат", power: "150 л.с." },
              { id: "h6", name: "2.0 AT AWD", engine: "2.0 бензин (150 л.с.)", transmission: "Автомат AWD", power: "150 л.с." },
            ]
          }
        ]
      }
    ]
  },
  {
    id: "kia",
    name: "KIA",
    models: [
      {
        id: "rio",
        name: "Rio",
        generations: [
          {
            id: "rio-4",
            name: "IV поколение",
            years: "2017 — н.в.",
            modifications: [
              { id: "k1", name: "1.4 MT", engine: "1.4 бензин (100 л.с.)", transmission: "Механика", power: "100 л.с." },
              { id: "k2", name: "1.4 AT", engine: "1.4 бензин (100 л.с.)", transmission: "Автомат", power: "100 л.с." },
              { id: "k3", name: "1.6 MT", engine: "1.6 бензин (123 л.с.)", transmission: "Механика", power: "123 л.с." },
              { id: "k4", name: "1.6 AT", engine: "1.6 бензин (123 л.с.)", transmission: "Автомат", power: "123 л.с." },
            ]
          }
        ]
      }
    ]
  }
];

export const SPARE_PARTS: SparePartWork[] = [
  { id: "sp1", category: "Двигатель", name: "Замена масла в двигателе", hours: 0.5 },
  { id: "sp2", category: "Двигатель", name: "Замена воздушного фильтра", hours: 0.3 },
  { id: "sp3", category: "Двигатель", name: "Замена свечей зажигания", hours: 0.8 },
  { id: "sp4", category: "Двигатель", name: "Замена ремня ГРМ", hours: 4.5 },
  { id: "sp5", category: "Двигатель", name: "Замена цепи ГРМ", hours: 6.0 },
  { id: "sp6", category: "Двигатель", name: "Замена помпы охлаждения", hours: 3.0 },
  { id: "sp7", category: "Двигатель", name: "Замена термостата", hours: 1.5 },
  { id: "sp8", category: "Двигатель", name: "Замена прокладки ГБЦ", hours: 8.0 },
  { id: "sp9", category: "Двигатель", name: "Замена катушки зажигания", hours: 0.5 },
  { id: "sp10", category: "Двигатель", name: "Замена топливного фильтра", hours: 0.8 },
  { id: "sp11", category: "Тормозная система", name: "Замена передних тормозных колодок", hours: 0.8 },
  { id: "sp12", category: "Тормозная система", name: "Замена задних тормозных колодок", hours: 1.0 },
  { id: "sp13", category: "Тормозная система", name: "Замена передних тормозных дисков", hours: 1.2 },
  { id: "sp14", category: "Тормозная система", name: "Замена задних тормозных дисков", hours: 1.5 },
  { id: "sp15", category: "Тормозная система", name: "Замена тормозной жидкости", hours: 0.5 },
  { id: "sp16", category: "Тормозная система", name: "Замена суппорта тормозного", hours: 2.0 },
  { id: "sp17", category: "Подвеска", name: "Замена передних амортизаторов", hours: 2.5 },
  { id: "sp18", category: "Подвеска", name: "Замена задних амортизаторов", hours: 2.0 },
  { id: "sp19", category: "Подвеска", name: "Замена передних пружин", hours: 2.0 },
  { id: "sp20", category: "Подвеска", name: "Замена рычага передней подвески", hours: 1.5 },
  { id: "sp21", category: "Подвеска", name: "Замена рычага задней подвески", hours: 2.0 },
  { id: "sp22", category: "Подвеска", name: "Замена шаровой опоры", hours: 1.2 },
  { id: "sp23", category: "Подвеска", name: "Замена стабилизатора поперечной устойчивости", hours: 1.5 },
  { id: "sp24", category: "Подвеска", name: "Замена ступичного подшипника", hours: 1.5 },
  { id: "sp25", category: "Рулевое управление", name: "Замена рулевой рейки", hours: 3.5 },
  { id: "sp26", category: "Рулевое управление", name: "Замена рулевой тяги", hours: 1.0 },
  { id: "sp27", category: "Рулевое управление", name: "Замена рулевого наконечника", hours: 0.8 },
  { id: "sp28", category: "Рулевое управление", name: "Замена ГУРа", hours: 3.0 },
  { id: "sp29", category: "Трансмиссия", name: "Замена масла в КПП", hours: 1.0 },
  { id: "sp30", category: "Трансмиссия", name: "Замена сцепления", hours: 5.0 },
  { id: "sp31", category: "Трансмиссия", name: "Замена ШРУС", hours: 2.0 },
  { id: "sp32", category: "Трансмиссия", name: "Замена привода в сборе", hours: 2.5 },
  { id: "sp33", category: "Трансмиссия", name: "Замена масла в АКПП", hours: 1.5 },
  { id: "sp34", category: "Выхлопная система", name: "Замена катализатора", hours: 2.0 },
  { id: "sp35", category: "Выхлопная система", name: "Замена глушителя", hours: 1.5 },
  { id: "sp36", category: "Выхлопная система", name: "Замена лямбда-зонда", hours: 0.8 },
  { id: "sp37", category: "Электрооборудование", name: "Замена аккумулятора", hours: 0.5 },
  { id: "sp38", category: "Электрооборудование", name: "Замена генератора", hours: 2.5 },
  { id: "sp39", category: "Электрооборудование", name: "Замена стартера", hours: 2.0 },
  { id: "sp40", category: "Кузов", name: "Замена лобового стекла", hours: 2.0 },
];
