/**
 * 获取页面内容，发送给服务器
 * 接收返回结果，判断认证状态
 */

 var login=function(){
     var phoneNum=document.getElementById("phoneNum").value
     var password=document.getElementById("password").value
     if(checkPhoneNum(phoneNum)){
         sendLoginMsg2Server(phoneNum,password)
     }
     
 }

 /**
 * 
 * @param {String} phoneNum 
 */
var checkPhoneNum=function(phoneNum){
    var len=phoneNum.length
    if(len!=11){
        document.getElementById("phoneNumTip").style.display="block"
        return false
    }else{
        document.getElementById("phoneNumTip").style.display="none"
        return true
    }
}

/**
 * 
 * @param {String} phoneNum 
 * @param {String} password 
 */
var sendLoginMsg2Server=function(phoneNum,password){
    console.log("sendLoginMsg")
    const request=new XMLHttpRequest();
    var loginUrl=`http://101.132.178.9/MoreTime/user/user/${phoneNum}/0/${password}`
    request.open("GET",loginUrl);
    request.send();
    request.onreadystatechange=(e)=>{
        if(request.readyState!==4)return
        if(request.status==200){
            var response=JSON.parse(request.responseText)
            console.log(response);
            if(response.msg=="登录成功"){
                window.location="html/main.html?userid="+response.data["userid"]
            }else{
                //提示登录失败
                document.getElementById("loginStateTip").style.display="block"
                return false;
            }
        }
    }  
}
    

