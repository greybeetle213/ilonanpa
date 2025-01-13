var lastAnswer
var currentOp
var vars = {}
var xcoord
var lineCount = 0
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const graphmode = (urlParams.get('graphmode')=="true")
const tabs = ["nanpa", "ilo", "setvars", "loadvars", "selopipokatuwan"]
function blueText(str){
    return("<span class='subnum'>"+str+"</span>")
}
function addMoveOpButtons(id,canmoveup,canmovedown){
    document.getElementById("palipitenponi").innerHTML = (
        "<div class='ansbox'>"+
            "<div>"+
                document.getElementById("palipitenponi").innerHTML+
            "</div>"+
            "<div class='xflex'>"+
                "<button "+(!canmoveup ? "" : "disabled")+" onclick='moveOperation("+id+",-1)' class='besideans'>󱥄󱥚󱤉󱥁</button>"+
                "<button "+(!canmovedown ? "" : "disabled")+" onclick='moveOperation("+id+",1)' class='besideans'>󱥄󱤅󱤉󱥁</button>"+
                "<button onclick='deleteOperation("+id+")' class='besideans' style='color:red'>󱥄󱥶󱤉󱥁</button>"+
            "</div>"+
        "</div>"
    )
}
function answerText(str){
    return("<span class='answer'>"+str+"</span>")
}
function selectedText(str){
    return("<span class='selectedText'>"+str+"</span>")
}
function errorText(str){
    return("<span class='errorText'>"+str+"</span>")
}
function setVariable(varname){
    document.getElementById(varname).disabled=false
    if(graphmode){
        currentGraph.editedLine.addOperation(new setVar(varname))
        refreshOpList()
        openTab("ilo")
        return
    }
    vars[varname] = lastAnswer
    document.getElementById("palipitenponi").innerHTML = (
        "󱤡󱥄󱥌󱤉󱥁󱥩"+blueText(varname)
    )
    sendCurrentInput()
    openTab("ilo")
}
function isNumberValid(number){
    if(/^((󱥶)?((󱤼)|(󱤭)|(󱥮)|(󱥳))((󱤼)*(󱤭)*(󱥮)*(󱥳)*(󱤄)*)*|(󱤂))$/.test(number)){
        return(true)
    }
    return(false)
}
function sendConstant(deffinition, constant){
    if(graphmode){
        currentOp = new constantNum(constant,deffinition)
        currentGraph.editedLine.addOperation(currentOp)
        refreshOpList()
        return
    }
    lastAnswer = constant
    document.getElementById("palipitenponi").innerHTML = (
        deffinition+
        "<div class='ansbox'>"+
            answerText(ositelenenanpa(base10ToNnp(constant)))+ 
            "<button class='besideans' onclick='osinenanpa("+constant+")'>󱥄󱥝󱤉󱤽󱥁</button>"+
        "</div>"
    )
    sendCurrentInput()
}
function osinenanpa(nanpa){
    lastAnswer = nanpa
    document.getElementById("palipitenponi").innerHTML = (
        "<div class='ansbox'>"+
            answerText(ositelenenanpa(base10ToNnp(lastAnswer)))+ 
            "<button class='besideans' onclick='osinenanpa("+lastAnswer+")'>󱥄󱥝󱤉󱤽󱥁</button>"+
        "</div>"
    )
    sendCurrentInput()
}
function opana(){
    currentOp.editedArg += 1
    document.getElementById("palipitenponi").innerHTML = currentOp.getText()
    update()
    if(currentOp.editedArg<currentOp.args.length){
        return
    }
    openTab("ilo")
    if(graphmode){
        currentGraph.editedLine.addOperation(currentOp)
        refreshOpList()
        return
    }
    lastAnswer = currentOp.base10Ans()
    if(currentOp.getError(lastAnswer)){
        document.getElementById("palipitenponi").innerHTML += "<br>" + errorText(currentOp.getError(lastAnswer))
        lastAnswer = null
    }else{
        document.getElementById("palipitenponi").innerHTML += (
            "<div class='ansbox'>"+
                answerText(ositelenenanpa(base10ToNnp(lastAnswer)))+ 
                "<button class='besideans' onclick='osinenanpa("+lastAnswer+")'>󱥄󱥝󱤉󱤽󱥁</button>"+
            "</div>"
        )
    }
    sendCurrentInput()
}
function sendCurrentInput(){
    currentOp.sent = true
    if(!graphmode){
        document.getElementById("palipitenponi").id = null
    }else{
        document.getElementById("palipitenponi").id = "op"+currentOp.lastId
    }
    document.getElementById("sitelen").innerHTML = "<div class='pali' id='palipitenponi'></div>"+document.getElementById("sitelen").innerHTML
    if(graphmode){
        return
    }
    update()
}
function owekaesitelen(){
    if(currentOp.args[currentOp.editedArg]=="" && currentOp.editedArg != 0){
        currentOp.editedArg -= 1
    }
    currentOp.args[currentOp.editedArg] = currentOp.args[currentOp.editedArg].slice(0,-2)
    document.getElementById("palipitenponi").innerHTML = currentOp.getText()
    update()
}
function opanaenanpa(nanpa){
    if(nanpa=="󱥁"||nanpa.indexOf("󱥓")!=-1||nanpa=="󱥒󱤩"){
        currentOp.args[currentOp.editedArg] = nanpa
    } else {
        currentOp.args[currentOp.editedArg] += nanpa
    }
    document.getElementById("palipitenponi").innerHTML = currentOp.getText()
    if(nanpa=="󱥁"||nanpa.indexOf("󱥓")!=-1||nanpa=="󱥒󱤩"){
        opana()
    }
    update()
}
function update(){
    if(lastAnswer||graphmode){
        document.getElementById("ans").disabled = false
        document.getElementById("setvarsbutton").disabled = false
    } else {
        document.getElementById("ans").disabled = true
        document.getElementById("setvarsbutton").disabled = true
    }
    if(!currentOp){
        return
    }
    if(currentOp.editedArgValid()){
        document.getElementById("opana").disabled = false
    }else{
        document.getElementById("opana").disabled = true
    }
    if(currentOp.args[0].length==0){
        document.getElementById("backspace").disabled = true
    }else{
        document.getElementById("backspace").disabled = false
    }
}
function nnpToBase10(num){
    if(num=="󱤂"){
        return(0)
    }
    let out = 0
    let sign = 1
    const seg = new Intl.Segmenter('en', { granularity: "grapheme" });
    num = [...seg.segment(num)]
    const nums = {"󱥳":1,"󱥮":2,"󱤭":5,"󱤼":20}
    for(var char of num){
        char=char.segment
        if(char=="󱥶"){
            sign = -1
        }else if (char == "󱤄"){
            out *= 100
        }else{
            out += nums[char]
        }
    }
    return(out*sign)
}
function base10ToNnp(num){
    if(num<0){
        var negative = true
    }
    num = String(Number(num))
    if(num=="0"){
        return("󱤂")
    }
    if(num.indexOf(".")!=-1){
        num = num.split(".")
        let dec = Math.round(Number("0."+num[1])*100)
        if(dec/100>=1){
            return(base10ToNnp(Number(num[0])+1))
        }
        num[1] = String(Math.round(Number("0."+num[1])*100)/100).split(".")[1]
        if(dec==0){
            return(base10ToNnp(num[0]))
        }else{
            dec = String(dec).match(/\d*[123456789]/)
        }
        if(num[0]==0){
            return("󱥻"+(negative?"󱥶":"")+"󱥁"+base10ToNnp(dec)+"󱦝󱥆"+base10ToNnp(Number("1"+"0".repeat(num[1].length)))+"󱤧󱥖󱥳")
        }
        return(base10ToNnp(num[0])+"󱤊󱥻"+(negative?"󱥶":"")+"󱥁"+base10ToNnp(dec)+"󱦝󱥆"+base10ToNnp(Number("1"+"0".repeat(num[1].length)))+"󱤧󱥖󱥳")
    }
    let out = ""
    if(num[0]=="-"){
        num = num.slice(1)
    }
    while(num){
        let end = num.slice(-2)
        let addition = ""
        end = Number(end)
        while(end>=20){
            end -= 20
            addition += "󱤼"
        }
        while(end>=5){
            end -= 5
            addition += "󱤭"
        }
        while(end>=2){
            end -= 2
            addition += "󱥮"
        }
        if(end==1){
            end=0
            addition += "󱥳"
        }
        out = addition + out
        num = num.slice(0,-2)
        if(num){
            out = "󱤄"+out
        }
    }
    if(negative){
        out = "󱥶"+out
    }
    return(out)
}
function doOperation(op){
    currentOp = new op()
    document.getElementById("palipitenponi").innerHTML = currentOp.getText()
    currentOp.args[0] = ""
    openTab("nanpa")
}

function openTab(tab){
    tabs.forEach((e)=>{
        document.getElementById(e).style.display = "none"
    })
    document.getElementById(tab).style.display = "flex"
    if(tab == "selopipokatuwan"){
        createTriangle()
    }
    update()
}
function ositelenenanpa(nanpa){
    if(nanpa=="󱥁"){
        return(nanpa)
    }
    const seg = new Intl.Segmenter('en', { granularity: "grapheme" });
    nums = [...seg.segment(nanpa)]
    out = ""
    for(num of nums){
        out += "‍"+num.segment
    }
    return(out)
}
function getXY(e) {
    var rect = canvas.getBoundingClientRect();
    return {x: e.clientX - rect.left, y: e.clientY - rect.top}
}
function init(){
    document.getElementById("󱥓󱤽󱥳").disabled=true
    document.getElementById("󱥓󱤽󱥮").disabled=true
    document.getElementById("󱥓󱤽󱥮‍󱥳").disabled=true
    document.getAnimations("setvarsbutton").disabled=true
    if(graphmode){
        currentGraph = new graph()
        document.getElementById("graphinfo").style.display="flex"
    } else{
        document.getElementById("ilonanpa").style.display="flex"
        document.getElementById("graph").style.display="none"
        document.getElementById("xcoord").style.display="none"
    }
    update()
}
function createOpperationList(){
    currentGraph.addLine()
    document.getElementById("graph").style.display = "none"
    document.getElementById("ilonanpa").style.display = "flex"
    document.getElementById("sitelen").innerHTML = "<div class='pali' id='palipitenponi'></div>"
    document.getElementById("lines").innerHTML = 
    ("<div style='border: 2px solid black;flex-grow:0.5;' class='xflex' id='line"+lineCount+"'><button onclick='editOpperationList(\"line"+lineCount+
        "\")' class='nena' style='background-color: white; color: "+
        currentGraph.editedLine.color+"'>󱤩󱤽"+
        ositelenenanpa(base10ToNnp(lineCount))+
        "</button><button onclick='deleteOpperationList(\"line"+lineCount+"\")' class='nena' style='flex-grow: 0;background-color:white;color:red;'>󱥄󱥶</button></div>"+
        document.getElementById("lines").innerHTML
    )
}
function editOpperationList(listid){
    currentGraph.editedLine = currentGraph.linesWithIds[listid]
    document.getElementById("graph").style.display = "none"
    document.getElementById("ilonanpa").style.display = "flex"
    refreshOpList()
}
function refreshOpList(){
    document.getElementById("sitelen").innerHTML = "<div class='pali' id='palipitenponi'></div>"
    for(let i=0;i<currentGraph.editedLine.operations.length;i++){
        op = currentGraph.editedLine.operations[i]
        document.getElementById("palipitenponi").innerHTML = op.getText()
        addMoveOpButtons(op.id,i==0,i==currentGraph.editedLine.operations.length-1)
        sendCurrentInput()
    }
    if(!currentOp.sent){
        document.getElementById("palipitenponi").innerHTML = currentOp.getText()
    }
}
function deleteOpperationList(listid){
    document.getElementById(listid).remove()
    currentGraph.removeLine(listid)
}
function deleteOperation(id){
    currentGraph.editedLine.deleteOperation(id)
    refreshOpList()
}
function moveOperation(id,ammount){
    currentGraph.editedLine.moveOperation(id,ammount)
    refreshOpList()
}
function openGraph(){
    document.getElementById("graph").style.display = "initial"
    document.getElementById("ilonanpa").style.display = "none"
    currentGraph.update()
}
function createTriangle(){
    currentOp = new triangle()
    document.getElementById("trianglequestion").innerHTML = "󱥄󱤮󱤉󱥠󱥒󱦜󱥞󱥡󱤉󱥙󱥁󱥮󱦝"
    document.getElementById("hypotenuse").disabled=false
    document.getElementById("hypotenuse").style.backgroundColor=""
    document.getElementById("opposite").disabled=false
    document.getElementById("opposite").style.backgroundColor=""
    document.getElementById("adjacent").disabled=false
    document.getElementById("adjacent").style.backgroundColor=""
    document.getElementById("angle").disabled=false
    document.getElementById("angle").style.backgroundColor=""
}
function toggleTriangleSide(side){
    if(currentOp.knownsSet){
        currentOp.unknown = side
        document.getElementById("palipitenponi").innerHTML = currentOp.getText()
        currentOp.args[0] = ""
        openTab("nanpa")
        return
    }
    currentOp.knowns[side] = !currentOp.knowns[side]
    if(currentOp.knowns[side]){
        document.getElementById(side).style.backgroundColor = "lightgreen" 
    }else{
        document.getElementById(side).style.backgroundColor = "" 
    }
    if(currentOp.knowns["hypotenuse"]+currentOp.knowns["angle"]+currentOp.knowns["opposite"]+currentOp.knowns["adjacent"]==2){
        currentOp.knownsSet = true
        document.getElementById("trianglequestion").innerHTML = "󱥞󱥷󱥡󱤉󱥁󱥙"
        if(currentOp.knowns["hypotenuse"]){
            document.getElementById("hypotenuse").disabled = true
        }
        if(currentOp.knowns["opposite"]){
            document.getElementById("opposite").disabled = true
        }
        if(currentOp.knowns["adjacent"]){
            document.getElementById("adjacent").disabled = true
        }
        if(currentOp.knowns["angle"]){
            document.getElementById("angle").disabled = true
        }
    }
}
class opperation{
    constructor(){
        this.args = ["",""]
        this.editedArg = 0
    }
    convertArgsToInts(){
        let out = []
        for(let i=0;i<this.args.length;i++){
            if(this.args[i]=="󱥁"){
                out.push(lastAnswer)
            }else if(this.args[i]=="󱥒󱤩"){
                out.push(xcoord)
            }else if(this.args[i].indexOf("󱥓")!=-1){
                out.push(vars[this.args[i]])
            }else{
                out.push(nnpToBase10(this.args[i]))
            }
        }
        return(out)
    }
    getAnswer(){
        let args = this.convertArgsToInts()
        let ans = this.calc([args[0],args[1]])
        let err = this.getError(ans)
        if(err){
            return(err)
        }
        return(ositelenenanpa(base10ToNnp(ans)))
    }
    getError(ans){
        if(ans == Infinity || ans == -Infinity){
            return(errorText("󱤽󱥈"))
        }
        if(ans>Number.MAX_SAFE_INTEGER){
            return(errorText("󱥈󱤡󱤽󱥁󱤧󱥣󱤍"))
        }
        if(ans<Number.MIN_SAFE_INTEGER){
            return(errorText("󱥈󱤡󱤽󱥁󱤧󱤨󱤍"))
        }
        if(isNaN(ans)){
            return(errorText("󱤽󱥈"))
        }
        return(false)
    }
    base10Ans(){
        let args = this.convertArgsToInts()
        return(this.calc([args[0],args[1]]))
    }
    calc(nums){
        return(0)
    }
    editedArgValid(){
        if(isNumberValid(this.args[this.editedArg])){
            return(true)
        }else{
            return(false)
        }
    }
    formatArgs(){
        let nums = []
        for(let i=0;i<this.args.length;i++){
            let num = this.args[i]||"󱤽"
            if(i==this.editedArg){
                if(num=="󱤽"||isNumberValid(num)){
                    nums.push(selectedText(ositelenenanpa(num)))
                }else{
                    nums.push(selectedText(errorText(ositelenenanpa(num))))
                }
            }else{
                nums.push(blueText(ositelenenanpa(num)))
            }
        }
        return(nums)
    }
    prefix(){
        for(let i=0;i<this.args.length;i++){
            if(this.args[i]=="󱥁"){
                return(blueText("󱤡"))
            }
        }
        return("")
    }
}
class add extends opperation{
    constructor(){
        super()
        this.args = ["",""]
        this.editedArg = 0
    }
    calc(nums){
        return(nums[0]+nums[1])
    }
    getText(){
        let nums = super.formatArgs()
        return(this.prefix()+"󱥄󱥌󱤉"+nums[0]+"󱥩"+nums[1])
    }
}
class subtract extends opperation{
    constructor(){
        super()
        this.args = ["",""]
        this.editedArg = 0
    }
    calc(nums){
        return(nums[1]-nums[0])
    }
    getText(){
        let nums = super.formatArgs()
        return(this.prefix()+"󱥄󱥶󱤉"+nums[0]+"󱥧"+nums[1])
    }
}
class multiply extends opperation{
    constructor(){
        super()
        this.args = ["",""]
        this.editedArg = 0
    }
    calc(nums){
        return(nums[0]*nums[1])
    }
    getText(){
        let nums = super.formatArgs()
        return(this.prefix()+"󱥄󱤖󱤓󱤉"+nums[0]+"󱤬󱥫"+nums[1])
    }
}
class devide extends opperation{
    constructor(){
        super()
        this.args = ["",""]
        this.editedArg = 0
    }
    calc(nums){
        return(nums[1]/nums[0])
    }
    getText(){
        let nums = super.formatArgs()
        return(this.prefix()+nums[0]+"󱥍󱤼󱥙󱤧󱤬"+nums[1])
    }
}
class exponent extends opperation{
    constructor(){
        super()
        this.args = ["",""]
        this.editedArg = 0
    }
    calc(nums){
        return(Math.pow(nums[1],nums[0]))
    }
    getText(){
        let nums = super.formatArgs()
        return(this.prefix()+"󱤓󱥓󱤧󱥳󱤬󱥇󱤡󱥫"+nums[0]+"󱤡󱤓󱥓󱤧󱤖󱤟"+nums[1]+"󱥍󱤓󱥓󱤡󱤓󱥓󱤧󱥙")
    }
}
class surd extends opperation{
    constructor(){
        super()
        this.args = ["",""]
        this.editedArg = 0
    }
    calc(nums){
        return(Math.pow(nums[0],1/nums[1]))
    }
    getText(){
        let nums = super.formatArgs()
        return(this.prefix()+"󱤓󱥓󱤧󱥳󱤬󱥇󱤡󱥆󱥄"+nums[0]+"󱤬󱥐󱤡󱥫"+nums[1]+"󱤡󱤓󱥓󱥄󱤖󱤟󱥍󱤼󱥙󱥍󱤓󱥓")
    }
}
class log extends opperation{
    constructor(){
        super()
        this.args = ["",""]
        this.editedArg = 0
    }
    calc(nums){
        if(nums[1]==0){

        }
        return(Math.log(nums[0])/Math.log(nums[1]))
    }
    getText(){
        let nums = super.formatArgs()
        return(this.prefix()+"󱥓󱤧󱤓󱤉󱥳󱤬󱥇󱤡󱥆󱥄󱤓󱤉"+nums[0]+"󱤬󱥐󱤡󱥫󱥍󱤼󱥙󱤡󱤓󱥓󱥄󱤖󱤟"+nums[1]+"󱥍󱤓󱥓")
    }
}
class mu extends opperation{
    constructor(){
        super()
        this.args = [""]
        this.editedArg = 0
    }
    calc(nums){
        return(nums[0])
    }
    getText(){
        let nums = super.formatArgs()
        return(this.prefix()+"󱥄󱤹󱤉"+nums[0])
    }
}

class triangle extends opperation{
    constructor(){
        super()
        this.args = ["", ""]
        this.editedArg = 0
        this.knownsSet = false
        this.knowns = {
            "adjacent":false,
            "hypotenuse":false,
            "opposite":false,
            "angle":false
        }
        this.unknown = ""
    }
    getText(){
        let nums = super.formatArgs()
        let args = []
        if(this.knowns["adjacent"]){
            args.push("󱤩󱤒󱤧󱥣"+nums.shift()+"󱤡")
        }
        if(this.knowns["hypotenuse"]){
            args.push("󱤩󱤫󱤧󱥣"+nums.shift()+"󱤡")
        }
        if(this.knowns["opposite"]){
            args.push("󱤩󱤣󱤧󱥣"+nums.shift()+"󱤡")
        }
        if(this.knowns["angle"]){
            args.push("󱥻󱥜󱥍󱥣"+nums.shift()+"󱤧󱤬󱤏󱥍󱤩󱤫󱥍󱤩󱤒󱤡")
        }
        if(this.unknown == "adjacent"){
            args.push("󱤩󱤒󱤧󱥣󱥙")
        }
        if(this.unknown == "hypotenuse"){
            args.push("󱤩󱤫󱤧󱥣󱥙")
        }
        if(this.unknown == "opposite"){
            args.push("󱤩󱤣󱤧󱥣󱥙")
        }
        if(this.unknown == "angle"){
            args.push("󱥻󱥜󱥍󱥣󱥙󱤧󱤬󱤏󱥍󱤩󱤫󱥍󱤩󱤒")
        }
        return(this.prefix()+"<img class='embedimg' src='selopipokatuwan.svg'/>"+args[0]+args[1]+args[2])
    }
    calc(nums){
        let info = {}
        if(this.knowns["opposite"] && this.knowns["hypotenuse"]){
            info["opposite"] = nums[1]
            info["adjacent"] = Math.pow(Math.pow(nums[0],2) - Math.pow(nums[1],2),1/2)
            info["hypotenuse"] = nums[0]
            info["angle"] = Math.asin(nums[1]/nums[0])/(Math.PI*2)
        }
        if(this.knowns["opposite"] && this.knowns["adjacent"]){
            info["opposite"] = nums[1]
            info["adjacent"] = nums[0]
            info["hypotenuse"] = Math.pow(Math.pow(nums[1],2) + Math.pow(nums[0],2),1/2)
            info["angle"] = Math.atan(nums[1]/nums[0])/(Math.PI*2)
        }
        if(this.knowns["adjacent"] && this.knowns["hypotenuse"]){
            info["opposite"] = Math.pow(Math.pow(nums[1],2) - Math.pow(nums[0],2),1/2)
            info["adjacent"] = nums[0]
            info["hypotenuse"] = nums[1]
            info["angle"] = Math.acos(nums[0]/nums[1])/(Math.PI*2)
        }
        if(this.knowns["angle"]&&this.knowns["adjacent"]){
            info["adjacent"] = nums[0]
            info["angle"] = nums[1]
            info["opposite"] = Math.tan(info["angle"]*(Math.PI*2))*info["adjacent"]
            info["hypotenuse"] = Math.pow(Math.pow(info["adjacent"],2) + Math.pow(info["opposite"],2),1/2)
        }
        if(this.knowns["angle"]&&this.knowns["opposite"]){
            info["opposite"] = nums[0]
            info["angle"] = nums[1]
            info["adjacent"] = Math.tan(info["angle"]*(Math.PI*2))/info["opposite"]
            info["hypotenuse"] = Math.pow(Math.pow(info["adjacent"],2) + Math.pow(info["opposite"],2),1/2)
        }
        if(this.knowns["angle"]&&this.knowns["hypotenuse"]){
            info["hypotenuse"] = nums[0]
            info["angle"] = nums[1]
            info["opposite"] = Math.sin(info["angle"]*(Math.PI*2))*info["hypotenuse"]
            info["adjacent"] = Math.pow(Math.pow(info["hypotenuse"],2) - Math.pow(info["opposite"],2),1/2)
        }
        return(info[this.unknown])
    }
}

class setVar{
    constructor(varid){
        this.varid = varid
    }
    base10Ans(){
        vars[this.varid] = lastAnswer
        return(lastAnswer)
    }
    getText(){
        return("󱤡󱥄󱥌󱤉󱥁󱥩"+blueText(this.varid))
    }
}

class constantNum{
    constructor(num, text){
        this.num = num
        this.text = text
    }
    base10Ans(){
        return(this.num)
    }
    getText(){
        return(this.text)
    }
}

class graph{
    constructor() {
        this.lines = []
        this.linesWithIds = {}
        this.canvas = document.getElementById("canvas")
        this.ctx = this.canvas.getContext("2d")
        this.scale = 1
        this.offsetx = 0
        this.offsety = 0
        this.editedLine
        this.mouse = {
            click: false,
            lastpos:{x:0,y:0},
        }
        var self = this
        //scroll listner
        this.canvas.addEventListener('wheel',function(event){
            self.scale += event.deltaY/1000
            if(self.scale < 0.1){
                self.scale = 0.1
            }
            self.update()
            return false; 
        }, false);
        //drag
        this.canvas.addEventListener("mousedown", function(e){
            self.mouse.click = true
            self.mouse.lastpos = getXY(e)        
        })
        this.canvas.addEventListener("mouseup", function(){
            self.mouse.click = false
        })
        this.canvas.addEventListener("mouseout", function(){
            self.mouse.click = false
        })
        this.canvas.addEventListener("mousemove", function(e){
            e=getXY(e)
            if(self.mouse.click){
                self.offsetx += self.mouse.lastpos.x - e.x
                self.offsety += self.mouse.lastpos.y - e.y
            }
            self.mouse.lastpos.x = e.x
            self.mouse.lastpos.y = e.y
            self.update()
        })

        //window resize
        window.addEventListener("resize", function(){
            self.update()
        })
        this.update()    
    }
    update(){
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.draw()
    }
    draw(){
        this.drawLines()
        this.drawAxis()
        this.drawHoverInfo()
    }
    drawHoverInfo(){
        for(let overlap of this.overlaps){
            if(Math.abs(this.mouse.lastpos.y-overlap.y)<20 && Math.abs(this.mouse.lastpos.x-overlap.x)<20){
                this.ctx.beginPath();
                this.ctx.arc(overlap.x, overlap.y, 20, 0, 2 * Math.PI);
                this.ctx.fill();
                let graphcoords = this.screenCoordsToGraphCoords(overlap.x,overlap.y)
                this.ctx.fillText("󱥒󱤩󱤡"+ositelenenanpa(base10ToNnp(graphcoords.x)),overlap.x+20,overlap.y)
                this.ctx.fillText("󱥚󱤩󱤡"+ositelenenanpa(base10ToNnp(graphcoords.y)),overlap.x+20,overlap.y+this.fontsize)
                return
            }
        }
        for(let line of this.lines){
            this.ctx.fillStyle = line.color
            let mouseX = this.screenCoordsToGraphCoords(this.mouse.lastpos.x,0).x
            let mouseY = this.screenCoordsToGraphCoords(0,this.mouse.lastpos.y).y
            let graphY = line.calc(mouseX)
            let drawx = this.mouse.lastpos.x
            let drawy = this.graphCoordsToScreenCoords(0,graphY).y
            if(Math.abs(this.mouse.lastpos.y-drawy) < 20){
                this.ctx.beginPath();
                    this.ctx.arc(drawx, drawy, 10, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.fillText("󱥒󱤩󱤡"+ositelenenanpa(base10ToNnp(mouseX)),drawx+10,drawy)
                this.ctx.fillText("󱥚󱤩󱤡"+ositelenenanpa(base10ToNnp(graphY)),drawx+10,drawy+this.fontsize)
                return
            }
        }
    }
    drawLines(){
        this.ctx.lineWidth = 4
        let lineSegments = [[]]
        this.overlaps = []
        for(let line of this.lines){
            this.ctx.strokeStyle = line.color
            this.ctx.fillStyle = line.color
            this.ctx.beginPath()
            let firstPoint = true
            for(let x=0;x<this.width;x++){
                let graphX = this.screenCoordsToGraphCoords(x,0).x
                let graphY = line.calc(graphX)
                let y = this.graphCoordsToScreenCoords(0,graphY).y
                if(firstPoint){
                    this.ctx.moveTo(x,y)
                    if(!lineSegments[x+1]){
                        lineSegments.push([[[x,y]]])
                    }else{
                        lineSegments[x+1].unshift([[x,y]])
                    }
                    firstPoint = false
                } else {
                    this.ctx.lineTo(x,y)
                    lineSegments[x][0].push([x,y])
                    if(!lineSegments[x+1]){
                        lineSegments.push([[[x,y]]])
                    }else{
                        lineSegments[x+1].unshift([[x,y]])
                    }
                    for(let i = 1;i<lineSegments[x].length;i++){
                        let intersectPos = intersect(
                            lineSegments[x][0][0][0],
                            lineSegments[x][0][0][1],
                            lineSegments[x][0][1][0],
                            lineSegments[x][0][1][1],
                            lineSegments[x][i][0][0],
                            lineSegments[x][i][0][1],
                            lineSegments[x][i][1][0],
                            lineSegments[x][i][1][1]
                        )
                        if(intersectPos){
                            this.overlaps.push({x:intersectPos.x, y:intersectPos.y,color:this.ctx.fillStyle,equation1:line.calc})
                        }
                    }
                }
            }
            this.ctx.stroke()
        }
        for(let overlap of this.overlaps){
            this.ctx.fillStyle = overlap.color
            this.ctx.beginPath();
            this.ctx.arc(overlap.x, overlap.y, 10, 0, 2 * Math.PI);
            this.ctx.fill();    
        }
    }
    screenCoordsToGraphCoords(x,y){
        let gx = (x-this.width/2+this.offsetx)/(this.width/20/this.scale)
        let gy = (y-this.height/2+this.offsety)/(-this.width/20/this.scale)
        return({x:gx,y:gy})
    }
    graphCoordsToScreenCoords(x,y){
        let sx = this.width/2 + x*(this.width/20/this.scale) - this.offsetx
        let sy = this.height/2 - y*(this.width/20/this.scale) - this.offsety
        //this.ctx.fillRect(sx,sy,10,10)
        return({x:sx,y:sy})
    }
    drawAxis(){
        //draw axis
        this.ctx.strokeStyle = "black"
        this.ctx.fillStyle = "black"
        this.ctx.lineWidth = 2
        this.ctx.beginPath()
        this.ctx.moveTo(this.width/2-this.offsetx,0)
        this.ctx.lineTo(this.width/2-this.offsetx,this.height)
        this.ctx.stroke()
        this.ctx.beginPath()
        this.ctx.moveTo(0,this.height/2-this.offsety)
        this.ctx.lineTo(this.width,this.height/2-this.offsety)
        this.ctx.stroke()
        //draw numbers
        let drawfactorsof = Math.floor((this.scale-0.1)*2)
        this.fontsize = this.width/70
        this.ctx.font = this.fontsize+"px sitelenpona"
        let numberoffsetx = (this.offsetx/(this.width/20))*this.scale
        let numberoffsety = (this.offsety/(this.width/20))*this.scale
        for(let i=Math.floor(-10*this.scale+numberoffsetx);i<=Math.ceil(10*this.scale+numberoffsetx);i++){
            let x = this.width/2 + i*(this.width/20/this.scale) - this.offsetx
            let y = this.height/2 - this.offsety
            this.ctx.beginPath()
            this.ctx.moveTo(x,y-5)
            this.ctx.lineTo(x,y+5)
            this.ctx.stroke()
            if(i%drawfactorsof){
                continue
            }
            this.ctx.fillText(
                ositelenenanpa(base10ToNnp(i)),
                x,
                y + this.fontsize
            )
        }
        for(let i=Math.floor(-10*this.scale-numberoffsety);i<=Math.ceil(10*this.scale-numberoffsety);i++){
            let x = this.width/2 -this.offsetx
            let y = this.height/2 - i*(this.width/20/this.scale) - this.offsety
            this.ctx.beginPath()
            this.ctx.moveTo(x-5,y)
            this.ctx.lineTo(x+5,y)
            this.ctx.stroke()
            if(i%drawfactorsof){
                continue
            }
            this.ctx.fillText(
                ositelenenanpa(base10ToNnp(i)),
                x,
                y+this.fontsize
            )
        }
    }
    addLine(){
        lineCount += 1
        this.editedLine = new operationsList()
        this.editedLine.color = randomColor()
        this.lines.push(this.editedLine)
        this.linesWithIds["line"+lineCount] = this.editedLine
    }
    removeLine(id){
        delete this.linesWithIds[id]
        this.lines = Object.values(this.linesWithIds)
        this.update()
    }
}

class operationsList{
    constructor(){
        this.vars = {}
        this.operations = []
        this.operationsWithIds = {}
        this.lastId = 0
    }
    addOperation(o){
        this.lastId += 1
        o.id=this.lastId
        this.operationsWithIds[this.lastId] = o
        this.operations.push(o)
    }
    deleteOperation(id){
        let index = this.operations.indexOf(this.operationsWithIds[id])
        this.operations.splice(index,1)
        delete this.operationsWithIds[index]
    }
    moveOperation(id,ammount){
        let index = this.operations.indexOf(this.operationsWithIds[id])
        let moved = this.operations.splice(index,1)[0]
        this.operations.splice(index+ammount,0,moved)
    }
    calc(x){
        vars = {}
        lastAnswer = null
        xcoord = x
        for(let op of this.operations){
            lastAnswer = op.base10Ans()
        }
        return(lastAnswer)
    }
}

function randomColor(){
    var r = Math.floor(0xa+Math.random()*0xc2).toString(16)
    var g = Math.floor(0xa+Math.random()*0xc2).toString(16)
    var b = Math.floor(0xa+Math.random()*0xc2).toString(16)
    return("#"+r+g+b)
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
// Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false
    }
    denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
// Lines are parallel
    if (denominator === 0) {
        return false
    }
    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
// is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false
    }
// Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1)
    let y = y1 + ua * (y2 - y1) 
    return {x, y}
}
