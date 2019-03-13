//存储用户信息
var userName
var customLabel={}
var mainMap_EN2CN={}
var subMap_EN2CN={}
var userid



var totalCondition={}

var chartData_1
var tabelData
var tabelData_2

var getUserInfo=function(){
    const request=new XMLHttpRequest()
    const url=`http://101.132.178.9/MoreTime/user/information/${userid}/${userid}`
    request.open("GET",url)
    request.send()
    request.onreadystatechange=(e)=>{
        if(request.readyState!=4)return
        if(request.status==200){
            var response=JSON.parse(request.responseText)
            //获取username和customlabel
            userName=response.data["username"]
            customLabel=JSON.parse(response.data["customlabel"])
            console.log("name",userName)
            console.log("customlabel",customLabel)
            EN2CN()
            //TODO:渲染用户名和用户头像信息
        }
    }
}

var EN2CN=function(){
    for(var key in customLabel){
        let splitRes=key.split("==")
        let en=splitRes[0]
        let cn=splitRes[1]
        mainMap_EN2CN[en]=cn
        subMap_EN2CN[en]={}
        let value=customLabel[key]
        for (let index = 0; index < value.length; index++) {
            let subSplitRes=value[index].split("==")
            subMap_EN2CN[en][subSplitRes[0]]=subSplitRes[1]
        }
    }
    generateLabelTree()
    console.log("mainMap_EN2CN",mainMap_EN2CN)
    console.log("subMap_EN2CN",subMap_EN2CN)
}

/**
 * 
 * @param {Date} date 
 * 返回YYYY-MM-DD格式
 */
var formatDate=function(date){
    // 获取当前月份
    var nowMonth = date.getMonth() + 1;
    // 获取当前是几号
    var strDate = date.getDate();
    // 添加分隔符“-”
    var seperator = "-";
    // 对月份进行处理，1-9月在前面添加一个“0”
    if (nowMonth >= 1 && nowMonth <= 9) {
    nowMonth = "0" + nowMonth;
    }
    // 对月份进行处理，1-9号在前面添加一个“0”
    if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
    }
    // 最后拼接字符串，得到一个格式为(yyyy-MM-dd)的日期
    var dateString = date.getFullYear() + seperator + nowMonth + seperator + strDate;
    return dateString
}

var getDefaultStartDate=function(){
    var date=new Date();
    var before=date-1000*60*60*24*20
    var startDate=formatDate(new Date(before))
    return startDate
}
/**
 * 获取最近7天的数据
 */
var getEvent=function(startDate,endDate){
    var eventData
    var eventKeys
    //发送请求
    const request=new XMLHttpRequest()
    const url=`http://101.132.178.9/MoreTime/event/${userid}/${startDate}/${endDate}`
    request.open("GET",url)
    request.send()
    request.onreadystatechange=(e)=>{
        if(request.readyState!=4) return
        if(request.status==200){
            console.log("recv data",JSON.parse(request.responseText).data)
            var response=JSON.parse(request.responseText).data
            if(response.length>0){
                eventData=response
                chartData_1=eventData
                tabelData=eventData
                tabelData_2=eventData
                eventKeys=new Set()
                let first=""
                let firstSub=""
                for (let index = 0; index < eventData.length; index++) {
                    const element = eventData[index];
                    eventKeys.add(element.labelid.split("_")[0])
                    if(first=="")
                        first=element.labelid.split("_")[0]
                 }
                 
                 //获取第一个subkey
                var subSet=new Set()
                for (let index = 0; index < tabelData_2.length; index++) {
                    const element = tabelData_2[index];
                    let splitRes=element.labelid.split("_")
                    if(splitRes[0]==first)
                    subSet.add(splitRes[1])
                }
                console.log("subset",subSet)
                let subArray=Array.from(subSet)
                firstSub=subMap_EN2CN[first][subArray[0]] 
                console.log("firstsub",firstSub)
                console.log("获取默认时间区域间事件成功！")
                constructTotalData(eventData,eventKeys)
                createList(eventKeys,"type_1")
                createList(eventKeys,"type_2")
                createList(eventKeys,"type_3")
                changeSubKey()
                creatchart_1_1()
                creatchart_1_2(eventKeys)
                createChart_1_3(first)
                creatchart_1_4()
                
                createTabel(eventData,first)
                createLoveThings(eventData,"08:00:00","10:00:00")

                console.log("筛选结果",mainMap_EN2CN[first],firstSub)
                createLoveThings_2(eventData,mainMap_EN2CN[first],firstSub)

                document.getElementById("start_1").value=startDate
                document.getElementById("end_1").value=endDate
                document.getElementById("start_2").value=startDate
                document.getElementById("end_2").value=endDate
                document.getElementById("start_3").value=startDate
                document.getElementById("end_3").value=endDate

            }
        }
    }
}

var getParameters=function(key){
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        userid=unescape(r[2])
        return unescape(r[2])
    }
    return null;
}

var initMap=function(eventKeys){
    var map=new Map()
    const iterator1 = eventKeys.entries();
    for (let entry of iterator1) {
        map[entry[0]]=0
    }
    console.log(map)
    return map
}

/**
 * 构建各个图表的数据
 */
var constructTotalData=function(eventData,eventKeys){
    //chart_one
    totalCondition["chart_one"]=new Map()
    totalCondition["chart_three"]=new Map()
    for (let index = 0; index < eventData.length; index++) {
        const element = eventData[index];
        //获取一级标签
        let main=element.labelid.split("_")[0]
        let sub=element.labelid.split("_")[1]
        //获取耗时
        let during=element.during
        if(!totalCondition["chart_one"].hasOwnProperty(main))
            totalCondition["chart_one"][main]=0
        totalCondition["chart_one"][main]+=during
        if(!totalCondition["chart_three"].hasOwnProperty(main))
            totalCondition["chart_three"][main]=new Map()
        if(!totalCondition["chart_three"][main].hasOwnProperty(sub))
            totalCondition["chart_three"][main][sub]=0
        totalCondition["chart_three"][main][sub]+=during
    }
    console.log("chart_one",totalCondition["chart_one"])
    console.log("chart_three",totalCondition["chart_three"])

    //chart_two
    totalCondition["chart_two"]=new Map()
    for (let index = 0; index < eventData.length; index++) {
        const element = eventData[index];
        let main=element.labelid.split("_")[0]
        let during=element.during
        let start=element.start
        let end=element.end
        let startDate=start.split(" ")[0]
        let endDate=end.split(" ")[0]
        if(!totalCondition["chart_two"].hasOwnProperty(startDate)){
            totalCondition["chart_two"][startDate]=initMap(eventKeys)
        }
        if(!totalCondition["chart_two"].hasOwnProperty(endDate)){
            totalCondition["chart_two"][endDate]=initMap(eventKeys)
        }
        //判断日期是否跨天
        if(startDate==endDate){  
            totalCondition["chart_two"][startDate][main]+=during
        }else{
            let dayLast=startDate+" 23:59:59"
            let tmpDate=new Date(dayLast.replace("-","/"))
            let startTime=new Date(start.replace("-","/"))
            var dateDiff = tmpDate.getTime() - startTime.getTime();//时间差的毫秒数
            var time=dateDiff/(60*1000)    //计算分钟数
            totalCondition["chart_two"][startDate][main]+=time
            totalCondition["chart_two"][endDate][main]+=during-time
        }
    }
    console.log("chart_two",totalCondition["chart_two"])

    //chart_four 给定类出现的天数
    var tmpDict=new Map()
    totalCondition["chart_four"]=new Map()
    for (let index = 0; index < eventData.length; index++) {
        const element = eventData[index];
        let main=element.labelid.split("_")[0]
        let start=element.start.split(" ")[0]
        let end=element.end.split(" ")[0]
        if(!tmpDict.hasOwnProperty(main))
            tmpDict[main]=new Set()
        tmpDict[main].add(start)
        tmpDict[main].add(end)
    }
    console.log(tmpDict)
    for(var key in tmpDict){
        console.log(typeof(key))
        totalCondition["chart_four"][key]=tmpDict[key].size
    }
    console.log("chart_four",totalCondition["chart_four"])
}

var creatchart_1_1=function(){
    var myChart = echarts.init(document.getElementById("chart_one"))
    var keyArr=[]
    //获取legend
    var seriesData=[]
    var item={value:null,name:null}
    for(var key in totalCondition["chart_one"]){
        keyArr.push(mainMap_EN2CN[key])
        var tmp={...item}
        tmp.name=mainMap_EN2CN[key]
        tmp.value=totalCondition["chart_one"][key]
        seriesData.push(tmp)
    }
    console.log("key",keyArr)
    console.log("data",seriesData)
    
    var option = {
        title : {
            text: '总体情况',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient:'vertical',
            left: 'left',
            data: keyArr
        },
        series : [
            {
                name: '总体占比',
                type: 'pie',
                radius : '70%',
                center: ['50%', '60%'],
                data:seriesData,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    }
    myChart.setOption(option);
}

var creatchart_1_2=function(eventKeys){
    var myChart = echarts.init(document.getElementById("chart_two"))
    var keyArr=[]
    var seriesData=[]
    var item=
    {
        name:null,
        type:'line',
        data:null
    }
    var x_data=Object.keys(totalCondition["chart_two"]).sort()
    const iterator1 = eventKeys.entries();
    for (let entry of iterator1) {
        keyArr.push(entry[0])
    }
    for (let index = 0; index < keyArr.length; index++) {
        const key = keyArr[index];
        var tmp={...item}
        tmp.data=[]
        tmp.name=mainMap_EN2CN[key]
        for (let i = 0; i < x_data.length; i++) {
            const day = x_data[i];
            tmp.data.push(totalCondition["chart_two"][day][key])
        }
        seriesData.push(tmp)
    }
    //转换legend
    for (let index = 0; index < keyArr.length; index++) {
        keyArr[index]=mainMap_EN2CN[keyArr[index]]
    }
    var option = {
        title: {
            text: '变化趋势',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis' 
        },
        legend: {
            orient: 'vertical',
            data: keyArr,
            left: '2%'
        },
        grid: {
          containLabel: true,
         
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: x_data,
        },
        yAxis: {
          type: 'value',
        },
        series: seriesData,
      }
      myChart.clear()
      myChart.setOption(option);
}

var createChart_1_3=function(main){
    //默认画出第一个
    var myChart = echarts.init(document.getElementById("chart_three"))
    console.log("source data",totalCondition["chart_three"])
    var keysArr=Object.keys(totalCondition["chart_three"])
    console.log("keys",keysArr)
    //var main='H'
    var data=totalCondition["chart_three"][main]
    console.log("data",data)
    let items=new Array()
    let series=new Array()
    for(let key in data){
        items.push(key)
        series.push(data[key])
    }
    console.log("items",items)
    //转中文
    for (let index = 0; index < items.length; index++) {
        items[index]=subMap_EN2CN[main][items[index]]
    }
    main=mainMap_EN2CN[main]
    var option = {
        title: {
            text: main,
            left:'center'
        },
        tooltip: {},
        legend: {
            data:['耗时'],
            left:'0%'
        },
        xAxis: {},
        yAxis: {
             data: items
        },
        series: [{
            name: '耗时',
            type: 'bar',
            data: series
        }]
    };
    myChart.setOption(option);
}

var creatchart_1_4=function(){
    var myChart = echarts.init(document.getElementById("chart_four"))
    var keysArr=new Array()
    var data=new Array()
    for(let key in totalCondition["chart_four"]){
        keysArr.push(key)
        data.push(totalCondition["chart_four"][key])
    }
    //转中文
    for (let index = 0; index < keysArr.length; index++) {
        keysArr[index]=mainMap_EN2CN[keysArr[index]]
    }
    var option = {
        title: {
            text: "各类出现的天数",
            left:'center'
        },
        tooltip: {},
        legend: {
            data:['天数'],
            left:'0%'
        },
        xAxis: {},
        yAxis: {
             data: keysArr
        },
        series: [{
            name: '天数',
            type: 'bar',
            data: data
        }]
    };
    myChart.setOption(option);
}


var generateLabelTree=function(){
    console.log("label tree",mainMap_EN2CN)
    var myChart=echarts.init(document.getElementById("label_tree"))
    var item={
        "name":null,
        "children":null
    }
    var data={...item}
    data["name"]="可用标签"
    data["children"]=[]
    
    for(var main in mainMap_EN2CN){
        var tmp={...item}
        tmp["name"]=mainMap_EN2CN[main]
        tmp["children"]=[]
        for(var sub in subMap_EN2CN[main]){
            var subTmp={...item}
            subTmp["name"]=subMap_EN2CN[main][sub]
            tmp["children"].push(subTmp)
        }
        data["children"].push(tmp)
    }
    myChart.setOption(option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        },
        series: [
            {
                type: 'tree',
                data: [data],
                top: '1%',
                bottom: '1%',
                right: '20%',
                symbolSize: 7,
                label: {
                    normal: {
                        position: 'left',
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 15
                    }
                },
                leaves: {
                    label: {
                        normal: {
                            position: 'right',
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                    }
                },
                expandAndCollapse: true,
                animationDuration: 550,
                animationDurationUpdate: 750
            }
        ]
    });
}

var createTabel=function(eventData,main){
    var table_1=document.getElementById("table_1")
    var table_2=document.getElementById("table_2")
    var len=table_1.rows.length;
    for(var i=0;i<len-1;i++){
        table_1.deleteRow(1);//也可以写成table.deleteRow(0);
    }
    len=table_2.rows.length;
    for(var i=0;i<len-1;i++){
        table_2.deleteRow(1);//也可以写成table.deleteRow(0);
    }

    var rowNum = table_2.rows.length
    for (let index = 0; index < eventData.length; index++) {
        const element = eventData[index];
        let name=element.name
        let res=element.labelid.split("_")
        let tag=mainMap_EN2CN[res[0]]+"_"+subMap_EN2CN[res[0]][res[1]]
        let start=element.start
        let end=element.end
        let during =element.during
        var newTr=table_2.insertRow(rowNum++)
        var newTd1=newTr.insertCell(0)
        var newTd2=newTr.insertCell(1)
        var newTd3=newTr.insertCell(2)
        var newTd4=newTr.insertCell(3)
        var newTd5=newTr.insertCell(4)
        newTd1.innerHTML=name
        newTd2.innerHTML=tag
        newTd3.innerHTML=start
        newTd4.innerHTML=end
        newTd5.innerHTML=during
    }
    var rowNum_1 = table_1.rows.length
    for (let index = 0; index < eventData.length; index++) {
        const element = eventData[index];
        let res=element.labelid.split("_")
        if(res[0]==main){
            let name=element.name
            let tag=subMap_EN2CN[main][res[1]]
            let start=element.start
            let end=element.end
            let during =element.during
            var newTr=table_1.insertRow(rowNum_1++)
            var newTd1=newTr.insertCell(0)
            var newTd2=newTr.insertCell(1)
            var newTd3=newTr.insertCell(2)
            var newTd4=newTr.insertCell(3)
            var newTd5=newTr.insertCell(4)
            newTd1.innerHTML=name
            newTd2.innerHTML=tag
            newTd3.innerHTML=start
            newTd4.innerHTML=end
            newTd5.innerHTML=during
        }
        
    }




    

}

var createList=function(eventKeys,name){
    console.log("parameter",eventKeys)
    var mainKeys=Array.from(eventKeys)
    var selector=document.getElementById(name)
    selector.length=0
    for(var i=0;i<mainKeys.length;++i){
        selector.options.add(new Option(mainMap_EN2CN[mainKeys[i]],i))
    }
}

var changeSubKey=function(){
    var mainIndex=document.getElementById("type_3").value
    var subSelector=document.getElementById("type_4")
    subSelector.length=0
    let eventKeys=new Set()
    for (let index = 0; index < tabelData_2.length; index++) {
        const element = tabelData_2[index];
        eventKeys.add(element.labelid.split("_")[0])
     }
     var mainKeys=Array.from(eventKeys)
     let main=mainKeys[mainIndex]
     console.log("main",main)
     //查找存在的subkey
    var subSet=new Set()
    for (let index = 0; index < tabelData_2.length; index++) {
        const element = tabelData_2[index];
        let splitRes=element.labelid.split("_")
        if(splitRes[0]==main)
            subSet.add(splitRes[1])
    }
    console.log("subset",subSet)
    subSelector.length=0
    let subKeyArr=Array.from(subSet)
    console.log("subkeyArr",subKeyArr);
    for(var i=0;i<subKeyArr.length;++i){
        subSelector.options.add(new Option(subMap_EN2CN[main][subKeyArr[i]],i))
        console.log("add ",subMap_EN2CN[main][subKeyArr[i]])
    }
    createLoveThings_2(tabelData_2,mainMap_EN2CN[main],subMap_EN2CN[main][subKeyArr[0]])

}

/**
 * 
 * 判断[start,end]和[a,b]是否有交集
 */
var isInTimeZone=function(start,end,a,b){
    if((start>a&&start<b)||(end>a&&end<b)){
        return true;
    } 
    if(start<=a&&end>=b){
        return true;
    }
    return false;
}

var createLoveThings=function(eventData,startTime,endTime){
   
    let k=5
    var tmp=new Map()
    for (let index = 0; index < eventData.length; index++) {
        const element = eventData[index];
        let start=element.start.split(" ")[1]
        let end=element.end.split(" ")[1]
        let labelRes=element.labelid.split("_")
        let sub=subMap_EN2CN[labelRes[0]][labelRes[1]]
        if(isInTimeZone(start,end,startTime,endTime)){
            if(!tmp.hasOwnProperty(sub))
                tmp[sub]=0
            tmp[sub]++
        }
    }
    var tmp_1=new Map()
    for(var key in tmp){
        tmp_1.set(key,tmp[key])
    }
    tmp_1[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
    }
    var x_data=new Array()
    var y_data=new Array()
    let res=[...tmp_1]
    console.log("tmp",[...tmp_1])
    let count=1;
    while(true){
        if(count>k) break
        if(res.length-count>=0){
            x_data.push(res[res.length-count][0])
            y_data.push(res[res.length-count][1])
        }
        count++
    }
    console.log(x_data,y_data)
    x_data=x_data.reverse()
    y_data=y_data.reverse()
    var myChart = echarts.init(document.getElementById("loveThings_one"))
    var option = {
        title: {
            text: '给定时间段高频事件',
            left:'center'
        },
        tooltip: {},
        legend: {
            data:['次数'],
            left:'0%'
        },
        xAxis: {},
        yAxis: {
             data: x_data,
             left:'0%'
        },
        series: [{
            name: '次数',
            type: 'bar',
            data: y_data
        }]
    };
    myChart.setOption(option);
}

var createLoveThings_2=function(eventData,mainTag,subTag){
    let k=5
    var beforeThings=new Map()
    var afterThings=new Map()
    for (let index = 0; index < eventData.length; index++) {
        const element = eventData[index];
        let labelRes=element.labelid.split("_")
        let main=mainMap_EN2CN[labelRes[0]]
        let sub=subMap_EN2CN[labelRes[0]][labelRes[1]]
        if(main==mainTag&&sub==subTag){
            //前
            if(index-1>=0&&index-1<eventData.length){
                const beforeItem=eventData[index-1]
                let labels=beforeItem.labelid.split("_")
                let cnLabel=mainMap_EN2CN[labels[0]]+"_"+subMap_EN2CN[labels[0]][labels[1]]
                if(!beforeThings.hasOwnProperty(cnLabel)){
                    beforeThings[cnLabel]=0
                }
                beforeThings[cnLabel]++
            }
            //后
            if(index+1>=0&&index+1<eventData.length){
                const beforeItem=eventData[index+1]
                let labels=beforeItem.labelid.split("_")
                let cnLabel=mainMap_EN2CN[labels[0]]+"_"+subMap_EN2CN[labels[0]][labels[1]]
                if(!afterThings.hasOwnProperty(cnLabel)){
                    afterThings[cnLabel]=0
                }
                afterThings[cnLabel]++
            }
        }
    }
    console.log(beforeThings,afterThings)
    //对其排序
    var tmp_1=new Map()
    var tmp_2=new Map()
    for(var key in beforeThings){
        tmp_1.set(key,beforeThings[key])
    }
    for(var key in afterThings){
        tmp_2.set(key,afterThings[key])
    }
    tmp_1[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
    }
    tmp_2[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
    }
    let res_1=[...tmp_1]
    let res_2=[...tmp_2]
    let count=1
    var x_data_1=new Array()
    var x_data_2=new Array()
    var y_data_1=new Array()
    var y_data_2=new Array()
    while(true){
        if(count>k) break
        let index_1=res_1.length-count
        let index_2=res_2.length-count
        if(index_1>=0&&index_1<res_1.length){
            x_data_1.push(res_1[index_1][0])
            y_data_1.push(res_1[index_1][1])
        }
        if(index_2>=0&&index_2<res_2.length){
            x_data_2.push(res_2[index_2][0])
            y_data_2.push(res_2[index_2][1])
        }
        count++
    }
    console.log(x_data_1,y_data_1)
    console.log(x_data_2,y_data_2)
    x_data_1=x_data_1.reverse()
    x_data_2=x_data_2.reverse()
    y_data_1=y_data_1.reverse()
    y_data_2=y_data_2.reverse()
    var myChart_1 = echarts.init(document.getElementById("loveThings_two"))
    var myChart_2 = echarts.init(document.getElementById("loveThings_three"))
    var option_1 = {
        title: {
            text: '给定事件前高频事件',
            left:'center'
        },
        tooltip: {},
        legend: {
            data:['次数'],
            left:'0%'
        },
        xAxis: {},
        yAxis: {
             data: x_data_1,
             left:'0%'
        },
        series: [{
            name: '次数',
            type: 'bar',
            data: y_data_1
        }]
    };
    myChart_1.setOption(option_1);
    var option_2 = {
        title: {
            text: '给定事件后高频事件',
            left:'center'
        },
        tooltip: {},
        legend: {
            data:['次数'],
            left:'0%'
        },
        xAxis: {},
        yAxis: {
             data: x_data_2,
             left:'0%'
        },
        series: [{
            name: '次数',
            type: 'bar',
            data: y_data_2
        }]
    };
    myChart_2.setOption(option_2);
}

var uploadFile=function(){
    var userid=getParameters("userid")
    console.log(userid)
    var formData = new FormData();
    var file=$('#file')[0].files[0]
    console.log(file)
    formData.append('file', file);
    var url=`http://101.132.178.9/MoreTime/file/csv/${userid}`
    $.ajax({
        url: url,
        type: 'POST',
        cache: false,
        data: formData,
        processData: false,
        contentType: false
    }).done(function(res) {
        console.log("success",res)
        alert(res.msg)
    }).fail(function(res) {
        console.log("fail",res)
        alert(res.msg)
    });
}

var update_1=function(){
    //获取时间，重新请求数据
    var start=document.getElementById("start_1").value
    var end=document.getElementById("end_1").value
    var eventData
    var eventKeys
    //发送请求
    const request=new XMLHttpRequest()
    const url=`http://101.132.178.9/MoreTime/event/${userid}/${start}/${end}`
    request.open("GET",url)
    request.send()
    request.onreadystatechange=(e)=>{
        if(request.readyState!=4) return
        if(request.status==200){
            var response=JSON.parse(request.responseText).data
            if(response.length>0){
                eventData=response
                chartData_1=eventData
                eventKeys=new Set()
                let first=""
                for (let index = 0; index < eventData.length; index++) {
                    const element = eventData[index];
                    eventKeys.add(element.labelid.split("_")[0])
                    if(first=="")
                        first=element.labelid.split("_")[0]
                }
                console.log("eventKey",eventKeys)
                constructTotalData(eventData,eventKeys)
                createList(eventKeys,"type_1")
                creatchart_1_1()
                creatchart_1_2(eventKeys)
                createChart_1_3(first)
                creatchart_1_4()
            }
        }
    }
    
}

var update_chart_three=function(){
    //依据选择器结果刷新第三个图
    //value 为数组的索引
    let keySet=new Set()
    for (let index = 0; index < chartData_1.length; index++) {
        const element = chartData_1[index];
        keySet.add(element.labelid.split("_")[0])
    }
    var selector=document.getElementById("type_1").value
    let mainKeys=Array.from(keySet)
    createChart_1_3(mainKeys[selector])
}

var update_2=function(){
    console.log("sss")
    //刷新表格
    //获取时间，重新请求数据
    var start=document.getElementById("start_2").value
    var end=document.getElementById("end_2").value
    var eventData
    var eventKeys
    //发送请求
    const request=new XMLHttpRequest()
    const url=`http://101.132.178.9/MoreTime/event/${userid}/${start}/${end}`
    request.open("GET",url)
    request.send()
    request.onreadystatechange=(e)=>{
        if(request.readyState!=4) return
        if(request.status==200){
            var response=JSON.parse(request.responseText).data
            if(response.length>0){
                eventData=response
                tabelData=eventData
                eventKeys=new Set()
                let first=""
                for (let index = 0; index < eventData.length; index++) {
                    const element = eventData[index];
                    eventKeys.add(element.labelid.split("_")[0])
                if(first=="")
                    first=element.labelid.split("_")[0]
                }
                console.log(eventData)
                createList(eventKeys,"type_2")
                createTabel(eventData,first)
            }
        }
    }
}

var update_tabel_1=function(){
    let keySet=new Set()
    for (let index = 0; index < tabelData.length; index++) {
        const element = tabelData[index];
        keySet.add(element.labelid.split("_")[0])
    }
    let mainKeys=Array.from(keySet)
    console.log("mainKeys",mainKeys)
    var table_1=document.getElementById("table_1")
    let value=document.getElementById("type_2").value
    console.log("value",value)
    let main=mainKeys[value]
    console.log("main",main)
    var len=table_1.rows.length;
    for(var i=0;i<len-1;i++){
        table_1.deleteRow(1);//也可以写成table.deleteRow(0);
    }
    var rowNum_1 = table_1.rows.length
    for (let index = 0; index < tabelData.length; index++) {
        const element = tabelData[index];
        let res=element.labelid.split("_")
        if(res[0]==main){
            let name=element.name
            let tag=subMap_EN2CN[main][res[1]]
            let start=element.start
            let end=element.end
            let during =element.during
            var newTr=table_1.insertRow(rowNum_1++)
            var newTd1=newTr.insertCell(0)
            var newTd2=newTr.insertCell(1)
            var newTd3=newTr.insertCell(2)
            var newTd4=newTr.insertCell(3)
            var newTd5=newTr.insertCell(4)
            newTd1.innerHTML=name
            newTd2.innerHTML=tag
            newTd3.innerHTML=start
            newTd4.innerHTML=end
            newTd5.innerHTML=during
        }
        
    }

}

var update_3=function(){
    var start=document.getElementById("start_3").value
    var end=document.getElementById("end_3").value
    var eventData
    var eventKeys
    //发送请求
    const request=new XMLHttpRequest()
    const url=`http://101.132.178.9/MoreTime/event/${userid}/${start}/${end}`
    request.open("GET",url)
    request.send()
    request.onreadystatechange=(e)=>{
        if(request.readyState!=4) return
        if(request.status==200){
            var response=JSON.parse(request.responseText).data
            if(response.length>0){
                eventData=response
                tabelData_2=eventData
                eventKeys=new Set()
                let first=""
                let firstSub=""
                for (let index = 0; index < eventData.length; index++) {
                    const element = eventData[index];
                    eventKeys.add(element.labelid.split("_")[0])
                if(first=="")
                    first=element.labelid.split("_")[0]
                }

                 //获取第一个subkey
                 var subSet=new Set()
                 for (let index = 0; index < tabelData_2.length; index++) {
                     const element = tabelData_2[index];
                     let splitRes=element.labelid.split("_")
                     if(splitRes[0]==first)
                     subSet.add(splitRes[1])
                 }
                 console.log("subset",subSet)
                 let subArray=Array.from(subSet)
                 firstSub=subMap_EN2CN[first][subArray[0]] 

                createList(eventKeys,"type_3")
                changeSubKey()
                createLoveThings(eventData,"08:00:00","10:00:00")
                console.log("筛选结果",mainMap_EN2CN[first],firstSub)
                createLoveThings_2(eventData,mainMap_EN2CN[first],firstSub)

            }
        }
    }
}

var update_loveThing_1=function(){
    var start=document.getElementById("start_4").value
    var end=document.getElementById("end_4").value
    console.log(start,end)
    console.log(tabelData_2)
    createLoveThings(tabelData_2,start,end)
}

var update_loveThing_2=function(){
    var mainIndex=document.getElementById("type_3").value
    var subIndex=document.getElementById("type_4").value
    let eventKeys=new Set()
    for (let index = 0; index < tabelData_2.length; index++) {
        const element = tabelData_2[index];
        eventKeys.add(element.labelid.split("_")[0])
     }
     var mainKeys=Array.from(eventKeys)
     let main=mainKeys[mainIndex]
      //查找存在的subkey
    var subSet=new Set()
    for (let index = 0; index < tabelData_2.length; index++) {
        const element = tabelData_2[index];
        let splitRes=element.labelid.split("_")
        if(splitRes[0]==main)
            subSet.add(splitRes[1])
    }
    let subKeyArr=Array.from(subSet)
    let sub=subKeyArr[subIndex]
    createLoveThings_2(tabelData_2,mainMap_EN2CN[main],subMap_EN2CN[main][sub])
}