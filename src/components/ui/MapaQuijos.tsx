 'use client';

import React, { useState } from 'react';

export type ParishReportCount = {
  parish: string;
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
};

type Props = {
  data: ParishReportCount[];
  imageSrc?: string;
};

type Region = {
  id: string; nombre: string; color: string; cabecera: boolean;
  centroide: [number, number]; d: string;
};

const VIEW_W = 1672;
const VIEW_H = 941;

// Geografía exacta extraída de la imagen original (no se redibuja a mano).
const REGIONS: Region[] = [
  {
    "id": "papallacta",
    "nombre": "Papallacta",
    "color": "#FCF060",
    "cabecera": false,
    "centroide": [
      308.2,
      282.3
    ],
    "d": "M 335.0 518.5 L 326.0 517.5 L 319.0 504.5 L 306.0 498.5 L 301.0 493.5 L 295.0 492.5 L 279.0 482.5 L 267.0 482.5 L 260.0 474.5 L 236.0 459.5 L 217.0 458.5 L 208.0 465.5 L 192.0 464.5 L 172.0 472.5 L 160.0 472.5 L 122.0 451.5 L 120.5 414.0 L 112.0 402.5 L 96.5 396.0 L 95.5 385.0 L 85.5 372.0 L 84.5 357.0 L 86.5 351.0 L 101.5 335.0 L 105.5 317.0 L 110.0 312.5 L 123.0 307.5 L 136.5 294.0 L 148.0 273.5 L 158.5 271.0 L 161.5 264.0 L 181.5 243.0 L 182.5 231.0 L 203.5 210.0 L 208.5 197.0 L 216.5 189.0 L 216.5 176.0 L 211.5 163.0 L 219.5 145.0 L 228.5 134.0 L 228.5 120.0 L 223.5 109.0 L 223.5 101.0 L 232.5 78.0 L 237.0 73.5 L 247.0 69.5 L 268.0 66.5 L 312.0 64.5 L 323.0 68.5 L 352.0 68.5 L 361.0 62.5 L 390.0 62.5 L 408.0 51.5 L 419.0 39.5 L 428.0 36.5 L 441.5 40.0 L 438.5 49.0 L 438.5 61.0 L 439.5 77.0 L 444.5 95.0 L 443.5 143.0 L 448.5 146.0 L 457.5 158.0 L 464.5 176.0 L 470.5 182.0 L 477.5 208.0 L 477.5 230.0 L 468.5 255.0 L 468.5 269.0 L 469.5 288.0 L 474.5 296.0 L 475.5 305.0 L 480.5 312.0 L 483.5 326.0 L 477.0 328.5 L 472.0 334.5 L 461.0 337.5 L 444.0 366.5 L 433.0 368.5 L 425.0 377.5 L 410.0 384.5 L 404.5 397.0 L 396.5 401.0 L 394.5 408.0 L 381.5 414.0 L 377.5 422.0 L 377.5 436.0 L 371.5 449.0 L 372.5 465.0 L 362.5 474.0 L 361.5 482.0 L 349.5 498.0 L 344.5 513.0 L 340.0 517.5 L 335.0 518.5 Z"
  },
  {
    "id": "cuyuja",
    "nombre": "Cuyuja",
    "color": "#FC8478",
    "cabecera": false,
    "centroide": [
      513.0,
      401.0
    ],
    "d": "M 296.0 710.5 L 293.0 705.5 L 289.0 705.5 L 278.0 697.5 L 272.0 689.5 L 263.0 686.5 L 255.0 677.5 L 243.0 672.5 L 239.5 668.0 L 249.5 648.0 L 260.5 642.0 L 260.5 630.0 L 254.5 625.0 L 269.0 620.5 L 277.5 612.0 L 281.5 586.0 L 289.5 567.0 L 318.5 545.0 L 324.5 534.0 L 325.5 521.0 L 340.0 520.5 L 348.5 513.0 L 352.5 499.0 L 358.5 495.0 L 363.5 487.0 L 365.5 476.0 L 372.5 470.0 L 372.5 455.0 L 379.5 439.0 L 379.5 427.0 L 383.5 417.0 L 396.5 411.0 L 399.5 403.0 L 406.5 399.0 L 413.0 386.5 L 427.0 380.5 L 434.0 371.5 L 446.0 369.5 L 454.5 352.0 L 458.5 350.0 L 465.0 338.5 L 473.0 337.5 L 480.0 330.5 L 483.5 330.0 L 482.5 310.0 L 471.5 284.0 L 471.5 256.0 L 480.5 232.0 L 480.5 207.0 L 473.5 182.0 L 467.5 175.0 L 460.5 156.0 L 444.5 139.0 L 447.5 94.0 L 442.5 76.0 L 441.5 48.0 L 444.0 41.5 L 449.5 49.0 L 453.5 67.0 L 461.5 86.0 L 463.5 105.0 L 470.0 113.5 L 486.0 114.5 L 491.0 112.5 L 494.0 107.5 L 500.0 107.5 L 518.0 119.5 L 528.0 129.5 L 538.0 134.5 L 540.5 147.0 L 547.0 149.5 L 556.0 162.5 L 565.0 165.5 L 569.5 173.0 L 574.5 176.0 L 575.5 187.0 L 586.5 218.0 L 594.0 226.5 L 607.0 226.5 L 622.0 222.5 L 640.0 226.5 L 652.5 241.0 L 658.5 259.0 L 678.5 271.0 L 680.5 278.0 L 688.5 284.0 L 691.5 296.0 L 697.0 302.5 L 710.0 311.5 L 730.5 316.0 L 732.5 319.0 L 732.5 333.0 L 736.5 344.0 L 736.5 352.0 L 732.5 361.0 L 732.5 373.0 L 737.5 380.0 L 738.5 390.0 L 733.5 401.0 L 728.0 401.5 L 727.5 408.0 L 720.0 414.5 L 709.0 419.5 L 686.0 422.5 L 681.5 432.0 L 673.0 437.5 L 645.0 440.5 L 633.0 448.5 L 610.0 453.5 L 580.0 469.5 L 570.0 471.5 L 565.5 477.0 L 562.5 491.0 L 558.0 495.5 L 538.5 503.0 L 540.5 519.0 L 536.5 523.0 L 536.5 536.0 L 532.5 554.0 L 527.5 565.0 L 518.5 571.0 L 516.5 579.0 L 509.5 584.0 L 508.0 598.5 L 491.0 592.5 L 469.0 594.5 L 460.0 590.5 L 445.0 590.5 L 439.5 593.0 L 439.0 597.5 L 434.0 597.5 L 433.0 602.5 L 420.0 607.5 L 383.0 608.5 L 377.0 614.5 L 363.0 618.5 L 347.0 628.5 L 342.0 628.5 L 339.0 635.5 L 329.0 636.5 L 328.0 640.5 L 321.0 641.5 L 314.0 650.5 L 307.5 653.0 L 305.5 665.0 L 298.5 681.0 L 296.0 710.5 Z"
  },
  {
    "id": "cosanga",
    "nombre": "Cosanga",
    "color": "#FCA878",
    "cabecera": false,
    "centroide": [
      738.4,
      684.9
    ],
    "d": "M 824.0 857.5 L 814.0 857.5 L 799.0 851.5 L 794.0 845.5 L 779.0 839.5 L 768.0 827.5 L 762.0 824.5 L 744.0 820.5 L 727.0 820.5 L 703.0 814.5 L 683.0 791.5 L 673.0 787.5 L 666.0 777.5 L 649.0 769.5 L 629.0 750.5 L 609.0 742.5 L 593.0 740.5 L 580.0 735.5 L 562.0 737.5 L 556.0 734.5 L 532.0 734.5 L 517.0 741.5 L 500.0 743.5 L 486.0 748.5 L 477.0 745.5 L 464.0 745.5 L 447.0 748.5 L 434.5 743.0 L 423.5 717.0 L 418.0 711.5 L 411.0 709.5 L 391.0 709.5 L 384.0 713.5 L 358.0 719.5 L 349.0 727.5 L 340.0 728.5 L 334.0 734.5 L 309.0 723.5 L 302.0 713.5 L 280.5 698.0 L 292.5 697.0 L 293.5 683.0 L 298.5 671.0 L 297.5 657.0 L 315.0 642.5 L 328.0 640.5 L 329.0 635.5 L 334.0 635.5 L 337.0 630.5 L 340.5 630.0 L 341.0 625.5 L 357.0 618.5 L 360.0 612.5 L 375.0 611.5 L 379.0 604.5 L 388.0 602.5 L 417.0 603.5 L 427.0 598.5 L 433.0 598.5 L 435.0 593.5 L 440.5 592.0 L 441.0 587.5 L 452.0 584.5 L 458.0 584.5 L 462.0 587.5 L 492.0 586.5 L 493.0 589.5 L 506.0 589.5 L 507.0 587.5 L 507.5 600.0 L 510.5 606.0 L 523.0 612.5 L 536.0 612.5 L 538.5 610.0 L 539.5 600.0 L 543.0 596.5 L 550.0 600.5 L 564.0 600.5 L 570.0 598.5 L 573.5 592.0 L 577.0 590.5 L 585.5 591.0 L 585.5 603.0 L 596.0 610.5 L 608.0 610.5 L 615.0 585.5 L 676.0 585.5 L 683.0 582.5 L 696.0 588.5 L 716.0 588.5 L 728.0 579.5 L 734.0 578.5 L 764.0 583.5 L 775.0 588.5 L 793.0 588.5 L 805.0 580.5 L 829.0 605.5 L 833.0 606.5 L 854.0 605.5 L 866.0 594.5 L 873.0 594.5 L 883.0 598.5 L 914.0 598.5 L 922.0 603.5 L 936.0 603.5 L 942.0 597.5 L 955.0 591.5 L 959.5 587.0 L 961.0 579.5 L 986.0 586.5 L 996.0 594.5 L 1006.0 597.5 L 1042.0 598.5 L 1060.5 576.0 L 1064.5 559.0 L 1068.0 555.5 L 1076.0 554.5 L 1082.5 560.0 L 1081.5 577.0 L 1087.0 582.5 L 1107.0 594.5 L 1134.5 598.0 L 1130.0 608.5 L 1113.0 616.5 L 1096.5 631.0 L 1096.5 646.0 L 1067.5 696.0 L 1070.5 726.0 L 1058.0 749.5 L 1036.0 767.5 L 1013.0 773.5 L 984.0 798.5 L 973.0 798.5 L 959.5 822.0 L 952.0 828.5 L 936.0 833.5 L 916.0 810.5 L 903.0 810.5 L 887.0 818.5 L 857.0 816.5 L 852.5 822.0 L 849.5 840.0 L 830.0 855.5 L 824.0 857.5 Z"
  },
  {
    "id": "sumaco",
    "nombre": "Sumaco",
    "color": "#F090CC",
    "cabecera": false,
    "centroide": [
      1256.2,
      507.4
    ],
    "d": "M 1437.0 619.5 L 1419.0 615.5 L 1406.0 608.5 L 1402.5 598.0 L 1398.0 594.5 L 1358.0 592.5 L 1352.0 586.5 L 1344.0 583.5 L 1324.0 563.5 L 1299.0 552.5 L 1278.0 551.5 L 1268.0 544.5 L 1252.0 542.5 L 1241.0 535.5 L 1232.0 523.5 L 1218.0 523.5 L 1209.5 537.0 L 1207.0 550.5 L 1197.0 550.5 L 1194.5 559.0 L 1182.0 569.5 L 1152.0 580.5 L 1138.0 594.5 L 1107.0 591.5 L 1088.0 579.5 L 1082.5 573.0 L 1083.5 556.0 L 1080.0 552.5 L 1067.0 552.5 L 1062.5 556.0 L 1058.5 574.0 L 1041.0 595.5 L 1018.0 595.5 L 998.0 592.5 L 987.0 583.5 L 977.0 582.5 L 955.5 574.0 L 955.5 543.0 L 957.5 537.0 L 965.5 530.0 L 965.5 521.0 L 983.5 488.0 L 982.5 469.0 L 989.0 455.5 L 990.5 465.0 L 998.0 466.5 L 1013.0 483.5 L 1026.0 483.5 L 1036.0 470.5 L 1049.0 464.5 L 1057.0 453.5 L 1070.0 443.5 L 1100.0 446.5 L 1108.0 437.5 L 1124.0 429.5 L 1133.5 415.0 L 1138.0 412.5 L 1156.0 416.5 L 1184.0 414.5 L 1190.0 411.5 L 1201.0 411.5 L 1211.0 415.5 L 1226.0 415.5 L 1231.5 412.0 L 1234.5 402.0 L 1240.0 398.5 L 1253.0 399.5 L 1271.0 408.5 L 1286.0 412.5 L 1300.0 412.5 L 1317.0 407.5 L 1328.0 415.5 L 1356.0 417.5 L 1386.0 441.5 L 1403.0 443.5 L 1415.0 448.5 L 1439.0 448.5 L 1443.5 453.0 L 1445.5 464.0 L 1453.0 474.5 L 1466.0 474.5 L 1471.0 469.5 L 1485.0 467.5 L 1488.5 470.0 L 1488.5 477.0 L 1491.0 480.5 L 1507.0 480.5 L 1514.0 483.5 L 1537.0 481.5 L 1557.5 491.0 L 1559.5 499.0 L 1558.5 518.0 L 1569.5 530.0 L 1568.5 534.0 L 1564.0 537.5 L 1551.0 539.5 L 1532.0 547.5 L 1507.0 560.5 L 1502.0 568.5 L 1495.0 570.5 L 1483.0 580.5 L 1464.0 582.5 L 1442.5 605.0 L 1439.5 618.0 L 1437.0 619.5 Z"
  },
  {
    "id": "baeza",
    "nombre": "Baeza",
    "color": "#3C9030",
    "cabecera": true,
    "centroide": [
      753.5,
      516.5
    ],
    "d": "M 606.0 613.5 L 600.0 613.5 L 599.0 609.5 L 595.0 609.5 L 594.0 606.5 L 589.5 605.0 L 589.0 601.5 L 585.0 601.5 L 584.0 595.5 L 568.0 595.5 L 567.0 599.5 L 559.0 601.5 L 558.0 599.5 L 540.0 599.5 L 537.5 611.0 L 531.0 613.5 L 513.0 607.5 L 505.0 594.5 L 492.0 592.5 L 472.0 592.5 L 471.0 594.5 L 463.5 591.0 L 480.0 590.5 L 481.0 588.5 L 484.0 591.5 L 507.5 591.0 L 508.5 585.0 L 513.0 584.5 L 513.5 581.0 L 516.5 580.0 L 518.5 571.0 L 523.0 570.5 L 527.5 566.0 L 529.5 558.0 L 532.5 557.0 L 538.5 506.0 L 547.0 499.5 L 560.5 496.0 L 565.5 477.0 L 570.0 471.5 L 587.0 466.5 L 600.0 458.5 L 608.0 458.5 L 610.0 453.5 L 625.0 451.5 L 645.0 443.5 L 663.0 440.5 L 664.0 437.5 L 678.0 435.5 L 684.0 426.5 L 692.0 424.5 L 694.0 420.5 L 713.0 419.5 L 714.0 416.5 L 722.0 416.5 L 722.5 412.0 L 727.0 411.5 L 727.5 408.0 L 732.5 405.0 L 737.5 393.0 L 737.0 376.5 L 739.5 377.0 L 741.5 385.0 L 738.5 397.0 L 739.0 415.5 L 747.0 415.5 L 747.5 420.0 L 752.0 424.5 L 756.0 424.5 L 761.0 432.5 L 771.0 434.5 L 772.0 437.5 L 778.0 437.5 L 788.0 442.5 L 820.0 447.5 L 825.0 455.5 L 839.0 460.5 L 856.0 460.5 L 879.0 455.5 L 883.0 449.5 L 893.0 446.5 L 903.0 447.5 L 910.0 451.5 L 923.0 451.5 L 930.0 448.5 L 962.0 451.5 L 971.0 446.5 L 973.0 440.5 L 983.0 440.5 L 987.5 436.0 L 987.5 446.0 L 993.5 450.0 L 995.5 463.0 L 984.5 464.0 L 983.5 488.0 L 979.5 489.0 L 979.5 496.0 L 972.5 500.0 L 971.5 510.0 L 969.0 514.5 L 965.5 515.0 L 963.5 528.0 L 957.5 533.0 L 956.5 541.0 L 953.5 542.0 L 956.5 576.0 L 986.0 583.5 L 986.0 586.5 L 961.0 583.5 L 952.0 593.5 L 937.0 599.5 L 936.0 603.5 L 921.0 602.5 L 917.0 599.5 L 864.0 595.5 L 859.0 597.5 L 854.0 605.5 L 839.0 607.5 L 831.0 605.5 L 826.0 596.5 L 817.0 593.5 L 816.5 588.0 L 810.0 580.5 L 798.0 580.5 L 796.5 585.0 L 789.0 590.5 L 769.0 586.5 L 768.0 583.5 L 746.0 580.5 L 743.0 576.5 L 728.0 577.5 L 727.0 580.5 L 712.0 589.5 L 698.0 588.5 L 687.0 583.5 L 675.0 583.5 L 672.0 587.5 L 667.0 586.5 L 666.0 583.5 L 653.0 583.5 L 651.0 585.5 L 650.0 582.5 L 629.0 582.5 L 628.0 585.5 L 614.5 586.0 L 606.0 613.5 Z"
  },
  {
    "id": "borja",
    "nombre": "San Francisco de Borja",
    "color": "#FCC03C",
    "cabecera": false,
    "centroide": [
      918.1,
      396.5
    ],
    "d": "M 1021.0 484.5 L 1008.5 476.0 L 1001.0 464.5 L 992.5 462.0 L 992.5 447.0 L 989.0 443.5 L 974.0 443.5 L 956.0 452.5 L 945.0 449.5 L 926.0 449.5 L 921.0 452.5 L 911.0 452.5 L 903.0 447.5 L 889.0 447.5 L 882.0 449.5 L 874.0 456.5 L 845.0 461.5 L 825.0 455.5 L 820.0 447.5 L 788.0 442.5 L 763.0 431.5 L 747.0 415.5 L 741.0 413.5 L 734.5 407.0 L 740.5 393.0 L 740.5 379.0 L 734.5 371.0 L 734.5 364.0 L 738.5 355.0 L 738.5 340.0 L 734.5 330.0 L 736.5 316.0 L 753.0 315.5 L 773.0 324.5 L 794.0 322.5 L 794.5 336.0 L 799.5 356.0 L 809.0 367.5 L 821.0 369.5 L 836.0 369.5 L 845.0 365.5 L 868.0 344.5 L 884.0 344.5 L 907.0 338.5 L 922.0 337.5 L 935.0 327.5 L 961.0 323.5 L 971.0 324.5 L 1007.0 345.5 L 1025.0 343.5 L 1029.5 339.0 L 1033.0 328.5 L 1035.5 341.0 L 1034.5 355.0 L 1038.5 359.0 L 1044.0 373.5 L 1058.0 378.5 L 1088.0 375.5 L 1107.0 379.5 L 1122.0 386.5 L 1127.5 395.0 L 1137.5 402.0 L 1138.5 408.0 L 1131.5 412.0 L 1122.0 427.5 L 1105.0 435.5 L 1096.0 444.5 L 1068.0 441.5 L 1062.0 447.5 L 1056.0 449.5 L 1048.0 461.5 L 1034.0 468.5 L 1021.0 484.5 Z"
  }
];

// Opacidad del overlay esmeralda según la intensidad de reportes.
function heatOpacity(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return 0.15 + 0.4 * (count / max);
}

type Tooltip = { x: number; y: number; region: Region; stat?: ParishReportCount };

export default function MapaQuijos({ data, imageSrc = '/mapa_quijos.png' }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const dataMap = Object.fromEntries(data.map((d) => [d.parish, d])) as Record<string, ParishReportCount>;
  const max = Math.max(...data.map((d) => d.total), 1);

  const move = (e: React.MouseEvent<SVGElement>, region: Region) => {
    const svg = e.currentTarget.closest('svg') as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, region, stat: dataMap[region.nombre] });
  };

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-auto rounded-lg"
        preserveAspectRatio="xMidYMid meet"
      >
        <image href={imageSrc} x={0} y={0} width={VIEW_W} height={VIEW_H} />

        {/* Overlay de intensidad + zonas interactivas */}
        {REGIONS.map((r) => {
          const total = dataMap[r.nombre]?.total ?? 0;
          const isActive = active === r.id;
          const op = heatOpacity(total, max) + (isActive ? 0.18 : 0);
          return (
            <path
              key={r.id}
              d={r.d}
              fill="#059669"
              fillOpacity={op}
              stroke={isActive ? '#047857' : 'transparent'}
              strokeWidth={3}
              tabIndex={0}
              role="button"
              aria-label={`${r.nombre}: ${total} reportes`}
              style={{ cursor: 'pointer', transition: 'fill-opacity .15s ease, stroke .15s ease', outline: 'none' }}
              onMouseEnter={() => setActive(r.id)}
              onMouseMove={(e) => move(e, r)}
              onMouseLeave={() => { setActive(null); setTooltip(null); }}
              onFocus={() => setActive(r.id)}
              onBlur={() => setActive(null)}
            />
          );
        })}

        {/* Puntos titilantes en parroquias con reportes */}
        {REGIONS.map((r) => {
          const total = dataMap[r.nombre]?.total ?? 0;
          if (total === 0) return null;
          const [cx, cy] = r.centroide;
          return (
            <g key={`pulse-${r.id}`} transform={`translate(${cx},${cy - 55})`} pointerEvents="none">
              {/* Primera onda */}
              <circle r="10" fill="#dc2626" opacity="0">
                <animate attributeName="r"       values="10;42"  dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0"  dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Segunda onda desfasada */}
              <circle r="10" fill="#dc2626" opacity="0">
                <animate attributeName="r"       values="10;42"  dur="2s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.55;0" dur="2s" begin="0.7s" repeatCount="indefinite" />
              </circle>
              {/* Punto sólido */}
              <circle r="10" fill="#dc2626" />
              <circle r="5"  fill="white" />
              <circle r="2.5" fill="#dc2626" />
            </g>
          );
        })}

        {/* Conteo en el centroide de cada parroquia con reportes */}
        {REGIONS.map((r) => {
          const total = dataMap[r.nombre]?.total ?? 0;
          if (total === 0) return null;
          const [cx, cy] = r.centroide;
          const w = 30 + String(total).length * 16;
          return (
            <g key={`badge-${r.id}`} transform={`translate(${cx},${cy})`} pointerEvents="none">
              <rect x={-w / 2} y={-18} width={w} height={36} rx={18} fill="#065f46" opacity={0.92} />
              <text x={0} y={7} textAnchor="middle" fill="#ffffff" fontSize={22} fontWeight={700} fontFamily="Arial, sans-serif">
                {total}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip flotante */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 70 }}
        >
          <p className="font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1 mb-1 flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ background: tooltip.region.color }} />
            {tooltip.region.nombre}
            {tooltip.region.cabecera && (
              <span className="text-[10px] font-normal text-gray-500 border border-gray-200 dark:border-gray-600 rounded-full px-1.5">Cabecera</span>
            )}
          </p>
          {tooltip.stat && tooltip.stat.total > 0 ? (
            <>
              <p className="text-2xl font-extrabold text-emerald-600">
                {tooltip.stat.total} <span className="text-xs font-normal text-gray-500">reportes</span>
              </p>
              <div className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                <div>🟢 Resueltos: <strong>{tooltip.stat.resolved}</strong></div>
                <div>🔵 En proceso: <strong>{tooltip.stat.inProgress}</strong></div>
                <div>🟣 Pendientes: <strong>{tooltip.stat.pending}</strong></div>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-xs">Sin reportes registrados</p>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow text-xs space-y-1">
        <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Intensidad de reportes</p>
        {[
          { o: 0.55, label: 'Muy alto' },
          { o: 0.4, label: 'Alto' },
          { o: 0.28, label: 'Medio' },
          { o: 0.16, label: 'Bajo' },
        ].map(({ o, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: `rgba(5,150,105,${o})` }} />
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0 border border-gray-300 dark:border-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">Sin reportes</span>
        </div>
      </div>
    </div>
  );
}
