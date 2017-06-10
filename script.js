const stats = {
  0:"HP",
  3:"MP",
  20:"ATT",
  21:"DEF",
  22:"SPD",
  28:"DEX",
  26:"VIT",
  27:"WIS",
  102:"LUCK", // TODO: find out what the real ID is
  24:"FAME" // not expressed in the same way as the rest
};
var dconf = {};
var conf = {};
var items = [];
var loaded = {};

$(document).ready(function(){
  getConfig(dconf);
  load();
  $("#xmlin").blur(load);
  $("#xmlout").blur(load);
  $("td>div").blur(organize);
});

function loadXML(url){
    return loaded[url] ? loaded[url] : loaded[url] = $.ajax({
        url: url,
        type: "get",
        datatype:"xml"
    });
}

function notNaN(number, foo, labels, i) {
  // I'm going to hell for this :DDDDDDDD
  number = Number(number)
  return isNaN(number) ? dconf[labels[i+1].innerHTML][foo] : number;
}

function getConfig(out) {
    let labels = $("#label>td");
    let values = $("#value>td>div");
    let expos = $("#expo>td>div");
    for (var i = 0; i < values.length; i++) {
      out[labels[i+1].innerHTML] = [
        notNaN(values[i].innerHTML, 0, labels, i),
        notNaN(expos[i].innerHTML, 1, labels, i)
        // || 0,
      ];
    }
}

function readXML(data) {
  // $.each($($.parseXML(data)).find("Object"), function(i, ele){
  let foo = "";
  $.each($(data).find("Object"), function(i, ele){
    if ($(ele).find("SlotType").text() == "9") {
      items.push(new Item($(ele), "https://static.drips.pw/rotmg/production/current"));
      foo += "\n   " + ele.outerHTML;
    }
  });
  console.log(foo);
  // console.log(data);
  // console.log($.parseXML(data));
}

function load(){
  items = [];

  for (let url of $("#xmlin").val().split("\n")) {
    // url = (url.substr(-4) == ".xml") ? url : url + "/xml/Equip.xml"
    loadXML(url)
      .done((data) => {
        readXML(data);
        organize();
      })
      .fail(() => {
        console.log("Failed");
      });
  }
  readXML($.parseXML('<?xml version="1.0" encoding="ISO-8859-1"?>\n\n<Objects>\n' + $("#xmlout").val() + '\n</Objects>'));
  // $.each($($.parseXML('<?xml version="1.0" encoding="ISO-8859-1"?>\n\n<Objects>\n' + $("#xmlout").val() + '\n</Objects>')).find("Object"), function(i, ele){
  //   if ($(ele).find("SlotType").text() == "9") {
  //     items.push(new Item($(ele), "https://static.drips.pw/rotmg/production/current"));
  //   }
  // });
  // console.log(items);
  organize();
}

function organize() {
  getConfig(conf);
  // console.log(conf);
  let sorteditems = [];
  for (item of items) {
    let score = 0;
    for (var key in item.stats) {
      if (item.stats.hasOwnProperty(key)) {
        score += conf[stats[key]][0] * item.stats[key];
      }
    }
    item.score = score;
    sorteditems.push(item);
  }
  sorteditems.sort((a, b) => {
    return b.score - a.score;
  });
  $("#output").html("");
  sorteditems.forEach(function callback(item, i, array) {
      item.drawItem($("#output"));
  });
}

//basic item from 'equip.xml'
function Item(xml, url){
    this.name = xml.attr("id");
    if (xml.find("DisplayId").text() && !xml.find("DisplayId").text().includes("{")) {
        this.name = xml.find("DisplayId").text();
        this.id = xml.attr("id");
    }

    this.url = url;
    this.spriteFile = xml.find("File").text().replace("Embed","") + ".png";
    this.spriteRef = xml.find("Index").text();

    this.stats = {};
    for (stat of xml.find("ActivateOnEquip")) {
      this.stats[Number(stat.attributes[0].nodeValue)] = Number(stat.attributes[1].nodeValue);
    }
    this.stats[24] = Number(xml.find("FameBonus").text()) || 0;

    // item.spriteFile = item.spriteFile.replace("playerskins", "playersSkins")
    // this.consumable = xml.find("Consumable").length;
    // this.soulbound = xml.find("Soulbound").length;
    // this.feedpower = xml.find("feedPower").text();
    this.desc = xml.find("Description").text();
    // this.tier = xml.find("Tier").text();

    //Return html for an Item Sprite
    Item.prototype.drawSprite = function(){
      row = 0 - (this.spriteRef >>> 4);
      column = 0 - (this.spriteRef & 0x00F);
      let style = `style="background-image: url(${this.url}/sheets/${this.spriteFile});background-position:${column*48}px ${row*48}px;"`;
      return `<div class="item-sprite" ${this.spriteRef ? style : ""}></div>`;
    }

    Item.prototype.stringifyStats = function() {
      let string = "";

      for (var i in this.stats) {
        if (this.stats.hasOwnProperty(i)) {
          string += "\n" + stats[i] + ": " + this.stats[i];
        }
      }

      return string;
    }

    //Append Beutiful HTML Representation of 'item' to 'container'
    // Item.prototype.drawItem = function(container){
    //     div = "";
    //
    //     div += "<div class='item' title='"+(this.id ? this.id : this.name)+"'>"
    //     div +=     "<h3 class='item-header'>"
    //     div +=         this.drawSprite()
    //     div +=         "<div class='header-text'>"
    //     div +=             "<div class='item-name'>" + this.name + "</div>"
    //     div +=             "<div class='tier'>" + (this.tier == "" ? "<span style='color: #8B2DDC;' >UT</span>" : (this.consumable ? "" : "T" + this.tier)) + "</div>"
    //     div +=         "</div>"
    //     div +=     "</h3>"
    //     div += "</div>"
    //
    //     container.append(div)
    // }
    Item.prototype.drawItem = function(container) {
      container.append(
        //<div class="item-sprite" style="background-image: url(${this.url}/sheets/${this.spriteFile};background-position: ${(0 - (this.spriteRef >>> 4))*48}px ${(0 - (this.spriteRef & 0x00F))*48}px;"></div>
`<div class="item" title="${this.id ? this.id : this.name}\n${this.desc}${this.stringifyStats()}">
  <h3 class="item-header">
    ${this.drawSprite()}
    <div class="item-name">${this.name}</div>
    <div class="tier">${this.score}</div>
  </h3>
</div>
`);
    }
}
