/**
 * Nigerian administrative divisions.
 * Source: Open Admin Data
 * https://github.com/open-admin-data/nigeria-administrative-divisions
 * Data licence: Creative Commons Attribution 4.0 International (CC BY 4.0)
 * Adaptation: selected state and LGA fields, sorted for WORKYARD selectors.
 * No endorsement by the data publisher is implied.
 */

export type NigeriaState = {
  id: string;
  name: string;
};

export type NigeriaLga = {
  id: string;
  name: string;
  stateId: string;
};

export const NIGERIAN_STATES: NigeriaState[] = [
  {
    "id": "NG001",
    "name": "Abia"
  },
  {
    "id": "NG002",
    "name": "Adamawa"
  },
  {
    "id": "NG003",
    "name": "Akwa Ibom"
  },
  {
    "id": "NG004",
    "name": "Anambra"
  },
  {
    "id": "NG005",
    "name": "Bauchi"
  },
  {
    "id": "NG006",
    "name": "Bayelsa"
  },
  {
    "id": "NG007",
    "name": "Benue"
  },
  {
    "id": "NG008",
    "name": "Borno"
  },
  {
    "id": "NG009",
    "name": "Cross River"
  },
  {
    "id": "NG010",
    "name": "Delta"
  },
  {
    "id": "NG011",
    "name": "Ebonyi"
  },
  {
    "id": "NG012",
    "name": "Edo"
  },
  {
    "id": "NG013",
    "name": "Ekiti"
  },
  {
    "id": "NG014",
    "name": "Enugu"
  },
  {
    "id": "NG015",
    "name": "Federal Capital Territory"
  },
  {
    "id": "NG016",
    "name": "Gombe"
  },
  {
    "id": "NG017",
    "name": "Imo"
  },
  {
    "id": "NG018",
    "name": "Jigawa"
  },
  {
    "id": "NG019",
    "name": "Kaduna"
  },
  {
    "id": "NG020",
    "name": "Kano"
  },
  {
    "id": "NG021",
    "name": "Katsina"
  },
  {
    "id": "NG022",
    "name": "Kebbi"
  },
  {
    "id": "NG023",
    "name": "Kogi"
  },
  {
    "id": "NG024",
    "name": "Kwara"
  },
  {
    "id": "NG025",
    "name": "Lagos"
  },
  {
    "id": "NG026",
    "name": "Nasarawa"
  },
  {
    "id": "NG027",
    "name": "Niger"
  },
  {
    "id": "NG028",
    "name": "Ogun"
  },
  {
    "id": "NG029",
    "name": "Ondo"
  },
  {
    "id": "NG030",
    "name": "Osun"
  },
  {
    "id": "NG031",
    "name": "Oyo"
  },
  {
    "id": "NG032",
    "name": "Plateau"
  },
  {
    "id": "NG033",
    "name": "Rivers"
  },
  {
    "id": "NG034",
    "name": "Sokoto"
  },
  {
    "id": "NG035",
    "name": "Taraba"
  },
  {
    "id": "NG036",
    "name": "Yobe"
  },
  {
    "id": "NG037",
    "name": "Zamfara"
  }
];

export const NIGERIAN_LGAS: NigeriaLga[] = [
  {
    "id": "NG001001",
    "name": "Aba North",
    "stateId": "NG001"
  },
  {
    "id": "NG001002",
    "name": "Aba South",
    "stateId": "NG001"
  },
  {
    "id": "NG001003",
    "name": "Arochukwu",
    "stateId": "NG001"
  },
  {
    "id": "NG001004",
    "name": "Bende",
    "stateId": "NG001"
  },
  {
    "id": "NG001005",
    "name": "Ikwuano",
    "stateId": "NG001"
  },
  {
    "id": "NG001006",
    "name": "Isiala-Ngwa North",
    "stateId": "NG001"
  },
  {
    "id": "NG001007",
    "name": "Isiala-Ngwa South",
    "stateId": "NG001"
  },
  {
    "id": "NG001008",
    "name": "Isiukwuato",
    "stateId": "NG001"
  },
  {
    "id": "NG001009",
    "name": "Obi Ngwa",
    "stateId": "NG001"
  },
  {
    "id": "NG001010",
    "name": "Ohafia",
    "stateId": "NG001"
  },
  {
    "id": "NG001011",
    "name": "Osisioma Ngwa",
    "stateId": "NG001"
  },
  {
    "id": "NG001012",
    "name": "Ugwunagbo",
    "stateId": "NG001"
  },
  {
    "id": "NG001013",
    "name": "Ukwa East",
    "stateId": "NG001"
  },
  {
    "id": "NG001014",
    "name": "Ukwa West",
    "stateId": "NG001"
  },
  {
    "id": "NG001017",
    "name": "Umu-Nneochi",
    "stateId": "NG001"
  },
  {
    "id": "NG001015",
    "name": "Umuahia North",
    "stateId": "NG001"
  },
  {
    "id": "NG001016",
    "name": "Umuahia South",
    "stateId": "NG001"
  },
  {
    "id": "NG002001",
    "name": "Demsa",
    "stateId": "NG002"
  },
  {
    "id": "NG002002",
    "name": "Fufore",
    "stateId": "NG002"
  },
  {
    "id": "NG002003",
    "name": "Ganye",
    "stateId": "NG002"
  },
  {
    "id": "NG002005",
    "name": "Girei",
    "stateId": "NG002"
  },
  {
    "id": "NG002004",
    "name": "Gombi",
    "stateId": "NG002"
  },
  {
    "id": "NG002006",
    "name": "Guyuk",
    "stateId": "NG002"
  },
  {
    "id": "NG002007",
    "name": "Hong",
    "stateId": "NG002"
  },
  {
    "id": "NG002008",
    "name": "Jada",
    "stateId": "NG002"
  },
  {
    "id": "NG002009",
    "name": "Lamurde",
    "stateId": "NG002"
  },
  {
    "id": "NG002010",
    "name": "Madagali",
    "stateId": "NG002"
  },
  {
    "id": "NG002011",
    "name": "Maiha",
    "stateId": "NG002"
  },
  {
    "id": "NG002012",
    "name": "Mayo-Belwa",
    "stateId": "NG002"
  },
  {
    "id": "NG002013",
    "name": "Michika",
    "stateId": "NG002"
  },
  {
    "id": "NG002014",
    "name": "Mubi North",
    "stateId": "NG002"
  },
  {
    "id": "NG002015",
    "name": "Mubi South",
    "stateId": "NG002"
  },
  {
    "id": "NG002016",
    "name": "Numan",
    "stateId": "NG002"
  },
  {
    "id": "NG002017",
    "name": "Shelleng",
    "stateId": "NG002"
  },
  {
    "id": "NG002018",
    "name": "Song",
    "stateId": "NG002"
  },
  {
    "id": "NG002019",
    "name": "Toungo",
    "stateId": "NG002"
  },
  {
    "id": "NG002020",
    "name": "Yola North",
    "stateId": "NG002"
  },
  {
    "id": "NG002021",
    "name": "Yola South",
    "stateId": "NG002"
  },
  {
    "id": "NG003001",
    "name": "Abak",
    "stateId": "NG003"
  },
  {
    "id": "NG003002",
    "name": "Eastern Obolo",
    "stateId": "NG003"
  },
  {
    "id": "NG003003",
    "name": "Eket",
    "stateId": "NG003"
  },
  {
    "id": "NG003004",
    "name": "Esit - Eket",
    "stateId": "NG003"
  },
  {
    "id": "NG003005",
    "name": "Essien Udim",
    "stateId": "NG003"
  },
  {
    "id": "NG003006",
    "name": "Etim Ekpo",
    "stateId": "NG003"
  },
  {
    "id": "NG003007",
    "name": "Etinan",
    "stateId": "NG003"
  },
  {
    "id": "NG003008",
    "name": "Ibeno",
    "stateId": "NG003"
  },
  {
    "id": "NG003009",
    "name": "Ibesikpo Asutan",
    "stateId": "NG003"
  },
  {
    "id": "NG003010",
    "name": "Ibiono Ibom",
    "stateId": "NG003"
  },
  {
    "id": "NG003011",
    "name": "Ika",
    "stateId": "NG003"
  },
  {
    "id": "NG003012",
    "name": "Ikono",
    "stateId": "NG003"
  },
  {
    "id": "NG003013",
    "name": "Ikot Abasi",
    "stateId": "NG003"
  },
  {
    "id": "NG003014",
    "name": "Ikot Ekpene",
    "stateId": "NG003"
  },
  {
    "id": "NG003015",
    "name": "Ini",
    "stateId": "NG003"
  },
  {
    "id": "NG003016",
    "name": "Itu",
    "stateId": "NG003"
  },
  {
    "id": "NG003017",
    "name": "Mbo",
    "stateId": "NG003"
  },
  {
    "id": "NG003018",
    "name": "Mkpat Enin",
    "stateId": "NG003"
  },
  {
    "id": "NG003019",
    "name": "Nsit Atai",
    "stateId": "NG003"
  },
  {
    "id": "NG003020",
    "name": "Nsit Ibom",
    "stateId": "NG003"
  },
  {
    "id": "NG003021",
    "name": "Nsit Ubium",
    "stateId": "NG003"
  },
  {
    "id": "NG003022",
    "name": "Obot Akara",
    "stateId": "NG003"
  },
  {
    "id": "NG003023",
    "name": "Okobo",
    "stateId": "NG003"
  },
  {
    "id": "NG003024",
    "name": "Onna",
    "stateId": "NG003"
  },
  {
    "id": "NG003025",
    "name": "Oron",
    "stateId": "NG003"
  },
  {
    "id": "NG003026",
    "name": "Oruk Anam",
    "stateId": "NG003"
  },
  {
    "id": "NG003027",
    "name": "Udung Uko",
    "stateId": "NG003"
  },
  {
    "id": "NG003028",
    "name": "Ukanafun",
    "stateId": "NG003"
  },
  {
    "id": "NG003029",
    "name": "Uruan",
    "stateId": "NG003"
  },
  {
    "id": "NG003030",
    "name": "Urue-Offong/Oruko",
    "stateId": "NG003"
  },
  {
    "id": "NG003031",
    "name": "Uyo",
    "stateId": "NG003"
  },
  {
    "id": "NG004001",
    "name": "Aguata",
    "stateId": "NG004"
  },
  {
    "id": "NG004002",
    "name": "Anambra East",
    "stateId": "NG004"
  },
  {
    "id": "NG004003",
    "name": "Anambra West",
    "stateId": "NG004"
  },
  {
    "id": "NG004004",
    "name": "Anaocha",
    "stateId": "NG004"
  },
  {
    "id": "NG004005",
    "name": "Awka North",
    "stateId": "NG004"
  },
  {
    "id": "NG004006",
    "name": "Awka South",
    "stateId": "NG004"
  },
  {
    "id": "NG004007",
    "name": "Ayamelum",
    "stateId": "NG004"
  },
  {
    "id": "NG004008",
    "name": "Dunukofia",
    "stateId": "NG004"
  },
  {
    "id": "NG004009",
    "name": "Ekwusigo",
    "stateId": "NG004"
  },
  {
    "id": "NG004010",
    "name": "Idemili North",
    "stateId": "NG004"
  },
  {
    "id": "NG004011",
    "name": "Idemili South",
    "stateId": "NG004"
  },
  {
    "id": "NG004012",
    "name": "Ihiala",
    "stateId": "NG004"
  },
  {
    "id": "NG004013",
    "name": "Njikoka",
    "stateId": "NG004"
  },
  {
    "id": "NG004014",
    "name": "Nnewi North",
    "stateId": "NG004"
  },
  {
    "id": "NG004015",
    "name": "Nnewi South",
    "stateId": "NG004"
  },
  {
    "id": "NG004016",
    "name": "Ogbaru",
    "stateId": "NG004"
  },
  {
    "id": "NG004017",
    "name": "Onitsha North",
    "stateId": "NG004"
  },
  {
    "id": "NG004018",
    "name": "Onitsha South",
    "stateId": "NG004"
  },
  {
    "id": "NG004019",
    "name": "Orumba North",
    "stateId": "NG004"
  },
  {
    "id": "NG004020",
    "name": "Orumba South",
    "stateId": "NG004"
  },
  {
    "id": "NG004021",
    "name": "Oyi",
    "stateId": "NG004"
  },
  {
    "id": "NG005001",
    "name": "Alkaleri",
    "stateId": "NG005"
  },
  {
    "id": "NG005002",
    "name": "Bauchi",
    "stateId": "NG005"
  },
  {
    "id": "NG005003",
    "name": "Bogoro",
    "stateId": "NG005"
  },
  {
    "id": "NG005004",
    "name": "Damban",
    "stateId": "NG005"
  },
  {
    "id": "NG005005",
    "name": "Darazo",
    "stateId": "NG005"
  },
  {
    "id": "NG005006",
    "name": "Dass",
    "stateId": "NG005"
  },
  {
    "id": "NG005007",
    "name": "Gamawa",
    "stateId": "NG005"
  },
  {
    "id": "NG005008",
    "name": "Ganjuwa",
    "stateId": "NG005"
  },
  {
    "id": "NG005009",
    "name": "Giade",
    "stateId": "NG005"
  },
  {
    "id": "NG005010",
    "name": "Itas/Gadau",
    "stateId": "NG005"
  },
  {
    "id": "NG005011",
    "name": "Jama'are",
    "stateId": "NG005"
  },
  {
    "id": "NG005012",
    "name": "Katagum",
    "stateId": "NG005"
  },
  {
    "id": "NG005013",
    "name": "Kirfi",
    "stateId": "NG005"
  },
  {
    "id": "NG005014",
    "name": "Misau",
    "stateId": "NG005"
  },
  {
    "id": "NG005015",
    "name": "Ningi",
    "stateId": "NG005"
  },
  {
    "id": "NG005016",
    "name": "Shira",
    "stateId": "NG005"
  },
  {
    "id": "NG005017",
    "name": "Tafawa-Balewa",
    "stateId": "NG005"
  },
  {
    "id": "NG005018",
    "name": "Toro",
    "stateId": "NG005"
  },
  {
    "id": "NG005019",
    "name": "Warji",
    "stateId": "NG005"
  },
  {
    "id": "NG005020",
    "name": "Zaki",
    "stateId": "NG005"
  },
  {
    "id": "NG006001",
    "name": "Brass",
    "stateId": "NG006"
  },
  {
    "id": "NG006002",
    "name": "Ekeremor",
    "stateId": "NG006"
  },
  {
    "id": "NG006003",
    "name": "Kolokuma/Opokuma",
    "stateId": "NG006"
  },
  {
    "id": "NG006004",
    "name": "Nembe",
    "stateId": "NG006"
  },
  {
    "id": "NG006005",
    "name": "Ogbia",
    "stateId": "NG006"
  },
  {
    "id": "NG006006",
    "name": "Sagbama",
    "stateId": "NG006"
  },
  {
    "id": "NG006007",
    "name": "Southern Ijaw",
    "stateId": "NG006"
  },
  {
    "id": "NG006008",
    "name": "Yenegoa",
    "stateId": "NG006"
  },
  {
    "id": "NG007001",
    "name": "Ado",
    "stateId": "NG007"
  },
  {
    "id": "NG007002",
    "name": "Agatu",
    "stateId": "NG007"
  },
  {
    "id": "NG007003",
    "name": "Apa",
    "stateId": "NG007"
  },
  {
    "id": "NG007004",
    "name": "Buruku",
    "stateId": "NG007"
  },
  {
    "id": "NG007005",
    "name": "Gboko",
    "stateId": "NG007"
  },
  {
    "id": "NG007006",
    "name": "Guma",
    "stateId": "NG007"
  },
  {
    "id": "NG007007",
    "name": "Gwer East",
    "stateId": "NG007"
  },
  {
    "id": "NG007008",
    "name": "Gwer West",
    "stateId": "NG007"
  },
  {
    "id": "NG007009",
    "name": "Katsina-Ala",
    "stateId": "NG007"
  },
  {
    "id": "NG007010",
    "name": "Konshisha",
    "stateId": "NG007"
  },
  {
    "id": "NG007011",
    "name": "Kwande",
    "stateId": "NG007"
  },
  {
    "id": "NG007012",
    "name": "Logo",
    "stateId": "NG007"
  },
  {
    "id": "NG007013",
    "name": "Makurdi",
    "stateId": "NG007"
  },
  {
    "id": "NG007014",
    "name": "Obi",
    "stateId": "NG007"
  },
  {
    "id": "NG007015",
    "name": "Ogbadibo",
    "stateId": "NG007"
  },
  {
    "id": "NG007016",
    "name": "Ohimini",
    "stateId": "NG007"
  },
  {
    "id": "NG007017",
    "name": "Oju",
    "stateId": "NG007"
  },
  {
    "id": "NG007018",
    "name": "Okpokwu",
    "stateId": "NG007"
  },
  {
    "id": "NG007019",
    "name": "Oturkpo",
    "stateId": "NG007"
  },
  {
    "id": "NG007020",
    "name": "Tarka",
    "stateId": "NG007"
  },
  {
    "id": "NG007021",
    "name": "Ukum",
    "stateId": "NG007"
  },
  {
    "id": "NG007022",
    "name": "Ushongo",
    "stateId": "NG007"
  },
  {
    "id": "NG007023",
    "name": "Vandeikya",
    "stateId": "NG007"
  },
  {
    "id": "NG008001",
    "name": "Abadam",
    "stateId": "NG008"
  },
  {
    "id": "NG008002",
    "name": "Askira/Uba",
    "stateId": "NG008"
  },
  {
    "id": "NG008003",
    "name": "Bama",
    "stateId": "NG008"
  },
  {
    "id": "NG008004",
    "name": "Bayo",
    "stateId": "NG008"
  },
  {
    "id": "NG008005",
    "name": "Biu",
    "stateId": "NG008"
  },
  {
    "id": "NG008006",
    "name": "Chibok",
    "stateId": "NG008"
  },
  {
    "id": "NG008007",
    "name": "Damboa",
    "stateId": "NG008"
  },
  {
    "id": "NG008008",
    "name": "Dikwa",
    "stateId": "NG008"
  },
  {
    "id": "NG008009",
    "name": "Gubio",
    "stateId": "NG008"
  },
  {
    "id": "NG008010",
    "name": "Guzamala",
    "stateId": "NG008"
  },
  {
    "id": "NG008011",
    "name": "Gwoza",
    "stateId": "NG008"
  },
  {
    "id": "NG008012",
    "name": "Hawul",
    "stateId": "NG008"
  },
  {
    "id": "NG008013",
    "name": "Jere",
    "stateId": "NG008"
  },
  {
    "id": "NG008014",
    "name": "Kaga",
    "stateId": "NG008"
  },
  {
    "id": "NG008015",
    "name": "Kala/Balge",
    "stateId": "NG008"
  },
  {
    "id": "NG008016",
    "name": "Konduga",
    "stateId": "NG008"
  },
  {
    "id": "NG008017",
    "name": "Kukawa",
    "stateId": "NG008"
  },
  {
    "id": "NG008018",
    "name": "Kwaya Kusar",
    "stateId": "NG008"
  },
  {
    "id": "NG008019",
    "name": "Mafa",
    "stateId": "NG008"
  },
  {
    "id": "NG008020",
    "name": "Magumeri",
    "stateId": "NG008"
  },
  {
    "id": "NG008021",
    "name": "Maiduguri",
    "stateId": "NG008"
  },
  {
    "id": "NG008022",
    "name": "Marte",
    "stateId": "NG008"
  },
  {
    "id": "NG008023",
    "name": "Mobbar",
    "stateId": "NG008"
  },
  {
    "id": "NG008024",
    "name": "Monguno",
    "stateId": "NG008"
  },
  {
    "id": "NG008025",
    "name": "Ngala",
    "stateId": "NG008"
  },
  {
    "id": "NG008026",
    "name": "Nganzai",
    "stateId": "NG008"
  },
  {
    "id": "NG008027",
    "name": "Shani",
    "stateId": "NG008"
  },
  {
    "id": "NG009001",
    "name": "Abi",
    "stateId": "NG009"
  },
  {
    "id": "NG009002",
    "name": "Akamkpa",
    "stateId": "NG009"
  },
  {
    "id": "NG009003",
    "name": "Akpabuyo",
    "stateId": "NG009"
  },
  {
    "id": "NG009005",
    "name": "Bakassi",
    "stateId": "NG009"
  },
  {
    "id": "NG009006",
    "name": "Bekwara",
    "stateId": "NG009"
  },
  {
    "id": "NG009007",
    "name": "Biase",
    "stateId": "NG009"
  },
  {
    "id": "NG009008",
    "name": "Boki",
    "stateId": "NG009"
  },
  {
    "id": "NG009009",
    "name": "Calabar South",
    "stateId": "NG009"
  },
  {
    "id": "NG009010",
    "name": "Calabar-Municipal",
    "stateId": "NG009"
  },
  {
    "id": "NG009011",
    "name": "Etung",
    "stateId": "NG009"
  },
  {
    "id": "NG009012",
    "name": "Ikom",
    "stateId": "NG009"
  },
  {
    "id": "NG009013",
    "name": "Obanliku",
    "stateId": "NG009"
  },
  {
    "id": "NG009014",
    "name": "Obubra",
    "stateId": "NG009"
  },
  {
    "id": "NG009015",
    "name": "Obudu",
    "stateId": "NG009"
  },
  {
    "id": "NG009016",
    "name": "Odukpani",
    "stateId": "NG009"
  },
  {
    "id": "NG009017",
    "name": "Ogoja",
    "stateId": "NG009"
  },
  {
    "id": "NG009018",
    "name": "Yakurr",
    "stateId": "NG009"
  },
  {
    "id": "NG009019",
    "name": "Yala",
    "stateId": "NG009"
  },
  {
    "id": "NG010001",
    "name": "Aniocha North",
    "stateId": "NG010"
  },
  {
    "id": "NG010002",
    "name": "Aniocha South",
    "stateId": "NG010"
  },
  {
    "id": "NG010003",
    "name": "Bomadi",
    "stateId": "NG010"
  },
  {
    "id": "NG010004",
    "name": "Burutu",
    "stateId": "NG010"
  },
  {
    "id": "NG010005",
    "name": "Ethiope East",
    "stateId": "NG010"
  },
  {
    "id": "NG010006",
    "name": "Ethiope West",
    "stateId": "NG010"
  },
  {
    "id": "NG010007",
    "name": "Ika North East",
    "stateId": "NG010"
  },
  {
    "id": "NG010008",
    "name": "Ika South",
    "stateId": "NG010"
  },
  {
    "id": "NG010009",
    "name": "Isoko North",
    "stateId": "NG010"
  },
  {
    "id": "NG010010",
    "name": "Isoko South",
    "stateId": "NG010"
  },
  {
    "id": "NG010011",
    "name": "Ndokwa East",
    "stateId": "NG010"
  },
  {
    "id": "NG010012",
    "name": "Ndokwa West",
    "stateId": "NG010"
  },
  {
    "id": "NG010013",
    "name": "Okpe",
    "stateId": "NG010"
  },
  {
    "id": "NG010014",
    "name": "Oshimili North",
    "stateId": "NG010"
  },
  {
    "id": "NG010015",
    "name": "Oshimili South",
    "stateId": "NG010"
  },
  {
    "id": "NG010016",
    "name": "Patani",
    "stateId": "NG010"
  },
  {
    "id": "NG010017",
    "name": "Sapele",
    "stateId": "NG010"
  },
  {
    "id": "NG010018",
    "name": "Udu",
    "stateId": "NG010"
  },
  {
    "id": "NG010019",
    "name": "Ughelli North",
    "stateId": "NG010"
  },
  {
    "id": "NG010020",
    "name": "Ughelli South",
    "stateId": "NG010"
  },
  {
    "id": "NG010021",
    "name": "Ukwuani",
    "stateId": "NG010"
  },
  {
    "id": "NG010022",
    "name": "Uvwie",
    "stateId": "NG010"
  },
  {
    "id": "NG010023",
    "name": "Warri North",
    "stateId": "NG010"
  },
  {
    "id": "NG010024",
    "name": "Warri South",
    "stateId": "NG010"
  },
  {
    "id": "NG010025",
    "name": "Warri South West",
    "stateId": "NG010"
  },
  {
    "id": "NG011001",
    "name": "Abakaliki",
    "stateId": "NG011"
  },
  {
    "id": "NG011002",
    "name": "Afikpo North",
    "stateId": "NG011"
  },
  {
    "id": "NG011003",
    "name": "Afikpo South",
    "stateId": "NG011"
  },
  {
    "id": "NG011004",
    "name": "Ebonyi",
    "stateId": "NG011"
  },
  {
    "id": "NG011005",
    "name": "Ezza North",
    "stateId": "NG011"
  },
  {
    "id": "NG011006",
    "name": "Ezza South",
    "stateId": "NG011"
  },
  {
    "id": "NG011007",
    "name": "Ikwo",
    "stateId": "NG011"
  },
  {
    "id": "NG011008",
    "name": "Ishielu",
    "stateId": "NG011"
  },
  {
    "id": "NG011009",
    "name": "Ivo",
    "stateId": "NG011"
  },
  {
    "id": "NG011010",
    "name": "Izzi",
    "stateId": "NG011"
  },
  {
    "id": "NG011011",
    "name": "Ohaozara",
    "stateId": "NG011"
  },
  {
    "id": "NG011012",
    "name": "Ohaukwu",
    "stateId": "NG011"
  },
  {
    "id": "NG011013",
    "name": "Onicha",
    "stateId": "NG011"
  },
  {
    "id": "NG012001",
    "name": "Akoko-Edo",
    "stateId": "NG012"
  },
  {
    "id": "NG012002",
    "name": "Egor",
    "stateId": "NG012"
  },
  {
    "id": "NG012003",
    "name": "Esan Central",
    "stateId": "NG012"
  },
  {
    "id": "NG012004",
    "name": "Esan North East",
    "stateId": "NG012"
  },
  {
    "id": "NG012005",
    "name": "Esan South East",
    "stateId": "NG012"
  },
  {
    "id": "NG012006",
    "name": "Esan West",
    "stateId": "NG012"
  },
  {
    "id": "NG012007",
    "name": "Etsako Central",
    "stateId": "NG012"
  },
  {
    "id": "NG012008",
    "name": "Etsako East",
    "stateId": "NG012"
  },
  {
    "id": "NG012009",
    "name": "Etsako West",
    "stateId": "NG012"
  },
  {
    "id": "NG012010",
    "name": "Igueben",
    "stateId": "NG012"
  },
  {
    "id": "NG012011",
    "name": "Ikpoba-Okha",
    "stateId": "NG012"
  },
  {
    "id": "NG012012",
    "name": "Oredo",
    "stateId": "NG012"
  },
  {
    "id": "NG012013",
    "name": "Orhionmwon",
    "stateId": "NG012"
  },
  {
    "id": "NG012014",
    "name": "Ovia North East",
    "stateId": "NG012"
  },
  {
    "id": "NG012015",
    "name": "Ovia South West",
    "stateId": "NG012"
  },
  {
    "id": "NG012016",
    "name": "Owan East",
    "stateId": "NG012"
  },
  {
    "id": "NG012017",
    "name": "Owan West",
    "stateId": "NG012"
  },
  {
    "id": "NG012018",
    "name": "Uhunmwonde",
    "stateId": "NG012"
  },
  {
    "id": "NG013001",
    "name": "Ado Ekiti",
    "stateId": "NG013"
  },
  {
    "id": "NG013002",
    "name": "Aiyekire (Gbonyin)",
    "stateId": "NG013"
  },
  {
    "id": "NG013003",
    "name": "Efon",
    "stateId": "NG013"
  },
  {
    "id": "NG013004",
    "name": "Ekiti East",
    "stateId": "NG013"
  },
  {
    "id": "NG013005",
    "name": "Ekiti South West",
    "stateId": "NG013"
  },
  {
    "id": "NG013006",
    "name": "Ekiti West",
    "stateId": "NG013"
  },
  {
    "id": "NG013007",
    "name": "Emure",
    "stateId": "NG013"
  },
  {
    "id": "NG013008",
    "name": "Ido-Osi",
    "stateId": "NG013"
  },
  {
    "id": "NG013009",
    "name": "Ijero",
    "stateId": "NG013"
  },
  {
    "id": "NG013010",
    "name": "Ikere",
    "stateId": "NG013"
  },
  {
    "id": "NG013011",
    "name": "Ikole",
    "stateId": "NG013"
  },
  {
    "id": "NG013012",
    "name": "Ilejemeji",
    "stateId": "NG013"
  },
  {
    "id": "NG013013",
    "name": "Irepodun/Ifelodun",
    "stateId": "NG013"
  },
  {
    "id": "NG013014",
    "name": "Ise/Orun",
    "stateId": "NG013"
  },
  {
    "id": "NG013015",
    "name": "Moba",
    "stateId": "NG013"
  },
  {
    "id": "NG013016",
    "name": "Oye",
    "stateId": "NG013"
  },
  {
    "id": "NG014001",
    "name": "Aninri",
    "stateId": "NG014"
  },
  {
    "id": "NG014002",
    "name": "Awgu",
    "stateId": "NG014"
  },
  {
    "id": "NG014003",
    "name": "Enugu East",
    "stateId": "NG014"
  },
  {
    "id": "NG014004",
    "name": "Enugu North",
    "stateId": "NG014"
  },
  {
    "id": "NG014005",
    "name": "Enugu South",
    "stateId": "NG014"
  },
  {
    "id": "NG014006",
    "name": "Ezeagu",
    "stateId": "NG014"
  },
  {
    "id": "NG014007",
    "name": "Igbo-Etiti",
    "stateId": "NG014"
  },
  {
    "id": "NG014008",
    "name": "Igbo-Eze North",
    "stateId": "NG014"
  },
  {
    "id": "NG014009",
    "name": "Igbo-Eze South",
    "stateId": "NG014"
  },
  {
    "id": "NG014010",
    "name": "Isi-Uzo",
    "stateId": "NG014"
  },
  {
    "id": "NG014011",
    "name": "Nkanu East",
    "stateId": "NG014"
  },
  {
    "id": "NG014012",
    "name": "Nkanu West",
    "stateId": "NG014"
  },
  {
    "id": "NG014013",
    "name": "Nsukka",
    "stateId": "NG014"
  },
  {
    "id": "NG014014",
    "name": "Oji-River",
    "stateId": "NG014"
  },
  {
    "id": "NG014015",
    "name": "Udenu",
    "stateId": "NG014"
  },
  {
    "id": "NG014016",
    "name": "Udi",
    "stateId": "NG014"
  },
  {
    "id": "NG014017",
    "name": "Uzo-Uwani",
    "stateId": "NG014"
  },
  {
    "id": "NG015001",
    "name": "Abaji",
    "stateId": "NG015"
  },
  {
    "id": "NG015002",
    "name": "Abuja Municipal",
    "stateId": "NG015"
  },
  {
    "id": "NG015003",
    "name": "Bwari",
    "stateId": "NG015"
  },
  {
    "id": "NG015004",
    "name": "Gwagwalada",
    "stateId": "NG015"
  },
  {
    "id": "NG015005",
    "name": "Kuje",
    "stateId": "NG015"
  },
  {
    "id": "NG015006",
    "name": "Kwali",
    "stateId": "NG015"
  },
  {
    "id": "NG016001",
    "name": "Akko",
    "stateId": "NG016"
  },
  {
    "id": "NG016002",
    "name": "Balanga",
    "stateId": "NG016"
  },
  {
    "id": "NG016003",
    "name": "Billiri",
    "stateId": "NG016"
  },
  {
    "id": "NG016004",
    "name": "Dukku",
    "stateId": "NG016"
  },
  {
    "id": "NG016005",
    "name": "Funakaye",
    "stateId": "NG016"
  },
  {
    "id": "NG016006",
    "name": "Gombe",
    "stateId": "NG016"
  },
  {
    "id": "NG016007",
    "name": "Kaltungo",
    "stateId": "NG016"
  },
  {
    "id": "NG016008",
    "name": "Kwami",
    "stateId": "NG016"
  },
  {
    "id": "NG016009",
    "name": "Nafada",
    "stateId": "NG016"
  },
  {
    "id": "NG016010",
    "name": "Shomgom",
    "stateId": "NG016"
  },
  {
    "id": "NG016011",
    "name": "Yamaltu/Deba",
    "stateId": "NG016"
  },
  {
    "id": "NG017001",
    "name": "Aboh-Mbaise",
    "stateId": "NG017"
  },
  {
    "id": "NG017002",
    "name": "Ahiazu-Mbaise",
    "stateId": "NG017"
  },
  {
    "id": "NG017003",
    "name": "Ehime-Mbano",
    "stateId": "NG017"
  },
  {
    "id": "NG017004",
    "name": "Ezinihitte",
    "stateId": "NG017"
  },
  {
    "id": "NG017005",
    "name": "Ideato North",
    "stateId": "NG017"
  },
  {
    "id": "NG017006",
    "name": "Ideato South",
    "stateId": "NG017"
  },
  {
    "id": "NG017007",
    "name": "Ihitte/Uboma",
    "stateId": "NG017"
  },
  {
    "id": "NG017008",
    "name": "Ikeduru",
    "stateId": "NG017"
  },
  {
    "id": "NG017009",
    "name": "Isiala Mbano",
    "stateId": "NG017"
  },
  {
    "id": "NG017010",
    "name": "Isu",
    "stateId": "NG017"
  },
  {
    "id": "NG017011",
    "name": "Mbaitoli",
    "stateId": "NG017"
  },
  {
    "id": "NG017012",
    "name": "Ngor-Okpala",
    "stateId": "NG017"
  },
  {
    "id": "NG017013",
    "name": "Njaba",
    "stateId": "NG017"
  },
  {
    "id": "NG017014",
    "name": "Nkwerre",
    "stateId": "NG017"
  },
  {
    "id": "NG017015",
    "name": "Nwangele",
    "stateId": "NG017"
  },
  {
    "id": "NG017016",
    "name": "Obowo",
    "stateId": "NG017"
  },
  {
    "id": "NG017017",
    "name": "Oguta",
    "stateId": "NG017"
  },
  {
    "id": "NG017018",
    "name": "Ohaji/Egbema",
    "stateId": "NG017"
  },
  {
    "id": "NG017019",
    "name": "Okigwe",
    "stateId": "NG017"
  },
  {
    "id": "NG017020",
    "name": "Orlu",
    "stateId": "NG017"
  },
  {
    "id": "NG017021",
    "name": "Orsu",
    "stateId": "NG017"
  },
  {
    "id": "NG017022",
    "name": "Oru East",
    "stateId": "NG017"
  },
  {
    "id": "NG017023",
    "name": "Oru West",
    "stateId": "NG017"
  },
  {
    "id": "NG017024",
    "name": "Owerri North",
    "stateId": "NG017"
  },
  {
    "id": "NG017025",
    "name": "Owerri West",
    "stateId": "NG017"
  },
  {
    "id": "NG017026",
    "name": "Owerri-Municipal",
    "stateId": "NG017"
  },
  {
    "id": "NG017027",
    "name": "Unuimo",
    "stateId": "NG017"
  },
  {
    "id": "NG018001",
    "name": "Auyo",
    "stateId": "NG018"
  },
  {
    "id": "NG018002",
    "name": "Babura",
    "stateId": "NG018"
  },
  {
    "id": "NG018003",
    "name": "Biriniwa",
    "stateId": "NG018"
  },
  {
    "id": "NG018004",
    "name": "Birni Kudu",
    "stateId": "NG018"
  },
  {
    "id": "NG018005",
    "name": "Buji",
    "stateId": "NG018"
  },
  {
    "id": "NG018006",
    "name": "Dutse",
    "stateId": "NG018"
  },
  {
    "id": "NG018007",
    "name": "Gagarawa",
    "stateId": "NG018"
  },
  {
    "id": "NG018008",
    "name": "Garki",
    "stateId": "NG018"
  },
  {
    "id": "NG018009",
    "name": "Gumel",
    "stateId": "NG018"
  },
  {
    "id": "NG018010",
    "name": "Guri",
    "stateId": "NG018"
  },
  {
    "id": "NG018011",
    "name": "Gwaram",
    "stateId": "NG018"
  },
  {
    "id": "NG018012",
    "name": "Gwiwa",
    "stateId": "NG018"
  },
  {
    "id": "NG018013",
    "name": "Hadejia",
    "stateId": "NG018"
  },
  {
    "id": "NG018014",
    "name": "Jahun",
    "stateId": "NG018"
  },
  {
    "id": "NG018015",
    "name": "Kafin Hausa",
    "stateId": "NG018"
  },
  {
    "id": "NG018016",
    "name": "Kaugama",
    "stateId": "NG018"
  },
  {
    "id": "NG018017",
    "name": "Kazaure",
    "stateId": "NG018"
  },
  {
    "id": "NG018018",
    "name": "Kiri Kasamma",
    "stateId": "NG018"
  },
  {
    "id": "NG018019",
    "name": "Kiyawa",
    "stateId": "NG018"
  },
  {
    "id": "NG018020",
    "name": "Maigatari",
    "stateId": "NG018"
  },
  {
    "id": "NG018021",
    "name": "Malam Madori",
    "stateId": "NG018"
  },
  {
    "id": "NG018022",
    "name": "Miga",
    "stateId": "NG018"
  },
  {
    "id": "NG018023",
    "name": "Ringim",
    "stateId": "NG018"
  },
  {
    "id": "NG018024",
    "name": "Roni",
    "stateId": "NG018"
  },
  {
    "id": "NG018025",
    "name": "Sule-Tankarkar",
    "stateId": "NG018"
  },
  {
    "id": "NG018026",
    "name": "Taura",
    "stateId": "NG018"
  },
  {
    "id": "NG018027",
    "name": "Yankwashi",
    "stateId": "NG018"
  },
  {
    "id": "NG019001",
    "name": "Birnin-Gwari",
    "stateId": "NG019"
  },
  {
    "id": "NG019002",
    "name": "Chikun",
    "stateId": "NG019"
  },
  {
    "id": "NG019003",
    "name": "Giwa",
    "stateId": "NG019"
  },
  {
    "id": "NG019004",
    "name": "Igabi",
    "stateId": "NG019"
  },
  {
    "id": "NG019005",
    "name": "Ikara",
    "stateId": "NG019"
  },
  {
    "id": "NG019006",
    "name": "Jaba",
    "stateId": "NG019"
  },
  {
    "id": "NG019007",
    "name": "Jema'a",
    "stateId": "NG019"
  },
  {
    "id": "NG019008",
    "name": "Kachia",
    "stateId": "NG019"
  },
  {
    "id": "NG019009",
    "name": "Kaduna North",
    "stateId": "NG019"
  },
  {
    "id": "NG019010",
    "name": "Kaduna South",
    "stateId": "NG019"
  },
  {
    "id": "NG019011",
    "name": "Kagarko",
    "stateId": "NG019"
  },
  {
    "id": "NG019012",
    "name": "Kajuru",
    "stateId": "NG019"
  },
  {
    "id": "NG019013",
    "name": "Kaura",
    "stateId": "NG019"
  },
  {
    "id": "NG019014",
    "name": "Kauru",
    "stateId": "NG019"
  },
  {
    "id": "NG019015",
    "name": "Kubau",
    "stateId": "NG019"
  },
  {
    "id": "NG019016",
    "name": "Kudan",
    "stateId": "NG019"
  },
  {
    "id": "NG019017",
    "name": "Lere",
    "stateId": "NG019"
  },
  {
    "id": "NG019018",
    "name": "Markafi",
    "stateId": "NG019"
  },
  {
    "id": "NG019019",
    "name": "Sabon-Gari",
    "stateId": "NG019"
  },
  {
    "id": "NG019020",
    "name": "Sanga",
    "stateId": "NG019"
  },
  {
    "id": "NG019021",
    "name": "Soba",
    "stateId": "NG019"
  },
  {
    "id": "NG019022",
    "name": "Zango-Kataf",
    "stateId": "NG019"
  },
  {
    "id": "NG019023",
    "name": "Zaria",
    "stateId": "NG019"
  },
  {
    "id": "NG020001",
    "name": "Ajingi",
    "stateId": "NG020"
  },
  {
    "id": "NG020002",
    "name": "Albasu",
    "stateId": "NG020"
  },
  {
    "id": "NG020003",
    "name": "Bagwai",
    "stateId": "NG020"
  },
  {
    "id": "NG020004",
    "name": "Bebeji",
    "stateId": "NG020"
  },
  {
    "id": "NG020005",
    "name": "Bichi",
    "stateId": "NG020"
  },
  {
    "id": "NG020006",
    "name": "Bunkure",
    "stateId": "NG020"
  },
  {
    "id": "NG020007",
    "name": "Dala",
    "stateId": "NG020"
  },
  {
    "id": "NG020008",
    "name": "Dambatta",
    "stateId": "NG020"
  },
  {
    "id": "NG020009",
    "name": "Dawakin Kudu",
    "stateId": "NG020"
  },
  {
    "id": "NG020010",
    "name": "Dawakin Tofa",
    "stateId": "NG020"
  },
  {
    "id": "NG020011",
    "name": "Doguwa",
    "stateId": "NG020"
  },
  {
    "id": "NG020012",
    "name": "Fagge",
    "stateId": "NG020"
  },
  {
    "id": "NG020013",
    "name": "Gabasawa",
    "stateId": "NG020"
  },
  {
    "id": "NG020014",
    "name": "Garko",
    "stateId": "NG020"
  },
  {
    "id": "NG020015",
    "name": "Garum Mallam",
    "stateId": "NG020"
  },
  {
    "id": "NG020016",
    "name": "Gaya",
    "stateId": "NG020"
  },
  {
    "id": "NG020017",
    "name": "Gezawa",
    "stateId": "NG020"
  },
  {
    "id": "NG020018",
    "name": "Gwale",
    "stateId": "NG020"
  },
  {
    "id": "NG020019",
    "name": "Gwarzo",
    "stateId": "NG020"
  },
  {
    "id": "NG020020",
    "name": "Kabo",
    "stateId": "NG020"
  },
  {
    "id": "NG020021",
    "name": "Kano Municipal",
    "stateId": "NG020"
  },
  {
    "id": "NG020022",
    "name": "Karaye",
    "stateId": "NG020"
  },
  {
    "id": "NG020023",
    "name": "Kibiya",
    "stateId": "NG020"
  },
  {
    "id": "NG020024",
    "name": "Kiru",
    "stateId": "NG020"
  },
  {
    "id": "NG020025",
    "name": "Kumbotso",
    "stateId": "NG020"
  },
  {
    "id": "NG020026",
    "name": "Kunchi",
    "stateId": "NG020"
  },
  {
    "id": "NG020027",
    "name": "Kura",
    "stateId": "NG020"
  },
  {
    "id": "NG020028",
    "name": "Madobi",
    "stateId": "NG020"
  },
  {
    "id": "NG020029",
    "name": "Makoda",
    "stateId": "NG020"
  },
  {
    "id": "NG020030",
    "name": "Minjibir",
    "stateId": "NG020"
  },
  {
    "id": "NG020031",
    "name": "Nasarawa",
    "stateId": "NG020"
  },
  {
    "id": "NG020032",
    "name": "Rano",
    "stateId": "NG020"
  },
  {
    "id": "NG020033",
    "name": "Rimin Gado",
    "stateId": "NG020"
  },
  {
    "id": "NG020034",
    "name": "Rogo",
    "stateId": "NG020"
  },
  {
    "id": "NG020035",
    "name": "Shanono",
    "stateId": "NG020"
  },
  {
    "id": "NG020036",
    "name": "Sumaila",
    "stateId": "NG020"
  },
  {
    "id": "NG020037",
    "name": "Takai",
    "stateId": "NG020"
  },
  {
    "id": "NG020038",
    "name": "Tarauni",
    "stateId": "NG020"
  },
  {
    "id": "NG020039",
    "name": "Tofa",
    "stateId": "NG020"
  },
  {
    "id": "NG020040",
    "name": "Tsanyawa",
    "stateId": "NG020"
  },
  {
    "id": "NG020041",
    "name": "Tudun Wada",
    "stateId": "NG020"
  },
  {
    "id": "NG020042",
    "name": "Ungogo",
    "stateId": "NG020"
  },
  {
    "id": "NG020043",
    "name": "Warawa",
    "stateId": "NG020"
  },
  {
    "id": "NG020044",
    "name": "Wudil",
    "stateId": "NG020"
  },
  {
    "id": "NG021001",
    "name": "Bakori",
    "stateId": "NG021"
  },
  {
    "id": "NG021002",
    "name": "Batagarawa",
    "stateId": "NG021"
  },
  {
    "id": "NG021003",
    "name": "Batsari",
    "stateId": "NG021"
  },
  {
    "id": "NG021004",
    "name": "Baure",
    "stateId": "NG021"
  },
  {
    "id": "NG021005",
    "name": "Bindawa",
    "stateId": "NG021"
  },
  {
    "id": "NG021006",
    "name": "Charanchi",
    "stateId": "NG021"
  },
  {
    "id": "NG021007",
    "name": "Dan Musa",
    "stateId": "NG021"
  },
  {
    "id": "NG021008",
    "name": "Dandume",
    "stateId": "NG021"
  },
  {
    "id": "NG021009",
    "name": "Danja",
    "stateId": "NG021"
  },
  {
    "id": "NG021010",
    "name": "Daura",
    "stateId": "NG021"
  },
  {
    "id": "NG021011",
    "name": "Dutsi",
    "stateId": "NG021"
  },
  {
    "id": "NG021012",
    "name": "Dutsin-Ma",
    "stateId": "NG021"
  },
  {
    "id": "NG021013",
    "name": "Faskari",
    "stateId": "NG021"
  },
  {
    "id": "NG021014",
    "name": "Funtua",
    "stateId": "NG021"
  },
  {
    "id": "NG021015",
    "name": "Ingawa",
    "stateId": "NG021"
  },
  {
    "id": "NG021016",
    "name": "Jibia",
    "stateId": "NG021"
  },
  {
    "id": "NG021017",
    "name": "Kafur",
    "stateId": "NG021"
  },
  {
    "id": "NG021018",
    "name": "Kaita",
    "stateId": "NG021"
  },
  {
    "id": "NG021019",
    "name": "Kankara",
    "stateId": "NG021"
  },
  {
    "id": "NG021020",
    "name": "Kankia",
    "stateId": "NG021"
  },
  {
    "id": "NG021021",
    "name": "Katsina",
    "stateId": "NG021"
  },
  {
    "id": "NG021022",
    "name": "Kurfi",
    "stateId": "NG021"
  },
  {
    "id": "NG021023",
    "name": "Kusada",
    "stateId": "NG021"
  },
  {
    "id": "NG021024",
    "name": "Mai'adua",
    "stateId": "NG021"
  },
  {
    "id": "NG021025",
    "name": "Malumfashi",
    "stateId": "NG021"
  },
  {
    "id": "NG021026",
    "name": "Mani",
    "stateId": "NG021"
  },
  {
    "id": "NG021027",
    "name": "Mashi",
    "stateId": "NG021"
  },
  {
    "id": "NG021028",
    "name": "Matazu",
    "stateId": "NG021"
  },
  {
    "id": "NG021029",
    "name": "Musawa",
    "stateId": "NG021"
  },
  {
    "id": "NG021030",
    "name": "Rimi",
    "stateId": "NG021"
  },
  {
    "id": "NG021031",
    "name": "Sabuwa",
    "stateId": "NG021"
  },
  {
    "id": "NG021032",
    "name": "Safana",
    "stateId": "NG021"
  },
  {
    "id": "NG021033",
    "name": "Sandamu",
    "stateId": "NG021"
  },
  {
    "id": "NG021034",
    "name": "Zango",
    "stateId": "NG021"
  },
  {
    "id": "NG022001",
    "name": "Aleiro",
    "stateId": "NG022"
  },
  {
    "id": "NG022002",
    "name": "Arewa-Dandi",
    "stateId": "NG022"
  },
  {
    "id": "NG022003",
    "name": "Argungu",
    "stateId": "NG022"
  },
  {
    "id": "NG022004",
    "name": "Augie",
    "stateId": "NG022"
  },
  {
    "id": "NG022005",
    "name": "Bagudo",
    "stateId": "NG022"
  },
  {
    "id": "NG022006",
    "name": "Birnin Kebbi",
    "stateId": "NG022"
  },
  {
    "id": "NG022007",
    "name": "Bunza",
    "stateId": "NG022"
  },
  {
    "id": "NG022008",
    "name": "Dandi",
    "stateId": "NG022"
  },
  {
    "id": "NG022009",
    "name": "Fakai",
    "stateId": "NG022"
  },
  {
    "id": "NG022010",
    "name": "Gwandu",
    "stateId": "NG022"
  },
  {
    "id": "NG022011",
    "name": "Jega",
    "stateId": "NG022"
  },
  {
    "id": "NG022012",
    "name": "Kalgo",
    "stateId": "NG022"
  },
  {
    "id": "NG022013",
    "name": "Koko/Besse",
    "stateId": "NG022"
  },
  {
    "id": "NG022014",
    "name": "Maiyama",
    "stateId": "NG022"
  },
  {
    "id": "NG022015",
    "name": "Ngaski",
    "stateId": "NG022"
  },
  {
    "id": "NG022016",
    "name": "Sakaba",
    "stateId": "NG022"
  },
  {
    "id": "NG022017",
    "name": "Shanga",
    "stateId": "NG022"
  },
  {
    "id": "NG022018",
    "name": "Suru",
    "stateId": "NG022"
  },
  {
    "id": "NG022019",
    "name": "Wasagu/Danko",
    "stateId": "NG022"
  },
  {
    "id": "NG022020",
    "name": "Yauri",
    "stateId": "NG022"
  },
  {
    "id": "NG022021",
    "name": "Zuru",
    "stateId": "NG022"
  },
  {
    "id": "NG023001",
    "name": "Adavi",
    "stateId": "NG023"
  },
  {
    "id": "NG023002",
    "name": "Ajaokuta",
    "stateId": "NG023"
  },
  {
    "id": "NG023003",
    "name": "Ankpa",
    "stateId": "NG023"
  },
  {
    "id": "NG023004",
    "name": "Bassa",
    "stateId": "NG023"
  },
  {
    "id": "NG023005",
    "name": "Dekina",
    "stateId": "NG023"
  },
  {
    "id": "NG023006",
    "name": "Ibaji",
    "stateId": "NG023"
  },
  {
    "id": "NG023007",
    "name": "Idah",
    "stateId": "NG023"
  },
  {
    "id": "NG023008",
    "name": "Igalamela-Odolu",
    "stateId": "NG023"
  },
  {
    "id": "NG023009",
    "name": "Ijumu",
    "stateId": "NG023"
  },
  {
    "id": "NG023010",
    "name": "Kabba/Bunu",
    "stateId": "NG023"
  },
  {
    "id": "NG023011",
    "name": "Kogi",
    "stateId": "NG023"
  },
  {
    "id": "NG023012",
    "name": "Lokoja",
    "stateId": "NG023"
  },
  {
    "id": "NG023013",
    "name": "Mopa-Muro",
    "stateId": "NG023"
  },
  {
    "id": "NG023014",
    "name": "Ofu",
    "stateId": "NG023"
  },
  {
    "id": "NG023015",
    "name": "Ogori/Magongo",
    "stateId": "NG023"
  },
  {
    "id": "NG023016",
    "name": "Okehi",
    "stateId": "NG023"
  },
  {
    "id": "NG023017",
    "name": "Okene",
    "stateId": "NG023"
  },
  {
    "id": "NG023018",
    "name": "Olamabolo",
    "stateId": "NG023"
  },
  {
    "id": "NG023019",
    "name": "Omala",
    "stateId": "NG023"
  },
  {
    "id": "NG023020",
    "name": "Yagba East",
    "stateId": "NG023"
  },
  {
    "id": "NG023021",
    "name": "Yagba West",
    "stateId": "NG023"
  },
  {
    "id": "NG024001",
    "name": "Asa",
    "stateId": "NG024"
  },
  {
    "id": "NG024002",
    "name": "Baruten",
    "stateId": "NG024"
  },
  {
    "id": "NG024003",
    "name": "Edu",
    "stateId": "NG024"
  },
  {
    "id": "NG024004",
    "name": "Ekiti",
    "stateId": "NG024"
  },
  {
    "id": "NG024005",
    "name": "Ifelodun",
    "stateId": "NG024"
  },
  {
    "id": "NG024006",
    "name": "Ilorin East",
    "stateId": "NG024"
  },
  {
    "id": "NG024007",
    "name": "Ilorin South",
    "stateId": "NG024"
  },
  {
    "id": "NG024008",
    "name": "Ilorin West",
    "stateId": "NG024"
  },
  {
    "id": "NG024009",
    "name": "Irepodun",
    "stateId": "NG024"
  },
  {
    "id": "NG024010",
    "name": "Isin",
    "stateId": "NG024"
  },
  {
    "id": "NG024011",
    "name": "Kaiama",
    "stateId": "NG024"
  },
  {
    "id": "NG024012",
    "name": "Moro",
    "stateId": "NG024"
  },
  {
    "id": "NG024013",
    "name": "Offa",
    "stateId": "NG024"
  },
  {
    "id": "NG024014",
    "name": "Oke-Ero",
    "stateId": "NG024"
  },
  {
    "id": "NG024015",
    "name": "Oyun",
    "stateId": "NG024"
  },
  {
    "id": "NG024016",
    "name": "Pategi",
    "stateId": "NG024"
  },
  {
    "id": "NG025001",
    "name": "Agege",
    "stateId": "NG025"
  },
  {
    "id": "NG025002",
    "name": "Ajeromi-Ifelodun",
    "stateId": "NG025"
  },
  {
    "id": "NG025003",
    "name": "Alimosho",
    "stateId": "NG025"
  },
  {
    "id": "NG025004",
    "name": "Amuwo-Odofin",
    "stateId": "NG025"
  },
  {
    "id": "NG025005",
    "name": "Apapa",
    "stateId": "NG025"
  },
  {
    "id": "NG025006",
    "name": "Badagry",
    "stateId": "NG025"
  },
  {
    "id": "NG025007",
    "name": "Epe",
    "stateId": "NG025"
  },
  {
    "id": "NG025008",
    "name": "Eti-Osa",
    "stateId": "NG025"
  },
  {
    "id": "NG025009",
    "name": "Ibeju/Lekki",
    "stateId": "NG025"
  },
  {
    "id": "NG025010",
    "name": "Ifako-Ijaye",
    "stateId": "NG025"
  },
  {
    "id": "NG025011",
    "name": "Ikeja",
    "stateId": "NG025"
  },
  {
    "id": "NG025012",
    "name": "Ikorodu",
    "stateId": "NG025"
  },
  {
    "id": "NG025013",
    "name": "Kosofe",
    "stateId": "NG025"
  },
  {
    "id": "NG025014",
    "name": "Lagos Island",
    "stateId": "NG025"
  },
  {
    "id": "NG025015",
    "name": "Lagos Mainland",
    "stateId": "NG025"
  },
  {
    "id": "NG025016",
    "name": "Mushin",
    "stateId": "NG025"
  },
  {
    "id": "NG025017",
    "name": "Ojo",
    "stateId": "NG025"
  },
  {
    "id": "NG025018",
    "name": "Oshodi-Isolo",
    "stateId": "NG025"
  },
  {
    "id": "NG025019",
    "name": "Shomolu",
    "stateId": "NG025"
  },
  {
    "id": "NG025020",
    "name": "Surulere",
    "stateId": "NG025"
  },
  {
    "id": "NG026001",
    "name": "Akwanga",
    "stateId": "NG026"
  },
  {
    "id": "NG026002",
    "name": "Awe",
    "stateId": "NG026"
  },
  {
    "id": "NG026003",
    "name": "Doma",
    "stateId": "NG026"
  },
  {
    "id": "NG026004",
    "name": "Karu",
    "stateId": "NG026"
  },
  {
    "id": "NG026005",
    "name": "Keana",
    "stateId": "NG026"
  },
  {
    "id": "NG026006",
    "name": "Keffi",
    "stateId": "NG026"
  },
  {
    "id": "NG026007",
    "name": "Kokona",
    "stateId": "NG026"
  },
  {
    "id": "NG026008",
    "name": "Lafia",
    "stateId": "NG026"
  },
  {
    "id": "NG026009",
    "name": "Nasarawa",
    "stateId": "NG026"
  },
  {
    "id": "NG026010",
    "name": "Nasarawa-Eggon",
    "stateId": "NG026"
  },
  {
    "id": "NG026011",
    "name": "Obi",
    "stateId": "NG026"
  },
  {
    "id": "NG026012",
    "name": "Toto",
    "stateId": "NG026"
  },
  {
    "id": "NG026013",
    "name": "Wamba",
    "stateId": "NG026"
  },
  {
    "id": "NG027001",
    "name": "Agaie",
    "stateId": "NG027"
  },
  {
    "id": "NG027002",
    "name": "Agwara",
    "stateId": "NG027"
  },
  {
    "id": "NG027003",
    "name": "Bida",
    "stateId": "NG027"
  },
  {
    "id": "NG027004",
    "name": "Borgu",
    "stateId": "NG027"
  },
  {
    "id": "NG027005",
    "name": "Bosso",
    "stateId": "NG027"
  },
  {
    "id": "NG027006",
    "name": "Chanchaga",
    "stateId": "NG027"
  },
  {
    "id": "NG027007",
    "name": "Edati",
    "stateId": "NG027"
  },
  {
    "id": "NG027008",
    "name": "Gbako",
    "stateId": "NG027"
  },
  {
    "id": "NG027009",
    "name": "Gurara",
    "stateId": "NG027"
  },
  {
    "id": "NG027010",
    "name": "Katcha",
    "stateId": "NG027"
  },
  {
    "id": "NG027011",
    "name": "Kontagora",
    "stateId": "NG027"
  },
  {
    "id": "NG027012",
    "name": "Lapai",
    "stateId": "NG027"
  },
  {
    "id": "NG027013",
    "name": "Lavun",
    "stateId": "NG027"
  },
  {
    "id": "NG027014",
    "name": "Magama",
    "stateId": "NG027"
  },
  {
    "id": "NG027015",
    "name": "Mariga",
    "stateId": "NG027"
  },
  {
    "id": "NG027016",
    "name": "Mashegu",
    "stateId": "NG027"
  },
  {
    "id": "NG027017",
    "name": "Mokwa",
    "stateId": "NG027"
  },
  {
    "id": "NG027018",
    "name": "Muya",
    "stateId": "NG027"
  },
  {
    "id": "NG027019",
    "name": "Paikoro",
    "stateId": "NG027"
  },
  {
    "id": "NG027020",
    "name": "Rafi",
    "stateId": "NG027"
  },
  {
    "id": "NG027021",
    "name": "Rijau",
    "stateId": "NG027"
  },
  {
    "id": "NG027022",
    "name": "Shiroro",
    "stateId": "NG027"
  },
  {
    "id": "NG027023",
    "name": "Suleja",
    "stateId": "NG027"
  },
  {
    "id": "NG027024",
    "name": "Tafa",
    "stateId": "NG027"
  },
  {
    "id": "NG027025",
    "name": "Wushishi",
    "stateId": "NG027"
  },
  {
    "id": "NG028001",
    "name": "Abeokuta North",
    "stateId": "NG028"
  },
  {
    "id": "NG028002",
    "name": "Abeokuta South",
    "stateId": "NG028"
  },
  {
    "id": "NG028003",
    "name": "Ado-Odo/Ota",
    "stateId": "NG028"
  },
  {
    "id": "NG028004",
    "name": "Egbado North",
    "stateId": "NG028"
  },
  {
    "id": "NG028005",
    "name": "Egbado South",
    "stateId": "NG028"
  },
  {
    "id": "NG028006",
    "name": "Ewekoro",
    "stateId": "NG028"
  },
  {
    "id": "NG028007",
    "name": "Ifo",
    "stateId": "NG028"
  },
  {
    "id": "NG028008",
    "name": "Ijebu East",
    "stateId": "NG028"
  },
  {
    "id": "NG028009",
    "name": "Ijebu North",
    "stateId": "NG028"
  },
  {
    "id": "NG028010",
    "name": "Ijebu North East",
    "stateId": "NG028"
  },
  {
    "id": "NG028011",
    "name": "Ijebu Ode",
    "stateId": "NG028"
  },
  {
    "id": "NG028012",
    "name": "Ikenne",
    "stateId": "NG028"
  },
  {
    "id": "NG028013",
    "name": "Imeko-Afon",
    "stateId": "NG028"
  },
  {
    "id": "NG028014",
    "name": "Ipokia",
    "stateId": "NG028"
  },
  {
    "id": "NG028015",
    "name": "Obafemi-Owode",
    "stateId": "NG028"
  },
  {
    "id": "NG028016",
    "name": "Odeda",
    "stateId": "NG028"
  },
  {
    "id": "NG028017",
    "name": "Odogbolu",
    "stateId": "NG028"
  },
  {
    "id": "NG028018",
    "name": "Ogun waterside",
    "stateId": "NG028"
  },
  {
    "id": "NG028019",
    "name": "Remo North",
    "stateId": "NG028"
  },
  {
    "id": "NG028020",
    "name": "Shagamu",
    "stateId": "NG028"
  },
  {
    "id": "NG029001",
    "name": "Akoko North East",
    "stateId": "NG029"
  },
  {
    "id": "NG029002",
    "name": "Akoko North West",
    "stateId": "NG029"
  },
  {
    "id": "NG029003",
    "name": "Akoko South East",
    "stateId": "NG029"
  },
  {
    "id": "NG029004",
    "name": "Akoko South West",
    "stateId": "NG029"
  },
  {
    "id": "NG029005",
    "name": "Akure North",
    "stateId": "NG029"
  },
  {
    "id": "NG029006",
    "name": "Akure South",
    "stateId": "NG029"
  },
  {
    "id": "NG029007",
    "name": "Ese-Odo",
    "stateId": "NG029"
  },
  {
    "id": "NG029008",
    "name": "Idanre",
    "stateId": "NG029"
  },
  {
    "id": "NG029009",
    "name": "Ifedore",
    "stateId": "NG029"
  },
  {
    "id": "NG029010",
    "name": "Ilaje",
    "stateId": "NG029"
  },
  {
    "id": "NG029011",
    "name": "Ile-Oluji-Okeigbo",
    "stateId": "NG029"
  },
  {
    "id": "NG029012",
    "name": "Irele",
    "stateId": "NG029"
  },
  {
    "id": "NG029013",
    "name": "Odigbo",
    "stateId": "NG029"
  },
  {
    "id": "NG029014",
    "name": "Okitipupa",
    "stateId": "NG029"
  },
  {
    "id": "NG029015",
    "name": "Ondo East",
    "stateId": "NG029"
  },
  {
    "id": "NG029016",
    "name": "Ondo West",
    "stateId": "NG029"
  },
  {
    "id": "NG029017",
    "name": "Ose",
    "stateId": "NG029"
  },
  {
    "id": "NG029018",
    "name": "Owo",
    "stateId": "NG029"
  },
  {
    "id": "NG030001",
    "name": "Aiyedade",
    "stateId": "NG030"
  },
  {
    "id": "NG030002",
    "name": "Aiyedire",
    "stateId": "NG030"
  },
  {
    "id": "NG030003",
    "name": "Atakumosa East",
    "stateId": "NG030"
  },
  {
    "id": "NG030004",
    "name": "Atakumosa West",
    "stateId": "NG030"
  },
  {
    "id": "NG030005",
    "name": "Boluwaduro",
    "stateId": "NG030"
  },
  {
    "id": "NG030006",
    "name": "Boripe",
    "stateId": "NG030"
  },
  {
    "id": "NG030007",
    "name": "Ede North",
    "stateId": "NG030"
  },
  {
    "id": "NG030008",
    "name": "Ede South",
    "stateId": "NG030"
  },
  {
    "id": "NG030009",
    "name": "Egbedore",
    "stateId": "NG030"
  },
  {
    "id": "NG030010",
    "name": "Ejigbo",
    "stateId": "NG030"
  },
  {
    "id": "NG030011",
    "name": "Ife Central",
    "stateId": "NG030"
  },
  {
    "id": "NG030012",
    "name": "Ife East",
    "stateId": "NG030"
  },
  {
    "id": "NG030013",
    "name": "Ife North",
    "stateId": "NG030"
  },
  {
    "id": "NG030014",
    "name": "Ife South",
    "stateId": "NG030"
  },
  {
    "id": "NG030015",
    "name": "Ifedayo",
    "stateId": "NG030"
  },
  {
    "id": "NG030016",
    "name": "Ifelodun",
    "stateId": "NG030"
  },
  {
    "id": "NG030017",
    "name": "Ila",
    "stateId": "NG030"
  },
  {
    "id": "NG030018",
    "name": "Ilesha East",
    "stateId": "NG030"
  },
  {
    "id": "NG030019",
    "name": "Ilesha West",
    "stateId": "NG030"
  },
  {
    "id": "NG030020",
    "name": "Irepodun",
    "stateId": "NG030"
  },
  {
    "id": "NG030021",
    "name": "Irewole",
    "stateId": "NG030"
  },
  {
    "id": "NG030022",
    "name": "Isokan",
    "stateId": "NG030"
  },
  {
    "id": "NG030023",
    "name": "Iwo",
    "stateId": "NG030"
  },
  {
    "id": "NG030024",
    "name": "Obokun",
    "stateId": "NG030"
  },
  {
    "id": "NG030025",
    "name": "Odo-Otin",
    "stateId": "NG030"
  },
  {
    "id": "NG030026",
    "name": "Ola-oluwa",
    "stateId": "NG030"
  },
  {
    "id": "NG030027",
    "name": "Olorunda",
    "stateId": "NG030"
  },
  {
    "id": "NG030028",
    "name": "Oriade",
    "stateId": "NG030"
  },
  {
    "id": "NG030029",
    "name": "Orolu",
    "stateId": "NG030"
  },
  {
    "id": "NG030030",
    "name": "Osogbo",
    "stateId": "NG030"
  },
  {
    "id": "NG031001",
    "name": "Afijio",
    "stateId": "NG031"
  },
  {
    "id": "NG031002",
    "name": "Akinyele",
    "stateId": "NG031"
  },
  {
    "id": "NG031003",
    "name": "Atiba",
    "stateId": "NG031"
  },
  {
    "id": "NG031004",
    "name": "Atigbo",
    "stateId": "NG031"
  },
  {
    "id": "NG031005",
    "name": "Egbeda",
    "stateId": "NG031"
  },
  {
    "id": "NG031006",
    "name": "Ibadan North",
    "stateId": "NG031"
  },
  {
    "id": "NG031007",
    "name": "Ibadan North East",
    "stateId": "NG031"
  },
  {
    "id": "NG031008",
    "name": "Ibadan North West",
    "stateId": "NG031"
  },
  {
    "id": "NG031009",
    "name": "Ibadan South East",
    "stateId": "NG031"
  },
  {
    "id": "NG031010",
    "name": "Ibadan South West",
    "stateId": "NG031"
  },
  {
    "id": "NG031011",
    "name": "Ibarapa Central",
    "stateId": "NG031"
  },
  {
    "id": "NG031012",
    "name": "Ibarapa East",
    "stateId": "NG031"
  },
  {
    "id": "NG031013",
    "name": "Ibarapa North",
    "stateId": "NG031"
  },
  {
    "id": "NG031014",
    "name": "Ido",
    "stateId": "NG031"
  },
  {
    "id": "NG031015",
    "name": "Irepo",
    "stateId": "NG031"
  },
  {
    "id": "NG031016",
    "name": "Iseyin",
    "stateId": "NG031"
  },
  {
    "id": "NG031017",
    "name": "Itesiwaju",
    "stateId": "NG031"
  },
  {
    "id": "NG031018",
    "name": "Iwajowa",
    "stateId": "NG031"
  },
  {
    "id": "NG031019",
    "name": "Kajola",
    "stateId": "NG031"
  },
  {
    "id": "NG031020",
    "name": "Lagelu",
    "stateId": "NG031"
  },
  {
    "id": "NG031021",
    "name": "Ogbomosho North",
    "stateId": "NG031"
  },
  {
    "id": "NG031022",
    "name": "Ogbomosho South",
    "stateId": "NG031"
  },
  {
    "id": "NG031023",
    "name": "Ogo Oluwa",
    "stateId": "NG031"
  },
  {
    "id": "NG031024",
    "name": "Olorunsogo",
    "stateId": "NG031"
  },
  {
    "id": "NG031025",
    "name": "Oluyole",
    "stateId": "NG031"
  },
  {
    "id": "NG031026",
    "name": "Ona-Ara",
    "stateId": "NG031"
  },
  {
    "id": "NG031027",
    "name": "Orelope",
    "stateId": "NG031"
  },
  {
    "id": "NG031028",
    "name": "Ori Ire",
    "stateId": "NG031"
  },
  {
    "id": "NG031029",
    "name": "Oyo East",
    "stateId": "NG031"
  },
  {
    "id": "NG031030",
    "name": "Oyo West",
    "stateId": "NG031"
  },
  {
    "id": "NG031031",
    "name": "Saki East",
    "stateId": "NG031"
  },
  {
    "id": "NG031032",
    "name": "Saki West",
    "stateId": "NG031"
  },
  {
    "id": "NG031033",
    "name": "Surulere",
    "stateId": "NG031"
  },
  {
    "id": "NG032001",
    "name": "Barikin Ladi",
    "stateId": "NG032"
  },
  {
    "id": "NG032002",
    "name": "Bassa",
    "stateId": "NG032"
  },
  {
    "id": "NG032003",
    "name": "Bokkos",
    "stateId": "NG032"
  },
  {
    "id": "NG032004",
    "name": "Jos East",
    "stateId": "NG032"
  },
  {
    "id": "NG032005",
    "name": "Jos North",
    "stateId": "NG032"
  },
  {
    "id": "NG032006",
    "name": "Jos South",
    "stateId": "NG032"
  },
  {
    "id": "NG032007",
    "name": "Kanam",
    "stateId": "NG032"
  },
  {
    "id": "NG032008",
    "name": "Kanke",
    "stateId": "NG032"
  },
  {
    "id": "NG032009",
    "name": "Langtang North",
    "stateId": "NG032"
  },
  {
    "id": "NG032010",
    "name": "Langtang South",
    "stateId": "NG032"
  },
  {
    "id": "NG032011",
    "name": "Mangu",
    "stateId": "NG032"
  },
  {
    "id": "NG032012",
    "name": "Mikang",
    "stateId": "NG032"
  },
  {
    "id": "NG032013",
    "name": "Pankshin",
    "stateId": "NG032"
  },
  {
    "id": "NG032014",
    "name": "Qua'an Pan",
    "stateId": "NG032"
  },
  {
    "id": "NG032015",
    "name": "Riyom",
    "stateId": "NG032"
  },
  {
    "id": "NG032016",
    "name": "Shendam",
    "stateId": "NG032"
  },
  {
    "id": "NG032017",
    "name": "Wase",
    "stateId": "NG032"
  },
  {
    "id": "NG033001",
    "name": "Abua/Odual",
    "stateId": "NG033"
  },
  {
    "id": "NG033002",
    "name": "Ahoada East",
    "stateId": "NG033"
  },
  {
    "id": "NG033003",
    "name": "Ahoada West",
    "stateId": "NG033"
  },
  {
    "id": "NG033004",
    "name": "Akuku Toru",
    "stateId": "NG033"
  },
  {
    "id": "NG033005",
    "name": "Andoni",
    "stateId": "NG033"
  },
  {
    "id": "NG033006",
    "name": "Asari-Toru",
    "stateId": "NG033"
  },
  {
    "id": "NG033007",
    "name": "Bonny",
    "stateId": "NG033"
  },
  {
    "id": "NG033008",
    "name": "Degema",
    "stateId": "NG033"
  },
  {
    "id": "NG033009",
    "name": "Eleme",
    "stateId": "NG033"
  },
  {
    "id": "NG033010",
    "name": "Emohua",
    "stateId": "NG033"
  },
  {
    "id": "NG033011",
    "name": "Etche",
    "stateId": "NG033"
  },
  {
    "id": "NG033012",
    "name": "Gokana",
    "stateId": "NG033"
  },
  {
    "id": "NG033013",
    "name": "Ikwerre",
    "stateId": "NG033"
  },
  {
    "id": "NG033014",
    "name": "Khana",
    "stateId": "NG033"
  },
  {
    "id": "NG033015",
    "name": "Obia/Akpor",
    "stateId": "NG033"
  },
  {
    "id": "NG033016",
    "name": "Ogba/Egbema/Ndoni",
    "stateId": "NG033"
  },
  {
    "id": "NG033017",
    "name": "Ogu/Bolo",
    "stateId": "NG033"
  },
  {
    "id": "NG033018",
    "name": "Okrika",
    "stateId": "NG033"
  },
  {
    "id": "NG033019",
    "name": "Omumma",
    "stateId": "NG033"
  },
  {
    "id": "NG033020",
    "name": "Opobo/Nkoro",
    "stateId": "NG033"
  },
  {
    "id": "NG033021",
    "name": "Oyigbo",
    "stateId": "NG033"
  },
  {
    "id": "NG033022",
    "name": "Port-Harcourt",
    "stateId": "NG033"
  },
  {
    "id": "NG033023",
    "name": "Tai",
    "stateId": "NG033"
  },
  {
    "id": "NG034001",
    "name": "Binji",
    "stateId": "NG034"
  },
  {
    "id": "NG034002",
    "name": "Bodinga",
    "stateId": "NG034"
  },
  {
    "id": "NG034003",
    "name": "Dange-Shuni",
    "stateId": "NG034"
  },
  {
    "id": "NG034004",
    "name": "Gada",
    "stateId": "NG034"
  },
  {
    "id": "NG034006",
    "name": "Goronyo",
    "stateId": "NG034"
  },
  {
    "id": "NG034007",
    "name": "Gudu",
    "stateId": "NG034"
  },
  {
    "id": "NG034005",
    "name": "Gwadabawa",
    "stateId": "NG034"
  },
  {
    "id": "NG034008",
    "name": "Illela",
    "stateId": "NG034"
  },
  {
    "id": "NG034009",
    "name": "Isa",
    "stateId": "NG034"
  },
  {
    "id": "NG034010",
    "name": "Kebbe",
    "stateId": "NG034"
  },
  {
    "id": "NG034011",
    "name": "Kware",
    "stateId": "NG034"
  },
  {
    "id": "NG034012",
    "name": "Rabah",
    "stateId": "NG034"
  },
  {
    "id": "NG034013",
    "name": "Sabon Birni",
    "stateId": "NG034"
  },
  {
    "id": "NG034014",
    "name": "Shagari",
    "stateId": "NG034"
  },
  {
    "id": "NG034015",
    "name": "Silame",
    "stateId": "NG034"
  },
  {
    "id": "NG034016",
    "name": "Sokoto North",
    "stateId": "NG034"
  },
  {
    "id": "NG034017",
    "name": "Sokoto South",
    "stateId": "NG034"
  },
  {
    "id": "NG034018",
    "name": "Tambuwal",
    "stateId": "NG034"
  },
  {
    "id": "NG034019",
    "name": "Tangaza",
    "stateId": "NG034"
  },
  {
    "id": "NG034020",
    "name": "Tureta",
    "stateId": "NG034"
  },
  {
    "id": "NG034021",
    "name": "Wamako",
    "stateId": "NG034"
  },
  {
    "id": "NG034022",
    "name": "Wurno",
    "stateId": "NG034"
  },
  {
    "id": "NG034023",
    "name": "Yabo",
    "stateId": "NG034"
  },
  {
    "id": "NG035001",
    "name": "Ardo-Kola",
    "stateId": "NG035"
  },
  {
    "id": "NG035002",
    "name": "Bali",
    "stateId": "NG035"
  },
  {
    "id": "NG035003",
    "name": "Donga",
    "stateId": "NG035"
  },
  {
    "id": "NG035004",
    "name": "Gashaka",
    "stateId": "NG035"
  },
  {
    "id": "NG035005",
    "name": "Gassol",
    "stateId": "NG035"
  },
  {
    "id": "NG035006",
    "name": "Ibi",
    "stateId": "NG035"
  },
  {
    "id": "NG035007",
    "name": "Jalingo",
    "stateId": "NG035"
  },
  {
    "id": "NG035008",
    "name": "Karim-Lamido",
    "stateId": "NG035"
  },
  {
    "id": "NG035009",
    "name": "Kurmi",
    "stateId": "NG035"
  },
  {
    "id": "NG035010",
    "name": "Lau",
    "stateId": "NG035"
  },
  {
    "id": "NG035011",
    "name": "Sardauna",
    "stateId": "NG035"
  },
  {
    "id": "NG035012",
    "name": "Takum",
    "stateId": "NG035"
  },
  {
    "id": "NG035013",
    "name": "Ussa",
    "stateId": "NG035"
  },
  {
    "id": "NG035014",
    "name": "Wukari",
    "stateId": "NG035"
  },
  {
    "id": "NG035015",
    "name": "Yorro",
    "stateId": "NG035"
  },
  {
    "id": "NG035016",
    "name": "Zing",
    "stateId": "NG035"
  },
  {
    "id": "NG036001",
    "name": "Bade",
    "stateId": "NG036"
  },
  {
    "id": "NG036002",
    "name": "Bursari",
    "stateId": "NG036"
  },
  {
    "id": "NG036003",
    "name": "Damaturu",
    "stateId": "NG036"
  },
  {
    "id": "NG036004",
    "name": "Fika",
    "stateId": "NG036"
  },
  {
    "id": "NG036005",
    "name": "Fune",
    "stateId": "NG036"
  },
  {
    "id": "NG036006",
    "name": "Geidam",
    "stateId": "NG036"
  },
  {
    "id": "NG036007",
    "name": "Gujba",
    "stateId": "NG036"
  },
  {
    "id": "NG036008",
    "name": "Gulani",
    "stateId": "NG036"
  },
  {
    "id": "NG036009",
    "name": "Jakusko",
    "stateId": "NG036"
  },
  {
    "id": "NG036010",
    "name": "Karasuwa",
    "stateId": "NG036"
  },
  {
    "id": "NG036011",
    "name": "Machina",
    "stateId": "NG036"
  },
  {
    "id": "NG036012",
    "name": "Nangere",
    "stateId": "NG036"
  },
  {
    "id": "NG036013",
    "name": "Nguru",
    "stateId": "NG036"
  },
  {
    "id": "NG036014",
    "name": "Potiskum",
    "stateId": "NG036"
  },
  {
    "id": "NG036015",
    "name": "Tarmua",
    "stateId": "NG036"
  },
  {
    "id": "NG036016",
    "name": "Yunusari",
    "stateId": "NG036"
  },
  {
    "id": "NG036017",
    "name": "Yusufari",
    "stateId": "NG036"
  },
  {
    "id": "NG037001",
    "name": "Anka",
    "stateId": "NG037"
  },
  {
    "id": "NG037002",
    "name": "Bakura",
    "stateId": "NG037"
  },
  {
    "id": "NG037003",
    "name": "Birnin Magaji",
    "stateId": "NG037"
  },
  {
    "id": "NG037004",
    "name": "Bukkuyum",
    "stateId": "NG037"
  },
  {
    "id": "NG037005",
    "name": "Bungudu",
    "stateId": "NG037"
  },
  {
    "id": "NG037006",
    "name": "Gummi",
    "stateId": "NG037"
  },
  {
    "id": "NG037007",
    "name": "Gusau",
    "stateId": "NG037"
  },
  {
    "id": "NG037008",
    "name": "Kaura Namoda",
    "stateId": "NG037"
  },
  {
    "id": "NG037009",
    "name": "Maradun",
    "stateId": "NG037"
  },
  {
    "id": "NG037010",
    "name": "Maru",
    "stateId": "NG037"
  },
  {
    "id": "NG037011",
    "name": "Shinkafi",
    "stateId": "NG037"
  },
  {
    "id": "NG037012",
    "name": "Talata Mafara",
    "stateId": "NG037"
  },
  {
    "id": "NG037013",
    "name": "Tsafe",
    "stateId": "NG037"
  },
  {
    "id": "NG037014",
    "name": "Zurmi",
    "stateId": "NG037"
  }
];
