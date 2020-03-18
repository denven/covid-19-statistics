// return the english name of a country
const getCountryEnName = (country) => {

  if(country.countryEnglishName === null) {
    switch(country.countryName) {
      case "库拉索岛": return "Curaçao";
      case "瓜德罗普岛": return "Guadeloupe";
      case "美属维尔京群岛": return "US Virgin Islands";
      case "圣巴泰勒米岛": return "St-Barthélemy Island";
      case "吉尔吉斯斯坦": return "Kyrgyzstan";
      case "马约特": return "Mayotte";
      case "黑山": return "Montenegro";
      case "刚果（布）": return "Congo";
      case "格陵兰": return "Greenland";
      case "赞比亚共和国": return "Zambia";
      case "阿鲁巴": return "Aruba";
      case "钻石公主号邮轮": return "Diamond Princess Cruise";
      case "至尊公主邮轮": return "Grand Princess Cruise";

      default:
        return null;  // don't know the actual english name  
    }
  } 
  
  switch(country.countryEnglishName) {
    case "United States of America": return "United States";
    case "The Islamic Republic of Mauritania": return "Mauritania";
    case "Democratic Republic of the Congo": return "Dem. Rep. Congo";
    case "The Republic of Equatorial Guinea": return "Eq. Rep.";
    case "Central African Republic": return "Central African Rep.";
    case "Czech Republic": return "Czech Rep.";
    case "Republic of Serbia": return "Serbia";
    case "Republic of Rwanda": return "Rwanda";
    case "Dominican Republic": return "Dominican Rep.";
    case "Kingdom of Bhutan": return "Bhutan";
    case "SriLanka": return "Sri Lanka";
    case "Kazakstan": return "Kazakhstan";
    case "Kampuchea (Cambodia )": return "Cambodia";
    default: 
      return country.countryEnglishName;
  }
}

export default function processCountryNames (countries) {
  return countries.map(country => {
    return {...country, countryEnglishName: getCountryEnName(country)}    
  });
}