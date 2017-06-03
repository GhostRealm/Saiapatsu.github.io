const stats = {
  0:"HP",
  3:"MP",
  20:"ATT",
  21:"DEF",
  22:"SPD",
  28:"DEX",
  26:"VIT",
  27:"WIS",
  1:"LUCK"
};
var items = [];
var loaded = {};

const testXML = `<?xml version="1.0" encoding="ISO-8859-1"?>

<Objects>
   <Object type="0xc85" id="Common Feline Egg">
      <Class>Equipment</Class>
      <Item/>
      <Texture>
         <File>lofiObj2</File>
         <Index>0x100</Index>
      </Texture>
      <SlotType>26</SlotType>
      <Tier>0</Tier>
      <Description>A common feline pet egg.</Description>
      <PetFamily>Feline</PetFamily>
      <Rarity>Common</Rarity>
      <Activate>CreatePet</Activate>
      <Consumable/>
      <BagType>3</BagType>
      <feedPower>50</feedPower>
   </Object>
   <Object type="0xc86" id="Uncommon Feline Egg">
      <Class>Equipment</Class>
      <Item/>
      <Texture>
         <File>lofiObj2</File>
         <Index>0x101</Index>
      </Texture>
      <SlotType>26</SlotType>
      <Tier>1</Tier>
      <Description>An uncommon feline pet egg.</Description>
      <PetFamily>Feline</PetFamily>
      <Rarity>Uncommon</Rarity>
      <Activate>CreatePet</Activate>
      <Consumable/>
      <BagType>3</BagType>
      <feedPower>300</feedPower>
      <Soulbound/>
   </Object>
</Objects>`

$(document).ready(function(){
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

function load(){
  items = [];

  for (let url of $("#xmlin").val().split("\n")) {
    loadXML((url.substr(-4) == ".xml") ? url : url + "/xml/Equip.xml")
      .done((data) => {
        $.each($($.parseXML(data)).find("Object"), function(i, ele){
            items.push(new Item($(ele), URL1));
        });
        organize();
      })
      .fail(() => {
        console.log("Failed");
      });
  }
  // $.each($($.parseXML(testXML)).find("Object"), function(i, ele){
  //     items.push(new Item($(ele), URL1));
  // });
  items.forEach(function callback(item, i, array) {
      item.drawItem($("#main-list > .list"));
  });
}

function organize() {

}

//basic item from 'equip.xml'
function Item(xml, url){
    this.name = xml.attr("id");
    if(xml.find("DisplayId").text() && !xml.find("DisplayId").text().includes("{")){
        this.name = xml.find("DisplayId").text();
        this.id = xml.attr("id");
    }
    this.desc = xml.find("Description").text();
    this.tier = xml.find("Tier").text();

    this.url = url;

    this.spriteFile = xml.find("File").text() + ".png";
    this.spriteRef = xml.find("Index").text();
    //item.spriteFile = item.spriteFile.replace("playerskins", "playersSkins")
    this.consumable = xml.find("Consumable").length;
    this.soulbound = xml.find("Soulbound").length;
    this.feedpower = xml.find("feedPower").text();
    this.famebonus = xml.find("FameBonus").text();

    //Return html for an Item Sprite
    Item.prototype.drawSprite = function(){
        row = 0 - (this.spriteRef >>> 4);
        column = 0 - (this.spriteRef & 0x00F);

        div = ""

        div += "<div class='item-sprite'"
        div +=     "style='"
        div +=         "background-image: url(" + this.url + "/sheets/" + this.spriteFile + ");"
        div +=         "background-position:" + column*48 + "px " + row*48 + "px;"
        div += "'></div>"


        return div;
    }

    //Append Beutiful HTML Representation of 'item' to 'container'
    Item.prototype.drawItem = function(container){
        div = "";

        div += "<div class='item' title='"+(this.id ? this.id : this.name)+"'>"
        div +=     "<h3 class='item-header'>"
        div +=         this.drawSprite()
        div +=         "<div class='header-text'>"
        div +=             "<div class='item-name'>" + this.name + "</div>"
        div +=             "<div class='tier'>" + (this.tier == "" ? "<span style='color: #8B2DDC;' >UT</span>" : (this.consumable ? "" : "T" + this.tier)) + "</div>"
        div +=         "</div>"
        div +=     "</h3>"
        div += "</div>"

        container.append(div)
    }
}
