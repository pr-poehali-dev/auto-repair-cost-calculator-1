export interface Work {
  id: string;
  name: string;
  hours: number;
}

export interface Modification {
  id: string;
  name: string;
  engine: string;
  transmission: string;
  power: string;
  works: Work[];
  // Расширенные поля из Excel
  engineType?: string;
  engineCode?: string;
  driveType?: string;
  [key: string]: unknown;
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
              {
                id: "c1", name: "2.5 AT", engine: "2.5 бензин (181 л.с.)", transmission: "Автомат", power: "181 л.с.",
                works: [
                  { id: "c1-w1", name: "Замена масла двигателя", hours: 0.5 },
                  { id: "c1-w2", name: "Замена тормозных колодок передних", hours: 1.0 },
                  { id: "c1-w3", name: "Замена воздушного фильтра", hours: 0.3 },
                  { id: "c1-w4", name: "Замена свечей зажигания", hours: 0.8 },
                  { id: "c1-w5", name: "Замена ремня ГРМ", hours: 3.5 },
                ]
              },
              {
                id: "c2", name: "3.5 AT", engine: "3.5 бензин (249 л.с.)", transmission: "Автомат", power: "249 л.с.",
                works: [
                  { id: "c2-w1", name: "Замена масла двигателя", hours: 0.5 },
                  { id: "c2-w2", name: "Замена тормозных колодок передних", hours: 1.0 },
                  { id: "c2-w3", name: "Замена свечей зажигания", hours: 1.2 },
                  { id: "c2-w4", name: "Замена ремня ГРМ", hours: 4.5 },
                ]
              },
            ]
          },
          {
            id: "camry-v50",
            name: "VI (V50)",
            years: "2011 — 2017",
            modifications: [
              {
                id: "c3", name: "2.5 AT", engine: "2.5 бензин (181 л.с.)", transmission: "Автомат", power: "181 л.с.",
                works: [
                  { id: "c3-w1", name: "Замена масла двигателя", hours: 0.5 },
                  { id: "c3-w2", name: "Замена тормозных колодок передних", hours: 1.2 },
                  { id: "c3-w3", name: "Замена ремня ГРМ", hours: 3.8 },
                ]
              },
            ]
          },
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
              {
                id: "cc1", name: "1.6 CVT", engine: "1.6 бензин (122 л.с.)", transmission: "Вариатор", power: "122 л.с.",
                works: [
                  { id: "cc1-w1", name: "Замена масла двигателя", hours: 0.4 },
                  { id: "cc1-w2", name: "Замена тормозных колодок передних", hours: 0.9 },
                  { id: "cc1-w3", name: "Замена воздушного фильтра", hours: 0.2 },
                  { id: "cc1-w4", name: "Замена цепи ГРМ", hours: 5.0 },
                ]
              },
            ]
          },
        ]
      },
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
              {
                id: "b1", name: "320i AT", engine: "2.0 бензин (184 л.с.)", transmission: "Автомат", power: "184 л.с.",
                works: [
                  { id: "b1-w1", name: "Замена масла двигателя", hours: 0.7 },
                  { id: "b1-w2", name: "Замена тормозных колодок передних", hours: 1.2 },
                  { id: "b1-w3", name: "Замена свечей зажигания", hours: 1.5 },
                  { id: "b1-w4", name: "Замена цепи ГРМ", hours: 8.0 },
                ]
              },
              {
                id: "b2", name: "320d AT", engine: "2.0 дизель (190 л.с.)", transmission: "Автомат", power: "190 л.с.",
                works: [
                  { id: "b2-w1", name: "Замена масла двигателя", hours: 0.7 },
                  { id: "b2-w2", name: "Замена топливного фильтра", hours: 0.8 },
                  { id: "b2-w3", name: "Замена тормозных колодок передних", hours: 1.2 },
                ]
              },
            ]
          },
        ]
      },
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
              {
                id: "v1", name: "1.6 MT", engine: "1.6 бензин (110 л.с.)", transmission: "Механика", power: "110 л.с.",
                works: [
                  { id: "v1-w1", name: "Замена масла двигателя", hours: 0.5 },
                  { id: "v1-w2", name: "Замена тормозных колодок передних", hours: 1.0 },
                  { id: "v1-w3", name: "Замена ремня ГРМ", hours: 2.5 },
                  { id: "v1-w4", name: "Замена сцепления", hours: 4.0 },
                ]
              },
            ]
          },
        ]
      },
    ]
  },
];