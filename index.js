
//map global variable
var map;

function mapSetup(){
    var latLong = [33.41,-111.89];

    map = L.map('mapid').setView(latLong, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

class vehicleClass{
    constructor(apiJson){
        //data.entity[i]
        this.raw = apiJson; 
        this.id = apiJson.id;
        this.latLong = [apiJson.vehicle.position.latitude,apiJson.vehicle.position.longitude];
        this.stopId = apiJson.vehicle.stopId;
        this.currentStopSequence = apiJson.vehicle.currentStopSequence;
        this.timestamp = apiJson.vehicle.timestamp;
        this.open = false;
    }
    update(apiJson){
        this.raw = apiJson; 
        this.id = apiJson.id;
        this.latLong = [apiJson.vehicle.position.latitude,apiJson.vehicle.position.longitude];
        this.stopId = apiJson.vehicle.stopId;
        this.currentStopSequence = apiJson.vehicle.currentStopSequence;
        this.timestamp = apiJson.vehicle.timestamp;
    }
    dataStr(){
        var dataStr = `<b>Light Rail</b><br>
        <b>ID:</b> ${this.id}<br>
        <b>stopId:</b> ${this.stopId}<br>
        <b>time:</b> ${new Date(parseInt(this.timestamp)*1000).toLocaleTimeString("en-US")}<br>
        `;
        return(dataStr);
    }

    plot(){ 
        if(this.open){
            this.marker = L.marker(this.latLong).addTo(map)
                .bindPopup(this.dataStr())
                .openPopup();
        }
        else{
            this.marker = L.marker(this.latLong).addTo(map)
                .bindPopup(this.dataStr())
        }

    }
    setOpenFlag(){
	console.log("Open Flag:",this.marker.isPopupOpen());
        this.open = this.marker.isPopupOpen();
    }

    remove(){
        map.removeLayer(this.marker);
    }
}

class vehicleList{
    constructor(vehicleArray){
        this.vArray = vehicleArray;  
    }
    plotAll(){
        for(var i = 0; i < this.vArray.length; i++){
            this.vArray[i].plot();
        }
    }
    removeAll(){
        for(var i = 0; i < this.vArray.length; i++){
            this.vArray[i].remove();
        }
    }
    checkOpen(){
        for(var i = 0; i < this.vArray.length; i++){
            this.vArray[i].setOpenFlag();
        }
    }

    updateAll(apiJson){
        //this.checkOpen();
        var vListNew = vehicleListConst(apiJson);
        var vListOld = this.vArray;
        for(var i = 0; i < vListNew.length; i++){
            for(var j = 0; j < vListOld.length; j++){
                if(vListNew[i].id == vListOld[j].id){
                    console.log("SAME");
                    console.log(vListOld[j].open);
                    vListNew[i].open = vListOld[j].open;
                    break;
                }
            }
        }
        this.vArray = vListNew; 
    }
}

function getPositions(callback){
    //get the valley metro data
    fetch("https://app.mecatran.com/utw/ws/gtfsfeed/vehicles/valleymetro?apiKey=4f22263f69671d7f49726c3011333e527368211f&asJson=true")
        .then(response => response.json())
        .then(data => callback(data));
}

function vehicleListConst(apiJson){
    var vList = [];
    var vehicle;
    for(var i = 0; i<apiJson.entity.length;i++){
        vehicle = new vehicleClass(apiJson.entity[i]);
        vList.push(vehicle);
    }
    return(vList);
}

//Run 
mapSetup();
var a; 

getPositions((data)=>
    {
        a = new vehicleList(vehicleListConst(data));
        a.plotAll();
    });

//train data only updates every 20 seconds

setInterval(function() {
    
    getPositions((data)=>
    {
        console.log("Update");
        a.removeAll();
	a.checkOpen();
        a.updateAll(data);
        a.plotAll();
    });
    
}, 20000);

